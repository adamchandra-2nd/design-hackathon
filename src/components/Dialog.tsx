import { useEffect, type ReactNode } from "react";
import "./Dialog.css";

type DialogProps = {
  title: string;
  children?: ReactNode;
  /** Buttons, stacked full width. */
  actions: ReactNode;
  /** Optional visual above the title (icon circle, avatar…). */
  lead?: ReactNode;
  onClose: () => void;
};

/** Figma: Dialog — centered card over a dimmed scrim. Tap outside or Esc to close. */
export function Dialog({ title, children, actions, lead, onClose }: DialogProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="dialog-scrim" onClick={onClose}>
      <div
        className="dialog clay clay-light"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {lead && <div className="dialog__lead">{lead}</div>}
        <div className="dialog__text">
          <h2 className="t-display-h6 dialog__title">{title}</h2>
          {children && <div className="t-p-h4 dialog__body">{children}</div>}
        </div>
        <div className="dialog__actions">{actions}</div>
      </div>
    </div>
  );
}
