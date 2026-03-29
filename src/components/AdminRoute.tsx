import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DASHBOARD_ROLES = ["admin", "manager", "editor"];

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  // Only show loading on very first load (no user determined yet)
  // Once user is set, never unmount children even if loading flickers
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm tracking-brand text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !DASHBOARD_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
