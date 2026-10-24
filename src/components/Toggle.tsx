import { useId } from "react";
import "./Toggle.css";

type ToggleProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Ink container with an orange "on" state. */
  dark?: boolean;
};

/** Figma: Toggle — label on the left, clay switch on the right. */
export function Toggle({ label, hint, checked, onChange, dark }: ToggleProps) {
  const id = useId();
  return (
    <label className={`toggle${dark ? " toggle--dark clay clay-dark" : ""}`} htmlFor={id}>
      <span className="toggle__text">
        <span className="t-p-h4-bold">{label}</span>
        {hint && <span className="t-p-h5 toggle__hint">{hint}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className="toggle__input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`toggle__track clay ${dark && checked ? "clay-accent" : checked ? "clay-dark" : "clay-light"}`} aria-hidden="true">
        <span className="toggle__thumb clay clay-light" />
      </span>
    </label>
  );
}
