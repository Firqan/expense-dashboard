import type { Transaction, TransactionType } from './types';

const COLUMNS = [
  'date',
  'type',
  'category',
  'amount',
  'description',
  'foreignCurrency',
  'foreignAmount',
  'exchangeRate',
] as const;

/** Quotes a CSV field only when it actually needs it (contains a comma, quote, or newline). */
function csvField(value: string | number | undefined): string {
  if (value === undefined || value === '') return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Splits a single CSV line into fields, respecting quoted sections. */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  // The "sep=" directive tells Excel explicitly which delimiter to use.
  // Without it, Excel in many non-US regional settings (including Turkish)
  // expects semicolons and will otherwise dump every row into one column.
  const sepDirective = 'sep=,';
  const header = COLUMNS.join(',');
  const rows = transactions.map((t) =>
    [
      csvField(t.date),
      csvField(t.type),
      csvField(t.category),
      csvField(t.amount),
      csvField(t.description),
      csvField(t.foreignCurrency),
      csvField(t.foreignAmount),
      csvField(t.exchangeRate),
    ].join(',')
  );
  return [sepDirective, header, ...rows].join('\n');
}

export class CsvParseError extends Error {}

const REQUIRED_COLUMNS = ['date', 'type', 'category', 'amount', 'description'];

/**
 * Parses CSV text back into transactions. Tolerant of the optional Excel
 * "sep=" directive line, and looks columns up by name (not fixed position),
 * so it stays backward-compatible with exports that predate the foreign
 * currency columns.
 */
export function csvToTransactions(csv: string, makeId: () => string): Transaction[] {
  const allLines = csv.trim().split('\n').filter((l) => l.trim().length > 0);
  if (allLines.length === 0) return [];

  const lines = allLines[0].trim().toLowerCase().startsWith('sep=') ? allLines.slice(1) : allLines;
  if (lines.length === 0) return [];

  const [headerLine, ...rows] = lines;
  const header = parseCsvLine(headerLine).map((h) => h.trim());

  for (const col of REQUIRED_COLUMNS) {
    if (!header.includes(col)) {
      throw new CsvParseError(`Missing required column: "${col}"`);
    }
  }

  return rows.map((row) => {
    const fields = parseCsvLine(row);
    const record: Record<string, string> = {};
    header.forEach((col, i) => {
      record[col] = (fields[i] ?? '').trim();
    });

    const amount = Number(record.amount);
    if (Number.isNaN(amount)) {
      throw new CsvParseError(`Invalid amount in row: "${row}"`);
    }
    if (record.type !== 'income' && record.type !== 'expense') {
      throw new CsvParseError(`Invalid transaction type in row: "${row}"`);
    }

    const transaction: Transaction = {
      id: makeId(),
      date: record.date,
      type: record.type as TransactionType,
      category: record.category,
      amount,
      description: record.description.replace(/""/g, '"'),
    };

    if (record.foreignCurrency) {
      const foreignAmount = Number(record.foreignAmount);
      const exchangeRate = Number(record.exchangeRate);
      if (!Number.isNaN(foreignAmount) && foreignAmount > 0) transaction.foreignAmount = foreignAmount;
      if (!Number.isNaN(exchangeRate) && exchangeRate > 0) transaction.exchangeRate = exchangeRate;
      transaction.foreignCurrency = record.foreignCurrency;
    }

    return transaction;
  });
}

export function downloadCsv(csv: string, filename: string) {
  // Prepending a UTF-8 BOM is what makes Excel render accented characters,
  // currency symbols, and non-Latin scripts correctly instead of as mojibake.
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
