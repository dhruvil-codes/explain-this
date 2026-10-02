import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";
import { IconButton } from "./icon-button";
import { trapTabKey, useDialogMount } from "./dialog-helpers";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Sheet heading, e.g. "Show me this". */
  title: React.ReactNode;
  /** The selected quote shown at the top of the sheet. */
  quote?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

/**
 * Mobile bottom sheet for Show-Me results. Drag the handle (or swipe)
 * down to dismiss; Escape also closes.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  quote,
  children,
  footer,
  ariaLabel,
  className,
}: BottomSheetProps): React.ReactElement | null {
  const panelRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const touchStartY = React.useRef<number | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  // Reset the drag position whenever the sheet reopens (React's sanctioned
  // adjust-state-during-render pattern for derived state).
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setDragOffset(0);
  }
  useDialogMount(open, onClose, panelRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-sheet)]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="anim-fade-in absolute inset-0 bg-[var(--overlay)]"
      />
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        tabIndex={-1}
        onKeyDown={(event) => trapTabKey(event, panelRef)}
        style={dragOffset > 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
        className={cn(
          "anim-sheet-in absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] w-full max-w-2xl flex-col rounded-t-card-lg border-t border-hairline bg-surface",
          className
        )}
      >
        <div
          onTouchStart={(event) => {
            touchStartY.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchMove={(event) => {
            if (touchStartY.current === null) return;
            const current = event.touches[0]?.clientY ?? touchStartY.current;
            setDragOffset(Math.max(0, current - touchStartY.current));
          }}
          onTouchEnd={() => {
            if (dragOffset > 120) onClose();
            else setDragOffset(0);
            touchStartY.current = null;
          }}
          className="flex min-h-[44px] cursor-grab touch-none items-center justify-center pt-3"
          aria-hidden="true"
        >
          <span className="h-1 w-12 rounded-pill bg-hairline" />
        </div>
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-6 pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[24px] leading-snug">
              {title}
            </h2>
            {quote ? (
              <blockquote className="mt-2 border-l-2 border-accent pl-3 text-[17px] italic text-muted">
                {quote}
              </blockquote>
            ) : null}
          </div>
          <IconButton aria-label="Close panel" onClick={onClose} className="-mr-2">
            <X aria-hidden="true" />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <footer className="border-t border-hairline px-6 py-4">{footer}</footer>
        ) : null}
      </section>
    </div>
  );
}
