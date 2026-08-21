import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/components/ui/field";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      leftIcon,
      rightIcon,
      error,
      disabled,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const field = useFieldContext();
    const isError = error ?? field.error;
    const isDisabled = disabled ?? field.disabled;
    const [focused, setFocused] = useState(false);

    const iconTone = cn(
      "transition-colors",
      isError
        ? "text-danger"
        : focused
          ? "text-brand-dark"
          : "text-gray-400 group-has-[input:not(:placeholder-shown)]/input:text-gray-800",
      isDisabled && "text-gray-400",
    );

    return (
      <div
        className={cn(
          "group/input relative",
          isDisabled && "cursor-not-allowed",
        )}
      >
        {leftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute inset-y-0 left-3 flex items-center",
              iconTone,
            )}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          disabled={isDisabled}
          aria-invalid={isError || undefined}
          // Space placeholder enables :placeholder-shown for empty/filled icon tones
          placeholder={placeholder ?? " "}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition-colors",
            "text-gray-800 placeholder:text-gray-400",
            "border-border",
            isError && "border-danger",
            isDisabled &&
              "cursor-not-allowed border-border text-gray-400 placeholder:text-gray-400",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className,
          )}
          {...props}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {rightIcon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
