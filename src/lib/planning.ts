import type { RecurringItem } from './types';
import { addDays, daysInMonth } from './date';

export interface Occurrence {
  date: string;
  item: RecurringItem;
}

/**
 * Resolves a recurring item's occurrence date for a given year/month,
 * clamping the day-of-month to the last real day of shorter months
 * (e.g. dayOfMonth 31 in February becomes Feb 28th, or 29th in a leap year).
 */
function occurrenceDateInMonth(item: RecurringItem, year: number, month: number): string {
  const day = Math.min(item.dayOfMonth, daysInMonth(year, month));
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Finds every occurrence of every recurring item that falls within
 * [fromDate, fromDate + daysAhead], respecting each item's startDate/endDate.
 * Results are sorted chronologically.
 */
export function getUpcomingOccurrences(
  items: RecurringItem[],
  fromDate: string,
  daysAhead: number
): Occurrence[] {
  const toDate = addDays(fromDate, daysAhead);
  const occurrences: Occurrence[] = [];

  for (const item of items) {
    const [fy, fm] = fromDate.split('-').map(Number);
    // Scan this month and the next couple of months — enough to cover any
    // realistic daysAhead window (up to ~90 days) without scanning forever.
    for (let offset = 0; offset <= Math.ceil(daysAhead / 28) + 1; offset++) {
      const totalMonth = fm - 1 + offset; // 0-indexed month arithmetic
      const year = fy + Math.floor(totalMonth / 12);
      const month = (totalMonth % 12) + 1;
      const date = occurrenceDateInMonth(item, year, month);

      if (date < fromDate || date > toDate) continue;
      if (date < item.startDate) continue;
      if (item.endDate && date > item.endDate) continue;

      occurrences.push({ date, item });
    }
  }

  return occurrences.sort((a, b) => a.date.localeCompare(b.date));
}

/** Projects the balance forward by summing every occurrence's signed amount. */
export function projectedBalance(currentBalance: number, occurrences: Occurrence[]): number {
  return occurrences.reduce((balance, occ) => {
    return occ.item.type === 'income' ? balance + occ.item.amount : balance - occ.item.amount;
  }, currentBalance);
}
