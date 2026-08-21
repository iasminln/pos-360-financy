import {
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type FieldContextValue = {
  error: boolean;
  disabled: boolean;
};

const FieldContext = createContext<FieldContextValue>({
  error: false,
  disabled: false,
});

export function useFieldContext() {
  return useContext(FieldContext);
}

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  error,
  helper,
  disabled = false,
  className,
  children,
  ...props
}: FieldProps) {
  const hasError = Boolean(error);

  return (
    <FieldContext.Provider value={{ error: hasError, disabled }}>
      <div className={cn("group/field flex flex-col gap-1.5", className)} {...props}>
        {label != null && (
          <label
            htmlFor={htmlFor}
            className={cn(
              "block text-sm font-medium transition-colors",
              hasError
                ? "text-danger"
                : "text-gray-700 group-focus-within/field:text-brand-dark",
              disabled && "text-gray-700",
            )}
          >
            {label}
          </label>
        )}
        {children}
        {(error || helper) && (
          <p
            className={cn(
              "text-xs leading-snug",
              error ? "text-danger" : "text-gray-400",
            )}
          >
            {error || helper}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
