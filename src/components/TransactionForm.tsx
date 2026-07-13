import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/types';
import type { TransactionType } from '../lib/types';
import { todayKey } from '../lib/date';

interface TransactionFormProps {
  onAdd: (input: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
  }) => void;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayKey());

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) return;

    onAdd({ type, amount: parsed, category, description: description.trim(), date });
    setAmount('');
    setDescription('');
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === 'expense' ? 'bg-expense text-white' : 'bg-expense-tint text-expense'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === 'income' ? 'bg-income text-white' : 'bg-income-tint text-income'
          }`}
        >
          Income
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="font-numeric w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="description">
            Description (optional)
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Grocery run"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Add transaction
      </button>
    </form>
  );
}
