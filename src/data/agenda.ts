/** Sample rundown. Times and titles are placeholders until the committee's rundown is final. */
export type AgendaStatus = "done" | "now" | "next" | "later";
export type AgendaItem = { id: string; time: string; title: string; roomId: string; status: AgendaStatus };

export const AGENDA: AgendaItem[] = [
  { id: "pembukaan", time: "09.00–09.30", title: "Pembukaan", roomId: "halaman-depan", status: "done" },
  { id: "talkshow", time: "09.30–10.30", title: "Talkshow", roomId: "ruang-omakase", status: "now" },
  { id: "pengenalan", time: "10.30–11.30", title: "Pengenalan kantor", roomId: "ruang-kerja-utama", status: "next" },
  { id: "makan", time: "11.30–13.00", title: "Makan siang bersama", roomId: "ruang-omakase", status: "later" },
  { id: "penutupan", time: "13.00–13.30", title: "Foto bersama & penutupan", roomId: "halaman-depan", status: "later" },
];
