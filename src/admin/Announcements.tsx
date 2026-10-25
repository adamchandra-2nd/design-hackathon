import { useState } from "react";
import { Badge } from "../components/Badge";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import { Toast, ToastIcon } from "../components/Toast";
import { formatTime } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import type { Announcement } from "./data";
import { roomStyle } from "./hooks";
import { Empty, Panel } from "./ui";

type Props = {
  history: Announcement[];
  recipients: number;
  now: number;
  /** Review case: sending fails. */
  failSend: boolean;
  onSend: (a: { title: string; body: string; roomId: string | null }) => void;
  onResend: (id: string) => void;
};

/**
 * Manual announcements from the committee, for things outside the rundown. Guests get them as the
 * same toast they see for event notices, with an optional "Ke sana" button to a room.
 */
export function Announcements({ history, recipients, now, failSend, onSend, onResend }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  const ready = title.trim() && body.trim();
  const previewRoom = roomId ? roomIndexById(roomId) : 0;

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

      <div className="admin-fill ann-fill">
        <Panel
          icon="Pencil"
          tone="orange"
          title="Tulis pengumuman"
          footer={
            <Button block icon="Megaphone" disabled={!ready} onClick={() => setConfirm(true)}>
              {error ? "Kirim lagi" : `Kirim ke ${recipients} tamu`}
            </Button>
          }
        >
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
            <span className="t-p-h5-bold field__label">Ruangan tujuan (opsional)</span>
            <div className="editor-rooms">
              {ROOMS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`room-chip t-p-h5-bold${r.id === roomId ? " is-active clay clay-light" : ""}`}
                  style={roomStyle(r.id)}
                  aria-pressed={r.id === roomId}
                  onClick={() => setRoomId(r.id === roomId ? null : r.id)}
                >
                  <Icon name={r.icon} size={16} />
                  {r.name}
                </button>
              ))}
            </div>
            <span className="t-p-h5 field__hint">Kalau dipilih, notifikasinya punya tombol “Ke sana”. Klik lagi untuk batal.</span>
          </div>
        </Panel>

        {/* What guests will see: a mini main area */}
        <Panel icon="Eye" tone="blue" title="Pratinjau di HP tamu" flush>
          <div className="ann-preview">
            <div className="ann-phone">
              <div className="ann-phone__screen" style={{ backgroundImage: `url(${ROOMS[previewRoom].image})` }}>
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
                <div className="ann-phone__stage">
                  <Character />
                </div>
                <div className="ann-phone__nav">
                  <BottomNav active="ruangan" feedbackLocked onChange={() => undefined} />
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel icon="Clock" tone="purple" title="Riwayat" aside={<Badge type="neutral">{history.length} pengumuman</Badge>}>
          {history.length === 0 ? (
            <Empty icon="Megaphone" tone="coral" title="Belum ada pengumuman" body="Pengumuman yang terkirim muncul di sini." />
          ) : (
            <ul className="ann-history">
              {[...history].reverse().map((a) => (
                <li key={a.id} className="ann-history__item">
                  <span className="ann-history__head">
                    <span className="t-p-h4-bold">{a.title}</span>
                    {a.failed ? <Badge type="danger">Gagal</Badge> : <Badge type="read">Terkirim</Badge>}
                  </span>
                  <span className="t-p-h5 admin-muted">{a.body}</span>
                  <dl className="ann-meta">
                    <div>
                      <dt className="t-p-h5 admin-muted">Dikirim</dt>
                      <dd className="t-p-h5-bold">
                        {formatTime(a.at)} · {Math.max(0, now - a.at)} menit lalu
                      </dd>
                    </div>
                    <div>
                      <dt className="t-p-h5 admin-muted">Penerima</dt>
                      <dd className="t-p-h5-bold">{a.failed ? "–" : `${a.recipients} tamu hadir`}</dd>
                    </div>
                    {!a.failed && (
                      <div>
                        <dt className="t-p-h5 admin-muted">Dibaca</dt>
                        <dd className="ann-read">
                          <span className="t-p-h5-bold">
                            {a.read} dari {a.recipients}
                          </span>
                          <span className="stat__bar">
                            <span style={{ width: `${a.recipients ? (a.read / a.recipients) * 100 : 0}%` }} />
                          </span>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="t-p-h5 admin-muted">Tombol “Ke sana”</dt>
                      <dd className="t-p-h5-bold">
                        {a.roomId ? (
                          <span className="dash-room" style={roomStyle(a.roomId)}>
                            <span className="room-dot" />
                            {ROOMS[roomIndexById(a.roomId)].name}
                          </span>
                        ) : (
                          "Tanpa ruangan"
                        )}
                      </dd>
                    </div>
                  </dl>
                  {a.failed && (
                    <Button size="small" style="secondary" icon="ArrowRight" onClick={() => onResend(a.id)}>
                      Kirim ulang
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {confirm && (
        <Dialog
          icon="Megaphone"
          iconTone="coral"
          title="Kirim pengumuman?"
          description={`Muncul di HP ${recipients} tamu yang sudah hadir. Pengumuman tidak bisa ditarik setelah terkirim.`}
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button onClick={send}>Kirim sekarang</Button>
              <Button style="tertiary" onClick={() => setConfirm(false)}>
                Kembali
              </Button>
            </>
          }
        >
          <div className="voucher-box ann-confirm">
            <span className="admin-cell-name__text">
              <span className="t-p-h4-bold">{title.trim()}</span>
              <span className="t-p-h5 admin-muted">{body.trim()}</span>
            </span>
          </div>
        </Dialog>
      )}
    </div>
  );
}
