import { Icon } from "./Icon";
import type { IconName } from "./iconPaths";
import "./Button.css";

type ButtonProps = {
  children: React.ReactNode;
  style?: "primary" | "secondary" | "accent" | "ghost";
  size?: "large" | "small";
  icon?: IconName;
  disabled?: boolean;
  onClick?: () => void;
};

const clayOf = { primary: "clay clay-dark", accent: "clay clay-accent", secondary: "clay clay-light", ghost: "" };

/** Figma: Button — Style × Size × State. */
export function Button({ children, style = "primary", size = "large", icon, disabled, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${style} btn--${size} ${disabled ? "" : clayOf[style]} ${size === "large" ? "t-p-h3-bold" : "t-p-h4-bold"}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{children}</span>
      {icon && <Icon name={icon} size={size === "large" ? 24 : 20} />}
    </button>
  );
}
