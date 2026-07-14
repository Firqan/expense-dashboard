import type { Transaction } from './types';
import type { PeriodSummary } from './periods';

function formatDateRange(start: string, end: string): string {
  return `${start} → ${end}`;
}

/**
 * The xlsx library is fairly large and only needed when someone actually
 * clicks "Export Excel," so it's dynamically imported here instead of being
 * part of the app's initial bundle.
 */
export async function exportToExcel(
  transactions: Transaction[],
  periods: PeriodSummary[],
  homeCurrency: string,
  filename: string
) {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();

  // --- Sheet 1: Statement history (most useful summary, so it goes first) ---
  const statementRows = periods.map((p) => ({
    Period: formatDateRange(p.startDate, p.endDate),
    'Opening balance': p.openingBalance,
    Income: p.income,
    Expense: p.expense,
    Net: p.net,
    'Closing balance': p.closingBalance,
    Transactions: p.transactionCount,
  }));
  const statementSheet = XLSX.utils.json_to_sheet(statementRows);
  statementSheet['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 13 },
  ];
  XLSX.utils.book_append_sheet(workbook, statementSheet, 'Statement History');

  // --- Sheet 2: Every transaction, newest first ---
  const sortedTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const transactionRows = sortedTransactions.map((t) => ({
    Date: t.date,
    Type: t.type === 'income' ? 'Income' : 'Expense',
    Category: t.category,
    Description: t.description,
    [`Amount (${homeCurrency})`]: t.type === 'income' ? t.amount : -t.amount,
    'Foreign currency': t.foreignCurrency ?? '',
    'Foreign amount': t.foreignAmount ?? '',
    'Exchange rate': t.exchangeRate ?? '',
  }));
  const transactionSheet = XLSX.utils.json_to_sheet(transactionRows);
  transactionSheet['!cols'] = [
    { wch: 12 },
    { wch: 9 },
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');

  XLSX.writeFile(workbook, filename);
}
