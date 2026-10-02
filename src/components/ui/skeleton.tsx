import * as React from "react";
import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When provided, the skeleton announces itself once as a loading
   * status. Leave unset for skeletons paired with a visible
   * ProgressLine or other status text (avoids double announcements).
   */
  label?: string;
}

export function Skeleton({
  label,
  className,
  ...rest
}: SkeletonProps): React.ReactElement {
  if (label) {
    return (
      <div
        role="status"
        aria-label={label}
        className={cn("animate-pulse rounded-control bg-hairline", className)}
        {...rest}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-control bg-hairline", className)}
      {...rest}
    />
  );
}

export interface SkeletonLinesProps {
  lines?: number;
  className?: string;
}

/** Stacked text-line placeholders that reserve the final layout space. */
export function SkeletonLines({
  lines = 3,
  className,
}: SkeletonLinesProps): React.ReactElement {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-5 animate-pulse rounded-control bg-hairline",
            i === lines - 1 && "w-2/3"
          )}
        />
      ))}
    </div>
  );
}
