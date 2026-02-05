import { useState, useCallback } from 'react';

const STORAGE_KEY = 'elis_notification_read_orders';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface StoredEntry {
  id: number;
  readAt: number;
}

function loadFromStorage(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const entries: StoredEntry[] = JSON.parse(raw);
    const now = Date.now();
    // Prune entries older than 30 days
    const valid = entries.filter(e => now - e.readAt < MAX_AGE_MS);
    if (valid.length !== entries.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return new Set(valid.map(e => e.id));
  } catch {
    return new Set();
  }
}

function saveToStorage(ids: Set<number>) {
  const now = Date.now();
  // Load existing entries to preserve their readAt timestamps
  let existing: StoredEntry[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw);
  } catch { /* ignore */ }

  const existingMap = new Map(existing.map(e => [e.id, e.readAt]));
  const entries: StoredEntry[] = Array.from(ids).map(id => ({
    id,
    readAt: existingMap.get(id) ?? now,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useNotificationState() {
  const [readIds, setReadIds] = useState<Set<number>>(() => loadFromStorage());

  const markAsRead = useCallback((orderId: number) => {
    setReadIds(prev => {
      if (prev.has(orderId)) return prev;
      const next = new Set(prev);
      next.add(orderId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback((orderIds: number[]) => {
    setReadIds(prev => {
      const next = new Set(prev);
      let changed = false;
      for (const id of orderIds) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return prev;
      saveToStorage(next);
      return next;
    });
  }, []);

  const isUnread = useCallback((orderId: number) => !readIds.has(orderId), [readIds]);

  return { readIds, markAsRead, markAllAsRead, isUnread };
}
