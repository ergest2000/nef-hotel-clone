import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "manager" | "editor" | "user";

interface AuthContext {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  role: AppRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role: AppRole; user: User | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  isAdmin: false,
  role: "user",
  loading: true,
  signIn: async () => ({ error: null, role: "user", user: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const checkRole = async (userId: string): Promise<AppRole> => {
    try {
      const priorityRoles = ["admin", "manager", "editor"] as const;
      const results = await Promise.all(
        priorityRoles.map(async (candidateRole) => {
          const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: candidateRole });
          if (error) return { candidateRole, hasRole: false };
          return { candidateRole, hasRole: Boolean(data) };
        })
      );
      return results.find((r) => r.hasRole)?.candidateRole ?? "user";
    } catch {
      return "user";
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const r = await checkRole(s.user.id);
        if (isMounted) { setRole(r); setIsAdmin(r === "admin"); }
      }
      if (isMounted) { setLoading(false); initializedRef.current = true; }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!isMounted || !initializedRef.current) return;
        if (event === "SIGNED_OUT") {
          setUser(null); setSession(null); setIsAdmin(false); setRole("user");
        }
      }
    );

    return () => { isMounted = false; subscription.unsubscribe(); };
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
      const resolvedRole = nextUser ? await checkRole(nextUser.id) : "user";

      setSession(nextSession);
      setUser(nextUser);
      setRole(resolvedRole);
      setIsAdmin(resolvedRole === "admin");
      setLoading(false);

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

  const contextValue = { user, session, isAdmin, role, loading, signIn, signOut };

  return (
    <AuthCtx.Provider value={contextValue}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
