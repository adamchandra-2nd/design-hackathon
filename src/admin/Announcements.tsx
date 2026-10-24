import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import { Toast, ToastIcon } from "../components/Toast";
import { formatTime } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import type { Announcement } from "./data";

type Props = {
  history: Announcement[];
  recipients: number;
  /** Review case: sending fails. */
  failSend: boolean;
  onSend: (a: Omit<Announcement, "id" | "at" | "recipients">) => void;
};

/**
 * Manual announcements from the committee, for things outside the rundown. Guests get them as the
 * same toast they see for event notices, with an optional "Ke sana" button to a room.
 */
export function Announcements({ history, recipients, failSend, onSend }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  const ready = title.trim() && body.trim();

  const send = () => {
    setConfirm(false);
    if (failSend) return setError(true);
    onSend({ title: title.trim(), body: body.trim(), roomId });
    setTitle("");
    setBody("");
    setRoomId(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Pengumuman</h1>
          <p className="t-p-h4 admin-sub">Kirim kabar di luar rundown ke semua tamu yang sudah hadir.</p>
        </div>
      </div>

      <div className="ann-grid">
        <section className="admin-panel">
          <h2 className="t-p-h3-bold admin-panel__title">Tulis pengumuman</h2>
          <TextField label="Judul" value={title} onChange={setTitle} placeholder="Foto bersama 5 menit lagi" maxLength={40} hint={`${title.length}/40`} />
          <TextField
            label="Isi"
            value={body}
            onChange={(v) => {
              setError(false);
              setBody(v);
            }}
            placeholder="Kumpul di Halaman Depan ya!"
            multiline
            maxLength={120}
            hint={`${body.length}/120`}
            error={error ? "Gagal mengirim. Cek koneksi, lalu kirim lagi." : undefined}
          />
          <div className="field">
            <span className="t-p-h5-bold field__label">Ruangan terkait (opsional)</span>
            <div className="editor-rooms">
              <button type="button" className={`pill-tab t-p-h5-bold${roomId === null ? " is-active clay clay-dark" : ""}`} onClick={() => setRoomId(null)}>
                Tanpa ruangan
              </button>
              {ROOMS.map((r) => (
                <button key={r.id} type="button" className={`pill-tab t-p-h5-bold${r.id === roomId ? " is-active clay clay-dark" : ""}`} onClick={() => setRoomId(r.id)}>
                  {r.name}
                </button>
              ))}
            </div>
            <span className="t-p-h5 field__hint">Kalau dipilih, notifikasinya punya tombol “Ke sana”.</span>
          </div>
          <Button block icon="Megaphone" disabled={!ready} onClick={() => setConfirm(true)}>
            {error ? "Kirim lagi" : `Kirim ke ${recipients} tamu`}
          </Button>
        </section>

        {/* What guests will see */}
        <section className="admin-panel ann-preview">
          <h2 className="t-p-h3-bold admin-panel__title">Pratinjau di HP tamu</h2>
          <div className="ann-phone">
            <div className="ann-phone__screen" style={{ backgroundImage: `url(${ROOMS[roomId ? roomIndexById(roomId) : 0].image})` }}>
              <div className="ann-phone__toast">
                <Toast
                  lead={<ToastIcon icon="Megaphone" tone="accent" />}
                  title={title.trim() || "Judul pengumuman"}
                  sub={body.trim() || "Isi pengumuman tampil di sini."}
                  action={
                    roomId ? (
                      <Button size="small" style="secondary">
                        Ke sana
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="t-p-h3-bold admin-panel__title">Riwayat</h2>
            <Badge type="next">{history.length} terkirim</Badge>
          </div>
          {history.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty__icon">
                <Icon name="Megaphone" />
              </span>
              <span className="t-p-h5">Belum ada pengumuman.</span>
            </div>
          ) : (
            <ul className="ann-history">
              {[...history].reverse().map((a) => (
                <li key={a.id} className="ann-history__item">
                  <span className="ann-history__head">
                    <span className="t-p-h4-bold">{a.title}</span>
                    <span className="t-p-h5 admin-muted">{formatTime(a.at)}</span>
                  </span>
                  <span className="t-p-h5 admin-muted">{a.body}</span>
                  <span className="agenda-card__tags">
                    {a.roomId && <Badge type="room">{ROOMS[roomIndexById(a.roomId)].name}</Badge>}
                    <Badge type="sent">{a.recipients} tamu</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {confirm && (
        <Dialog
          title="Kirim pengumuman?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button block onClick={send}>
                Kirim sekarang
              </Button>
              <Button block style="tertiary" onClick={() => setConfirm(false)}>
                Kembali
              </Button>
            </>
          }
        >
          “{title.trim()}” akan muncul di HP {recipients} tamu yang sudah hadir. Pengumuman tidak bisa ditarik setelah terkirim.
        </Dialog>
      )}
    </div>
  );
}
