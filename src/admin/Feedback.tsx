import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { formatTime, statusAt } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import { downloadCsv } from "./csv";
import type { AdminEvent, EventFeedbackEntry } from "./data";
import type { Phase } from "./Dashboard";

type Final = { ratings: number[]; moods: Record<string, number>; messages: string[] };
type Props = {
  events: AdminEvent[];
  now: number;
  phase: Phase;
  perEvent: Record<string, EventFeedbackEntry[]>;
  final: Final | null;
  initialTab?: string;
  onExported: () => void;
};

const avg = (ratings: number[]) => (ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);

/** Feedback results: per event (anonymous rating + text) and the final event feedback. */
export function Feedback({ events, now, phase, perEvent, final, initialTab, onExported }: Props) {
  const status = phase === "ended" ? Object.fromEntries(events.map((e) => [e.id, "done"])) : phase === "pre" ? {} : statusAt(now);
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const [tab, setTab] = useState<string>(initialTab ?? sorted.find((e) => status[e.id] === "done")?.id ?? "akhir");
  const event = events.find((e) => e.id === tab);
  const entries = perEvent[tab] ?? [];

  const exportCsv = () => {
    downloadCsv("feedback-hmd.csv", [
      ["Acara", "Rating", "Feedback", "Jam"],
      ...Object.entries(perEvent).flatMap(([id, list]) => list.map((f) => [events.find((e) => e.id === id)?.title ?? id, f.rating, f.text, formatTime(f.at)])),
    ]);
    onExported();
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Feedback</h1>
          <p className="t-p-h4 admin-sub">Semua feedback anonim. Nama tamu tidak pernah tercatat di sini.</p>
        </div>
        <div className="admin-actions">
          <Button size="small" style="tertiary" icon="Download" onClick={exportCsv}>
            Ekspor CSV
          </Button>
        </div>
      </div>

      <div className="pill-tabs" role="tablist">
        {sorted.map((e) => (
          <button key={e.id} type="button" role="tab" aria-selected={tab === e.id} className={`pill-tab t-p-h5-bold${tab === e.id ? " is-active clay clay-dark" : ""}`} onClick={() => setTab(e.id)}>
            {e.title}
            <span className="pill-tab__count">{(perEvent[e.id] ?? []).length}</span>
          </button>
        ))}
        <button type="button" role="tab" aria-selected={tab === "akhir"} className={`pill-tab t-p-h5-bold${tab === "akhir" ? " is-active clay clay-dark" : ""}`} onClick={() => setTab("akhir")}>
          Feedback akhir
        </button>
      </div>

      {event ? (
        status[event.id] !== "done" ? (
          <Empty icon="Clock" title={`${event.title} belum selesai`} body="Form feedback dikirim ke tamu begitu acara diselesaikan." />
        ) : entries.length === 0 ? (
          <Empty icon="Star" title="Belum ada feedback" body="Tamu sedang mengisi. Hasilnya muncul di sini secara langsung." />
        ) : (
          <div className="admin-grid">
            <section className="admin-panel">
              <div className="admin-panel__head">
                <h2 className="t-p-h3-bold admin-panel__title">Komentar ({entries.length})</h2>
                <Badge type="room">{ROOMS[roomIndexById(event.roomId)].name}</Badge>
              </div>
              <ul className="fb-list">
                {entries.map((f, i) => (
                  <li key={i} className="fb-list__item">
                    <span className="fb-stars" aria-label={`${f.rating} bintang`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Icon key={n} name={n <= f.rating ? "StarFill" : "Star"} size={16} />
                      ))}
                    </span>
                    <span className="t-p-h4">{f.text}</span>
                    <span className="t-p-h5 admin-muted">Anonim · {formatTime(f.at)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <Summary ratings={entries.map((e) => e.rating)} />
          </div>
        )
      ) : !final ? (
        <Empty icon="Lock" title="Feedback akhir belum dibuka" body="Tab Feedback di HP tamu terbuka setelah acara selesai." />
      ) : (
        <div className="admin-grid">
          <div className="admin-col">
            <section className="admin-panel">
              <h2 className="t-p-h3-bold admin-panel__title">Yang paling berkesan</h2>
              {Object.entries(final.moods)
                .sort((a, b) => b[1] - a[1])
                .map(([m, n]) => (
                  <div key={m} className="fb-bar">
                    <span className="t-p-h5-bold fb-bar__label">{m}</span>
                    <span className="fb-bar__track">
                      <span style={{ width: `${(n / Math.max(...Object.values(final.moods))) * 100}%` }} />
                    </span>
                    <span className="t-p-h5 admin-muted">{n}</span>
                  </div>
                ))}
            </section>
            <section className="admin-panel">
              <h2 className="t-p-h3-bold admin-panel__title">Pesan buat Potara</h2>
              <ul className="fb-list">
                {final.messages.map((m, i) => (
                  <li key={i} className="fb-list__item">
                    <span className="t-p-h4">{m}</span>
                    <span className="t-p-h5 admin-muted">Anonim</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <Summary ratings={final.ratings.flatMap((n, i) => Array(n).fill(i + 1))} />
        </div>
      )}
    </div>
  );
}

function Summary({ ratings }: { ratings: number[] }) {
  const a = avg(ratings);
  return (
    <section className="admin-panel fb-summary">
      <span className="t-p-h5-bold admin-muted">Rata-rata</span>
      <span className="fb-summary__avg">{a.toFixed(1)}</span>
      <span className="fb-stars fb-stars--big">
        {[1, 2, 3, 4, 5].map((n) => (
          <Icon key={n} name={n <= Math.round(a) ? "StarFill" : "Star"} size={24} />
        ))}
      </span>
      <span className="t-p-h5 admin-muted">dari {ratings.length} tamu</span>
      <div className="fb-dist">
        {[5, 4, 3, 2, 1].map((n) => {
          const c = ratings.filter((r) => r === n).length;
          return (
            <div key={n} className="fb-bar">
              <span className="t-p-h5-bold fb-bar__label">{n} ★</span>
              <span className="fb-bar__track">
                <span style={{ width: `${ratings.length ? (c / ratings.length) * 100 : 0}%` }} />
              </span>
              <span className="t-p-h5 admin-muted">{c}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Empty({ icon, title, body }: { icon: "Clock" | "Star" | "Lock"; title: string; body: string }) {
  return (
    <section className="admin-panel">
      <div className="admin-empty">
        <span className="admin-empty__icon">
          <Icon name={icon} />
        </span>
        <span className="t-p-h4-bold">{title}</span>
        <span className="t-p-h5">{body}</span>
      </div>
    </section>
  );
}
