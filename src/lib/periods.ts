import type { Transaction } from './types';
import { addDays, daysInMonth } from './date';

export interface PeriodSummary {
  startDate: string; // YYYY-MM-DD, inclusive
  endDate: string; // YYYY-MM-DD, inclusive
  income: number;
  expense: number;
  net: number; // income - expense for this period alone
  openingBalance: number; // carried over from before this period started
  closingBalance: number; // openingBalance + net
  transactionCount: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Finds the start date of the period that `dateKey` falls into, given a
 * cycle that begins on `cycleStartDay` of each month (1 = calendar month).
 * Clamps to the last real day of shorter months, same as recurring items.
 */
export function periodStartForDate(dateKey: string, cycleStartDay: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const clampedThisMonth = Math.min(cycleStartDay, daysInMonth(y, m));

  if (d >= clampedThisMonth) {
    return `${y}-${pad(m)}-${pad(clampedThisMonth)}`;
  }

  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const clampedPrevMonth = Math.min(cycleStartDay, daysInMonth(prevYear, prevMonth));
  return `${prevYear}-${pad(prevMonth)}-${pad(clampedPrevMonth)}`;
}

/** Given a period's start date, returns its end date (the day before the next period starts). */
export function periodEndForStart(startDate: string, cycleStartDay: number): string {
  const [y, m] = startDate.split('-').map(Number);
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const clampedNextMonth = Math.min(cycleStartDay, daysInMonth(nextYear, nextMonth));
  const nextStart = `${nextYear}-${pad(nextMonth)}-${pad(clampedNextMonth)}`;
  return addDays(nextStart, -1);
}

/**
 * Groups every transaction into its statement period and returns one summary
 * per period that actually has data, sorted most-recent-first. Each period's
 * openingBalance is the running total of every transaction before that
 * period started — so periods chain together the way a real bank statement's
 * "previous balance" does, regardless of gaps between them.
 */
export function groupTransactionsByPeriod(
  transactions: Transaction[],
  cycleStartDay: number
): PeriodSummary[] {
  if (transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  const periodStarts = new Set<string>();
  for (const t of sorted) {
    periodStarts.add(periodStartForDate(t.date, cycleStartDay));
  }
  const sortedStarts = [...periodStarts].sort();

  let runningBalance = 0;
  const summaries: PeriodSummary[] = [];

  for (const startDate of sortedStarts) {
    const endDate = periodEndForStart(startDate, cycleStartDay);
    const openingBalance = runningBalance;

    let income = 0;
    let expense = 0;
    let transactionCount = 0;
    for (const t of sorted) {
      if (t.date < startDate || t.date > endDate) continue;
      transactionCount++;
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }

    const net = income - expense;
    runningBalance = openingBalance + net;

    summaries.push({
      startDate,
      endDate,
      income,
      expense,
      net,
      openingBalance,
      closingBalance: runningBalance,
      transactionCount,
    });
  }

  return summaries.reverse(); // most recent first
}
