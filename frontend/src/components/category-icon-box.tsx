import { getCategoryColor } from "@/lib/categories";
import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Props = {
  icon: string;
  color: string;
  className?: string;
};

export function CategoryIconBox({ icon, color, className }: Props) {
  const Icon = getCategoryIcon(icon);
  const palette = getCategoryColor(color);

  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg",
        className,
      )}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}
