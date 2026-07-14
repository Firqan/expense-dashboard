import { useEffect, useState } from 'react';
import type { Transaction, TransactionType } from './types';
import {
  getAllTransactions,
  putTransaction,
  deleteTransactionFromDb,
  bulkAddTransactions,
} from './transactionsDb';

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  foreignCurrency?: string;
  foreignAmount?: number;
  exchangeRate?: number;
}

/**
 * Transactions live in IndexedDB rather than localStorage — its storage
 * quota is dramatically larger (tens of megabytes or more, vs. ~5MB), which
 * matters here since this is the one piece of app data that can genuinely
 * grow without bound over years of use. Every write updates local state
 * immediately (so the UI never waits on IndexedDB) and persists in the
 * background; if the background write fails, the in-memory state still
 * reflects the user's action for the rest of the session.
 */
export function useTransactionsStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllTransactions()
      .then((loaded) => {
        if (!cancelled) {
          setTransactions(loaded);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function addTransaction(input: TransactionInput) {
    const newTransaction: Transaction = { id: makeId(), ...input };
    setTransactions((prev) => [newTransaction, ...prev]);
    putTransaction(newTransaction).catch(() => {
      // Best effort — the transaction still shows up for this session even
      // if the background write to IndexedDB failed.
    });
  }

  function updateTransaction(id: string, input: TransactionInput) {
    let updated: Transaction | null = null;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...input, id };
        return updated;
      })
    );
    if (updated) putTransaction(updated).catch(() => {});
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteTransactionFromDb(id).catch(() => {});
  }

  function importTransactions(imported: Transaction[]) {
    setTransactions((prev) => [...imported, ...prev]);
    bulkAddTransactions(imported).catch(() => {});
  }

  return {
    transactions,
    isLoaded,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    makeId,
  };
}
