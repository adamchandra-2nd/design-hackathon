import { Badge } from "./Badge";
import { Icon } from "./Icon";
import "./AgendaMini.css";

type AgendaMiniProps = {
  room: string;
  title: string;
  next: string;
  /** The guest is already in the event's room. */
  here: boolean;
  onClick?: () => void;
  onGoToRoom?: () => void;
};

/** Figma: Agenda Mini (Type=Now) — floating live-agenda summary, glass. Tags on top, then icon + title + next. */
export function AgendaMini({ room, title, next, here, onClick, onGoToRoom }: AgendaMiniProps) {
  return (
    <div className="agenda-mini glass">
      <span className="agenda-mini__tags">
        <Badge type="now">Sekarang</Badge>
        {here ? (
          <Badge type="room">Kamu di sini</Badge>
        ) : (
          <button type="button" className="agenda-mini__room" onClick={onGoToRoom} aria-label={`Pindah ke ${room}`}>
            <Badge type="room" arrow>
              {room}
            </Badge>
          </button>
        )}
      </span>
      <button type="button" className="agenda-mini__body" onClick={onClick}>
        <span className="agenda-mini__icon clay clay-accent">
          <Icon name="Sparkle" size={20} />
        </span>
        <span className="agenda-mini__text">
          <span className="t-p-h3-bold">{title}</span>
          <span className="t-p-h5 agenda-mini__next">
            Berikutnya: <span className="t-p-h5-bold">{next}</span>
          </span>
        </span>
        <Icon name="ChevronRight" />
      </button>
    </div>
  );
}
