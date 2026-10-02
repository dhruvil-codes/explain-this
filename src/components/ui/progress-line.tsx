import * as React from "react";
import { cn } from "./cn";

export interface ProgressLineProps {
  /** Muted italic status, e.g. "Drawing the diagram…". */
  label: string;
  /**
   * Determinate 0-100 value. Omit for indeterminate (streaming /
   * unknown-length work).
   */
  value?: number;
  className?: string;
}

export function ProgressLine({
  label,
  value,
  className,
}: ProgressLineProps): React.ReactElement {
  const determinate =
    typeof value === "number" && Number.isFinite(value);
  const clamped = determinate
    ? Math.min(100, Math.max(0, value as number))
    : 0;

  return (
    <div className={cn("w-full", className)}>
      <p className="mb-2 text-[16px] italic text-muted">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? 100 : undefined}
        aria-valuenow={determinate ? Math.round(clamped) : undefined}
        className="h-[3px] w-full overflow-hidden rounded-pill bg-hairline"
      >
        {determinate ? (
          <div
            className="h-full rounded-pill bg-accent transition-[width] duration-200 ease-out"
            style={{ width: `${clamped}%` }}
          />
        ) : (
          <div className="progress-indeterminate-bar h-full w-1/3 rounded-pill bg-accent" />
        )}
      </div>
    </div>
  );
}
