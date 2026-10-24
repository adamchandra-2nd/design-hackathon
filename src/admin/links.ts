import type { AdminPage } from "./AdminShell";
import type { Phase } from "./Dashboard";
import type { AdminEvent } from "./data";
import type { LoginScenario } from "./Login";

export type Scenario = {
  signedIn: boolean;
  login?: LoginScenario;
  page: AdminPage;
  phase: Phase;
  search?: string;
  selected?: string;
  rundownDraft?: (events: AdminEvent[]) => AdminEvent[];
  rundownEdit?: string;
  failAnnouncement?: boolean;
  feedbackTab?: string;
  sessionExpired?: boolean;
  offline?: boolean;
  system?: "error" | "404";
};

const live = (page: AdminPage, extra: Partial<Scenario> = {}): Scenario => ({ signedIn: true, page, phase: "live", ...extra });

/** Review links for the admin side: #admin-… */
export const ADMIN_LINKS: Record<string, Scenario> = {
  "admin-login": { signedIn: false, login: "email", page: "dashboard", phase: "live" },
  "admin-pin": { signedIn: false, login: "pin", page: "dashboard", phase: "live" },
  "admin-pin-kedaluwarsa": { signedIn: false, login: "pin-expired", page: "dashboard", phase: "live" },
  "admin-pin-terkunci": { signedIn: false, login: "pin-locked", page: "dashboard", phase: "live" },
  admin: live("dashboard"),
  "admin-sebelum": live("dashboard", { phase: "pre" }),
  "admin-selesai": live("dashboard", { phase: "ended" }),
  "admin-tamu": live("tamu"),
  "admin-tamu-detail": live("tamu", { selected: "laras" }),
  "admin-tamu-kosong": live("tamu", { search: "zzz" }),
  "admin-rundown": live("rundown"),
  "admin-rundown-edit": live("rundown", { rundownEdit: "makan" }),
  "admin-rundown-belum-disimpan": live("rundown", {
    rundownDraft: (ev) => ev.map((e) => (e.id === "makan" ? { ...e, start: e.start + 15, end: e.end + 15 } : e)),
  }),
  "admin-rundown-bentrok": live("rundown", {
    rundownDraft: (ev) => ev.map((e) => (e.id === "makan" ? { ...e, start: 12 * 60 + 15, end: 13 * 60 + 15, roomId: "halaman-depan" } : e)),
  }),
  "admin-pengumuman": live("pengumuman"),
  "admin-pengumuman-gagal": live("pengumuman", { failAnnouncement: true }),
  "admin-hadiah": live("hadiah"),
  "admin-hadiah-kosong": live("hadiah", { phase: "pre" }),
  "admin-feedback": live("feedback"),
  "admin-feedback-akhir": live("feedback", { phase: "ended", feedbackTab: "akhir" }),
  "admin-feedback-kosong": live("feedback", { phase: "pre" }),
  "admin-pengaturan": live("pengaturan"),
  "admin-sesi-habis": live("dashboard", { sessionExpired: true }),
  "admin-offline": live("dashboard", { offline: true }),
  "admin-error": live("dashboard", { system: "error" }),
  "admin-404": live("dashboard", { system: "404" }),
};

