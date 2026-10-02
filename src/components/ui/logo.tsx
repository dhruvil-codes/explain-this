import Link from "next/link";
import { cn } from "./cn";

const logoSizes = {
  sm: "text-[22px]",
  md: "text-[28px]",
  lg: "text-[36px]",
} as const;

export interface LogoProps {
  size?: keyof typeof logoSizes;
  className?: string;
}

/** ExplainThis italic serif wordmark, linking home. */
export function Logo({ size = "md", className }: LogoProps): React.ReactElement {
  return (
    <Link
      href="/"
      aria-label="ExplainThis — home"
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center italic leading-none text-ink transition-colors duration-200 ease-out hover:text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]",
        logoSizes[size],
        className
      )}
    >
      ExplainThis
    </Link>
  );
}
