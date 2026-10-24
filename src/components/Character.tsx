import { useEffect, useRef, useState } from "react";
import dragonFront from "../assets/characters/dragon-front.webp";
import "./Character.css";

// Placeholder reactions until Nanda's face/head expression art is ready.
const LINES = ["Halo!", "Yuk kenalan sama tamu lain!", "Hehe, geli!", "Jangan lupa cek agenda ya!", "Seru banget di sini!"];
const BUBBLE_MS = 2200;

/** Figma: Illustration/Character — Nanda's dragon mascot (front view). Tap for a reaction. */
export function Character() {
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

  return (
    <button type="button" className="character" onClick={react} aria-label="Sapa karaktermu">
      {line && (
        <span key={line} className="character__bubble clay clay-light t-p-h4-bold" role="status">
          {line}
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
      />
    </button>
  );
}
