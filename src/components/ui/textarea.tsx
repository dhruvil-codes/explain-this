import * as React from "react";
import { cn } from "./cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered above the paper card. */
  label?: string;
  /** Calm helper line under the card. */
  hint?: string;
  /** Error message; switches the card border and is announced. */
  error?: string;
  /** Show a live character counter (needs maxLength or counterMax). */
  showCount?: boolean;
  /** Counter ceiling when different from maxLength. */
  counterMax?: number;
}

export function Textarea({
  label,
  hint,
  error,
  showCount = false,
  counterMax,
  maxLength,
  id,
  className,
  onChange,
  value,
  defaultValue,
  ...rest
}: TextareaProps): React.ReactElement {
  const generatedId = React.useId();
  const fieldId = id ?? `textarea-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const ceiling = counterMax ?? maxLength ?? null;
  const [uncontrolledLen, setUncontrolledLen] = React.useState(
    typeof defaultValue === "string" ? defaultValue.length : 0
  );
  const length =
    typeof value === "string" ? value.length : uncontrolledLen;
  const nearLimit = ceiling !== null && length >= ceiling * 0.9;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="mb-2 block text-[17px] text-ink"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => {
          if (typeof value !== "string") {
            setUncontrolledLen(event.target.value.length);
          }
          onChange?.(event);
        }}
        className="min-h-[220px] w-full resize-y rounded-card-lg border border-hairline bg-paper px-5 py-4 text-[19px] leading-[1.6] text-ink shadow-[var(--shadow-paper-inset)] transition-[border-color] duration-200 ease-out placeholder:text-muted focus:border-accent focus:outline-none"
        {...rest}
      />
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="text-[16px] text-destructive"
            >
              {error}
            </p>
          ) : hint ? (
            <p id={hintId} className="text-[16px] italic text-muted">
              {hint}
            </p>
          ) : null}
        </div>
        {showCount && ceiling !== null ? (
          <p
            aria-hidden="true"
            className={cn(
              "shrink-0 text-[15px]",
              nearLimit ? "text-destructive" : "text-muted"
            )}
          >
            {length} / {ceiling}
          </p>
        ) : null}
      </div>
    </div>
  );
}
