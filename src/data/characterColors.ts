/** Character colour options. Hue-shifted from Nanda's orange dragon until per-colour art exists. */
export type CharacterColor = { id: string; name: string; hue: number };

export const CHARACTER_COLORS: CharacterColor[] = [
  { id: "oranye", name: "Oranye", hue: 0 },
  { id: "hijau", name: "Hijau", hue: 80 },
  { id: "biru", name: "Biru", hue: 170 },
  { id: "ungu", name: "Ungu", hue: 230 },
  { id: "pink", name: "Pink", hue: 300 },
];

export const colorById = (id: string) => CHARACTER_COLORS.find((c) => c.id === id) ?? CHARACTER_COLORS[0];
