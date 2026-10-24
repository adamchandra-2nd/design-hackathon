import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import "./RoomHeader.css";

type RoomHeaderProps = {
  name: string;
  kenalanCount: number;
  kenalanTarget: number;
};

/** Figma: Room Header (Type=Event) — floating profile chip + Kenalan progress chip. */
export function RoomHeader({ name, kenalanCount, kenalanTarget }: RoomHeaderProps) {
  return (
    <header className="room-header">
      <div className="room-header__chip room-header__profile glass">
        <Avatar initial={name.charAt(0)} size="M" />
        <span className="t-p-h4-bold">{name}</span>
      </div>
      <button type="button" className="room-header__chip room-header__kenalan glass" aria-label={`Kenalan ${kenalanCount} dari ${kenalanTarget}`}>
        <span className="room-header__kenalan-icon clay clay-accent">
          <Icon name="UserPlus" size={16} />
        </span>
        <span className="t-p-h4-bold">
          {kenalanCount}/{kenalanTarget}
        </span>
      </button>
    </header>
  );
}
