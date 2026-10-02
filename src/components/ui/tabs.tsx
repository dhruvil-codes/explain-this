import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn, focusRing } from "./cn";

export interface TabItem {
  id: string;
  /** Serif tab label, e.g. "Read". */
  label: React.ReactNode;
  /** Muted italic subtitle, e.g. "plain English". */
  subtitle?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  /** Controlled selected tab id. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

function nextEnabled(tabs: TabItem[], from: number, step: 1 | -1): number {
  const n = tabs.length;
  let i = from;
  for (let k = 0; k < n; k += 1) {
    i = (i + step + n) % n;
    if (!tabs[i]?.disabled) return i;
  }
  return from;
}

export function Tabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Sections",
  className,
}: TabsProps): React.ReactElement {
  const [internal, setInternal] = React.useState(
    defaultValue ?? tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? ""
  );
  const selected = value ?? internal;
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const select = React.useCallback(
    (id: string, focus = false) => {
      setInternal(id);
      onValueChange?.(id);
      if (focus) {
        const index = tabs.findIndex((t) => t.id === id);
        buttonRefs.current[index]?.focus();
      }
    },
    [onValueChange, tabs]
  );

  const onKeyDown = (event: React.KeyboardEvent): void => {
    const current = tabs.findIndex((t) => t.id === selected);
    if (current < 0) return;
    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowLeft" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      let next = current;
      if (event.key === "Home") {
        next = tabs.findIndex((t) => !t.disabled);
      } else if (event.key === "End") {
        next = tabs.map((t) => !t.disabled).lastIndexOf(true);
      } else {
        next = nextEnabled(
          tabs,
          current,
          event.key === "ArrowRight" ? 1 : -1
        );
      }
      const tab = tabs[next];
      if (tab && !tab.disabled) select(tab.id, true);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn("flex gap-7 overflow-x-auto border-b border-hairline", className)}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === selected;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => select(tab.id)}
            className={cn(
              "relative min-h-[44px] shrink-0 cursor-pointer px-1 pb-3 pt-2 text-left text-[20px] leading-tight transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50",
              isActive ? "text-ink" : "text-muted hover:text-ink",
              focusRing
            )}
          >
            <span className="inline-flex items-center gap-2">
              {Icon ? <Icon aria-hidden="true" className="size-5" /> : null}
              {tab.label}
            </span>
            {tab.subtitle ? (
              <span className="block text-[15px] italic leading-snug text-muted">
                {tab.subtitle}
              </span>
            ) : null}
            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-[2px] bg-accent"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  /** Matches the tab id this panel belongs to. */
  tabId: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({
  tabId,
  active,
  children,
  className,
}: TabPanelProps): React.ReactElement {
  return (
    <div
      id={`panel-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
      hidden={!active}
      className={cn("pt-6", className)}
    >
      {active ? children : null}
    </div>
  );
}
