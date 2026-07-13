import { describe, it, expect } from 'vitest';
import { transactionsToCsv, csvToTransactions, CsvParseError } from './csv';
import type { Transaction } from './types';

const sample: Transaction[] = [
  { id: '1', type: 'income', amount: 3000, category: 'Salary', description: 'Paycheck', date: '2026-06-01' },
  {
    id: '2',
    type: 'expense',
    amount: 42.5,
    category: 'Food',
    description: 'Lunch, with "quotes"',
    date: '2026-06-02',
  },
];

const foreignCurrencySample: Transaction[] = [
  {
    id: '3',
    type: 'expense',
    amount: 54,
    category: 'Food',
    description: 'Dinner abroad',
    date: '2026-06-03',
    foreignCurrency: 'EUR',
    foreignAmount: 50,
    exchangeRate: 1.08,
  },
];

describe('transactionsToCsv', () => {
  it('starts with an Excel "sep=" directive so regional settings do not break the delimiter', () => {
    const csv = transactionsToCsv(sample);
    expect(csv.split('\n')[0]).toBe('sep=,');
  });

  it('produces a header row with all eight columns, followed by one row per transaction', () => {
    const csv = transactionsToCsv(sample);
    const lines = csv.split('\n');
    expect(lines[1]).toBe('date,type,category,amount,description,foreignCurrency,foreignAmount,exchangeRate');
    expect(lines).toHaveLength(4); // sep line + header + 2 rows
  });

  it('escapes double quotes in the description', () => {
    const csv = transactionsToCsv(sample);
    expect(csv).toContain('"Lunch, with ""quotes"""');
  });

  it('leaves foreign-currency columns blank for domestic-currency transactions', () => {
    const csv = transactionsToCsv(sample);
    const row = csv.split('\n')[2];
    expect(row.endsWith(',,,')).toBe(true);
  });

  it('includes foreign-currency details when present', () => {
    const csv = transactionsToCsv(foreignCurrencySample);
    const row = csv.split('\n')[2];
    expect(row).toContain('EUR');
    expect(row).toContain('50');
    expect(row).toContain('1.08');
  });
});

describe('csvToTransactions', () => {
  let idCounter = 0;
  const makeId = () => `generated-${++idCounter}`;

  it('parses a round-tripped CSV back into equivalent transactions', () => {
    const csv = transactionsToCsv(sample);
    const parsed = csvToTransactions(csv, makeId);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].date).toBe('2026-06-01');
    expect(parsed[0].type).toBe('income');
    expect(parsed[0].amount).toBe(3000);
    expect(parsed[1].description).toBe('Lunch, with "quotes"');
  });

  it('round-trips foreign-currency details', () => {
    const csv = transactionsToCsv(foreignCurrencySample);
    const parsed = csvToTransactions(csv, makeId);

    expect(parsed[0].foreignCurrency).toBe('EUR');
    expect(parsed[0].foreignAmount).toBe(50);
    expect(parsed[0].exchangeRate).toBe(1.08);
  });

  it('leaves foreign-currency fields undefined for domestic transactions', () => {
    const csv = transactionsToCsv(sample);
    const parsed = csvToTransactions(csv, makeId);
    expect(parsed[0].foreignCurrency).toBeUndefined();
  });

  it('assigns a fresh id to each parsed row', () => {
    const csv = transactionsToCsv(sample);
    const parsed = csvToTransactions(csv, makeId);
    expect(parsed[0].id).not.toBe('1');
    expect(new Set(parsed.map((t) => t.id)).size).toBe(2);
  });

  it('still parses an older 5-column export without the foreign currency columns', () => {
    const legacyCsv = 'date,type,category,amount,description\n2026-01-01,expense,Food,10,"Snack"';
    const parsed = csvToTransactions(legacyCsv, makeId);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].amount).toBe(10);
    expect(parsed[0].foreignCurrency).toBeUndefined();
  });

  it('tolerates a CSV without the sep= directive line', () => {
    const csv = 'date,type,category,amount,description\n2026-01-01,income,Salary,100,""';
    expect(() => csvToTransactions(csv, makeId)).not.toThrow();
  });

  it('throws CsvParseError when a required column is missing', () => {
    expect(() => csvToTransactions('wrong,header\n1,2', makeId)).toThrow(CsvParseError);
  });

  it('throws CsvParseError on an invalid transaction type', () => {
    const bad = 'date,type,category,amount,description\n2026-01-01,bogus,Food,10,"test"';
    expect(() => csvToTransactions(bad, makeId)).toThrow(CsvParseError);
  });

  it('throws CsvParseError on a non-numeric amount', () => {
    const bad = 'date,type,category,amount,description\n2026-01-01,expense,Food,notanumber,"test"';
    expect(() => csvToTransactions(bad, makeId)).toThrow(CsvParseError);
  });

  it('returns an empty array for a header-only CSV', () => {
    expect(csvToTransactions('date,type,category,amount,description', makeId)).toEqual([]);
  });
});
