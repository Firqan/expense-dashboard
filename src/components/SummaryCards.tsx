import type { Totals } from '../lib/types';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';

export function SummaryCards({ totals, currency }: { totals: Totals; currency: string }) {
  const { t } = useTranslation();

  const cards = [
    { label: t('income'), value: totals.income, color: 'text-income' },
    { label: t('expenses'), value: totals.expense, color: 'text-expense' },
    {
      label: t('balance'),
      value: totals.balance,
      color: totals.balance >= 0 ? 'text-income' : 'text-expense',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{card.label}</p>
          <p className={`font-numeric mt-1 text-2xl font-bold ${card.color}`}>
            {formatCurrency(card.value, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}
