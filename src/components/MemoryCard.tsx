import dragonFront from "../assets/characters/dragon-front.webp";
import { EVENT } from "../config";
import "./MemoryCard.css";

type Props = { name: string; hue: number; kenalanCount: number; roomsVisited: number };

/** Figma: Memory Card — story-sized keepsake to share on Instagram. */
export function MemoryCard({ name, hue, kenalanCount, roomsVisited }: Props) {
  return (
    <figure className="memory-card clay clay-accent" aria-label={`Memory card ${name}`}>
      <div className="memory-card__head">
        <span className="t-p-h5-bold">{EVENT.host}</span>
        <span className="t-p-h5-bold">08.11.2026</span>
      </div>
      <span className="memory-card__title">{EVENT.name}</span>
      <div className="memory-card__stage">
        <img src={dragonFront} alt="" style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined} />
      </div>
      <figcaption className="memory-card__foot">
        <span className="memory-card__name">{name}</span>
        <span className="memory-card__stats t-p-h5-bold">
          <span>{kenalanCount} kenalan baru</span>
          <span>·</span>
          <span>{roomsVisited} ruangan dijelajahi</span>
        </span>
      </figcaption>
    </figure>
  );
}
