import { useEffect, useState } from 'react';
import type { Transaction, TransactionType } from './types';

const STORAGE_KEY = 'expense-dashboard-transactions-v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useTransactionsStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // localStorage unavailable — app still works for the session.
    }
  }, [transactions]);

  function addTransaction(input: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) {
    const newTransaction: Transaction = { id: makeId(), ...input };
    setTransactions((prev) => [newTransaction, ...prev]);
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function importTransactions(imported: Transaction[]) {
    setTransactions((prev) => [...imported, ...prev]);
  }

  return { transactions, addTransaction, deleteTransaction, importTransactions, makeId };
}
