import { Badge } from "./Badge";
import { Icon } from "./Icon";
import "./AgendaMini.css";

type AgendaMiniProps = {
  room: string;
  title: string;
  next: string;
  onClick?: () => void;
};

/** Figma: Agenda Mini (Type=Now) — floating live-agenda summary, glass. Tags on top, then icon + title + next. */
export function AgendaMini({ room, title, next, onClick }: AgendaMiniProps) {
  return (
    <button type="button" className="agenda-mini glass" onClick={onClick}>
      <span className="agenda-mini__tags">
        <Badge type="live">Sekarang</Badge>
        <Badge type="room">{room}</Badge>
      </span>
      <span className="agenda-mini__body">
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
      </span>
    </button>
  );
}
