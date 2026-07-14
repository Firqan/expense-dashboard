import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllTransactions,
  putTransaction,
  deleteTransactionFromDb,
  bulkAddTransactions,
  resetTransactionsDbForTests,
} from './transactionsDb';
import type { Transaction } from './types';

const sample: Transaction = {
  id: '1',
  type: 'expense',
  amount: 42.5,
  category: 'Food',
  description: 'Lunch',
  date: '2026-07-01',
};

describe('transactionsDb', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetTransactionsDbForTests();
  });

  it('returns an empty array when nothing has been stored', async () => {
    expect(await getAllTransactions()).toEqual([]);
  });

  it('stores and retrieves a transaction', async () => {
    await putTransaction(sample);
    const all = await getAllTransactions();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(sample);
  });

  it('updates a transaction in place when put with the same id', async () => {
    await putTransaction(sample);
    await putTransaction({ ...sample, amount: 99 });
    const all = await getAllTransactions();
    expect(all).toHaveLength(1);
    expect(all[0].amount).toBe(99);
  });

  it('deletes a transaction by id', async () => {
    await putTransaction(sample);
    await deleteTransactionFromDb('1');
    expect(await getAllTransactions()).toEqual([]);
  });

  it('bulk-adds multiple transactions at once', async () => {
    const second: Transaction = { ...sample, id: '2', amount: 10 };
    await bulkAddTransactions([sample, second]);
    const all = await getAllTransactions();
    expect(all).toHaveLength(2);
  });

  it('migrates data from the legacy localStorage key on first read', async () => {
    localStorage.setItem('expense-dashboard-transactions-v1', JSON.stringify([sample]));

    const all = await getAllTransactions();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('1');
    // The legacy key should be cleaned up after a successful migration.
    expect(localStorage.getItem('expense-dashboard-transactions-v1')).toBeNull();
  });

  it('does not overwrite existing IndexedDB data with legacy localStorage data', async () => {
    await putTransaction({ ...sample, id: 'already-here' });
    localStorage.setItem(
      'expense-dashboard-transactions-v1',
      JSON.stringify([{ ...sample, id: 'legacy-one' }])
    );

    const all = await getAllTransactions();

    // Only the data already in IndexedDB should remain — the legacy data is
    // discarded (with its key still cleaned up) rather than merged in
    // unexpectedly, since IndexedDB having data means migration already ran.
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('already-here');
  });

  it('does nothing when there is no legacy data to migrate', async () => {
    expect(await getAllTransactions()).toEqual([]);
  });
});
