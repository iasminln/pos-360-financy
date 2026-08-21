import {
  Book,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Gift,
  Heart,
  Home,
  Lightbulb,
  PiggyBank,
  Plane,
  ShoppingCart,
  Smartphone,
  Ticket,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIconId } from "@/lib/categories";

const iconMap: Record<CategoryIconId, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  "shopping-cart": ShoppingCart,
  briefcase: Briefcase,
  heart: Heart,
  "piggy-bank": PiggyBank,
  ticket: Ticket,
  lightbulb: Lightbulb,
  home: Home,
  gift: Gift,
  plane: Plane,
  wallet: Wallet,
  coffee: Coffee,
  dumbbell: Dumbbell,
  book: Book,
  smartphone: Smartphone,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return iconMap[icon as CategoryIconId] ?? Wallet;
}
