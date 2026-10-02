import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

/**
 * Shared visible-focus treatment. The global `:focus-visible` rule in
 * globals.css already paints a 2px accent ring; these utilities make the
 * intent explicit on every interactive component without touching color
 * tokens directly.
 */
export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:var(--focus-ring)]";
