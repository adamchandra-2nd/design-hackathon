/** Sample data for the admin side until the backend exists. */
import { AGENDA, type AgendaItem } from "../data/agenda";

export type Rsvp = "ya" | "tidak" | "belum";
export type RewardStatus = "mengumpulkan" | "siap" | "diambil";
export type AdminGuest = {
  id: string;
  name: string;
  email: string;
  rsvp: Rsvp;
  /** Check-in minute (since 00:00), null = not here yet. */
  checkIn: number | null;
  checkInBy?: "qr" | "kode" | "panitia";
  cards: number;
  reward: RewardStatus;
  finalFeedback: boolean;
};

const NAMES = [
  "David", "Nanda", "Azwar", "Adam", "Sinta", "Raka", "Laras", "Dimas", "Putri", "Bayu", "Citra", "Fajar",
  "Gita", "Hana", "Ilham", "Joko", "Kirana", "Lutfi", "Maya", "Nadia", "Oka", "Pandu", "Rani", "Sekar",
  "Tegar", "Ulfa", "Vina", "Wulan", "Yoga", "Zahra", "Arya", "Bima",
];

/** Deterministic sample guests: most said yes, many already checked in. */
export const ADMIN_GUESTS: AdminGuest[] = NAMES.map((name, i) => {
  const rsvp: Rsvp = i % 11 === 7 ? "tidak" : i % 9 === 8 ? "belum" : "ya";
  const here = rsvp === "ya" && i % 6 !== 5;
  const cards = here ? [5, 3, 2, 5, 1, 4, 0, 5, 2][i % 9] : 0;
  return {
    id: name.toLowerCase(),
    name,
    email: `${name.toLowerCase()}@contoh.id`,
    rsvp,
    checkIn: here ? 9 * 60 + ((i * 7) % 48) : null,
    checkInBy: here ? (i % 8 === 3 ? "panitia" : i % 8 === 6 ? "kode" : "qr") : undefined,
    cards,
    reward: cards >= 5 ? (i % 2 ? "diambil" : "siap") : "mengumpulkan",
    finalFeedback: false,
  };
});

export type AdminEvent = AgendaItem;
export const ADMIN_EVENTS: AdminEvent[] = AGENDA.map((a) => ({ ...a }));

export type Announcement = { id: string; title: string; body: string; roomId: string | null; at: number; recipients: number };
export const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", title: "Selamat datang!", body: "Check-in di pintu, lalu jelajahi 5 ruangan Potara.", roomId: null, at: 8 * 60 + 55, recipients: 0 },
  { id: "a2", title: "Talkshow segera mulai", body: "Kursi di Ruang Omakase masih banyak, yuk merapat.", roomId: "ruang-omakase", at: 9 * 60 + 25, recipients: 18 },
];

export type EventFeedbackEntry = { rating: number; text: string; at: number };
export const SAMPLE_EVENT_FEEDBACK: Record<string, EventFeedbackEntry[]> = {
  pembukaan: [
    { rating: 5, text: "Sambutannya hangat, langsung kerasa akrab.", at: 9 * 60 + 31 },
    { rating: 4, text: "Seru, tapi suaranya agak kecil di belakang.", at: 9 * 60 + 32 },
    { rating: 5, text: "Suka banget sama dekorasinya!", at: 9 * 60 + 33 },
    { rating: 3, text: "Agak telat mulainya.", at: 9 * 60 + 35 },
    { rating: 4, text: "Oke!", at: 9 * 60 + 36 },
  ],
};

export const SAMPLE_FINAL_FEEDBACK = {
  ratings: [0, 1, 2, 6, 9] as number[],
  moods: { "Acaranya seru": 12, "Kantornya keren": 15, "Makanannya enak": 9, "Dapat kenalan baru": 11, "Kurang lama!": 4 } as Record<string, number>,
  messages: ["Semoga betah di rumah baru!", "Makasih undangannya, sukses terus Potara.", "Ruang omakase-nya juara."],
};

export const ADMIN_EMAIL = "admin@potara.id";
/** Prototype PIN "sent" by email. */
export const ADMIN_PIN = "123456";
