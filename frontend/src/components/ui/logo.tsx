import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  to?: string;
};

export function Logo({ className, to = "/" }: LogoProps) {
  const content = (
    <img
      src="/logo.svg"
      alt="Financy"
      className={cn("h-6 w-auto", className)}
    />
  );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
}
