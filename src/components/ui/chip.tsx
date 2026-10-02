import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn, focusRing } from "./cn";

const chipVariants = cva(
  "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-pill border px-5 text-[17px] leading-none transition-[color,background-color,border-color,opacity] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "border-accent bg-accent-soft text-accent-ink",
        false:
          "border-hairline bg-surface text-ink hover:border-accent hover:text-accent-ink",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  /** Optional leading icon (Lucide only). */
  icon?: LucideIcon;
}

export function Chip({
  active,
  icon: Icon,
  children,
  className,
  type = "button",
  ...rest
}: ChipProps): React.ReactElement {
  return (
    <button
      type={type}
      aria-pressed={active ?? undefined}
      className={cn(chipVariants({ active }), focusRing, className)}
      {...rest}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export { chipVariants };
