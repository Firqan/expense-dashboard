import { describe, it, expect } from 'vitest';
import { transactionsToCsv, csvToTransactions, CsvParseError } from './csv';
import type { Transaction } from './types';

const sample: Transaction[] = [
  { id: '1', type: 'income', amount: 3000, category: 'Salary', description: 'Paycheck', date: '2026-06-01' },
  { id: '2', type: 'expense', amount: 42.5, category: 'Food', description: 'Lunch, with "quotes"', date: '2026-06-02' },
];

describe('transactionsToCsv', () => {
  it('produces a header row followed by one row per transaction', () => {
    const csv = transactionsToCsv(sample);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('date,type,category,amount,description');
    expect(lines).toHaveLength(3);
  });

  it('escapes double quotes in the description', () => {
    const csv = transactionsToCsv(sample);
    expect(csv).toContain('"Lunch, with ""quotes"""');
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

  it('assigns a fresh id to each parsed row', () => {
    const csv = transactionsToCsv(sample);
    const parsed = csvToTransactions(csv, makeId);
    expect(parsed[0].id).not.toBe('1');
    expect(new Set(parsed.map((t) => t.id)).size).toBe(2);
  });

  it('throws CsvParseError on an unexpected header', () => {
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
