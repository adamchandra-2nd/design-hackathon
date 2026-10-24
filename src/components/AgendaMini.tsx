import { Icon } from "./Icon";
import "./AgendaMini.css";

type AgendaMiniProps = {
  eyebrow: string;
  title: string;
  next: string;
  onClick?: () => void;
};

/** Figma: Agenda Mini (Type=Now) — floating live-agenda summary, glass. */
export function AgendaMini({ eyebrow, title, next, onClick }: AgendaMiniProps) {
  return (
    <button type="button" className="agenda-mini glass" onClick={onClick}>
      <span className="agenda-mini__pulse clay clay-accent">
        <Icon name="Sparkle" size={20} />
      </span>
      <span className="agenda-mini__text">
        <span className="t-p-h5-bold agenda-mini__eyebrow">{eyebrow}</span>
        <span className="t-p-h3-bold">{title}</span>
        <span className="t-p-h5 agenda-mini__next">{next}</span>
      </span>
      <Icon name="ChevronRight" />
    </button>
  );
}
