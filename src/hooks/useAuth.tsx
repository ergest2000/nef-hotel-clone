import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const checkRole = async (userId: string): Promise<AppRole> => {
    try {
      const priorityRoles = ["admin", "manager", "editor"] as const;
      const results = await Promise.all(
        priorityRoles.map(async (candidateRole) => {
          const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: candidateRole });
          if (error) {
            console.error(`Role check failed for ${candidateRole}:`, error.message);
            return { candidateRole, hasRole: false };
          }
          return { candidateRole, hasRole: Boolean(data) };
        })
      );

      const matchedRole = results.find((result) => result.hasRole)?.candidateRole;
      return matchedRole ?? "user";
    } catch (error) {
      console.error("Failed to resolve user role:", error);
      return "user";
    }
  };

  const applySessionState = async (nextSession: Session | null) => {
    try {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setIsAdmin(false);
        setRole("user");
        return;
      }

      const resolvedRole = await checkRole(nextSession.user.id);
      setRole(resolvedRole);
      setIsAdmin(resolvedRole === "admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;
      setLoading(true);
      await applySessionState(nextSession);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void syncSession(nextSession);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => syncSession(nextSession));

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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

  return (
    <AuthCtx.Provider value={{ user, session, isAdmin, role, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
