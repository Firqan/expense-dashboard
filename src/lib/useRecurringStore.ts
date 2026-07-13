import { useEffect, useState } from 'react';
import type { RecurringItem, TransactionType } from './types';

const STORAGE_KEY = 'expense-dashboard-recurring-v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadRecurringItems(): RecurringItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface RecurringItemInput {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
}

export function useRecurringStore() {
  const [items, setItems] = useState<RecurringItem[]>(loadRecurringItems);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable — app still works for the session.
    }
  }, [items]);

  function addRecurringItem(input: RecurringItemInput) {
    const newItem: RecurringItem = { id: makeId(), ...input };
    setItems((prev) => [...prev, newItem]);
  }

  function deleteRecurringItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return { items, addRecurringItem, deleteRecurringItem };
}
