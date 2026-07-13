import type { Transaction } from './types';

export function transactionsToCsv(transactions: Transaction[]): string {
  const header = 'date,type,category,amount,description';
  const rows = transactions.map((t) =>
    [t.date, t.type, t.category, t.amount, `"${t.description.replace(/"/g, '""')}"`].join(',')
  );
  return [header, ...rows].join('\n');
}

export class CsvParseError extends Error {}

/**
 * Parses CSV text back into transactions. Expects the same column order
 * produced by transactionsToCsv: date,type,category,amount,description
 */
export function csvToTransactions(csv: string, makeId: () => string): Transaction[] {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  const [header, ...rows] = lines;
  const expectedHeader = 'date,type,category,amount,description';
  if (header.trim() !== expectedHeader) {
    throw new CsvParseError(`Unexpected CSV header. Expected: "${expectedHeader}"`);
  }

  return rows
    .filter((row) => row.trim().length > 0)
    .map((row) => {
      const match = row.match(/^([^,]*),([^,]*),([^,]*),([^,]*),"((?:[^"]|"")*)"$/);
      if (!match) {
        throw new CsvParseError(`Malformed CSV row: "${row}"`);
      }
      const [, date, type, category, amountStr, description] = match;
      const amount = Number(amountStr);
      if (Number.isNaN(amount)) {
        throw new CsvParseError(`Invalid amount in row: "${row}"`);
      }
      if (type !== 'income' && type !== 'expense') {
        throw new CsvParseError(`Invalid transaction type in row: "${row}"`);
      }
      return {
        id: makeId(),
        date,
        type,
        category,
        amount,
        description: description.replace(/""/g, '"'),
      };
    });
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
