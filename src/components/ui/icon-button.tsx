import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRing } from "./cn";

const iconButtonVariants = cva(
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,border-color,opacity] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5",
  {
    variants: {
      variant: {
        ghost: "text-ink hover:bg-accent-soft hover:text-accent-ink",
        outline:
          "border border-hairline bg-surface text-ink hover:border-accent hover:text-accent-ink",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible name, required because the button has no visible text. */
  "aria-label": string;
}

export function IconButton({
  variant,
  children,
  className,
  type = "button",
  ...rest
}: IconButtonProps): React.ReactElement {
  return (
    <button
      type={type}
      className={cn(iconButtonVariants({ variant }), focusRing, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export { iconButtonVariants };
