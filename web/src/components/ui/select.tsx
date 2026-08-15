import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/components/ui/field";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, disabled, ...props }, ref) => {
    const field = useFieldContext();
    const isError = error ?? field.error;
    const isDisabled = disabled ?? field.disabled;

    return (
      <select
        ref={ref}
        disabled={isDisabled}
        aria-invalid={isError || undefined}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3 text-sm text-gray-800 outline-none transition-colors",
          "border-border",
          "focus:border-border",
          isError && "border-danger",
          isDisabled && "cursor-not-allowed text-gray-400",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
