import { NavLink, Outlet, Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transacoes", label: "Transações" },
  { to: "/categorias", label: "Categorias" },
];

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col bg-gray-100">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "font-semibold text-brand-base"
                      : "text-gray-500 hover:text-gray-800",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/perfil" className="rounded-full">
            <Avatar name={user?.name ?? "U"} size="sm" />
          </Link>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap text-sm font-medium",
                  isActive ? "text-brand-base" : "text-gray-500",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
