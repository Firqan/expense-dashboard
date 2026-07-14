export type LanguageCode = 'ar' | 'de' | 'en' | 'fa' | 'fr' | 'ku' | 'tr';

export interface LanguageInfo {
  code: LanguageCode;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

// Sorted alphabetically by English language name (Arabic, English, French,
// German, Kurdish, Persian, Turkish) — a neutral, language-independent order.
export const LANGUAGES: LanguageInfo[] = [
  { code: 'ar', nativeName: 'العربية', dir: 'rtl' },
  { code: 'en', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'ku', nativeName: 'Kurdî', dir: 'ltr' },
  { code: 'fa', nativeName: 'فارسی', dir: 'rtl' },
  { code: 'tr', nativeName: 'Türkçe', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export type TranslationKey =
  | 'appName'
  | 'appTitle'
  | 'appSubtitle'
  | 'exportCsv'
  | 'importCsv'
  | 'currencyLabel'
  | 'languageLabel'
  | 'from'
  | 'to'
  | 'clear'
  | 'income'
  | 'expenses'
  | 'balance'
  | 'spendingByCategory'
  | 'incomeByCategory'
  | 'noDataForPeriod'
  | 'monthlyTrend'
  | 'expense'
  | 'selectTypeWarning'
  | 'differentCurrency'
  | 'amount'
  | 'amountIn'
  | 'exchangeRateLabel'
  | 'date'
  | 'dateFutureWarning'
  | 'category'
  | 'selectTypeFirst'
  | 'description'
  | 'descriptionOptional'
  | 'addTransaction'
  | 'saveChanges'
  | 'cancel'
  | 'catFood'
  | 'catTransport'
  | 'catHousing'
  | 'catUtilities'
  | 'catEntertainment'
  | 'catHealth'
  | 'catShopping'
  | 'catOther'
  | 'catSalary'
  | 'catFreelance'
  | 'catInvestment'
  | 'catGift'
  | 'noTransactionsYet'
  | 'edit'
  | 'confirm'
  | 'addRecurringPrompt'
  | 'billExpense'
  | 'name'
  | 'dayOfMonth'
  | 'startingFrom'
  | 'addRecurringItem'
  | 'upcoming'
  | 'nothingScheduled'
  | 'allRecurringItems'
  | 'projectedBalanceIn'
  | 'fromTodays'
  | 'planning'
  | 'recurringBillsIncome'
  | 'planningDescription'
  | 'footerNote'
  | 'csvReadError'
  | 'day'
  | 'night'
  | 'cycleStartDayLabel'
  | 'statementHistory'
  | 'statementHistoryDescription'
  | 'openingBalance'
  | 'closingBalance'
  | 'noStatementsYet'
  | 'transactionsCount'
  | 'exportExcel';
