import { useId, type KeyboardEvent } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** A radiogroup styled as a segmented control. Arrow keys move the selection. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  hideLabel,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  hideLabel?: boolean;
}) {
  const id = useId();
  const onKey = (e: KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = options[(i + d + options.length) % options.length];
    onChange(next.value);
    document.getElementById(`${id}-${next.value}`)?.focus();
  };
  return (
    <div className="field">
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : "field-label"}>
        {label}
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={onKey}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              id={`${id}-${o.value}`}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              className={on ? "seg on" : "seg"}
              disabled={disabled}
              title={o.hint}
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
