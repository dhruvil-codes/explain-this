import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full border border-hairline text-muted">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <p className="mt-5 max-w-md text-[24px] leading-snug">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-[17px] italic leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
