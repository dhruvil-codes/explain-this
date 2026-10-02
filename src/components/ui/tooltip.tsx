import * as React from "react";
import { cn } from "./cn";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const sidePosition: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export interface TooltipProps {
  /** Tooltip text. When absent, children render without a tooltip. */
  content?: React.ReactNode;
  children: React.ReactElement;
  side?: TooltipSide;
}

export function Tooltip({
  content,
  children,
  side = "top",
}: TooltipProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open ]);

  const trigger = React.isValidElement<{
    "aria-describedby"?: string;
  }>(children)
    ? React.cloneElement(children, {
        "aria-describedby": open && content ? tooltipId : undefined,
      })
    : children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {trigger}
      {open && content ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "anim-fade-in pointer-events-none absolute z-[var(--z-tooltip)] w-max max-w-[240px] rounded-control border border-hairline bg-surface px-3 py-2 text-[15px] leading-snug text-ink",
            sidePosition[side]
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
