import { useId } from "react";
import "./TextField.css";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  inputMode?: "text" | "numeric";
  maxLength?: number;
  autoFocus?: boolean;
};

/** Figma: Form/Text Field — label on top, field, optional hint. */
export function TextField({ label, value, onChange, placeholder, hint, multiline, inputMode, maxLength, autoFocus }: TextFieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="t-p-h5-bold field__label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="field__input field__input--multiline t-p-h4"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="field__input t-p-h3-bold"
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <span className="t-p-h5 field__hint">{hint}</span>}
    </div>
  );
}
