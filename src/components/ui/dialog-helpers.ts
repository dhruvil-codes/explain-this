import * as React from "react";

/**
 * Shared behavior for Drawer and BottomSheet: Escape to close, body
 * scroll lock while open, move focus into the panel on open and return
 * it to the previously focused element on close.
 */
export function useDialogMount(
  open: boolean,
  onClose: () => void,
  panelRef: React.RefObject<HTMLElement | null>
): void {
  const previousFocus = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    };
  }, [open, onClose, panelRef]);
}

/** Keep Tab cycling inside the panel while it is open. */
export function trapTabKey(
  event: React.KeyboardEvent,
  panelRef: React.RefObject<HTMLElement | null>
): void {
  if (event.key !== "Tab" || !panelRef.current) return;
  const focusable = panelRef.current.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
