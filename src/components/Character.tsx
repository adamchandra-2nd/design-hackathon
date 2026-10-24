import "./Character.css";

/** Figma: Illustration/Character — layered placeholder (Body, Face, Hair, Accessory).
    Swap the inner layers for Nanda's assets; size and position stay the same. */
export function Character() {
  return (
    <div className="character" role="img" aria-label="Karaktermu">
      <span className="character__shadow" />
      <span className="character__body clay clay-accent" />
      <span className="character__belly" />
      <span className="character__face" />
      <span className="character__hair" />
      <span className="character__accessory clay clay-accent" />
      <span className="character__tag t-p-h5-bold">ILUSTRASI KARAKTER</span>
    </div>
  );
}
