import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldContext } from "@/components/ui/field";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: { target: { value: string; name?: string } }) => void;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  error?: boolean;
  leftIcon?: ReactNode;
  placeholder?: string;
  className?: string;
};

export function Select({
  options,
  value: valueProp,
  defaultValue = "",
  onChange,
  onValueChange,
  onBlur,
  name,
  id,
  disabled,
  error,
  leftIcon,
  placeholder = "Selecione",
  className,
}: SelectProps) {
  const field = useFieldContext();
  const isError = error ?? field.error;
  const isDisabled = disabled ?? field.disabled;
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onBlur]);

  const commit = (next: string) => {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
    onChange?.({ target: { value: next, name } });
    setOpen(false);
  };

  const iconTone = cn(
    "transition-colors",
    isError
      ? "text-danger"
      : open
        ? "text-brand-dark"
        : value
          ? "text-gray-800"
          : "text-gray-400",
    isDisabled && "text-gray-400",
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        name={name}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={isError || undefined}
        onClick={() => {
          if (isDisabled) return;
          setOpen((prev) => !prev);
        }}
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget as Node)) {
            onBlur?.();
          }
        }}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3 text-left text-sm outline-none transition-colors",
          "border-border",
          isError && "border-danger",
          isDisabled && "cursor-not-allowed text-gray-400",
          !isDisabled && "cursor-pointer",
        )}
      >
        {leftIcon && (
          <span className={cn("shrink-0", iconTone)}>{leftIcon}</span>
        )}
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "font-normal text-gray-800" : "text-gray-400",
            isDisabled && "text-gray-400",
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            iconTone,
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && !isDisabled && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || "__empty"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-gray-100",
                    isSelected && "font-semibold",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => commit(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-brand-base"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
