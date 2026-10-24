/** Guests who are currently present. Sample data until check-in is wired to the backend. */
export type Guest = { id: string; name: string; role: string; question: string };

export const GUESTS: Guest[] = [
  { id: "nanda", name: "Nanda", role: "Ilustrator", question: "Karakter kartun apa yang paling membekas waktu kecil?" },
  { id: "azwar", name: "Azwar", role: "Product", question: "Kalau kerja dari kantor ini, kamu paling suka duduk di ruangan mana?" },
  { id: "adam", name: "Adam", role: "Developer", question: "Lagu apa yang lagi sering kamu putar minggu ini?" },
  { id: "sinta", name: "Sinta", role: "Tamu", question: "Menu omakase apa yang paling pengin kamu coba?" },
  { id: "raka", name: "Raka", role: "Tamu", question: "Kalau Potara punya maskot kedua, hewan apa yang cocok?" },
  { id: "laras", name: "Laras", role: "Tamu", question: "Hal kecil apa yang bikin harimu jadi baik?" },
  { id: "dimas", name: "Dimas", role: "Tamu", question: "Tempat makan favoritmu di dekat sini apa?" },
];

/** Cards already collected when jumping straight into the app (review links). */
export const SAMPLE_COLLECTED: Record<string, string> = {
  azwar: "Ruang Kerja Dalam, katanya paling tenang.",
  adam: "Lagi muter soundtrack game terus.",
  sinta: "Salmon aburi!",
};
