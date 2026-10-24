import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Character } from "../components/Character";
import { Dialog } from "../components/Dialog";
import { EventCard } from "../components/EventCard";
import { EVENT } from "../config";
import { ROOMS } from "../data/rooms";

/** Guest said "Tidak": thank them, and leave a clear way back in. */
export function Thanks({ onChangeToYes }: { onChangeToYes: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <main className="flow screen-enter">
      <div className="flow__bg" style={{ backgroundImage: `url(${ROOMS[0].image})` }} />
      <div className="flow__top">
        <EventCard status={<Badge type="done">Tidak hadir</Badge>} />
      </div>
      <div className="flow__stage">
        <Character say="Yah, sampai jumpa lain waktu!" />
      </div>
      <div className="flow__bottom">
        <section className="panel glass">
          <h2 className="t-p-h3-bold panel__title">Terima kasih sudah mengabari</h2>
          <p className="t-p-h5 panel__body">Kalau rencanamu berubah, pintu Potara masih terbuka buat kamu.</p>
          <div className="panel__actions">
            <Button block style="secondary" onClick={() => setConfirm(true)}>
              Eh, aku ternyata bisa hadir
            </Button>
          </div>
        </section>
      </div>
      {confirm && (
        <Dialog
          title="Jadi bisa hadir?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button block onClick={onChangeToYes}>
                Ya, aku hadir
              </Button>
              <Button block style="ghost" onClick={() => setConfirm(false)}>
                Batal
              </Button>
            </>
          }
        >
          Kami catat kamu sebagai tamu yang hadir di {EVENT.name}.
        </Dialog>
      )}
    </main>
  );
}
