import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";
import { IconButton } from "./icon-button";
import { trapTabKey, useDialogMount } from "./dialog-helpers";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Panel heading, e.g. "Show me this". */
  title: React.ReactNode;
  /** The selected quote shown at the top of the panel. */
  quote?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

/**
 * Right-side panel (~420px) for Show-Me results and other secondary
 * flows on desktop. Use BottomSheet on small screens.
 */
export function Drawer({
  open,
  onClose,
  title,
  quote,
  children,
  footer,
  ariaLabel,
  className,
}: DrawerProps): React.ReactElement | null {
  const panelRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  useDialogMount(open, onClose, panelRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-drawer)]">
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
        className={cn(
          "anim-drawer-in absolute right-0 top-0 flex h-full w-[420px] max-w-[94vw] flex-col border-l border-hairline bg-surface",
          className
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-6 py-5">
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
          <IconButton aria-label="Close panel" onClick={onClose} className="-mr-2 -mt-1">
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
