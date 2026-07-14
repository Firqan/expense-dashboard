import { describe, it, expect } from 'vitest';
import { periodStartForDate, periodEndForStart, groupTransactionsByPeriod } from './periods';
import type { Transaction } from './types';

describe('periodStartForDate', () => {
  it('with cycleStartDay=1, behaves like a normal calendar month', () => {
    expect(periodStartForDate('2026-06-15', 1)).toBe('2026-06-01');
    expect(periodStartForDate('2026-06-01', 1)).toBe('2026-06-01');
  });

  it('with a mid-month cycle day, a date before it belongs to the previous period', () => {
    // Salary day = 5th. June 3rd hasn't reached this month's payday yet,
    // so it's still part of the period that started May 5th.
    expect(periodStartForDate('2026-06-03', 5)).toBe('2026-05-05');
  });

  it('with a mid-month cycle day, a date on/after it starts a new period', () => {
    expect(periodStartForDate('2026-06-05', 5)).toBe('2026-06-05');
    expect(periodStartForDate('2026-06-20', 5)).toBe('2026-06-05');
  });

  it('rolls over the year boundary correctly', () => {
    expect(periodStartForDate('2027-01-02', 5)).toBe('2026-12-05');
  });

  it('clamps a cycle day beyond a short month to that month\'s last day', () => {
    // cycleStartDay=31 in February (28 days, 2026 is not a leap year)
    expect(periodStartForDate('2026-02-15', 31)).toBe('2026-01-31');
    expect(periodStartForDate('2026-02-28', 31)).toBe('2026-02-28');
  });
});

describe('periodEndForStart', () => {
  it('ends the day before the next period starts, for a calendar month', () => {
    expect(periodEndForStart('2026-06-01', 1)).toBe('2026-06-30');
  });

  it('ends the day before the next cycle date, for a mid-month cycle', () => {
    expect(periodEndForStart('2026-06-05', 5)).toBe('2026-07-04');
  });

  it('handles a December → January rollover', () => {
    expect(periodEndForStart('2026-12-05', 5)).toBe('2027-01-04');
  });

  it('clamps correctly when the next month is shorter', () => {
    // Period starting Jan 31 should end the day before Feb's (clamped) 28th.
    expect(periodEndForStart('2026-01-31', 31)).toBe('2026-02-27');
  });
});

describe('groupTransactionsByPeriod', () => {
  const sample: Transaction[] = [
    { id: '1', type: 'income', amount: 3000, category: 'Salary', description: '', date: '2026-05-05' },
    { id: '2', type: 'expense', amount: 800, category: 'Housing', description: '', date: '2026-05-10' },
    { id: '3', type: 'income', amount: 3000, category: 'Salary', description: '', date: '2026-06-05' },
    { id: '4', type: 'expense', amount: 200, category: 'Food', description: '', date: '2026-06-15' },
  ];

  it('returns an empty array for no transactions', () => {
    expect(groupTransactionsByPeriod([], 1)).toEqual([]);
  });

  it('groups by calendar month when cycleStartDay is 1', () => {
    const result = groupTransactionsByPeriod(sample, 1);
    expect(result).toHaveLength(2);
    expect(result[0].startDate).toBe('2026-06-01'); // most recent first
    expect(result[1].startDate).toBe('2026-05-01');
  });

  it('groups by a salary-day cycle instead of the calendar month', () => {
    const result = groupTransactionsByPeriod(sample, 5);
    expect(result).toHaveLength(2);
    expect(result[0].startDate).toBe('2026-06-05');
    expect(result[1].startDate).toBe('2026-05-05');
  });

  it('computes income, expense, and net correctly per period', () => {
    const result = groupTransactionsByPeriod(sample, 5);
    const mayPeriod = result[1];
    expect(mayPeriod.income).toBe(3000);
    expect(mayPeriod.expense).toBe(800);
    expect(mayPeriod.net).toBe(2200);
  });

  it('carries the closing balance of one period into the next period\'s opening balance', () => {
    const result = groupTransactionsByPeriod(sample, 5);
    const [june, may] = result;

    expect(may.openingBalance).toBe(0);
    expect(may.closingBalance).toBe(2200);

    // June's opening balance should equal May's closing balance
    expect(june.openingBalance).toBe(may.closingBalance);
    expect(june.net).toBe(3000 - 200);
    expect(june.closingBalance).toBe(2200 + 2800);
  });

  it('counts transactions per period', () => {
    const result = groupTransactionsByPeriod(sample, 5);
    expect(result[1].transactionCount).toBe(2);
    expect(result[0].transactionCount).toBe(2);
  });

  it('produces a single period when all transactions fall in the same cycle', () => {
    const oneMonth: Transaction[] = [
      { id: '1', type: 'income', amount: 100, category: 'Salary', description: '', date: '2026-06-06' },
      { id: '2', type: 'expense', amount: 30, category: 'Food', description: '', date: '2026-06-20' },
    ];
    const result = groupTransactionsByPeriod(oneMonth, 5);
    expect(result).toHaveLength(1);
    expect(result[0].closingBalance).toBe(70);
  });
});
