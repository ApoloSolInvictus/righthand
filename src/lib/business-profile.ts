import type { BusinessCategory } from "@/lib/types";

export const costaRicaProvinces = [
  "San Jose",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limon",
] as const;

export const businessCategoryLabels: Record<BusinessCategory, string> = {
  restaurante: "Restaurante / soda",
  tienda: "Tienda",
  pyme: "PYME / servicios",
  farmacia: "Farmacia",
};

export const businessCategories = Object.entries(businessCategoryLabels).map(
  ([value, label]) => ({
    value: value as BusinessCategory,
    label,
  }),
);

export function normalizeBusinessCategory(
  value: string | null | undefined,
): BusinessCategory {
  if (
    value === "restaurante" ||
    value === "tienda" ||
    value === "pyme" ||
    value === "farmacia"
  ) {
    return value;
  }

  return "pyme";
}

export function parseSearchTags(value: string | null | undefined) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function formatSearchTags(tags: string[] = []) {
  return tags.join(", ");
}
