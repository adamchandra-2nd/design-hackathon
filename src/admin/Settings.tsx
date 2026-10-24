import { useState } from "react";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { Toggle } from "../components/Toggle";

export type AdminSettings = {
  eventName: string;
  dateLabel: string;
  place: string;
  doorCode: string;
  panitiaPin: string;
  countdown: boolean;
  finalFeedbackAt: string;
};

type Props = { settings: AdminSettings; onSave: (s: AdminSettings) => void };

/** Event settings in cards; unsaved changes show a sticky save bar. */
export function Settings({ settings, onSave }: Props) {
  const [s, setS] = useState(settings);
  const [tried, setTried] = useState(false);
  const set = (patch: Partial<AdminSettings>) => setS({ ...s, ...patch });
  const dirty = JSON.stringify(s) !== JSON.stringify(settings);
  const errors = {
    eventName: !s.eventName.trim() ? "Nama acara wajib diisi." : undefined,
    doorCode: !/^\d{4}$/.test(s.doorCode) ? "Kode pintu harus 4 angka." : undefined,
    panitiaPin: !/^\d{4}$/.test(s.panitiaPin) ? "PIN panitia harus 4 angka." : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const save = () => {
    setTried(true);
    if (valid) onSave(s);
  };

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="admin-head__text">
          <h1 className="admin-title">Pengaturan</h1>
          <p className="t-p-h4 admin-sub">Berlaku langsung di HP semua tamu setelah disimpan.</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="admin-panel">
          <h2 className="t-p-h3-bold admin-panel__title">Data acara</h2>
          <TextField label="Nama acara" value={s.eventName} onChange={(v) => set({ eventName: v })} error={tried ? errors.eventName : undefined} />
          <TextField label="Tanggal" value={s.dateLabel} onChange={(v) => set({ dateLabel: v })} />
          <TextField label="Tempat" value={s.place} onChange={(v) => set({ place: v })} />
        </section>
        <section className="admin-panel">
          <h2 className="t-p-h3-bold admin-panel__title">Akses</h2>
          <TextField
            label="Kode pintu"
            value={s.doorCode}
            onChange={(v) => set({ doorCode: v.replace(/\D/g, "").slice(0, 4) })}
            inputMode="numeric"
            hint="Tertempel di bawah QR pintu masuk."
            error={tried ? errors.doorCode : undefined}
          />
          <TextField
            label="PIN panitia"
            value={s.panitiaPin}
            onChange={(v) => set({ panitiaPin: v.replace(/\D/g, "").slice(0, 4) })}
            inputMode="numeric"
            hint="Untuk menandai hadiah diambil di HP tamu."
            error={tried ? errors.panitiaPin : undefined}
          />
        </section>
        <section className="admin-panel">
          <h2 className="t-p-h3-bold admin-panel__title">Mode acara</h2>
          <Toggle label="Countdown sebelum hari H" hint="Matikan saat Test Day: tamu langsung ke “Mulai masuk Potara”." checked={s.countdown} onChange={(v) => set({ countdown: v })} />
          <label className="field">
            <span className="t-p-h5-bold field__label">Feedback akhir dibuka jam</span>
            <input type="time" className="field__input t-p-h3-bold" value={s.finalFeedbackAt} onChange={(e) => set({ finalFeedbackAt: e.target.value })} />
            <span className="t-p-h5 field__hint">Sebelum jam ini, tab Feedback di HP tamu terkunci.</span>
          </label>
        </section>
      </div>

      {dirty && (
        <div className="settings-bar clay clay-dark" role="status">
          <span className="t-p-h4-bold">Ada perubahan yang belum disimpan</span>
          <div className="admin-actions">
            <Button
              size="small"
              style="tertiary"
              onClick={() => {
                setS(settings);
                setTried(false);
              }}
            >
              Batalkan
            </Button>
            <Button size="small" onClick={save}>
              Simpan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
