import { Icon } from "./Icon";
import "./SwipeHint.css";

type SwipeHintProps = {
  direction: "left" | "right";
  label: string;
  onClick: () => void;
};

/** Figma: Swipe Hint (Direction=Left/Right) — floating arrow at the screen edge. */
export function SwipeHint({ direction, label, onClick }: SwipeHintProps) {
  return (
    <button type="button" className="swipe-hint glass" aria-label={label} onClick={onClick}>
      <Icon name={direction === "left" ? "ChevronLeft" : "ChevronRight"} />
    </button>
  );
}
