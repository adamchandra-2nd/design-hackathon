import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { formatTime } from "../data/agenda";
import { PEOPLE, SCRIPTS, SESSIONS, type Person } from "../stage/data";
import { DataTable, Panel } from "./ui";

export type Access = "belum" | "terkirim" | "masuk" | "dicabut";
const ACCESS: Record<Access, { label: string; type: "done" | "neutral" | "claimed" | "danger"; icon?: "Check" | "Send" | "Close" }> = {
  belum: { label: "Belum diundang", type: "done" },
  terkirim: { label: "Link terkirim", type: "neutral", icon: "Send" },
  masuk: { label: "Sudah masuk", type: "claimed", icon: "Check" },
  dicabut: { label: "Dicabut", type: "danger", icon: "Close" },
};

type Props = { access: Record<string, Access>; onSend: (id: string) => void; onRevoke: (id: string) => void };

/** MC and speakers (may be from outside Potara): personal WhatsApp link + code, no account. */
export function Pengisi({ access, onSend, onRevoke }: Props) {
  const [sending, setSending] = useState<Person | null>(null);
  const [revoking, setRevoking] = useState<Person | null>(null);
  const sessionsOf = (p: Person) => (p.role === "mc" ? "Semua sesi" : SESSIONS.filter((s) => s.speakerId === p.id).map((s) => `${s.title} · ${formatTime(s.start)}`).join(", "));

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Pengisi acara</h1>
          <p className="t-p-h4 admin-sub">MC dan pembicara masuk lewat link pribadi di WhatsApp, lalu kode 6 angka. Tidak perlu akun.</p>
        </div>
      </div>

      <div className="admin-fill pengisi-fill">
        <Panel icon="Sparkle" tone="sky" title={`MC & pembicara · ${PEOPLE.length}`} flush>
          <DataTable
            columns={[
              { label: "Nama & sesi", width: "minmax(0, 1fr)" },
              { label: "Peran", width: "128px" },
              { label: "Akses", width: "164px" },
              { label: "Aksi", width: "228px", align: "end" },
            ]}
            rows={PEOPLE.map((p) => {
              const a = access[p.id] ?? "belum";
              return {
                id: p.id,
                cells: [
                  <span className="admin-cell-name">
                    <Avatar initial={p.name.charAt(0)} size="S" />
                    <span className="admin-cell-name__text">
                      <span className="t-p-h4-bold">{p.name}</span>
                      <span className="t-p-h5 admin-muted one-line">
                        {sessionsOf(p)} · {p.phone}
                      </span>
                    </span>
                  </span>,
                  <Badge type="ready" icon={p.role === "mc" ? "Megaphone" : "Sparkle"}>
                    {p.role === "mc" ? "MC" : "Pembicara"}
                  </Badge>,
                  <Badge type={ACCESS[a].type} icon={ACCESS[a].icon}>
                    {ACCESS[a].label}
                  </Badge>,
                  <span className="pengisi-actions">
                    {a !== "dicabut" && a !== "belum" && (
                      <Button size="small" style="tertiary" onClick={() => setRevoking(p)}>
                        Cabut
                      </Button>
                    )}
                    <Button size="small" style="tertiary" icon="Send" onClick={() => setSending(p)}>
                      {a === "belum" ? "Kirim link" : "Kirim ulang"}
                    </Button>
                  </span>,
                ],
              };
            })}
          />
        </Panel>

        <Panel icon="Pencil" tone="ink" title="Naskah MC">
          <span className="t-p-h5 admin-muted">Disusun Claude dari rundown, tampil di layar MC per sesi.</span>
          <ul className="naskah-list">
            {SESSIONS.map((s) => (
              <li key={s.id} className="naskah-item">
                <span className="t-p-h5-bold admin-muted">{formatTime(s.start)}</span>
                <span className="naskah-item__text">
                  <span className="t-p-h4-bold">{s.title}</span>
                  <span className="t-p-h5 admin-muted">
                    {SCRIPTS[s.id]?.[0].length ?? 0} poin · PIC {s.pic}
                  </span>
                </span>
                <Badge type="ready" icon="Sparkle">Claude</Badge>
              </li>
            ))}
          </ul>
          <div className="setting-box setting-box--note">
            <Icon name="Eye" size={20} />
            <span className="t-p-h5">
              Lihat seperti mereka: <a href="#mc">layar MC</a> · <a href="#pembicara">layar pembicara</a>
            </span>
          </div>
        </Panel>
      </div>

      {sending && (
        <Dialog
          icon="Send"
          iconTone="green"
          title={`Kirim link ke ${sending.name.split(" ")[0]}?`}
          description={`Link pribadi dikirim ke WhatsApp ${sending.phone}. Saat dibuka, ${sending.name.split(" ")[0]} memasukkan kode 6 angka yang kami kirim ke nomor yang sama.`}
          onClose={() => setSending(null)}
          actions={
            <>
              <Button
                icon="Send"
                onClick={() => {
                  onSend(sending.id);
                  setSending(null);
                }}
              >
                Kirim link
              </Button>
              <Button style="tertiary" onClick={() => setSending(null)}>
                Kembali
              </Button>
            </>
          }
        />
      )}
      {revoking && (
        <Dialog
          icon="Lock"
          iconTone="red"
          title={`Cabut akses ${revoking.name.split(" ")[0]}?`}
          description="Link langsung tidak berlaku dan layarnya keluar. Kamu bisa kirim link baru kapan saja."
          onClose={() => setRevoking(null)}
          actions={
            <>
              <Button
                style="danger"
                onClick={() => {
                  onRevoke(revoking.id);
                  setRevoking(null);
                }}
              >
                Cabut akses
              </Button>
              <Button style="tertiary" onClick={() => setRevoking(null)}>
                Kembali
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
