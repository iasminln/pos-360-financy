import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/categories";

type BadgeProps = {
  label: string;
  color: string;
  className?: string;
};

export function CategoryBadge({ label, color, className }: BadgeProps) {
  const palette = getCategoryColor(color);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium",
        className,
      )}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {label}
    </span>
  );
}
