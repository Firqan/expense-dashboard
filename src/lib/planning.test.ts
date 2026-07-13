import { describe, it, expect } from 'vitest';
import { getUpcomingOccurrences, projectedBalance } from './planning';
import type { RecurringItem } from './types';

const rent: RecurringItem = {
  id: '1',
  type: 'expense',
  amount: 800,
  category: 'Housing',
  description: 'Rent',
  dayOfMonth: 5,
  startDate: '2026-01-01',
};

const salary: RecurringItem = {
  id: '2',
  type: 'income',
  amount: 3000,
  category: 'Salary',
  description: 'Paycheck',
  dayOfMonth: 1,
  startDate: '2026-01-01',
};

describe('getUpcomingOccurrences', () => {
  it('finds a single occurrence within a short window', () => {
    const result = getUpcomingOccurrences([rent], '2026-07-01', 10);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2026-07-05');
  });

  it('finds occurrences spanning a month boundary', () => {
    const result = getUpcomingOccurrences([rent], '2026-07-01', 40);
    expect(result.map((o) => o.date)).toEqual(['2026-07-05', '2026-08-05']);
  });

  it('excludes occurrences before the window start', () => {
    // Window starts after this month's rent date, should skip to next month
    const result = getUpcomingOccurrences([rent], '2026-07-10', 30);
    expect(result.map((o) => o.date)).toEqual(['2026-08-05']);
  });

  it('respects an item start date in the future', () => {
    const futureItem: RecurringItem = { ...rent, startDate: '2026-08-01' };
    const result = getUpcomingOccurrences([futureItem], '2026-07-01', 40);
    expect(result.map((o) => o.date)).toEqual(['2026-08-05']);
  });

  it('respects an item end date', () => {
    const endingItem: RecurringItem = { ...rent, endDate: '2026-07-05' };
    const result = getUpcomingOccurrences([endingItem], '2026-07-01', 40);
    expect(result.map((o) => o.date)).toEqual(['2026-07-05']);
  });

  it('clamps day 31 to the last real day of a shorter month', () => {
    const endOfMonthItem: RecurringItem = { ...rent, dayOfMonth: 31 };
    // February 2026 has 28 days (not a leap year)
    const result = getUpcomingOccurrences([endOfMonthItem], '2026-02-01', 28);
    expect(result.map((o) => o.date)).toEqual(['2026-02-28']);
  });

  it('clamps to Feb 29 in a leap year', () => {
    const endOfMonthItem: RecurringItem = { ...rent, dayOfMonth: 31 };
    const result = getUpcomingOccurrences([endOfMonthItem], '2028-02-01', 28);
    expect(result.map((o) => o.date)).toEqual(['2028-02-29']);
  });

  it('sorts occurrences from multiple items chronologically', () => {
    const result = getUpcomingOccurrences([rent, salary], '2026-07-01', 10);
    expect(result.map((o) => o.item.description)).toEqual(['Paycheck', 'Rent']);
  });

  it('returns an empty array when there are no items', () => {
    expect(getUpcomingOccurrences([], '2026-07-01', 30)).toEqual([]);
  });
});

describe('projectedBalance', () => {
  it('adds income and subtracts expenses from the current balance', () => {
    const occurrences = getUpcomingOccurrences([rent, salary], '2026-07-01', 10);
    // 1000 + 3000 (salary) - 800 (rent) = 3200
    expect(projectedBalance(1000, occurrences)).toBe(3200);
  });

  it('returns the current balance unchanged with no occurrences', () => {
    expect(projectedBalance(500, [])).toBe(500);
  });

  it('can project a negative balance', () => {
    const occurrences = getUpcomingOccurrences([rent], '2026-07-01', 10);
    expect(projectedBalance(200, occurrences)).toBe(-600);
  });
});
