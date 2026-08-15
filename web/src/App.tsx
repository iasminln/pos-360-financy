import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { BootLoadingScreen } from "@/components/layout/boot-loading-screen";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { useAuth } from "@/context/auth-context";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { TransactionsPage } from "@/pages/transactions-page";
import { CategoriesPage } from "@/pages/categories-page";
import { ProfilePage } from "@/pages/profile-page";
import { NotFoundPage } from "@/pages/not-found-page";

function RootPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <BootLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout />
  );
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <BootLoadingScreen />;
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />}>
          <Route index element={<DashboardPage />} />
        </Route>

        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/transacoes" element={<TransactionsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
