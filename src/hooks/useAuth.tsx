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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  session: null,
  isAdmin: false,
  role: "user",
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AppRole>("user");
  const [loading, setLoading] = useState(true);

  const checkRole = async (userId: string): Promise<AppRole> => {
    const priorityRoles = ["admin", "manager", "editor"] as const;
    const results = await Promise.all(
      priorityRoles.map(async (candidateRole) => {
        const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: candidateRole });
        return { candidateRole, hasRole: Boolean(data) };
      })
    );

    const matchedRole = results.find((result) => result.hasRole)?.candidateRole;
    return matchedRole ?? "user";
  };

  const applySessionState = async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setIsAdmin(false);
      setRole("user");
      setLoading(false);
      return;
    }

    const resolvedRole = await checkRole(nextSession.user.id);
    setRole(resolvedRole);
    setIsAdmin(resolvedRole === "admin");
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isMounted) return;
      setLoading(true);
      await applySessionState(nextSession);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        await syncSession(nextSession);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => syncSession(nextSession));

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
