"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn, focusRing } from "./cn";

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "explainthis-theme";

const choiceMeta: Record<
  ThemeChoice,
  { label: string; hint: string; Icon: typeof Sun }
> = {
  system: { label: "System", hint: "Follow system", Icon: Monitor },
  light: { label: "Light", hint: "Light mode", Icon: Sun },
  dark: { label: "Dark", hint: "Dark mode", Icon: Moon },
};

const cycleOrder: ThemeChoice[] = ["system", "light", "dark"];

function readStored(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

/**
 * Theme toggle. Defaults to the system theme, persists the manual
 * override in localStorage, and follows live system changes while in
 * "system" mode. Toggles the `dark` class on <html>.
 */
export function ThemeToggle({
  className,
}: {
  className?: string;
}): React.ReactElement {
  // Lazy init reads localStorage on first client render; server renders
  // "system". `mounted` flips after hydration via useSyncExternalStore so
  // no effect-driven setState is needed.
  const [theme, setTheme] = React.useState<ThemeChoice>(readStored);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  React.useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (choice: ThemeChoice): void => {
      const dark =
        choice === "dark" || (choice === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };
    apply(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    if (theme !== "system") return;
    const follow = (): void => apply("system");
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, [theme, mounted]);

  if (!mounted) {
    return <span aria-hidden="true" className={cn("size-11", className)} />;
  }

  const next = cycleOrder[(cycleOrder.indexOf(theme) + 1) % cycleOrder.length];
  const current = choiceMeta[theme];
  const upcoming = next ? choiceMeta[next] : choiceMeta.system;
  const CurrentIcon = current.Icon;

  return (
    <button
      type="button"
      aria-label={`Theme: ${current.label}. Switch to ${upcoming.label}.`}
      title={`Theme: ${current.label} — switch to ${upcoming.label}`}
      onClick={() => {
        if (next) setTheme(next);
      }}
      className={cn(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-[color,background-color] duration-200 ease-out hover:bg-accent-soft hover:text-accent-ink",
        focusRing,
        className
      )}
    >
      <CurrentIcon aria-hidden="true" className="size-5" />
    </button>
  );
}
