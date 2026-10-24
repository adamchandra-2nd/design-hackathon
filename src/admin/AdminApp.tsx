import { useState } from "react";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Toast, ToastIcon } from "../components/Toast";
import type { IconName } from "../components/iconPaths";
import { DEMO_NOW, DOOR_CODE, EVENT, PANITIA_PIN } from "../config";
import { formatTime } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import { AdminShell, type AdminPage } from "./AdminShell";
import { AdminOfflineBanner, AdminSystem } from "./AdminSystem";
import { Announcements } from "./Announcements";
import { Dashboard, type Phase } from "./Dashboard";
import {
  ADMIN_EMAIL,
  ADMIN_EVENTS,
  ADMIN_GUESTS,
  SAMPLE_ANNOUNCEMENTS,
  SAMPLE_EVENT_FEEDBACK,
  SAMPLE_FINAL_FEEDBACK,
  type AdminEvent,
  type AdminGuest,
  type Announcement,
} from "./data";
import { Feedback } from "./Feedback";
import { Guests } from "./Guests";
import { Login } from "./Login";
import { ADMIN_LINKS } from "./links";
import { Rewards } from "./Rewards";
import { Rundown } from "./Rundown";
import { Settings, type AdminSettings } from "./Settings";

const NOW: Record<Phase, number> = { pre: 8 * 60, live: DEMO_NOW.live, ended: DEMO_NOW.ended };

/** Before D-day nobody has checked in or collected cards yet. */
const guestsFor = (phase: Phase): AdminGuest[] =>
  phase === "pre" ? ADMIN_GUESTS.map((g) => ({ ...g, checkIn: null, checkInBy: undefined, cards: 0, reward: "mengumpulkan" })) : ADMIN_GUESTS;

/** Admin (desktop): same design system as the guest app, one access level, PIN-by-email sign-in. */
export function AdminApp({ token }: { token: string }) {
  const sc = ADMIN_LINKS[token] ?? ADMIN_LINKS["admin-404"];
  const [signedIn, setSignedIn] = useState(sc.signedIn);
  const [page, setPage] = useState<AdminPage>(sc.page);
  const [system, setSystem] = useState(token in ADMIN_LINKS ? sc.system : "404");
  const [phase] = useState<Phase>(sc.phase);
  const [now] = useState(NOW[sc.phase]);
  const [guests, setGuests] = useState<AdminGuest[]>(() => guestsFor(sc.phase));
  const [events, setEvents] = useState<AdminEvent[]>(ADMIN_EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(sc.phase === "pre" ? [] : SAMPLE_ANNOUNCEMENTS);
  const [settings, setSettings] = useState<AdminSettings>({
    eventName: EVENT.name,
    dateLabel: EVENT.dateLabel,
    place: EVENT.place,
    doorCode: DOOR_CODE,
    panitiaPin: PANITIA_PIN,
    countdown: true,
    finalFeedbackAt: "13:30",
  });
  const [search, setSearch] = useState(sc.search ?? "");
  const [selected, setSelected] = useState<string | null>(sc.selected ?? null);
  const [sessionExpired, setSessionExpired] = useState(!!sc.sessionExpired);
  const [toast, setToast] = useState<{ icon: IconName; title: string; sub: string } | null>(null);

  const notify = (icon: IconName, title: string, sub: string) => {
    setToast({ icon, title, sub });
    window.setTimeout(() => setToast(null), 3500);
  };

  if (system) return <AdminSystem kind={system} onAction={() => {
          setSystem(undefined);
          setPage("dashboard");
        }} />;
  if (!signedIn) return <Login scenario={sc.login ?? "email"} onSignedIn={() => setSignedIn(true)} />;

  const here = guests.filter((g) => g.checkIn !== null).length;
  const patchGuest = (id: string, patch: Partial<AdminGuest>) => setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const name = (id: string) => guests.find((g) => g.id === id)?.name ?? "";
  const activity = phase === "pre"
    ? []
    : guests
        .filter((g) => g.checkIn !== null)
        .sort((a, b) => (b.checkIn ?? 0) - (a.checkIn ?? 0))
        .slice(0, 6)
        .map((g) => ({ at: g.checkIn as number, text: `${g.name} check-in lewat ${g.checkInBy === "panitia" ? "panitia" : g.checkInBy === "kode" ? "kode pintu" : "scan QR"}` }));

  const goTo = (p: AdminPage) => {
    setPage(p);
    if (p !== "tamu") setSelected(null);
  };

  return (
    <AdminShell
      page={page}
      onNavigate={goTo}
      now={now}
      search={search}
      onSearch={(q) => {
        setSearch(q);
        if (q && page !== "tamu") setPage("tamu");
      }}
      counts={{ hadiah: guests.filter((g) => g.reward === "siap").length }}
      email={ADMIN_EMAIL}
      onLogout={() => setSignedIn(false)}
      banner={sc.offline ? <AdminOfflineBanner /> : undefined}
    >
      {page === "dashboard" && (
        <Dashboard
          phase={phase}
          daysLeft={15}
          now={now}
          guests={guests}
          events={events}
          announcements={announcements}
          activity={activity}
          onNavigate={goTo}
          onEndEvent={(id) => {
            const ev = events.find((e) => e.id === id)!;
            setEvents((es) => es.map((e) => (e.id === id ? { ...e, end: now } : e)));
            notify("Check", `${ev.title} diselesaikan`, `Form feedback dikirim ke ${here} tamu.`);
          }}
          onStartEvent={(id) => {
            const ev = events.find((e) => e.id === id)!;
            setEvents((es) => es.map((e) => (e.id === id ? { ...e, start: now, end: now + (e.end - e.start) } : e)));
            notify("ArrowRight", `${ev.title} dimulai`, `Tamu dapat notifikasi pindah ke ${ROOMS[roomIndexById(ev.roomId)].name}.`);
          }}
        />
      )}
      {page === "tamu" && (
        <Guests
          guests={guests}
          search={search}
          selectedId={selected}
          now={now}
          onSelect={setSelected}
          onCheckIn={(id) => {
            patchGuest(id, { checkIn: now, checkInBy: "panitia" });
            notify("Check", `${name(id)} sudah check-in`, `Tercatat jam ${formatTime(now)} lewat panitia.`);
          }}
          onUndoCheckIn={(id) => {
            patchGuest(id, { checkIn: null, checkInBy: undefined });
            notify("Close", "Check-in dibatalkan", `${name(id)} kembali ke status belum datang.`);
          }}
          onClaimReward={(id) => {
            patchGuest(id, { reward: "diambil" });
            notify("Gift", "Hadiah ditandai diambil", `Voucher ${name(id)} sudah tidak berlaku.`);
          }}
          onExported={() => notify("Download", "CSV diunduh", "tamu-hmd.csv")}
        />
      )}
      {page === "rundown" && (
        <Rundown
          events={events}
          now={now}
          phase={phase}
          initialDraft={sc.rundownDraft?.(events)}
          initialEditId={sc.rundownEdit}
          onSave={(next, send) => {
            setEvents(next);
            notify("Calendar", "Rundown disimpan", send ? `Notifikasi “Rundown berubah” dikirim ke ${here} tamu.` : "Tanpa notifikasi ke tamu.");
          }}
        />
      )}
      {page === "pengumuman" && (
        <Announcements
          history={announcements}
          recipients={here}
          failSend={!!sc.failAnnouncement}
          onSend={(a) => {
            setAnnouncements((list) => [...list, { ...a, id: `a${Date.now()}`, at: now, recipients: here }]);
            notify("Megaphone", "Pengumuman terkirim", `Muncul di HP ${here} tamu.`);
          }}
        />
      )}
      {page === "hadiah" && (
        <Rewards
          guests={guests}
          pin={settings.panitiaPin}
          onClaim={(id) => {
            patchGuest(id, { reward: "diambil" });
            notify("Gift", "Hadiah ditandai diambil", `Voucher ${name(id)} sudah tidak berlaku.`);
          }}
          onChangePin={(pin) => {
            setSettings({ ...settings, panitiaPin: pin });
            notify("Lock", "PIN panitia diganti", "Kabari panitia di meja hadiah.");
          }}
        />
      )}
      {page === "feedback" && (
        <Feedback
          events={events}
          now={now}
          phase={phase}
          perEvent={phase === "pre" ? {} : SAMPLE_EVENT_FEEDBACK}
          final={phase === "ended" ? SAMPLE_FINAL_FEEDBACK : null}
          initialTab={sc.feedbackTab}
          onExported={() => notify("Download", "CSV diunduh", "feedback-hmd.csv")}
        />
      )}
      {page === "pengaturan" && (
        <Settings
          settings={settings}
          onSave={(s) => {
            setSettings(s);
            notify("Check", "Pengaturan disimpan", "Berlaku di HP tamu dalam beberapa detik.");
          }}
        />
      )}

      {toast && (
        <div className="admin-toast">
          <Toast lead={<ToastIcon icon={toast.icon} tone="accent" />} title={toast.title} sub={toast.sub} />
        </div>
      )}
      {sessionExpired && (
        <Dialog
          title="Sesi kamu sudah habis"
          onClose={() => undefined}
          actions={
            <Button
              block
              icon="Mail"
              onClick={() => {
                setSessionExpired(false);
                setSignedIn(false);
              }}
            >
              Masuk lagi
            </Button>
          }
        >
          Demi keamanan, sesi admin berakhir setelah 12 jam. Masuk lagi dengan PIN baru dari email.
        </Dialog>
      )}
    </AdminShell>
  );
}
