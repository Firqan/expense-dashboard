import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from '../lib/types';
import type { TransactionType, Transaction } from '../lib/types';
import type { TransactionInput } from '../lib/useTransactionsStore';
import { todayKey } from '../lib/date';
import { convertToHomeCurrency, formatCurrency } from '../lib/calculations';

interface TransactionFormProps {
  onAdd: (input: TransactionInput) => void;
  onUpdate: (id: string, input: TransactionInput) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  homeCurrency: string;
}

const CURRENCY_CODES = Object.keys(CURRENCIES);

export function TransactionForm({
  onAdd,
  onUpdate,
  editingTransaction,
  onCancelEdit,
  homeCurrency,
}: TransactionFormProps) {
  const isEditing = editingTransaction !== null;

  const [type, setType] = useState<TransactionType | null>(editingTransaction?.type ?? null);
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '');
  const [category, setCategory] = useState<string>(editingTransaction?.category ?? '');
  const [description, setDescription] = useState(editingTransaction?.description ?? '');
  const [date, setDate] = useState(editingTransaction?.date ?? todayKey());
  const [useForeignCurrency, setUseForeignCurrency] = useState(
    Boolean(editingTransaction?.foreignCurrency)
  );
  const [foreignCurrency, setForeignCurrency] = useState(
    editingTransaction?.foreignCurrency ?? CURRENCY_CODES.find((c) => c !== homeCurrency) ?? 'EUR'
  );
  const [foreignAmount, setForeignAmount] = useState(
    editingTransaction?.foreignAmount ? String(editingTransaction.foreignAmount) : ''
  );
  const [exchangeRate, setExchangeRate] = useState(
    editingTransaction?.exchangeRate ? String(editingTransaction.exchangeRate) : ''
  );
  const [showTypeWarning, setShowTypeWarning] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const today = todayKey();

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setShowTypeWarning(false);
    if (!category) {
      setCategory(next === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    }
  }

  const parsedForeignAmount = Number(foreignAmount);
  const parsedRate = Number(exchangeRate);
  const computedAmount =
    useForeignCurrency && parsedForeignAmount > 0 && parsedRate > 0
      ? convertToHomeCurrency(parsedForeignAmount, parsedRate)
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!type) {
      setShowTypeWarning(true);
      return;
    }

    if (date > today) {
      setShowDateWarning(true);
      return;
    }

    let finalAmount: number;
    let extra: Partial<TransactionInput> = {};

    if (useForeignCurrency) {
      if (!parsedForeignAmount || parsedForeignAmount <= 0 || !parsedRate || parsedRate <= 0) return;
      finalAmount = convertToHomeCurrency(parsedForeignAmount, parsedRate);
      extra = { foreignCurrency, foreignAmount: parsedForeignAmount, exchangeRate: parsedRate };
    } else {
      finalAmount = Number(amount);
      if (!finalAmount || finalAmount <= 0) return;
    }

    const input: TransactionInput = {
      type,
      amount: finalAmount,
      category,
      description: description.trim(),
      date,
      ...extra,
    };

    if (isEditing && editingTransaction) {
      onUpdate(editingTransaction.id, input);
    } else {
      onAdd(input);
      setAmount('');
      setDescription('');
      setForeignAmount('');
      setExchangeRate('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === 'expense'
              ? 'bg-expense text-white'
              : 'bg-surface text-ink-muted border border-border hover:border-expense/40'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            type === 'income'
              ? 'bg-income text-white'
              : 'bg-surface text-ink-muted border border-border hover:border-income/40'
          }`}
        >
          Income
        </button>
      </div>
      {showTypeWarning && (
        <p className="mt-1.5 text-xs font-medium text-expense">
          Please select Expense or Income before continuing.
        </p>
      )}

      <label className="mt-4 flex items-center gap-2 text-xs font-medium text-ink-muted">
        <input
          type="checkbox"
          checked={useForeignCurrency}
          onChange={(e) => setUseForeignCurrency(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-border"
        />
        This was in a different currency
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {useForeignCurrency ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="foreign-currency">
                Currency
              </label>
              <select
                id="foreign-currency"
                value={foreignCurrency}
                onChange={(e) => setForeignCurrency(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} ({CURRENCIES[code].symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="foreign-amount">
                Amount ({foreignCurrency})
              </label>
              <input
                id="foreign-amount"
                type="number"
                step="0.01"
                min="0"
                value={foreignAmount}
                onChange={(e) => setForeignAmount(e.target.value)}
                placeholder="0.00"
                className="font-numeric w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="exchange-rate">
                Exchange rate (1 {foreignCurrency} = ? {homeCurrency})
              </label>
              <input
                id="exchange-rate"
                type="number"
                step="0.0001"
                min="0"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="e.g. 1.08"
                className="font-numeric w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
              />
              {computedAmount !== null && (
                <p className="font-numeric mt-1 text-xs text-ink-muted">
                  = {formatCurrency(computedAmount, homeCurrency)}
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="amount">
              Amount ({homeCurrency})
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
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            max={today}
            onChange={(e) => {
              setDate(e.target.value);
              setShowDateWarning(false);
            }}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
          {showDateWarning && (
            <p className="mt-1 text-xs font-medium text-expense">Date can't be in the future.</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!type}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!type && <option value="">Select Expense or Income first</option>}
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

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {isEditing ? 'Save changes' : 'Add transaction'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
