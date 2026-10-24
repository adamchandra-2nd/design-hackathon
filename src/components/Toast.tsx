import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Icon } from "./Icon";
import type { IconName } from "./iconPaths";
import "./Toast.css";

type ToastProps =
  | { type: "hadir"; name: string; onGreet: () => void; closing?: boolean }
  | { type: "info"; icon: IconName; title: string; sub: string; closing?: boolean };

/** Figma: Toast — solid card that scales in under the agenda card (Type=Hadir | Info). */
export function Toast(props: ToastProps) {
  let lead: ReactNode, title: string, sub: string, action: ReactNode = null;
  if (props.type === "hadir") {
    lead = <Avatar initial={props.name.charAt(0)} size="M" />;
    title = `${props.name} baru saja hadir`;
    sub = "Ayo sapa dan kenalan!";
    action = (
      <Button size="small" onClick={props.onGreet}>
        Sapa
      </Button>
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
    <div className={`toast clay clay-light${props.closing ? " is-closing" : ""}`} role="status">
      {lead}
      <div className="toast__text">
        <span className="t-p-h4-bold">{title}</span>
        <span className="t-p-h5 toast__sub">{sub}</span>
      </div>
      {action}
    </div>
  );
}
