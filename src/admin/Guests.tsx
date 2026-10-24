import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { KENALAN_TARGET } from "../config";
import { formatTime } from "../data/agenda";
import { downloadCsv } from "./csv";
import type { AdminGuest } from "./data";

type Tab = "semua" | "hadir" | "belum" | "tidak";
type Confirm = { kind: "checkin" | "undo" | "reward"; guest: AdminGuest } | null;

type Props = {
  guests: AdminGuest[];
  search: string;
  selectedId: string | null;
  now: number;
  onSelect: (id: string | null) => void;
  onCheckIn: (id: string) => void;
  onUndoCheckIn: (id: string) => void;
  onClaimReward: (id: string) => void;
  onExported: () => void;
};

const RSVP = {
  ya: <Badge type="hadir">Hadir</Badge>,
  tidak: <Badge type="done">Tidak hadir</Badge>,
  belum: <Badge type="next">Belum jawab</Badge>,
};
const BY = { qr: "Scan QR", kode: "Kode pintu", panitia: "Panitia" };

/** Guest list (table) with a detail side panel and committee actions. */
export function Guests({ guests, search, selectedId, now, onSelect, onCheckIn, onUndoCheckIn, onClaimReward, onExported }: Props) {
  const [tab, setTab] = useState<Tab>("semua");
  const [confirm, setConfirm] = useState<Confirm>(null);

  const inTab = (t: Tab, g: AdminGuest) =>
    t === "semua" || (t === "hadir" && g.checkIn !== null) || (t === "belum" && g.rsvp === "ya" && g.checkIn === null) || (t === "tidak" && g.rsvp === "tidak");
  const matches = (g: AdminGuest) => inTab(tab, g);
  const q = search.trim().toLowerCase();
  const rows = guests.filter((g) => matches(g) && (!q || g.name.toLowerCase().includes(q) || g.email.includes(q)));
  const count = (t: Tab) => guests.filter((g) => inTab(t, g)).length;
  const selected = guests.find((g) => g.id === selectedId);

  const exportCsv = () => {
    downloadCsv("tamu-hmd.csv", [
      ["Nama", "Email", "RSVP", "Check-in", "Lewat", "Kartu", "Hadiah"],
      ...guests.map((g) => [g.name, g.email, g.rsvp, g.checkIn !== null ? formatTime(g.checkIn) : "", g.checkInBy ?? "", g.cards, g.reward]),
    ]);
    onExported();
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "semua", label: "Semua" },
    { id: "hadir", label: "Sudah check-in" },
    { id: "belum", label: "Belum datang" },
    { id: "tidak", label: "Tidak hadir" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Daftar tamu</h1>
          <p className="t-p-h4 admin-sub">Klik tamu untuk detail dan check-in manual.</p>
        </div>
        <div className="admin-actions">
          <Button size="small" style="tertiary" icon="Download" onClick={exportCsv}>
            Ekspor CSV
          </Button>
        </div>
      </div>

      <div className="pill-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`pill-tab t-p-h5-bold${tab === t.id ? " is-active clay clay-dark" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="pill-tab__count">{count(t.id)}</span>
          </button>
        ))}
      </div>

      <div className="admin-grid">
        <section className="admin-panel guests-table">
          {rows.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty__icon">
                <Icon name="Search" />
              </span>
              <span className="t-p-h4-bold">Tidak ada tamu yang cocok</span>
              <span className="t-p-h5">{q ? `Tidak ada hasil untuk "${search}". Coba ejaan lain.` : "Belum ada tamu di kategori ini."}</span>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr className="t-p-h5-bold">
                  <th>Nama</th>
                  <th>RSVP</th>
                  <th>Check-in</th>
                  <th>Kartu</th>
                  <th>Hadiah</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id} className={g.id === selectedId ? "is-selected" : ""} onClick={() => onSelect(g.id)}>
                    <td>
                      <span className="admin-cell-name">
                        <Avatar initial={g.name.charAt(0)} size="S" />
                        <span className="admin-cell-name__text">
                          <span className="t-p-h4-bold">{g.name}</span>
                          <span className="t-p-h5 admin-muted">{g.email}</span>
                        </span>
                      </span>
                    </td>
                    <td>{RSVP[g.rsvp]}</td>
                    <td className="t-p-h4">{g.checkIn !== null ? formatTime(g.checkIn) : <span className="admin-muted">–</span>}</td>
                    <td className="t-p-h4">
                      {g.cards}/{KENALAN_TARGET}
                    </td>
                    <td>
                      {g.reward === "diambil" ? <Badge type="complete">Diambil</Badge> : g.reward === "siap" ? <Badge type="pic">Siap</Badge> : <span className="admin-muted t-p-h5">–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside className="admin-panel guest-detail">
          {selected ? (
            <>
              <div className="admin-panel__head">
                <span className="agenda-card__tags">{RSVP[selected.rsvp]}</span>
                <button type="button" className="icon-btn clay clay-light" onClick={() => onSelect(null)} aria-label="Tutup detail">
                  <Icon name="Close" size={20} />
                </button>
              </div>
              <div className="admin-cell-name">
                <Avatar initial={selected.name.charAt(0)} size="L" />
                <span className="admin-cell-name__text">
                  <span className="t-display-h6">{selected.name}</span>
                  <span className="t-p-h5 admin-muted">{selected.email}</span>
                </span>
              </div>
              <dl className="guest-detail__list">
                <div>
                  <dt className="t-p-h5 admin-muted">Check-in</dt>
                  <dd className="t-p-h4-bold">{selected.checkIn !== null ? `${formatTime(selected.checkIn)} · ${BY[selected.checkInBy ?? "qr"]}` : "Belum"}</dd>
                </div>
                <div>
                  <dt className="t-p-h5 admin-muted">Kartu kenalan</dt>
                  <dd className="t-p-h4-bold">
                    {selected.cards} dari {KENALAN_TARGET}
                  </dd>
                </div>
                <div>
                  <dt className="t-p-h5 admin-muted">Hadiah</dt>
                  <dd className="t-p-h4-bold">{selected.reward === "diambil" ? "Sudah diambil" : selected.reward === "siap" ? "Siap ditukar" : "Masih mengumpulkan"}</dd>
                </div>
              </dl>
              <div className="guest-detail__actions">
                {selected.checkIn === null ? (
                  <Button block icon="Check" onClick={() => setConfirm({ kind: "checkin", guest: selected })}>
                    Check-in manual
                  </Button>
                ) : (
                  <Button block style="danger" onClick={() => setConfirm({ kind: "undo", guest: selected })}>
                    Batalkan check-in
                  </Button>
                )}
                {selected.reward === "siap" && (
                  <Button block style="secondary" icon="Gift" onClick={() => setConfirm({ kind: "reward", guest: selected })}>
                    Tandai hadiah diambil
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="admin-empty">
              <span className="admin-empty__icon">
                <Icon name="Users" />
              </span>
              <span className="t-p-h4-bold">Pilih tamu</span>
              <span className="t-p-h5">Detail dan aksi check-in muncul di sini.</span>
            </div>
          )}
        </aside>
      </div>

      {confirm && (
        <Dialog
          title={
            confirm.kind === "checkin"
              ? `Check-in ${confirm.guest.name}?`
              : confirm.kind === "undo"
                ? `Batalkan check-in ${confirm.guest.name}?`
                : `Hadiah ${confirm.guest.name} sudah diambil?`
          }
          onClose={() => setConfirm(null)}
          actions={
            <>
              <Button
                block
                style={confirm.kind === "undo" ? "danger" : "primary"}
                onClick={() => {
                  if (confirm.kind === "checkin") onCheckIn(confirm.guest.id);
                  if (confirm.kind === "undo") onUndoCheckIn(confirm.guest.id);
                  if (confirm.kind === "reward") onClaimReward(confirm.guest.id);
                  setConfirm(null);
                }}
              >
                {confirm.kind === "checkin" ? "Ya, check-in" : confirm.kind === "undo" ? "Ya, batalkan" : "Ya, sudah diambil"}
              </Button>
              <Button block style="tertiary" onClick={() => setConfirm(null)}>
                Kembali
              </Button>
            </>
          }
        >
          {confirm.kind === "checkin"
            ? `${confirm.guest.name} tercatat hadir jam ${formatTime(now)} lewat panitia. ${confirm.guest.rsvp !== "ya" ? "Catatan: RSVP-nya bukan Ya." : ""}`
            : confirm.kind === "undo"
              ? "Status hadirnya dihapus. Pakai ini hanya kalau salah check-in."
              : "Voucher hadiahnya ditandai sudah dipakai."}
        </Dialog>
      )}
    </div>
  );
}
