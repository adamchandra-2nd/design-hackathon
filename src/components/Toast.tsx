import { Avatar } from "./Avatar";
import { Button } from "./Button";
import "./Toast.css";

type ToastProps = {
  name: string;
  onGreet: () => void;
};

/** Figma: Toast (Type=Hadir) — glass notification when another guest arrives. */
export function Toast({ name, onGreet }: ToastProps) {
  return (
    <div className="toast glass" role="status">
      <Avatar initial={name.charAt(0)} size="M" />
      <div className="toast__text">
        <span className="t-p-h4-bold">{name} baru saja hadir</span>
        <span className="t-p-h5 toast__sub">Ayo sapa dan kenalan!</span>
      </div>
      <Button size="small" onClick={onGreet}>
        Sapa
      </Button>
    </div>
  );
}
