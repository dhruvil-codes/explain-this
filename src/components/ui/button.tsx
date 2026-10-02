import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn, focusRing } from "./cn";

const buttonVariants = cva(
  "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-pill px-6 text-[19px] leading-none transition-[color,background-color,border-color,opacity] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:opacity-90",
        secondary:
          "border border-hairline bg-surface text-ink hover:border-accent hover:text-accent-ink",
        subtle: "bg-accent-soft text-accent-ink hover:opacity-90",
        ghost: "text-ink hover:bg-accent-soft hover:text-accent-ink",
        destructive:
          "border border-hairline bg-destructive-soft text-destructive hover:opacity-90",
      },
      size: {
        sm: "px-4 text-[16px]",
        md: "px-6 text-[19px]",
        lg: "px-7 text-[22px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner, disables the button, and announces busy state. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps): React.ReactElement {
  const busy = loading || disabled;
  return (
    <button
      type={type}
      disabled={busy}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), focusRing, className)}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden="true" className="animate-spin" />
      ) : null}
      {loading ? <span className="sr-only">Loading</span> : null}
      {children}
    </button>
  );
}

export { buttonVariants };
