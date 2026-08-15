export const CATEGORY_COLORS = [
  { id: "green", value: "#16A34A", bg: "#E0FAE9", text: "#15803D" },
  { id: "blue", value: "#2563EB", bg: "#DBEAFE", text: "#1D4ED8" },
  { id: "purple", value: "#9333EA", bg: "#F3E8FF", text: "#7E22CE" },
  { id: "pink", value: "#DB2777", bg: "#FCE7F3", text: "#BE185D" },
  { id: "red", value: "#DC2626", bg: "#FEE2E2", text: "#B91C1C" },
  { id: "orange", value: "#EA580C", bg: "#FFEDD5", text: "#C2410C" },
  { id: "yellow", value: "#CA8A04", bg: "#F7F3CA", text: "#A16207" },
] as const;

export const CATEGORY_ICONS = [
  "utensils",
  "car",
  "shopping-cart",
  "briefcase",
  "heart",
  "piggy-bank",
  "ticket",
  "lightbulb",
  "home",
  "gift",
  "plane",
  "wallet",
  "coffee",
  "dumbbell",
  "book",
  "smartphone",
] as const;

export type CategoryIconId = (typeof CATEGORY_ICONS)[number];
export type CategoryColorId = (typeof CATEGORY_COLORS)[number]["id"];

export function getCategoryColor(color: string) {
  return (
    CATEGORY_COLORS.find((item) => item.id === color || item.value === color) ??
    CATEGORY_COLORS[0]
  );
}
