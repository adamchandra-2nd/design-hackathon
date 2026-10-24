import { Badge } from "../components/Badge";
import { Icon } from "../components/Icon";
import { EVENT } from "../config";
import { AGENDA, type AgendaItem } from "../data/agenda";
import { ROOMS, roomIndexById } from "../data/rooms";
import "./AgendaScreen.css";

const STATUS: Record<AgendaItem["status"], { type: "now" | "next" | "done"; label: string } | null> = {
  now: { type: "now", label: "Sekarang" },
  next: { type: "next", label: "Berikutnya" },
  done: { type: "done", label: "Selesai" },
  later: null,
};

type Props = { currentRoomIndex: number; onGoToRoom: (roomIndex: number) => void };

/** Figma: Agenda Card list — the full rundown. Room tags jump to that room in the main area. */
export function AgendaScreen({ currentRoomIndex, onGoToRoom }: Props) {
  return (
    <div className="page__scroll screen-enter">
      <header className="page__header">
        <h1 className="t-display-h6 page__title">Agenda</h1>
        <p className="t-p-h5 page__sub">{EVENT.dateLabel} · rundown bisa berubah, kami kabari kalau ada perubahan.</p>
      </header>
      <ol className="list agenda-list">
        {AGENDA.map((item) => {
          const status = STATUS[item.status];
          const roomIndex = roomIndexById(item.roomId);
          const here = roomIndex === currentRoomIndex;
          return (
            <li key={item.id} className={`card agenda-card agenda-card--${item.status}`}>
              <span className="agenda-card__tags">
                {status && <Badge type={status.type}>{status.label}</Badge>}
                {item.status === "done" ? (
                  <Badge type="room">{ROOMS[roomIndex].name}</Badge>
                ) : (
                  <button
                    type="button"
                    className="agenda-mini__room"
                    onClick={() => onGoToRoom(roomIndex)}
                    aria-label={`Pindah ke ${ROOMS[roomIndex].name}`}
                  >
                    <Badge type="room" arrow={!here}>
                      {here ? "Kamu di sini" : ROOMS[roomIndex].name}
                    </Badge>
                  </button>
                )}
              </span>
              <div className="agenda-card__body">
                <h2 className="t-display-h6 agenda-card__title">{item.title}</h2>
                <span className="t-p-h5 agenda-card__time">
                  <Icon name="Clock" size={16} />
                  {item.time}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
