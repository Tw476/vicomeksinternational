import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function normalizeName(value: string) {
  return slugify(value).replace(/-/g, "");
}

export function inferCategory(name: string) {
  const lower = name.toLowerCase();
  const map: Array<[string, string]> = [
    ["oven", "Industrial & Commercial Kitchen Equipment"],
    ["burner", "Industrial & Commercial Kitchen Equipment"],
    ["mixer", "Industrial & Commercial Kitchen Equipment"],
    ["cooker", "Industrial & Commercial Kitchen Equipment"],
    ["microwave", "Industrial & Commercial Kitchen Equipment"],
    ["freezer", "Refrigeration & Cooling Systems"],
    ["refrigerator", "Refrigeration & Cooling Systems"],
    ["fridge", "Refrigeration & Cooling Systems"],
    ["chiller", "Refrigeration & Cooling Systems"],
    ["air conditioner", "Air Conditioning Systems"],
    ["ac", "Air Conditioning Systems"],
    ["blender", "Kitchen & Household Appliances"],
    ["kettle", "Kitchen & Household Appliances"],
    ["fan", "Kitchen & Household Appliances"],
    ["television", "Kitchen & Household Appliances"],
    ["tv", "Kitchen & Household Appliances"],
    ["hair dryer", "Hair & Body Care Equipment"],
    ["clipper", "Hair & Body Care Equipment"],
    ["trimmer", "Hair & Body Care Equipment"],
    ["washing", "Laundry Equipment"],
    ["dryer", "Laundry Equipment"],
    ["iron", "Laundry Equipment"],
    ["generator", "General Merchandise"],
    ["pot", "General Merchandise"]
  ];
  return map.find(([key]) => lower.includes(key))?.[1] ?? "General Merchandise";
}
