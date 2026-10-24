import { Badge } from "./Badge";
import "./RoomIndicator.css";

type RoomIndicatorProps = {
  name: string;
  index: number;
  total: number;
  live?: boolean;
};

/** Figma: Room Indicator — room name + position dots; LIVE badge when the event is happening here. */
export function RoomIndicator({ name, index, total, live }: RoomIndicatorProps) {
  return (
    <div className="room-indicator glass" aria-live="polite">
      <div className="room-indicator__title">
        <span className="t-p-h4-bold">{name}</span>
        {live && <Badge type="live">LIVE</Badge>}
      </div>
      <div className="room-indicator__dots" aria-label={`Ruangan ${index + 1} dari ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`room-indicator__dot${i === index ? " is-active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
