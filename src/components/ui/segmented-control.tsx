import * as React from "react";
import { cn, focusRing } from "./cn";

export interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Options",
  className,
}: SegmentedControlProps): React.ReactElement {
  const [internal, setInternal] = React.useState(
    defaultValue ?? options.find((o) => !o.disabled)?.value ?? ""
  );
  const selected = value ?? internal;
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const choose = React.useCallback(
    (next: string, focus = false) => {
      setInternal(next);
      onValueChange?.(next);
      if (focus) {
        const index = options.findIndex((o) => o.value === next);
        refs.current[index]?.focus();
      }
    },
    [onValueChange, options]
  );

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    if (enabled.length === 0) return;
    const current = enabled.findIndex((o) => o.value === selected);
    let next = enabled[0];
    if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled[enabled.length - 1];
    else {
      const step = event.key === "ArrowRight" ? 1 : -1;
      next = enabled[(current + step + enabled.length) % enabled.length];
    }
    if (next) choose(next.value, true);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-pill border border-hairline bg-surface p-1",
        className
      )}
    >
      {options.map((option, index) => {
        const isActive = option.value === selected;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={option.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => choose(option.value)}
            className={cn(
              "min-h-[44px] cursor-pointer rounded-pill px-5 text-[17px] leading-none transition-[color,background-color] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "bg-accent-soft text-accent-ink"
                : "text-muted hover:text-ink",
              focusRing
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
