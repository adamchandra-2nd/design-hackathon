import { useEffect, useRef, useState } from "react";
import dragonFront from "../assets/characters/dragon-front.webp";
import "./Character.css";

// Placeholder reactions until Nanda's face/head expression art is ready.
const LINES = ["Halo!", "Yuk kenalan sama tamu lain!", "Hehe, geli!", "Jangan lupa cek agenda ya!", "Seru banget di sini!"];
const BUBBLE_MS = 2200;

type CharacterProps = {
  /** Colour hue shift chosen in customisation. */
  hue?: number;
  /** A line the character keeps saying (e.g. on RSVP). Tap reactions still override it briefly. */
  say?: string;
};

/** Figma: Illustration/Character — Nanda's dragon mascot (front view). Tap for a reaction. */
export function Character({ hue = 0, say }: CharacterProps) {
  const [line, setLine] = useState<string | null>(null);
  const [bounce, setBounce] = useState(0);
  const lineIndex = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const react = () => {
    setLine(LINES[lineIndex.current++ % LINES.length]);
    setBounce((b) => b + 1);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLine(null), BUBBLE_MS);
  };

  const shown = line ?? say;
  return (
    <button type="button" className="character" onClick={react} aria-label="Sapa karaktermu">
      {shown && (
        <span key={shown} className="character__bubble clay clay-light t-p-h4-bold" role="status">
          {shown}
        </span>
      )}
      <span className="character__shadow" aria-hidden="true" />
      <img
        key={bounce}
        className={`character__img${bounce ? " is-bouncing" : ""}`}
        src={dragonFront}
        alt=""
        width={211}
        height={340}
        draggable={false}
        style={hue ? { filter: `hue-rotate(${hue}deg)` } : undefined}
      />
    </button>
  );
}
