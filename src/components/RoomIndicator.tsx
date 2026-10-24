import { Icon } from "./Icon";
import "./RoomIndicator.css";

type RoomIndicatorProps = {
  name: string;
  index: number;
  total: number;
  live?: boolean;
};

/** Figma: Room Indicator — one slim row: room name tag, LIVE marker, position dots. Sits just above the Bottom Nav. */
export function RoomIndicator({ name, index, total, live }: RoomIndicatorProps) {
  return (
    <div className="room-indicator glass" aria-live="polite">
      <span className="room-indicator__tags">
        <span className="room-indicator__name clay clay-light t-p-h5-bold">
          <Icon name="MapPin" size={16} />
          {name}
        </span>
        {live && (
          <span className="room-indicator__live clay clay-accent t-p-h5-bold">
            <span className="room-indicator__live-dot" />
            LIVE
          </span>
        )}
      </span>
      <span className="room-indicator__dots" aria-label={`Ruangan ${index + 1} dari ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`room-indicator__dot${i === index ? " is-active" : ""}`} />
        ))}
      </span>
    </div>
  );
}
