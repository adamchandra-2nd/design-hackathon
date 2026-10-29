/**
 * Guest notifications: everything that popped up as a toast and is worth reading again later.
 * Announcements come from the admin through a shared store (localStorage in the prototype, so #admin-pengumuman
 * and the guest app sync across tabs); production pushes them from the backend.
 */
import { useEffect, useRef } from "react";
import type { IconName } from "../components/iconPaths";

export type NoticeKind = "pengumuman" | "jadwal" | "galeri" | "hadiah" | "tanya";

/** Where tapping the notification takes the guest. */
export type NoticeTarget =
  | { to: "agenda" }
  | { to: "galeri" }
  | { to: "voucher" }
  | { to: "tanya"; eventId: string }
  | { to: "ruangan"; roomId: string };

export type GuestNotice = {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  /** Rundown minute it arrived. */
  at: number;
  read: boolean;
  target?: NoticeTarget;
};

export const NOTICE_KIND: Record<NoticeKind, { label: string; icon: IconName }> = {
  pengumuman: { label: "Pengumuman panitia", icon: "Megaphone" },
  jadwal: { label: "Jadwal", icon: "Calendar" },
  galeri: { label: "Galeri", icon: "Image" },
  hadiah: { label: "Hadiah", icon: "Gift" },
  tanya: { label: "Tanya pembicara", icon: "Message" },
};

/** What a guest who's been here since the opening has received so far (sample). */
export const SAMPLE_NOTICES: GuestNotice[] = [
  { id: "n-tanya-dibaca", kind: "tanya", title: "Pertanyaanmu dibaca MC", body: "“Apa rencana Potara setahun ke depan di rumah baru?”", at: 9 * 60 + 49, read: false, target: { to: "tanya", eventId: "talkshow" } },
  { id: "n-foto", kind: "galeri", title: "Nanda membagikan foto", body: "“Talkshow-nya rame banget!” Lihat dan unduh di Galeri.", at: 9 * 60 + 48, read: false, target: { to: "galeri" } },
  { id: "n-talkshow", kind: "jadwal", title: "Talkshow dimulai di Ruang Omakase", body: "Kamu dipindahkan ke sana saat acara mulai.", at: 9 * 60 + 30, read: true, target: { to: "ruangan", roomId: "ruang-omakase" } },
  { id: "ann-a2", kind: "pengumuman", title: "Talkshow segera mulai", body: "Kursi di Ruang Omakase masih banyak, yuk merapat.", at: 9 * 60 + 25, read: true, target: { to: "ruangan", roomId: "ruang-omakase" } },
  { id: "ann-a1", kind: "pengumuman", title: "Selamat datang!", body: "Check-in di pintu, lalu jelajahi 5 ruangan Potara.", at: 9 * 60 + 2, read: true },
];

/** Add a notice unless it's already there (scenarios can replay on review links). */
export const addNotice = (list: GuestNotice[], n: GuestNotice) => (list.some((x) => x.id === n.id) ? list : [n, ...list]);

// ---------- Announcements shared with the admin ----------

export type SharedAnnouncement = { id: string; title: string; body: string; roomId: string | null; at: number };

const KEY = "hmd-announcements-v1";

function read(): SharedAnnouncement[] {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}

/** Admin side: deliver an announcement to every guest's phone. */
export function broadcastAnnouncement(a: SharedAnnouncement) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...read().filter((x) => x.id !== a.id), a]));
  } catch {
    /* storage blocked: the admin tab still records it */
  }
}

export const announcementNotice = (a: SharedAnnouncement): GuestNotice => ({
  id: `ann-${a.id}`,
  kind: "pengumuman",
  title: a.title,
  body: a.body,
  at: a.at,
  read: false,
  target: a.roomId ? { to: "ruangan", roomId: a.roomId } : undefined,
});

/**
 * Guest side: `onArrive(list, live)` gets announcements the guest hasn't logged yet: once on open (live = false,
 * no toast) and whenever the admin sends one from another tab (live = true, shown as a toast too).
 */
export function useAnnouncements(onArrive: (list: SharedAnnouncement[], live: boolean) => void) {
  const cb = useRef(onArrive);
  useEffect(() => {
    cb.current = onArrive;
  });
  useEffect(() => {
    cb.current(read(), false);
    const onStorage = (e: StorageEvent) => e.key === KEY && cb.current(read(), true);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}
