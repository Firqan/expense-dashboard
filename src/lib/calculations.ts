import type { Transaction, Totals, CategoryTotal, MonthlyTotal } from './types';
import { CURRENCIES, DEFAULT_CURRENCY } from './types';

export function filterByDateRange(
  transactions: Transaction[],
  startDate: string | null,
  endDate: string | null
): Transaction[] {
  return transactions.filter((t) => {
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;
    return true;
  });
}

export function calculateTotals(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export function groupByCategory(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals.set(t.category, (totals.get(t.category) || 0) + t.amount);
  }
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export function monthlyTrend(transactions: Transaction[]): MonthlyTotal[] {
  const months = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    const month = t.date.slice(0, 7); // YYYY-MM
    const entry = months.get(month) || { income: 0, expense: 0 };
    if (t.type === 'income') entry.income += t.amount;
    else entry.expense += t.amount;
    months.set(month, entry);
  }
  return [...months.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const symbol = CURRENCIES[currencyCode]?.symbol ?? currencyCode;
  const sign = amount < 0 ? '-' : '';
  return `${sign}${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Converts a foreign-currency amount into the home currency using the given rate. */
export function convertToHomeCurrency(foreignAmount: number, exchangeRate: number): number {
  return Math.round(foreignAmount * exchangeRate * 100) / 100;
}
