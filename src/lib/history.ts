/**
 * Recent-results history (PRD §6.3): last 10 explains in localStorage.
 * Metadata + source text only (re-runnable without a share link).
 */
"use client";

export interface HistoryEntry {
  id: string;
  topic: string;
  preview: string;
  level: "simpler" | "standard" | "technical";
  source: string;
  createdAt: string;
}

const STORAGE_KEY = "explainthis-history-v1";
const MAX_ENTRIES = 10;

function readRaw(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).source === "string"
    );
  } catch {
    return [];
  }
}

export function loadHistory(): HistoryEntry[] {
  return readRaw().slice(0, MAX_ENTRIES);
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const next = [
    entry,
    ...readRaw().filter((e) => e.id !== entry.id),
  ].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota or privacy mode: history is best-effort.
  }
  return next;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort.
  }
}
