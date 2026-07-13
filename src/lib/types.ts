export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always in the home currency
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  // Present only when the transaction was originally made in a different currency.
  foreignCurrency?: string;
  foreignAmount?: number;
  exchangeRate?: number; // 1 unit of foreignCurrency = exchangeRate units of home currency
}

export const CURRENCIES: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  TRY: { symbol: '₺', name: 'Turkish Lira' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
};

export const DEFAULT_CURRENCY = 'USD';

export interface RecurringItem {
  id: string;
  type: TransactionType;
  amount: number; // in the home currency
  category: string;
  description: string;
  dayOfMonth: number; // 1-31; clamped to the last day of shorter months
  startDate: string; // YYYY-MM-DD — the item has no occurrences before this date
  endDate?: string; // YYYY-MM-DD — the item has no occurrences after this date (inclusive)
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Other',
] as const;

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'] as const;

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlyTotal {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}
