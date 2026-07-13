import { describe, it, expect } from 'vitest';
import {
  filterByDateRange,
  calculateTotals,
  groupByCategory,
  monthlyTrend,
  formatCurrency,
} from './calculations';
import type { Transaction } from './types';

const sample: Transaction[] = [
  { id: '1', type: 'income', amount: 3000, category: 'Salary', description: 'Paycheck', date: '2026-06-01' },
  { id: '2', type: 'expense', amount: 800, category: 'Housing', description: 'Rent', date: '2026-06-02' },
  { id: '3', type: 'expense', amount: 150, category: 'Food', description: 'Groceries', date: '2026-06-15' },
  { id: '4', type: 'expense', amount: 50, category: 'Food', description: 'Restaurant', date: '2026-07-01' },
  { id: '5', type: 'income', amount: 500, category: 'Freelance', description: 'Side gig', date: '2026-07-05' },
];

describe('filterByDateRange', () => {
  it('returns all transactions when no bounds are given', () => {
    expect(filterByDateRange(sample, null, null)).toHaveLength(5);
  });

  it('filters by start date', () => {
    const result = filterByDateRange(sample, '2026-07-01', null);
    expect(result).toHaveLength(2);
  });

  it('filters by end date', () => {
    const result = filterByDateRange(sample, null, '2026-06-02');
    expect(result).toHaveLength(2);
  });

  it('filters by both bounds', () => {
    const result = filterByDateRange(sample, '2026-06-02', '2026-06-30');
    expect(result).toHaveLength(2);
  });

  it('is inclusive of the boundary dates', () => {
    const result = filterByDateRange(sample, '2026-06-01', '2026-06-01');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('calculateTotals', () => {
  it('sums income and expense separately and computes balance', () => {
    const totals = calculateTotals(sample);
    expect(totals.income).toBe(3500);
    expect(totals.expense).toBe(1000);
    expect(totals.balance).toBe(2500);
  });

  it('returns zeros for an empty list', () => {
    expect(calculateTotals([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it('handles a negative balance (spending more than earning)', () => {
    const overspent: Transaction[] = [
      { id: '1', type: 'income', amount: 100, category: 'Salary', description: '', date: '2026-01-01' },
      { id: '2', type: 'expense', amount: 300, category: 'Shopping', description: '', date: '2026-01-02' },
    ];
    expect(calculateTotals(overspent).balance).toBe(-200);
  });
});

describe('groupByCategory', () => {
  it('sums expense amounts per category, sorted descending', () => {
    const result = groupByCategory(sample, 'expense');
    expect(result).toEqual([
      { category: 'Food', total: 200 },
      { category: 'Housing', total: 800 },
    ].sort((a, b) => b.total - a.total));
  });

  it('only includes the requested transaction type', () => {
    const result = groupByCategory(sample, 'income');
    expect(result.find((c) => c.category === 'Housing')).toBeUndefined();
  });

  it('returns an empty array when there are no matching transactions', () => {
    expect(groupByCategory([], 'expense')).toEqual([]);
  });
});

describe('monthlyTrend', () => {
  it('groups totals by month, sorted chronologically', () => {
    const result = monthlyTrend(sample);
    expect(result).toEqual([
      { month: '2026-06', income: 3000, expense: 950 },
      { month: '2026-07', income: 500, expense: 50 },
    ]);
  });

  it('returns an empty array for no transactions', () => {
    expect(monthlyTrend([])).toEqual([]);
  });
});

describe('formatCurrency', () => {
  it('formats a positive amount with a dollar sign and two decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats a negative amount with a leading minus sign', () => {
    expect(formatCurrency(-42)).toBe('-$42.00');
  });

  it('formats zero without a sign', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
