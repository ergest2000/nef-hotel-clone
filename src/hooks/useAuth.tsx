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

  const checkRole = async (userId: string) => {
    // Check roles in priority order using the security definer function
    for (const r of ["admin", "manager", "editor"] as const) {
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: r });
      if (data) {
        setRole(r);
        setIsAdmin(r === "admin");
        return;
      }
    }
    setRole("user");
    setIsAdmin(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setRole("user");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
