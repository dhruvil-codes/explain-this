/**
 * Client analytics: custom Vercel events only (PRD §6.4). No PII, no text
 * content — event names and coarse metadata (tab id, level) at most.
 */
"use client";

import { track } from "@vercel/analytics";

export const ANALYTICS_EVENTS = [
  "explain_submitted",
  "tab_viewed",
  "play_interacted",
  "showme_used",
  "share_created",
  "regenerate",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** Fire-and-forget; never throws, never blocks UI. */
export function trackEvent(
  name: AnalyticsEvent,
  props?: Record<string, string | number | boolean>
): void {
  try {
    track(name, props);
  } catch {
    // Analytics must never break the product.
  }
}
