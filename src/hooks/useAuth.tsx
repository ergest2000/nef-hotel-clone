import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "manager" | "editor" | "user";

const AuthCtx = createContext({
  user: null as any,
  session: null as any,
  isAdmin: false,
  role: "user" as AppRole,
  loading: true,
  signIn: async (_email: string, _password: string) => ({ error: null as Error | null, role: "user" as AppRole, user: null as any }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null as any);
  const [session, setSession] = useState(null as any);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState("user" as AppRole);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const checkRole = async (userId: string) => {
    try {
      const priorityRoles = ["admin", "manager", "editor"] as const;
      const results = await Promise.all(
        priorityRoles.map(async (candidateRole) => {
          const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: candidateRole });
          if (error) return { candidateRole, hasRole: false };
          return { candidateRole, hasRole: Boolean(data) };
        })
      );
      const matched = results.find((r) => r.hasRole);
      return (matched ? matched.candidateRole : "user") as AppRole;
    } catch {
      return "user" as AppRole;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // With autoRefreshToken: true, onAuthStateChange fires INITIAL_SESSION
    // before getSession resolves, so we handle initialization via the listener only.
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setRole("user");
        setLoading(false);
        initializedRef.current = true;
      } else if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const r = await checkRole(newSession.user.id);
          if (isMounted) { setRole(r); setIsAdmin(r === "admin"); }
        }
        if (isMounted) { setLoading(false); initializedRef.current = true; }
      }
    });

    return () => { isMounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error as Error, role: "user" as AppRole, user: null };
      }

      const nextUser = data.user ?? null;
      const nextSession = data.session ?? null;
      const resolvedRole = nextUser ? await checkRole(nextUser.id) : ("user" as AppRole);

      setSession(nextSession);
      setUser(nextUser);
      setRole(resolvedRole);
      setIsAdmin(resolvedRole === "admin");
      setLoading(false);
      initializedRef.current = true;

      return { error: null, role: resolvedRole, user: nextUser };
    } catch (error) {
      setLoading(false);
      return { error: error as Error, role: "user" as AppRole, user: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setRole("user");
  };

  const val = { user, session, isAdmin, role, loading, signIn, signOut };

  return React.createElement(AuthCtx.Provider, { value: val }, children);
};

export const useAuth = () => useContext(AuthCtx);
