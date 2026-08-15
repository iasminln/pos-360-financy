import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => { 
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-60",
          variant === "primary" &&
            "bg-brand-base text-white hover:bg-brand-dark",
          variant === "secondary" &&
            "border border-border bg-white text-gray-800 hover:bg-gray-100",
          variant === "outline" &&
            "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100",
          variant === "ghost" && "bg-transparent text-brand-base hover:bg-green-light",
          variant === "danger" &&
            "border border-border bg-white text-danger hover:bg-red-light",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-4 text-sm",
          size === "lg" && "h-12 w-full px-4 text-base",
          size === "icon" && "h-9 w-9 p-0",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
