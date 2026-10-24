import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { formatTime, statusAt } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import type { AdminPage } from "./AdminShell";
import type { AdminEvent, AdminGuest, Announcement } from "./data";

export type Phase = "pre" | "live" | "ended";

type Props = {
  phase: Phase;
  daysLeft: number;
  now: number;
  guests: AdminGuest[];
  events: AdminEvent[];
  announcements: Announcement[];
  activity: { at: number; text: string }[];
  onNavigate: (p: AdminPage) => void;
  onEndEvent: (id: string) => void;
  onStartEvent: (id: string) => void;
};

const roomName = (id: string) => ROOMS[roomIndexById(id)].name;

/** Overview: stat strip, today's rundown + activity, and the live event as the single orange hero. */
export function Dashboard({ phase, daysLeft, now, guests, events, announcements, activity, onNavigate, onEndEvent, onStartEvent }: Props) {
  const yes = guests.filter((g) => g.rsvp === "ya").length;
  const no = guests.filter((g) => g.rsvp === "tidak").length;
  const pending = guests.filter((g) => g.rsvp === "belum").length;
  const here = guests.filter((g) => g.checkIn !== null).length;
  const cards = guests.reduce((n, g) => n + g.cards, 0);
  const ready = guests.filter((g) => g.reward !== "mengumpulkan").length;
  const claimed = guests.filter((g) => g.reward === "diambil").length;
  const status = statusAt(now);
  const live = phase === "live" ? events.find((e) => status[e.id] === "now") : undefined;
  const next = phase === "ended" ? undefined : events.find((e) => (phase === "pre" ? true : status[e.id] === "next"));
  const sorted = [...events].sort((a, b) => a.start - b.start);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Dashboard</h1>
          <p className="t-p-h4 admin-sub">
            {phase === "pre" ? `Hari H dalam ${daysLeft} hari. Pantau RSVP dulu.` : phase === "live" ? "Acara sedang berjalan." : "Acara sudah selesai. Terima kasih, panitia!"}
          </p>
        </div>
        <div className="admin-actions">
          <Button size="small" style="tertiary" icon="Megaphone" onClick={() => onNavigate("pengumuman")}>
            Buat pengumuman
          </Button>
        </div>
      </div>

      <section className="stat-strip" aria-label="Ringkasan">
        <Stat label="RSVP hadir" value={yes} extra={`${no} tidak · ${pending} belum jawab`} />
        <Stat label="Sudah check-in" value={here} of={yes} />
        <Stat label="Kartu kenalan" value={cards} extra={phase === "pre" ? "Belum mulai" : "terkumpul total"} />
        <Stat label="Hadiah" value={claimed} of={ready} extra="diambil dari yang siap" />
      </section>

      <div className="admin-grid">
        <div className="admin-col">
          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="t-p-h3-bold admin-panel__title">Rundown hari ini</h2>
              <Button size="small" style="tertiary" icon="ArrowRight" onClick={() => onNavigate("rundown")}>
                Atur rundown
              </Button>
            </div>
            <ol className="dash-rundown">
              {sorted.map((e) => {
                const s = phase === "pre" ? "later" : phase === "ended" ? "done" : status[e.id];
                return (
                  <li key={e.id} className={`dash-rundown__item is-${s}`}>
                    <span className="t-p-h5-bold dash-rundown__time">{formatTime(e.start)}</span>
                    <span className="dash-rundown__dot" />
                    <span className="dash-rundown__body">
                      <span className="t-p-h4-bold">{e.title}</span>
                      <span className="t-p-h5 admin-muted">
                        {roomName(e.roomId)} · {formatTime(e.start)}–{formatTime(e.end)}
                      </span>
                    </span>
                    {s === "now" && <Badge type="now">Sekarang</Badge>}
                    {s === "next" && <Badge type="next">Berikutnya</Badge>}
                    {s === "done" && <Badge type="done">Selesai</Badge>}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="t-p-h3-bold admin-panel__title">Aktivitas terbaru</h2>
              <Button size="small" style="tertiary" icon="ArrowRight" onClick={() => onNavigate("tamu")}>
                Lihat tamu
              </Button>
            </div>
            {activity.length === 0 ? (
              <div className="admin-empty">
                <span className="admin-empty__icon">
                  <Icon name="Clock" />
                </span>
                <span className="t-p-h4">Belum ada aktivitas. Check-in dibuka di hari H.</span>
              </div>
            ) : (
              <ul className="dash-activity">
                {activity.map((a, i) => (
                  <li key={i} className="dash-activity__item">
                    <span className="t-p-h5 admin-muted">{formatTime(a.at)}</span>
                    <span className="t-p-h4">{a.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="admin-col">
          {/* The one orange hero on the page */}
          <section className="dash-hero clay clay-accent">
            {live ? (
              <>
                <span className="agenda-card__tags">
                  <Badge type="now">Sekarang</Badge>
                </span>
                <span className="dash-hero__title">{live.title}</span>
                <span className="t-p-h4">
                  {roomName(live.roomId)} · sampai {formatTime(live.end)}
                </span>
                <Button block style="secondary" icon="Check" onClick={() => onEndEvent(live.id)}>
                  Selesaikan acara
                </Button>
                <span className="t-p-h5 dash-hero__note">Tamu langsung dapat form feedback acara ini.</span>
              </>
            ) : phase === "pre" ? (
              <>
                <span className="agenda-card__tags">
                  <Badge type="next">Belum mulai</Badge>
                </span>
                <span className="dash-hero__title">{daysLeft} hari lagi</span>
                <span className="t-p-h4">{yes} tamu sudah konfirmasi hadir.</span>
              </>
            ) : phase === "ended" ? (
              <>
                <span className="agenda-card__tags">
                  <Badge type="complete">Selesai</Badge>
                </span>
                <span className="dash-hero__title">Semua acara selesai</span>
                <Button block style="secondary" icon="ArrowRight" onClick={() => onNavigate("feedback")}>
                  Lihat feedback
                </Button>
              </>
            ) : (
              <>
                <span className="agenda-card__tags">
                  <Badge type="next">Jeda</Badge>
                </span>
                <span className="dash-hero__title">Tidak ada acara berjalan</span>
              </>
            )}
          </section>

          {next && (
            <section className="admin-panel">
              <span className="agenda-card__tags">
                <Badge type="next">Berikutnya</Badge>
              </span>
              <h2 className="t-display-h6 admin-panel__title">{next.title}</h2>
              <span className="t-p-h5 admin-muted">
                {roomName(next.roomId)} · {formatTime(next.start)}–{formatTime(next.end)}
              </span>
              {phase === "live" && (
                <Button block style="tertiary" icon="ArrowRight" onClick={() => onStartEvent(next.id)}>
                  Mulai sekarang
                </Button>
              )}
            </section>
          )}

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h2 className="t-p-h3-bold admin-panel__title">Pengumuman terakhir</h2>
            </div>
            {announcements.length ? (
              <div className="dash-ann">
                <span className="t-p-h4-bold">{announcements[announcements.length - 1].title}</span>
                <span className="t-p-h5 admin-muted">{announcements[announcements.length - 1].body}</span>
              </div>
            ) : (
              <span className="t-p-h5 admin-muted">Belum ada pengumuman.</span>
            )}
            <Button block size="small" style="tertiary" icon="Plus" onClick={() => onNavigate("pengumuman")}>
              Pengumuman baru
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, of, extra }: { label: string; value: number; of?: number; extra?: string }) {
  return (
    <div className="stat">
      <span className="t-p-h5-bold stat__label">{label}</span>
      <span className="stat__row">
        <span className="stat__value">{value}</span>
        {of !== undefined && <span className="t-p-h4 admin-muted">/ {of}</span>}
      </span>
      {of !== undefined ? (
        <span className="stat__bar">
          <span style={{ width: `${of ? Math.round((value / of) * 100) : 0}%` }} />
        </span>
      ) : null}
      {extra && <span className="t-p-h5 admin-muted">{extra}</span>}
    </div>
  );
}
