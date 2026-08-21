import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const homeTo = isAuthenticated ? "/" : "/";

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gray-100 px-4 py-10">
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <Logo to={homeTo} className="mb-10 h-7" />

        <p className="text-7xl font-bold tracking-tight text-brand-base sm:text-6xl">
          404
        </p>
        <h1 className="mt-4 text-xl font-bold text-gray-800">
          Página não encontrada
        </h1>
        <p className="mt-2 max-w-sm text-base text-gray-600">
          O endereço que você acessou não existe.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={homeTo} className="w-full">
            <Button size="lg" className="w-full">
              <Home className="h-4 w-4" />
              {isAuthenticated ? "Ir ao dashboard" : "Ir ao início"}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
