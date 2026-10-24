import dragonFront from "../assets/characters/dragon-front.webp";
import "./Avatar.css";

type AvatarProps = {
  initial: string;
  size?: "S" | "M" | "L" | "XL";
  /** Show the guest's own character (head crop) instead of the initial. Value is the colour hue shift. */
  characterHue?: number;
};

/** Figma: Avatar. Character head for the signed-in guest; initials for others until face crops exist. */
export function Avatar({ initial, size = "M", characterHue }: AvatarProps) {
  if (characterHue !== undefined) {
    return (
      <span className={`avatar avatar--${size} avatar--character clay clay-light`} aria-hidden="true">
        <span
          className="avatar__face"
          style={{ backgroundImage: `url(${dragonFront})`, filter: characterHue ? `hue-rotate(${characterHue}deg)` : undefined }}
        />
      </span>
    );
  }
  return (
    <span className={`avatar avatar--${size} clay clay-accent`} aria-hidden="true">
      <span>{initial}</span>
    </span>
  );
}
