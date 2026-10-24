import "./Avatar.css";

type AvatarProps = {
  initial: string;
  size?: "S" | "M" | "L" | "XL";
};

/** Figma: Avatar. Initial placeholder until Nanda's face crops are in. */
export function Avatar({ initial, size = "M" }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size} clay clay-accent`} aria-hidden="true">
      <span>{initial}</span>
    </span>
  );
}
