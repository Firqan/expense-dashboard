import { useState } from 'react';
import type { Transaction } from '../lib/types';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';
import { categoryLabel } from '../lib/categoryLabels';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  homeCurrency: string;
  editingId: string | null;
}

function TransactionRow({
  tx,
  onDelete,
  onEdit,
  homeCurrency,
  isEditing,
}: {
  tx: Transaction;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  homeCurrency: string;
  isEditing: boolean;
}) {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const label = categoryLabel(tx.category, t);

  return (
    <li
      className={`group flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
        isEditing ? 'bg-ink/[0.03]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{tx.description || label}</p>
        <p className="text-xs text-ink-muted">
          {label} &middot; {tx.date}
          {tx.foreignCurrency && tx.foreignAmount && (
            <span className="font-numeric">
              {' '}
              &middot; {formatCurrency(tx.foreignAmount, tx.foreignCurrency)} &times; {tx.exchangeRate}
            </span>
          )}
        </p>
      </div>
      <span
        className={`font-numeric shrink-0 text-sm font-semibold ${
          tx.type === 'income' ? 'text-income' : 'text-expense'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}
        {formatCurrency(tx.amount, homeCurrency)}
      </span>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={() => onDelete(tx.id)}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-expense hover:underline"
            >
              {t('confirm')}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-muted hover:underline"
            >
              {t('cancel')}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(tx)}
              aria-label={`Edit transaction: ${tx.description || tx.category}`}
              className="rounded p-1 text-ink-muted hover:text-ink"
            >
              {t('edit')}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Delete transaction: ${tx.description || tx.category}`}
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
  const { t } = useTranslation();

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-ink-muted">
        {t('noTransactionsYet')}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <ul>
        {transactions.map((tx) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            onDelete={onDelete}
            onEdit={onEdit}
            homeCurrency={homeCurrency}
            isEditing={editingId === tx.id}
          />
        ))}
      </ul>
    </div>
  );
}
