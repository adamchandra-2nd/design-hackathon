import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Icon } from "./Icon";
import type { IconName } from "./iconPaths";
import "./Toast.css";

type ToastProps =
  | { type: "hadir"; name: string; onGreet: () => void; closing?: boolean }
  | { type: "info"; icon: IconName; title: string; sub: string; closing?: boolean }
  | {
      type: "move";
      event: string;
      room: string;
      secondsLeft: number;
      onMove: () => void;
      onStay: () => void;
      closing?: boolean;
    };

/** Figma: Toast — solid card that scales in under the agenda card (Type=Hadir | Info | Locked | Move). */
export function Toast(props: ToastProps) {
  let lead: ReactNode, title: string, sub: string, action: ReactNode = null, actions: ReactNode = null;
  if (props.type === "hadir") {
    lead = <Avatar initial={props.name.charAt(0)} size="M" />;
    title = `${props.name} baru saja hadir`;
    sub = "Ayo sapa dan kenalan!";
    action = (
      <Button size="small" onClick={props.onGreet}>
        Sapa
      </Button>
    );
  } else if (props.type === "move") {
    // An event started elsewhere: warn first, then move the guest so the room never switches by surprise.
    lead = (
      <span className="toast__icon toast__icon--accent clay clay-accent">
        <Icon name="MapPin" size={20} />
      </span>
    );
    title = `${props.event} dimulai di ${props.room}`;
    sub = `Kamu pindah ke sana dalam ${props.secondsLeft} detik`;
    actions = (
      <div className="toast__actions">
        <Button style="ghost" size="small" onClick={props.onStay}>
          Tetap di sini
        </Button>
        <Button size="small" onClick={props.onMove}>
          Pindah sekarang
        </Button>
      </div>
    );
  } else {
    lead = (
      <span className="toast__icon clay clay-light">
        <Icon name={props.icon} size={20} />
      </span>
    );
    title = props.title;
    sub = props.sub;
  }
  return (
    <div
      className={`toast clay clay-light${actions ? " toast--stacked" : ""}${props.closing ? " is-closing" : ""}`}
      role="status"
    >
      <div className="toast__main">
        {lead}
        <div className="toast__text">
          <span className="t-p-h4-bold">{title}</span>
          <span className="t-p-h5 toast__sub">{sub}</span>
        </div>
        {action}
      </div>
      {actions}
    </div>
  );
}
