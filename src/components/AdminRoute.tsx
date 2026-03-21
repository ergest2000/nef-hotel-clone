import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DASHBOARD_ROLES = ["admin", "manager", "editor"];

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
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
