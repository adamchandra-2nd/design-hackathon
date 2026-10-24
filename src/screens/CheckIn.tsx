import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { TextField } from "../components/TextField";
import { ROOMS } from "../data/rooms";
import "./CheckIn.css";

const CODE_LENGTH = 4;
/** Prototype only: the camera can't run here, so a QR "is found" after a few seconds. */
const DEMO_SCAN_MS = 3500;

type Props = { name: string; onBack: () => void; onCheckedIn: () => void };

/** Check-in at the physical door: scan the QR (primary), door code or committee lookup (fallbacks). */
export function CheckIn({ name, onBack, onCheckedIn }: Props) {
  const [found, setFound] = useState(false);
  const [sheet, setSheet] = useState<"code" | "panitia" | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (sheet) return;
    const t = window.setTimeout(() => setFound(true), DEMO_SCAN_MS);
    return () => clearTimeout(t);
  }, [sheet]);

  useEffect(() => {
    if (!found) return;
    const t = window.setTimeout(onCheckedIn, 900);
    return () => clearTimeout(t);
  }, [found, onCheckedIn]);

  return (
    <main className="flow checkin screen-enter">
      <div className="flow__bg" style={{ backgroundImage: `url(${ROOMS[0].image})` }} />
      <div className="flow__top">
        <div className="topbar">
          <button type="button" className="icon-btn clay clay-light" onClick={onBack} aria-label="Kembali">
            <Icon name="ArrowLeft" />
          </button>
          <span className="t-p-h3-bold">Check-in</span>
        </div>
      </div>

      <div className="flow__stage checkin__stage">
        <div className={`scanner clay clay-dark${found ? " is-found" : ""}`} aria-live="polite">
          <span className="scanner__corner scanner__corner--tl" />
          <span className="scanner__corner scanner__corner--tr" />
          <span className="scanner__corner scanner__corner--bl" />
          <span className="scanner__corner scanner__corner--br" />
          {found ? (
            <span className="scanner__ok clay clay-accent">
              <Icon name="Check" size={32} />
            </span>
          ) : (
            <>
              <span className="scanner__line" />
              <Icon name="Scan" size={40} />
            </>
          )}
        </div>
      </div>

      <div className="flow__bottom">
        <section className="panel glass">
          <h2 className="t-p-h3-bold panel__title">{found ? "QR terbaca!" : "Scan QR di pintu Potara"}</h2>
          <p className="t-p-h5 panel__body">
            {found ? "Pintu sedang dibuka untukmu…" : "Arahkan kamera ke QR yang tertempel di pintu masuk."}
          </p>
          {!found && (
            <div className="panel__actions">
              <Button block style="secondary" icon="KeyCard" onClick={() => setSheet("code")}>
                Pakai kode pintu
              </Button>
              <Button block style="ghost" size="small" onClick={() => setSheet("panitia")}>
                Minta bantuan panitia
              </Button>
            </div>
          )}
        </section>
      </div>

      {sheet === "code" && (
        <Dialog
          title="Masukkan kode pintu"
          onClose={() => setSheet(null)}
          actions={
            <>
              <Button block disabled={code.length < CODE_LENGTH} onClick={onCheckedIn}>
                Masuk
              </Button>
              <Button block style="ghost" onClick={() => setSheet(null)}>
                Batal
              </Button>
            </>
          }
        >
          <TextField
            label="Kode pintu"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, CODE_LENGTH))}
            placeholder="0000"
            inputMode="numeric"
            maxLength={CODE_LENGTH}
            hint="Kode 4 angka ada di bawah QR pada pintu."
            autoFocus
          />
        </Dialog>
      )}
      {sheet === "panitia" && (
        <Dialog
          title="Sebutkan namamu ke panitia"
          onClose={() => setSheet(null)}
          lead={<span className="checkin__name t-display-h6">{name}</span>}
          actions={
            <>
              <Button block onClick={onCheckedIn}>
                Sudah dibantu panitia
              </Button>
              <Button block style="ghost" onClick={() => setSheet(null)}>
                Kembali scan
              </Button>
            </>
          }
        >
          Panitia di pintu akan mencari namamu di daftar tamu dan membukakan akses masuk.
        </Dialog>
      )}
    </main>
  );
}
