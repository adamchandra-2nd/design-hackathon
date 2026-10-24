import { useCallback, useState } from "react";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { Scanner, type ScanState } from "../components/Scanner";
import { TextField } from "../components/TextField";
import { DOOR_CODE } from "../config";
import { ROOMS } from "../data/rooms";
import "./CheckIn.css";

const CODE_LENGTH = 4;

/** What the (simulated) camera finds. "invalid" = not a Potara door QR. */
export type CheckInScenario = "ok" | "invalid" | "denied" | "offline";

type Props = { name: string; scenario: CheckInScenario; onBack: () => void; onCheckedIn: () => void };

const PANEL: Record<ScanState, { title: string; body: string }> = {
  scanning: { title: "Scan QR di pintu Potara", body: "Arahkan kamera ke QR yang tertempel di pintu masuk." },
  found: { title: "QR terbaca!", body: "Pintu sedang dibuka untukmu…" },
  invalid: { title: "Ini bukan QR pintu Potara", body: "Pastikan kamu scan QR yang ada di pintu masuk, bukan poster lain." },
  denied: { title: "Izin kamera ditolak", body: "Izinkan kamera di pengaturan browser, atau pakai kode pintu." },
  offline: { title: "Tidak ada koneksi", body: "Check-in butuh internet. Sambungkan lalu coba lagi, atau minta bantuan panitia." },
};

/** Check-in at the physical door: scan the QR (primary), door code or committee lookup (fallbacks). */
export function CheckIn({ name, scenario, onBack, onCheckedIn }: Props) {
  const initial: ScanState = scenario === "denied" ? "denied" : scenario === "offline" ? "offline" : "scanning";
  const [state, setState] = useState<ScanState>(initial);
  const [sheet, setSheet] = useState<"code" | "panitia" | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const onRead = useCallback(() => {
    if (scenario === "invalid") return setState("invalid");
    setState("found");
    window.setTimeout(onCheckedIn, 900);
  }, [scenario, onCheckedIn]);

  const submitCode = () => {
    if (code === DOOR_CODE) return onCheckedIn();
    setCodeError(true);
  };

  const p = PANEL[state];
  return (
    <main className="flow checkin screen-enter">
      <div className="flow__bg" style={{ backgroundImage: `url(${ROOMS[0].image})` }} />
      <div className="flow__top">
        <div className="topbar">
          <button type="button" className="icon-btn clay clay-light" onClick={onBack} aria-label="Kembali">
            <Icon name="ArrowLeft" />
          </button>
          <span className="topbar__title glass t-p-h4-bold">Check-in</span>
        </div>
      </div>

      <div className="flow__stage checkin__stage">
        <Scanner state={state} onRead={sheet ? undefined : onRead} />
      </div>

      <div className="flow__bottom">
        <section className="panel glass">
          <h2 className="t-p-h3-bold panel__title">{p.title}</h2>
          <p className="t-p-h5 panel__body">{p.body}</p>
          {state !== "found" && (
            <div className="panel__actions">
              {state === "invalid" && (
                <Button block onClick={() => setState("scanning")}>
                  Scan lagi
                </Button>
              )}
              {state === "offline" && (
                <Button block onClick={() => setState(scenario === "offline" ? "offline" : "scanning")}>
                  Coba lagi
                </Button>
              )}
              {state !== "offline" && (
                <Button block style={state === "denied" ? "primary" : "secondary"} icon="KeyCard" onClick={() => setSheet("code")}>
                  Pakai kode pintu
                </Button>
              )}
              <Button block style="tertiary" onClick={() => setSheet("panitia")}>
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
              <Button block disabled={code.length < CODE_LENGTH} onClick={submitCode}>
                Masuk
              </Button>
              <Button block style="tertiary" onClick={() => setSheet(null)}>
                Kembali
              </Button>
            </>
          }
        >
          <TextField
            label="Kode pintu"
            value={code}
            onChange={(v) => {
              setCodeError(false);
              setCode(v.replace(/\D/g, "").slice(0, CODE_LENGTH));
            }}
            placeholder="0000"
            inputMode="numeric"
            maxLength={CODE_LENGTH}
            error={codeError ? "Kodenya salah. Cek lagi kode di bawah QR pintu." : undefined}
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
              <Button block style="tertiary" onClick={() => setSheet(null)}>
                Kembali
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
