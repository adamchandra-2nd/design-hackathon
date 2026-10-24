import dragonFront from "../assets/characters/dragon-front.webp";
import "./Character.css";

/** Figma: Illustration/Character — Nanda's dragon mascot (front view). */
export function Character() {
  return (
    <div className="character">
      <span className="character__shadow" aria-hidden="true" />
      <img className="character__img" src={dragonFront} alt="Karaktermu" width={199} height={320} draggable={false} />
    </div>
  );
}
