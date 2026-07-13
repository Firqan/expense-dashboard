import { useState } from 'react';
import type { Transaction } from '../lib/types';
import { formatCurrency } from '../lib/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  homeCurrency: string;
  editingId: string | null;
}

function TransactionRow({
  t,
  onDelete,
  onEdit,
  homeCurrency,
  isEditing,
}: {
  t: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  homeCurrency: string;
  isEditing: boolean;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li
      className={`group flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
        isEditing ? 'bg-ink/[0.03]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{t.description || t.category}</p>
        <p className="text-xs text-ink-muted">
          {t.category} &middot; {t.date}
          {t.foreignCurrency && t.foreignAmount && (
            <span className="font-numeric">
              {' '}
              &middot; {formatCurrency(t.foreignAmount, t.foreignCurrency)} &times; {t.exchangeRate}
            </span>
          )}
        </p>
      </div>
      <span
        className={`font-numeric shrink-0 text-sm font-semibold ${
          t.type === 'income' ? 'text-income' : 'text-expense'
        }`}
      >
        {t.type === 'income' ? '+' : '-'}
        {formatCurrency(t.amount, homeCurrency)}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={() => onDelete(t.id)}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-expense hover:underline"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-muted hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(t)}
              aria-label={`Edit transaction: ${t.description || t.category}`}
              className="rounded p-1 text-ink-muted hover:text-ink"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete transaction: ${t.description || t.category}`}
              className="rounded p-1 text-ink-muted hover:text-expense"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function TransactionList({
  transactions,
  onDelete,
  onEdit,
  homeCurrency,
  editingId,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-ink-muted">
        No transactions yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <ul>
        {transactions.map((t) => (
          <TransactionRow
            key={t.id}
            t={t}
            onDelete={onDelete}
            onEdit={onEdit}
            homeCurrency={homeCurrency}
            isEditing={editingId === t.id}
          />
        ))}
      </ul>
    </div>
  );
}
