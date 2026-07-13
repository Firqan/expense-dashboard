import type { RecurringItem } from '../lib/types';
import type { Occurrence } from '../lib/planning';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';
import { categoryLabel } from '../lib/categoryLabels';

interface UpcomingListProps {
  occurrences: Occurrence[];
  allItems: RecurringItem[];
  onDelete: (id: string) => void;
  currency: string;
}

export function UpcomingList({ occurrences, allItems, onDelete, currency }: UpcomingListProps) {
  const { t } = useTranslation();

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t('upcoming', { count: occurrences.length })}
        </p>
      </div>
      {occurrences.length === 0 ? (
        <p className="px-4 py-4 text-sm text-ink-muted">{t('nothingScheduled')}</p>
      ) : (
        <ul>
          {occurrences.map((occ, i) => (
            <li
              key={`${occ.item.id}-${occ.date}`}
              className={`flex items-center justify-between gap-3 px-4 py-2.5 ${
                i < occurrences.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {occ.item.description || categoryLabel(occ.item.category, t)}
                </p>
                <p className="text-xs text-ink-muted">{occ.date}</p>
              </div>
              <span
                className={`font-numeric text-sm font-semibold ${
                  occ.item.type === 'income' ? 'text-income' : 'text-expense'
                }`}
              >
                {occ.item.type === 'income' ? '+' : '-'}
                {formatCurrency(occ.item.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border px-4 py-2.5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {t('allRecurringItems')}
        </p>
        <ul className="space-y-1">
          {allItems.map((item) => (
            <li key={item.id} className="group flex items-center justify-between gap-2 text-xs">
              <span className="text-ink-muted">
                {item.description || categoryLabel(item.category, t)} &middot; {t('dayOfMonth').toLowerCase()} {item.dayOfMonth}
              </span>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Remove recurring item: ${item.description || item.category}`}
                className="rounded px-1 text-ink-muted opacity-0 transition-opacity hover:text-expense group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
