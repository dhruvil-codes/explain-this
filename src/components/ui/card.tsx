import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

const cardVariants = cva("rounded-card border border-hairline", {
  variants: {
    variant: {
      default: "bg-surface",
      paper:
        "bg-paper shadow-[var(--shadow-paper-inset)]",
      ghost: "border-transparent bg-transparent",
    },
    padding: {
      none: "p-0",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({
  variant,
  padding,
  className,
  ...rest
}: CardProps): React.ReactElement {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...rest} />
  );
}

export { cardVariants };
