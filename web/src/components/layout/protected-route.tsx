import { Navigate, Outlet } from "react-router-dom";
import { BootLoadingScreen } from "@/components/layout/boot-loading-screen";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <BootLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
