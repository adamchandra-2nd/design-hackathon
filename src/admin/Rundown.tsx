import { useRef, useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import { Toggle } from "../components/Toggle";
import { DAY_END, DAY_START, formatTime, statusAt } from "../data/agenda";
import { ROOMS } from "../data/rooms";
import type { AdminEvent } from "./data";
import type { Phase } from "./Dashboard";

/** Whole day (09.00–14.00) fits one desktop screen: 300 min × 1.7 px. */
const PX = 1.7;
const SNAP = 5;
const MIN_DURATION = 15;
const HOURS = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START + i * 60);

type Drag = { id: string; mode: "move" | "resize"; x: number; y: number; start: number; end: number; room: number; moved: boolean };

type Props = {
  events: AdminEvent[];
  now: number;
  phase: Phase;
  /** Review cases: open with a draft already changed / an event open in the editor. */
  initialDraft?: AdminEvent[];
  initialEditId?: string;
  onSave: (events: AdminEvent[], notify: boolean) => void;
};

const roomIndex = (id: string) => ROOMS.findIndex((r) => r.id === id);
const snap = (m: number) => Math.round(m / SNAP) * SNAP;
const parseTime = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + (m || 0);
};
const toInput = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function conflicts(events: AdminEvent[]) {
  const out: [AdminEvent, AdminEvent][] = [];
  events.forEach((a, i) =>
    events.slice(i + 1).forEach((b) => {
      if (a.roomId === b.roomId && a.start < b.end && b.start < a.end) out.push([a, b]);
    }),
  );
  return out;
}

/**
 * Rundown editor: one column per room, the whole day on one screen. Drag a card to move it
 * (time and room), drag its bottom edge to change duration, or click it to edit. Changes stay
 * a draft until saved, with an option to notify guests.
 */
export function Rundown({ events, now, phase, initialDraft, initialEditId, onSave }: Props) {
  const [draft, setDraft] = useState<AdminEvent[]>(initialDraft ?? events);
  const [editing, setEditing] = useState<AdminEvent | "new" | null>(initialEditId ? (events.find((e) => e.id === initialEditId) ?? null) : null);
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState(true);
  const drag = useRef<Drag | null>(null);
  const cols = useRef<HTMLDivElement>(null);

  const status = phase === "pre" ? {} : statusAt(now);
  const locked = (e: AdminEvent) => phase === "ended" || status[e.id] === "done";
  const changed = draft.filter((d) => {
    const o = events.find((e) => e.id === d.id);
    return !o || o.start !== d.start || o.end !== d.end || o.roomId !== d.roomId || o.title !== d.title;
  });
  const removed = events.filter((e) => !draft.some((d) => d.id === e.id));
  const dirty = changed.length > 0 || removed.length > 0;
  const clashes = conflicts(draft);
  const clashIds = new Set(clashes.flat().map((e) => e.id));
  const sorted = [...draft].sort((a, b) => a.start - b.start);

  const update = (id: string, patch: Partial<AdminEvent>) => setDraft((d) => d.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const onPointerDown = (e: React.PointerEvent, ev: AdminEvent, mode: Drag["mode"]) => {
    if (locked(ev)) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: ev.id, mode, x: e.clientX, y: e.clientY, start: ev.start, end: ev.end, room: roomIndex(ev.roomId), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dy) < 4 && Math.abs(e.clientX - d.x) < 4) return;
    d.moved = true;
    const dMin = snap(dy / PX);
    if (d.mode === "resize") {
      update(d.id, { end: Math.min(DAY_END, Math.max(d.start + MIN_DURATION, d.end + dMin)) });
      return;
    }
    const dur = d.end - d.start;
    const start = Math.min(DAY_END - dur, Math.max(DAY_START, d.start + dMin));
    let room = d.room;
    const box = cols.current?.getBoundingClientRect();
    if (box) room = Math.min(ROOMS.length - 1, Math.max(0, Math.floor(((e.clientX - box.left) / box.width) * ROOMS.length)));
    update(d.id, { start, end: start + dur, roomId: ROOMS[room].id });
  };
  const onPointerUp = (ev: AdminEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) setEditing(ev);
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Rundown</h1>
          <p className="t-p-h4 admin-sub">Geser kartu untuk pindah, tarik tepi bawah untuk durasi, klik untuk edit.</p>
        </div>
        <div className="admin-actions">
          {dirty && (
            <Button size="small" style="tertiary" onClick={() => setDraft(events)}>
              Batalkan perubahan
            </Button>
          )}
          <Button size="small" style="secondary" icon="Plus" onClick={() => setEditing("new")}>
            Tambah acara
          </Button>
          <Button size="small" disabled={!dirty || clashes.length > 0} onClick={() => setSaving(true)}>
            Simpan perubahan
          </Button>
        </div>
      </div>

      {/* Whole day at a glance, in order */}
      <div className="rundown-strip" aria-label="Urutan acara">
        {sorted.map((e, i) => (
          <span key={e.id} className="rundown-strip__item">
            {i > 0 && <Icon name="ChevronRight" size={16} />}
            <span className={`rundown-strip__chip t-p-h5-bold${status[e.id] === "now" ? " is-now clay clay-dark" : ""}${status[e.id] === "done" ? " is-done" : ""}`}>
              {formatTime(e.start)} {e.title}
            </span>
          </span>
        ))}
      </div>

      {(dirty || clashes.length > 0) && (
        <div className={`rundown-banner t-p-h5-bold${clashes.length ? " is-error" : ""}`} role="status">
          <Icon name={clashes.length ? "Close" : "Pencil"} size={16} />
          {clashes.length
            ? `Jadwal bentrok di ${ROOMS[roomIndex(clashes[0][0].roomId)].name}: ${clashes[0][0].title} dan ${clashes[0][1].title}. Geser salah satunya dulu.`
            : `${changed.length + removed.length} perubahan belum disimpan.`}
        </div>
      )}

      <section className="admin-panel rundown">
        <div className="rundown__head">
          <span />
          {ROOMS.map((r) => (
            <span key={r.id} className="rundown__room t-p-h5-bold">
              <Icon name="MapPin" size={16} />
              {r.name}
            </span>
          ))}
        </div>
        <div className="rundown__body" style={{ height: (DAY_END - DAY_START) * PX }}>
          {HOURS.map((h) => (
            <div key={h} className="rundown__hour" style={{ top: (h - DAY_START) * PX }}>
              <span className="t-p-h5 rundown__label">{formatTime(h)}</span>
              <span className="rundown__rule" />
            </div>
          ))}
          <div ref={cols} className="rundown__cols">
            {ROOMS.map((r) => (
              <div key={r.id} className="rundown__col" />
            ))}
            {draft.map((e) => {
              const s = status[e.id];
              const lock = locked(e);
              const col = roomIndex(e.roomId);
              return (
                <article
                  key={e.id}
                  className={`rundown__event clay clay-light is-${s ?? "later"}${clashIds.has(e.id) ? " is-clash" : ""}${lock ? " is-locked" : ""}${changed.some((c) => c.id === e.id) ? " is-changed" : ""}`}
                  style={{
                    top: (e.start - DAY_START) * PX,
                    height: (e.end - e.start) * PX,
                    left: `calc(${(col / ROOMS.length) * 100}% + 4px)`,
                    width: `calc(${100 / ROOMS.length}% - 8px)`,
                  }}
                  onPointerDown={(p) => onPointerDown(p, e, "move")}
                  onPointerMove={onPointerMove}
                  onPointerUp={() => onPointerUp(e)}
                  title={lock ? "Acara sudah selesai, tidak bisa diubah" : "Geser untuk pindah, klik untuk edit"}
                >
                  <span className="rundown__event-title t-p-h5-bold">{e.title}</span>
                  <span className="t-p-h5 rundown__event-time">
                    {formatTime(e.start)}–{formatTime(e.end)}
                  </span>
                  {s === "now" && <span className="rundown__live" aria-label="Sedang berlangsung" />}
                  {lock ? (
                    <Icon name="Lock" size={16} className="rundown__lock" />
                  ) : (
                    <span
                      className="rundown__resize"
                      aria-label="Ubah durasi"
                      onPointerDown={(p) => onPointerDown(p, e, "resize")}
                      onPointerMove={onPointerMove}
                      onPointerUp={() => (drag.current = null)}
                    />
                  )}
                </article>
              );
            })}
          </div>
          {phase === "live" && now >= DAY_START && now <= DAY_END && (
            <>
              {/* Line runs behind the cards; the time label stays on top in the hour column */}
              <span className="rundown__now-line" style={{ top: (now - DAY_START) * PX }} />
              <span className="t-p-h5-bold rundown__now-time" style={{ top: (now - DAY_START) * PX }}>
                {formatTime(now)}
              </span>
            </>
          )}
        </div>
      </section>

      {editing && (
        <EventEditor
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onApply={(ev) => {
            setDraft((d) => (d.some((x) => x.id === ev.id) ? d.map((x) => (x.id === ev.id ? ev : x)) : [...d, ev]));
            setEditing(null);
          }}
          onDelete={(id) => {
            setDraft((d) => d.filter((x) => x.id !== id));
            setEditing(null);
          }}
        />
      )}

      {saving && (
        <Dialog
          title="Simpan perubahan rundown?"
          onClose={() => setSaving(false)}
          actions={
            <>
              <Button
                block
                onClick={() => {
                  onSave(draft, notify);
                  setSaving(false);
                }}
              >
                Simpan
              </Button>
              <Button block style="tertiary" onClick={() => setSaving(false)}>
                Kembali
              </Button>
            </>
          }
        >
          <ul className="rundown-changes">
            {changed.map((c) => (
              <li key={c.id} className="t-p-h5">
                <strong>{c.title}</strong> → {formatTime(c.start)}–{formatTime(c.end)}, {ROOMS[roomIndex(c.roomId)].name}
              </li>
            ))}
            {removed.map((r) => (
              <li key={r.id} className="t-p-h5">
                <strong>{r.title}</strong> dihapus
              </li>
            ))}
          </ul>
          <Toggle label="Kirim notifikasi ke tamu" hint="Tamu dapat notifikasi “Rundown berubah”." checked={notify} onChange={setNotify} />
        </Dialog>
      )}
    </div>
  );
}

function EventEditor({ event, onClose, onApply, onDelete }: { event: AdminEvent | null; onClose: () => void; onApply: (e: AdminEvent) => void; onDelete: (id: string) => void }) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [roomId, setRoomId] = useState(event?.roomId ?? ROOMS[0].id);
  const [start, setStart] = useState(toInput(event?.start ?? 13 * 60 + 30));
  const [end, setEnd] = useState(toInput(event?.end ?? 14 * 60));
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const s = parseTime(start);
  const e = parseTime(end);
  const timeError = e <= s ? "Jam selesai harus setelah jam mulai." : s < DAY_START || e > DAY_END ? "Di luar jam acara (09.00–14.00)." : null;
  const titleError = !title.trim() ? "Judul acara wajib diisi." : null;

  const apply = () => {
    setTried(true);
    if (timeError || titleError) return;
    onApply({ id: event?.id ?? `acara-${Date.now()}`, title: title.trim(), roomId, start: s, end: e });
  };

  if (confirmDelete && event) {
    return (
      <Dialog
        title={`Hapus ${event.title}?`}
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <Button block style="danger" onClick={() => onDelete(event.id)}>
              Ya, hapus
            </Button>
            <Button block style="tertiary" onClick={() => setConfirmDelete(false)}>
              Kembali
            </Button>
          </>
        }
      >
        Acara ini hilang dari rundown tamu setelah perubahan disimpan.
      </Dialog>
    );
  }

  return (
    <Dialog
      title={event ? "Edit acara" : "Tambah acara"}
      onClose={onClose}
      actions={
        <>
          <Button block onClick={apply}>
            {event ? "Terapkan" : "Tambah ke rundown"}
          </Button>
          <div className="editor-actions">
            {event && (
              <Button style="danger" icon="Trash" onClick={() => setConfirmDelete(true)}>
                Hapus
              </Button>
            )}
            <Button style="tertiary" onClick={onClose}>
              Batal
            </Button>
          </div>
        </>
      }
    >
      <div className="editor">
        <TextField label="Judul acara" value={title} onChange={setTitle} maxLength={40} error={tried ? (titleError ?? undefined) : undefined} />
        <div className="field">
          <span className="t-p-h5-bold field__label">Ruangan</span>
          <div className="editor-rooms">
            {ROOMS.map((r) => (
              <button key={r.id} type="button" className={`pill-tab t-p-h5-bold${r.id === roomId ? " is-active clay clay-dark" : ""}`} onClick={() => setRoomId(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
        <div className="editor-times">
          <label className="field">
            <span className="t-p-h5-bold field__label">Mulai</span>
            <input type="time" step={SNAP * 60} className={`field__input t-p-h3-bold${tried && timeError ? " is-error" : ""}`} value={start} onChange={(v) => setStart(v.target.value)} />
          </label>
          <label className="field">
            <span className="t-p-h5-bold field__label">Selesai</span>
            <input type="time" step={SNAP * 60} className={`field__input t-p-h3-bold${tried && timeError ? " is-error" : ""}`} value={end} onChange={(v) => setEnd(v.target.value)} />
          </label>
        </div>
        {tried && timeError && (
          <span className="t-p-h5 field__hint field__hint--error" role="alert">
            {timeError}
          </span>
        )}
        {event && <Badge type="next">Perubahan baru tersimpan setelah klik “Simpan perubahan”</Badge>}
      </div>
    </Dialog>
  );
}
