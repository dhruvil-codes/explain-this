import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "./cn";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  /**
   * Convenience Try-again handler. Renders a "Try again" button.
   * For full control, pass `action` instead (or as well).
   */
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something didn’t get through.",
  description = "Your work is safe. Please try again in a moment.",
  onRetry,
  retryLabel = "Try again",
  action,
  className,
}: ErrorStateProps): React.ReactElement {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-card border border-hairline bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive-soft text-destructive">
        <AlertCircle aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-5 max-w-md text-[24px] leading-snug">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-[17px] italic leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {onRetry || action ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry ? (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              <RotateCcw aria-hidden="true" />
              {retryLabel}
            </Button>
          ) : null}
          {action}
        </div>
      ) : null}
    </div>
  );
}
