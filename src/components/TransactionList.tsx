import type { Transaction } from '../lib/types';
import { formatCurrency } from '../lib/calculations';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
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
          <li
            key={t.id}
            className="group flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {t.description || t.category}
              </p>
              <p className="text-xs text-ink-muted">
                {t.category} &middot; {t.date}
              </p>
            </div>
            <span
              className={`font-numeric shrink-0 text-sm font-semibold ${
                t.type === 'income' ? 'text-income' : 'text-expense'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}
              {formatCurrency(t.amount)}
            </span>
            <button
              type="button"
              onClick={() => onDelete(t.id)}
              aria-label={`Delete transaction: ${t.description || t.category}`}
              className="shrink-0 rounded p-1 text-ink-muted opacity-0 transition-opacity hover:text-expense group-hover:opacity-100"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
