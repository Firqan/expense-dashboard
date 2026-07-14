import { useState } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/types';
import type { TransactionType } from '../lib/types';
import type { RecurringItemInput } from '../lib/useRecurringStore';
import { todayKey } from '../lib/date';
import { useTranslation } from '../lib/i18n';
import { categoryLabel } from '../lib/categoryLabels';

interface RecurringItemFormProps {
  onAdd: (input: RecurringItemInput) => void;
}

export function RecurringItemForm({ onAdd }: RecurringItemFormProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [startDate, setStartDate] = useState(todayKey());
  const [showTypeWarning, setShowTypeWarning] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setShowTypeWarning(false);
    if (!category) setCategory(next === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function reset() {
    setType(null);
    setAmount('');
    setCategory('');
    setDescription('');
    setDayOfMonth('1');
    setStartDate(todayKey());
    setIsOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) {
      setShowTypeWarning(true);
      return;
    }
    const parsedAmount = Number(amount);
    const parsedDay = Number(dayOfMonth);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!parsedDay || parsedDay < 1 || parsedDay > 31) return;

    onAdd({
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      dayOfMonth: parsedDay,
      startDate,
    });
    reset();
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-xl border border-dashed border-border bg-surface py-4 text-sm font-medium text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
      >
        {t('addRecurringPrompt')}
      </button>
    );
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
          {t('billExpense')}
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
          {t('income')}
        </button>
      </div>
      {showTypeWarning && (
        <p className="mt-1.5 text-xs font-medium text-expense">{t('selectTypeWarning')}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="recurring-description">
            {t('name')}
          </label>
          <input
            id="recurring-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Rent, Salary, Netflix"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="recurring-amount">
            {t('amount')}
          </label>
          <input
            id="recurring-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="font-numeric w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="recurring-day">
            {t('dayOfMonth')}
          </label>
          <input
            id="recurring-day"
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="font-numeric w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="recurring-category">
            {t('category')}
          </label>
          <select
            id="recurring-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!type}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!type && <option value="">{t('selectTypeFirst')}</option>}
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabel(c, t)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="recurring-start">
            {t('startingFrom')}
          </label>
          <input
            id="recurring-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/40"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:text-bg"
        >
          {t('addRecurringItem')}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
