/** Outfit options. Placeholders until Nanda's outfit art and the final item list are ready. */
export type OutfitCategory = "baju" | "celana" | "aksesoris";
export type Outfit = Record<OutfitCategory, string | null>;

export const OUTFIT_CATEGORIES: { id: OutfitCategory; label: string; items: string[] }[] = [
  { id: "baju", label: "Baju", items: ["Kaos Potara", "Hoodie", "Kemeja", "Jaket"] },
  { id: "celana", label: "Celana", items: ["Jeans", "Celana pendek", "Jogger", "Rok"] },
  { id: "aksesoris", label: "Aksesoris", items: ["Topi", "Kacamata", "Syal", "Tas"] },
];

export const EMPTY_OUTFIT: Outfit = { baju: null, celana: null, aksesoris: null };

export const outfitSummary = (o: Outfit) => [o.baju, o.celana, o.aksesoris].filter(Boolean) as string[];
