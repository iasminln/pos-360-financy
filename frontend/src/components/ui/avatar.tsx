import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700",
        size === "sm" && "h-9 w-9 text-xs",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-20 w-20 text-2xl",
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
