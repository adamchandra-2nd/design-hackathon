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
import { Dashboard, type Activity, type Phase } from "./Dashboard";
import {
  ADMIN_EMAIL,
  ADMIN_EVENTS,
  ADMIN_GUESTS,
  NEW_INVITEES,
  SAMPLE_ANNOUNCEMENTS,
  SAMPLE_EVENT_FEEDBACK,
  SAMPLE_FINAL_FEEDBACK,
  type AdminEvent,
  type AdminGuest,
  type Announcement,
} from "./data";
import { Feedback } from "./Feedback";
import { Guests } from "./Guests";
import { DEFAULT_TEMPLATE } from "./invite";
import { Login } from "./Login";
import { ADMIN_LINKS } from "./links";
import { Notifications, type AdminNotice } from "./Notifications";
import { Rewards } from "./Rewards";
import { Rundown } from "./Rundown";
import { Settings, type AdminSettings } from "./Settings";
import { Undangan } from "./Undangan";

const NOW: Record<Phase, number> = { pre: 8 * 60, live: DEMO_NOW.live, ended: DEMO_NOW.ended };
const TODAY = new Date(2026, 9, 25);

const newGuest = (id: string, name: string, phone: string): AdminGuest => ({
  id,
  name,
  email: "",
  rsvp: "belum",
  checkIn: null,
  hadir: false,
  phone,
  invite: "belum",
  cards: 0,
  reward: "mengumpulkan",
  finalFeedback: false,
});

/** Before D-day nobody has checked in or collected cards yet. Uninvited guests and one failed send are there in every phase. */
function guestsFor(phase: Phase): AdminGuest[] {
  const base: AdminGuest[] =
    phase === "pre"
      ? ADMIN_GUESTS.map((g) => ({ ...g, checkIn: null, checkInBy: undefined, hadir: false, cards: 0, reward: "mengumpulkan", claimedAt: undefined }))
      : ADMIN_GUESTS;
  const firstPending = base.findIndex((g) => g.rsvp === "belum");
  return [
    ...NEW_INVITEES.map((n) => newGuest(`baru-${n.name.toLowerCase()}`, n.name, n.phone)),
    ...base.map((g, i) => (i === firstPending ? { ...g, invite: "gagal" as const, inviteError: "Nomor tidak terdaftar di WhatsApp" } : g)),
  ];
}

/** Recent things guests did, newest first. Feedback is anonymous, so it never carries a name. */
function activityOf(guests: AdminGuest[], phase: Phase, now: number): Activity[] {
  if (phase === "pre") return [];
  const list: Activity[] = [];
  guests.forEach((g) => {
    if (g.checkIn !== null && g.checkInBy) list.push({ at: g.checkIn, guest: g.name, kind: g.checkInBy });
    if (g.reward !== "mengumpulkan" && g.checkIn !== null) list.push({ at: g.checkIn + 35, guest: g.name, kind: "reward-ready", detail: "5/5 kartu" });
    if (g.reward === "diambil" && g.claimedAt) list.push({ at: g.claimedAt, guest: g.name, kind: "reward-claimed" });
  });
  Object.values(SAMPLE_EVENT_FEEDBACK)
    .flat()
    .forEach((f) => list.push({ at: f.at, guest: "Tamu anonim", kind: "feedback", detail: `Pembukaan · ${f.rating}/5` }));
  return list.filter((a) => a.at <= now).sort((a, b) => b.at - a.at).slice(0, 12);
}

const SAMPLE_NOTICES = (phase: Phase): AdminNotice[] =>
  phase === "pre"
    ? [
        { id: "n-gagal", kind: "action", icon: "Close", tone: "red", title: "1 undangan gagal terkirim", body: "Nomor tidak terdaftar di WhatsApp. Cek lalu kirim ulang.", at: 7 * 60 + 50, read: false, page: "undangan" },
        { id: "n-rsvp", kind: "info", icon: "ChatCheck", tone: "green", title: "3 RSVP baru", body: "Laras, Dimas, dan Putri akan datang.", at: 7 * 60 + 30, read: true, page: "tamu" },
      ]
    : [
        { id: "n-hadiah", kind: "action", icon: "Gift", tone: "amber", title: "Sinta siap ambil hadiah", body: "5/5 kartu kenalan. Siapkan voucher di meja panitia.", at: NOW[phase] - 4, read: false, page: "hadiah" },
        { id: "n-gagal", kind: "action", icon: "Close", tone: "red", title: "1 undangan gagal terkirim", body: "Nomor tidak terdaftar di WhatsApp. Cek lalu kirim ulang.", at: NOW[phase] - 20, read: false, page: "undangan" },
        { id: "n-bentrok", kind: "info", icon: "Calendar", tone: "blue", title: "Talkshow mulai 10 menit lagi", body: "Ruang Omakase. Tamu otomatis dapat notifikasi.", at: NOW[phase] - 10, read: false, page: "rundown" },
        { id: "n-feedback", kind: "info", icon: "Star", tone: "purple", title: "5 feedback baru untuk Pembukaan", body: "Rata-rata 4,2 dari 5.", at: NOW[phase] - 45, read: true, page: "feedback" },
      ];

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
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    sc.phase === "pre" ? [] : sc.failAnnouncement ? [...SAMPLE_ANNOUNCEMENTS, { id: "a-gagal", title: "Makan siang siap", body: "Silakan ke Ruang Meeting.", roomId: "ruang-meeting", at: NOW.live - 3, recipients: 22, read: 0, failed: true }] : SAMPLE_ANNOUNCEMENTS,
  );
  const [settings, setSettings] = useState<AdminSettings>({
    eventName: EVENT.name,
    date: new Date(2026, 10, 8),
    place: { name: EVENT.place, address: "Jl. Kemang Raya No. 18, Bangka, Mampang Prapatan, Jakarta Selatan" },
    doorCode: DOOR_CODE,
    panitiaPin: PANITIA_PIN,
    countdown: true,
    finalFeedbackAt: 13 * 60 + 30,
    codesChangedAt: 7 * 60 + 45,
  });
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [notices, setNotices] = useState<AdminNotice[]>(() => SAMPLE_NOTICES(sc.phase));
  const [search, setSearch] = useState(sc.search ?? "");
  const [selected, setSelected] = useState<string | null>(sc.selected ?? null);
  const [inviteFor, setInviteFor] = useState<string | undefined>(sc.undangan?.single);
  const [sessionExpired, setSessionExpired] = useState(!!sc.sessionExpired);
  const [toast, setToast] = useState<{ icon: IconName; title: string; sub: string; action?: { label: string; page: AdminPage } } | null>(
    sc.actionToast ? { icon: "Gift", title: "Sinta siap ambil hadiah", sub: "5/5 kartu kenalan. Siapkan voucher di meja panitia.", action: { label: "Buka Hadiah", page: "hadiah" } } : null,
  );

  const notify = (icon: IconName, title: string, sub: string, action?: { label: string; page: AdminPage }) => {
    setToast({ icon, title, sub, action });
    window.setTimeout(() => setToast((t) => (t?.title === title ? null : t)), action ? 6000 : 3500);
  };
  /** Things that need the committee go to the bell and pop up as a toast. */
  const pushNotice = (n: Omit<AdminNotice, "id" | "at" | "read">) => {
    setNotices((list) => [{ ...n, id: `n${Date.now()}`, at: now, read: false }, ...list]);
    if (n.kind === "action") notify(n.icon, n.title, n.body, { label: "Lihat", page: n.page });
  };

  if (system)
    return (
      <AdminSystem
        kind={system}
        onAction={() => {
          setSystem(undefined);
          setPage("dashboard");
        }}
      />
    );
  if (!signedIn) return <Login scenario={sc.login ?? "email"} onSignedIn={() => setSignedIn(true)} />;

  const present = guests.filter((g) => g.checkIn !== null && g.hadir).length;
  const patchGuest = (id: string, patch: Partial<AdminGuest>) => setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  const name = (id: string) => guests.find((g) => g.id === id)?.name ?? "";

  const goTo = (p: AdminPage) => {
    setPage(p);
    if (p !== "tamu") setSelected(null);
    if (p !== "undangan") setInviteFor(undefined);
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
      counts={{ hadiah: guests.filter((g) => g.reward === "siap").length, undangan: guests.filter((g) => g.rsvp === "belum" && g.invite === "gagal").length }}
      email={ADMIN_EMAIL}
      onLogout={() => setSignedIn(false)}
      banner={sc.offline ? <AdminOfflineBanner /> : undefined}
      bell={
        <Notifications
          notices={notices}
          now={now}
          initialOpen={sc.notifOpen}
          onOpen={(n) => {
            setNotices((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
            goTo(n.page);
            if (n.guestId) setSelected(n.guestId);
          }}
          onReadAll={() => setNotices((list) => list.map((x) => ({ ...x, read: true })))}
        />
      }
    >
      {page === "dashboard" && (
        <Dashboard
          phase={phase}
          daysLeft={14}
          now={now}
          guests={guests}
          events={events}
          announcements={announcements}
          activity={activityOf(guests, phase, now)}
          onNavigate={goTo}
          onEndEvent={(id) => {
            const ev = events.find((e) => e.id === id)!;
            setEvents((es) => es.map((e) => (e.id === id ? { ...e, end: now } : e)));
            notify("Check", `${ev.title} diselesaikan`, `Form feedback dikirim ke ${present} tamu.`);
          }}
          onStartEvent={(id) => {
            const ev = events.find((e) => e.id === id)!;
            setEvents((es) => es.map((e) => (e.id === id ? { ...e, start: now, end: now + (e.end - e.start) } : e)));
            notify("ArrowRight", `${ev.title} dimulai`, `Tamu dapat notifikasi pindah ke ${ROOMS[roomIndexById(ev.roomId)].name}.`);
          }}
        />
      )}
      {page === "undangan" && (
        <Undangan
          guests={guests}
          now={now}
          template={template}
          initialTab={sc.undangan?.tab}
          initialSelected={sc.undangan?.selected}
          initialDialog={sc.undangan?.dialog}
          initialSingle={inviteFor}
          onPatch={patchGuest}
          onAdd={(rows) => {
            const stamp = Date.now();
            const added = rows.map((r, i) => newGuest(`csv-${stamp}-${i}`, r.name, r.phone));
            setGuests((gs) => [...added, ...gs]);
            return added.map((g) => g.id);
          }}
          onTemplate={(t) => {
            setTemplate(t);
            notify("Message", "Pesan undangan disimpan", "Dipakai untuk undangan berikutnya.");
          }}
          onDone={(sent, failed) => {
            if (failed.length)
              pushNotice({
                kind: "action",
                icon: "Close",
                tone: "red",
                title: failed.length === 1 ? `Undangan ke ${failed[0].name} gagal` : `${failed.length} undangan gagal terkirim`,
                body: `${failed[0].inviteError ?? "Coba lagi"}. Cek nomornya lalu kirim ulang.`,
                page: "undangan",
              });
            else if (sent) notify("Send", `${sent} undangan terkirim`, "Status berubah jadi Dibaca begitu tamu membuka pesannya.");
          }}
          onToast={(title, sub) => notify("Send", title, sub)}
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
            patchGuest(id, { checkIn: now, checkInBy: "panitia", hadir: true });
            notify("Check", `${name(id)} sudah check-in`, `Tercatat jam ${formatTime(now)} lewat panitia.`);
          }}
          onUndoCheckIn={(id) => {
            patchGuest(id, { checkIn: null, checkInBy: undefined, hadir: false });
            notify("Close", "Check-in dibatalkan", `${name(id)} kembali ke status belum datang.`);
          }}
          onClaimReward={(id) => {
            patchGuest(id, { reward: "diambil", claimedAt: now });
            notify("Gift", "Hadiah ditandai diambil", `Voucher ${name(id)} sudah tidak berlaku.`);
          }}
          onInvite={(id) => {
            setInviteFor(id);
            setPage("undangan");
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
            notify("Calendar", "Rundown disimpan", send ? `Notifikasi “Rundown berubah” dikirim ke ${present} tamu.` : "Tanpa notifikasi ke tamu.");
          }}
        />
      )}
      {page === "pengumuman" && (
        <Announcements
          history={announcements}
          recipients={present}
          now={now}
          failSend={!!sc.failAnnouncement}
          onSend={(a) => {
            setAnnouncements((list) => [...list, { ...a, id: `a${Date.now()}`, at: now, recipients: present, read: 0 }]);
            notify("Megaphone", "Pengumuman terkirim", `Muncul di HP ${present} tamu.`);
          }}
          onResend={(id) => {
            setAnnouncements((list) => list.map((a) => (a.id === id ? { ...a, failed: false, at: now, recipients: present, read: 0 } : a)));
            notify("Megaphone", "Pengumuman terkirim ulang", `Muncul di HP ${present} tamu.`);
          }}
        />
      )}
      {page === "hadiah" && (
        <Rewards
          guests={guests}
          pin={settings.panitiaPin}
          changedAt={settings.codesChangedAt}
          onClaim={(id) => {
            patchGuest(id, { reward: "diambil", claimedAt: now });
            notify("Gift", "Hadiah ditandai diambil", `Voucher ${name(id)} sudah tidak berlaku.`);
          }}
          onChangePin={(pin) => {
            setSettings({ ...settings, panitiaPin: pin, codesChangedAt: now });
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
          present={present}
          initialTab={sc.feedbackTab}
          onExported={() => notify("Download", "CSV diunduh", "feedback-hmd.csv")}
        />
      )}
      {page === "pengaturan" && (
        <Settings
          settings={settings}
          today={TODAY}
          onSave={(s) => {
            setSettings(s);
            notify("Check", "Pengaturan disimpan", "Berlaku di HP tamu dalam beberapa detik.");
          }}
          onCopied={(what) => notify("Copy", `${what} disalin`, "Tempel di grup panitia.")}
        />
      )}

      {toast && (
        <div className="admin-toast">
          <Toast
            lead={<ToastIcon icon={toast.icon} tone="accent" />}
            title={toast.title}
            sub={toast.sub}
            action={
              toast.action ? (
                <Button
                  size="small"
                  block
                  icon="ArrowRight"
                  onClick={() => {
                    goTo(toast.action!.page);
                    setToast(null);
                  }}
                >
                  {toast.action.label}
                </Button>
              ) : undefined
            }
          />
        </div>
      )}
      {sessionExpired && (
        <Dialog
          icon="Lock"
          iconTone="ink"
          title="Sesi kamu sudah habis"
          description="Demi keamanan, sesi admin berakhir setelah 12 jam. Masuk lagi dengan PIN baru dari email."
          onClose={() => undefined}
          actions={
            <Button
              icon="Mail"
              onClick={() => {
                setSessionExpired(false);
                setSignedIn(false);
              }}
            >
              Masuk lagi
            </Button>
          }
        />
      )}
    </AdminShell>
  );
}
