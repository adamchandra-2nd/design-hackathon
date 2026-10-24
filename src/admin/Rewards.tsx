import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import type { AdminGuest } from "./data";

type Props = { guests: AdminGuest[]; pin: string; onClaim: (id: string) => void; onChangePin: (pin: string) => void };

/** Rewards: who can claim, who already did, and the committee PIN used on guests' phones. */
export function Rewards({ guests, pin, onClaim, onChangePin }: Props) {
  const [showPin, setShowPin] = useState(false);
  const [changing, setChanging] = useState(false);
  const [next, setNext] = useState("");
  const [claiming, setClaiming] = useState<AdminGuest | null>(null);
  const ready = guests.filter((g) => g.reward === "siap");
  const claimed = guests.filter((g) => g.reward === "diambil");
  const collecting = guests.filter((g) => g.reward === "mengumpulkan" && g.checkIn !== null);
  const rows = [...ready, ...claimed];

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Hadiah</h1>
          <p className="t-p-h4 admin-sub">Tamu dengan 5 kartu kenalan menukar voucher di meja panitia.</p>
        </div>
      </div>

      <section className="stat-strip">
        <div className="stat">
          <span className="t-p-h5-bold stat__label">Siap ditukar</span>
          <span className="stat__value">{ready.length}</span>
        </div>
        <div className="stat">
          <span className="t-p-h5-bold stat__label">Sudah diambil</span>
          <span className="stat__value">{claimed.length}</span>
        </div>
        <div className="stat">
          <span className="t-p-h5-bold stat__label">Masih mengumpulkan</span>
          <span className="stat__value">{collecting.length}</span>
        </div>
      </section>

      <div className="admin-grid">
        <section className="admin-panel">
          {rows.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty__icon">
                <Icon name="Gift" />
              </span>
              <span className="t-p-h4-bold">Belum ada yang mengumpulkan 5 kartu</span>
              <span className="t-p-h5">Tamu muncul di sini begitu kartunya lengkap.</span>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr className="t-p-h5-bold">
                  <th>Tamu</th>
                  <th>Voucher</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <span className="admin-cell-name">
                        <Avatar initial={g.name.charAt(0)} size="S" />
                        <span className="t-p-h4-bold">{g.name}</span>
                      </span>
                    </td>
                    <td className="t-p-h4">HMD-{g.name.slice(0, 3).toUpperCase()}-05</td>
                    <td>{g.reward === "diambil" ? <Badge type="complete">Diambil</Badge> : <Badge type="pic">Siap</Badge>}</td>
                    <td>
                      {g.reward === "siap" && (
                        <Button size="small" style="secondary" onClick={() => setClaiming(g)}>
                          Tandai diambil
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="admin-panel">
          <h2 className="t-p-h3-bold admin-panel__title">PIN panitia</h2>
          <p className="t-p-h5 admin-muted">Dipakai panitia di HP tamu untuk menandai voucher sudah ditukar.</p>
          <div className="pin-show">
            <span className="pin-show__value">{showPin ? pin : "••••"}</span>
            <button type="button" className="icon-btn clay clay-light" onClick={() => setShowPin(!showPin)} aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}>
              <Icon name="Eye" size={20} />
            </button>
          </div>
          <Button block style="tertiary" icon="Pencil" onClick={() => setChanging(true)}>
            Ganti PIN
          </Button>
        </section>
      </div>

      {claiming && (
        <Dialog
          title={`Hadiah ${claiming.name} sudah diambil?`}
          onClose={() => setClaiming(null)}
          actions={
            <>
              <Button
                block
                onClick={() => {
                  onClaim(claiming.id);
                  setClaiming(null);
                }}
              >
                Ya, sudah diambil
              </Button>
              <Button block style="tertiary" onClick={() => setClaiming(null)}>
                Kembali
              </Button>
            </>
          }
        >
          Voucher di HP {claiming.name} ikut berubah jadi “Sudah diambil”.
        </Dialog>
      )}
      {changing && (
        <Dialog
          title="Ganti PIN panitia"
          onClose={() => setChanging(false)}
          actions={
            <>
              <Button
                block
                disabled={next.length !== 4}
                onClick={() => {
                  onChangePin(next);
                  setNext("");
                  setChanging(false);
                }}
              >
                Simpan PIN baru
              </Button>
              <Button block style="tertiary" onClick={() => setChanging(false)}>
                Batal
              </Button>
            </>
          }
        >
          <TextField label="PIN baru (4 angka)" value={next} onChange={(v) => setNext(v.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} placeholder="0000" hint="Kabari semua panitia di meja hadiah." autoFocus />
        </Dialog>
      )}
    </div>
  );
}
