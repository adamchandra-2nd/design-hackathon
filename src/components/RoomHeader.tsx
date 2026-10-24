import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import "./RoomHeader.css";

type RoomHeaderProps = {
  name: string;
  characterHue?: number;
  kenalanCount: number;
  kenalanTarget: number;
  onKenalan?: () => void;
};

/** Figma: Room Header — profile chip on its own (pre-event screens). */
export function ProfileChip({ name, characterHue }: { name: string; characterHue?: number }) {
  return (
    <div className="room-header__chip room-header__profile glass">
      <Avatar initial={name.charAt(0)} size="M" characterHue={characterHue} />
      <span className="t-p-h4-bold">{name}</span>
    </div>
  );
}

/** Figma: Room Header (Type=Event) — floating profile chip + Kenalan progress chip. */
export function RoomHeader({ name, characterHue, kenalanCount, kenalanTarget, onKenalan }: RoomHeaderProps) {
  const progress = Math.min(kenalanCount / kenalanTarget, 1);
  return (
    <header className="room-header">
      <ProfileChip name={name} characterHue={characterHue} />
      <button
        type="button"
        className="room-header__chip room-header__kenalan clay clay-accent"
        aria-label={`Kenalan ${kenalanCount} dari ${kenalanTarget}`}
        onClick={onKenalan}
      >
        <span className="room-header__kenalan-icon clay clay-light">
          <Icon name="UserPlus" size={16} />
        </span>
        <span className="room-header__kenalan-body">
          <span className="room-header__kenalan-row">
            <span className="t-p-h5-bold room-header__kenalan-label">Kenalan</span>
            <span className="t-p-h5-bold">
              {kenalanCount}/{kenalanTarget}
            </span>
          </span>
          <span className="room-header__bar" aria-hidden="true">
            <span className="room-header__bar-fill" style={{ width: `${progress * 100}%` }} />
          </span>
        </span>
      </button>
    </header>
  );
}
