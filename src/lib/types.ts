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
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  PLN: { symbol: 'zł', name: 'Polish Złoty' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint' },
  RON: { symbol: 'lei', name: 'Romanian Leu' },
  UAH: { symbol: '₴', name: 'Ukrainian Hryvnia' },
  RUB: { symbol: '₽', name: 'Russian Ruble' },
  ILS: { symbol: '₪', name: 'Israeli Shekel' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal' },
  QAR: { symbol: 'QAR', name: 'Qatari Riyal' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound' },
  IQD: { symbol: 'IQD', name: 'Iraqi Dinar' },
  IRR: { symbol: '﷼', name: 'Iranian Rial' },
  JOD: { symbol: 'JOD', name: 'Jordanian Dinar' },
  KWD: { symbol: 'KWD', name: 'Kuwaiti Dinar' },
  LBP: { symbol: 'LBP', name: 'Lebanese Pound' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka' },
  AFN: { symbol: '؋', name: 'Afghan Afghani' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
  MAD: { symbol: 'MAD', name: 'Moroccan Dirham' },
  DZD: { symbol: 'DZD', name: 'Algerian Dinar' },
  TND: { symbol: 'TND', name: 'Tunisian Dinar' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso' },
  ARS: { symbol: 'AR$', name: 'Argentine Peso' },
  CLP: { symbol: 'CL$', name: 'Chilean Peso' },
  COP: { symbol: 'CO$', name: 'Colombian Peso' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar' },
  THB: { symbol: '฿', name: 'Thai Baht' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  VND: { symbol: '₫', name: 'Vietnamese Dong' },
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
