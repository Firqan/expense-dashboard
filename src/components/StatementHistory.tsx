import type { PeriodSummary } from '../lib/periods';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';

interface StatementHistoryProps {
  periods: PeriodSummary[];
  currency: string;
}

const MAX_VISIBLE_PERIODS = 6;

export function StatementHistory({ periods, currency }: StatementHistoryProps) {
  const { t } = useTranslation();
  const visible = periods.slice(0, MAX_VISIBLE_PERIODS);

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-ink-muted">
        {t('noStatementsYet')}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((period) => (
        <div key={period.startDate} className="rounded-xl border border-border bg-surface p-4">
          <p className="font-numeric text-xs text-ink-muted">
            {period.startDate} → {period.endDate}
          </p>

          <p className={`font-numeric mt-2 text-xl font-bold ${period.closingBalance >= 0 ? 'text-ink' : 'text-expense'}`}>
            {formatCurrency(period.closingBalance, currency)}
          </p>
          <p className="text-xs text-ink-muted">{t('closingBalance')}</p>

          <div className="mt-3 space-y-1 border-t border-dashed border-border pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">{t('openingBalance')}</span>
              <span className="font-numeric text-ink">{formatCurrency(period.openingBalance, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-income">{t('income')}</span>
              <span className="font-numeric text-income">+{formatCurrency(period.income, currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-expense">{t('expenses')}</span>
              <span className="font-numeric text-expense">-{formatCurrency(period.expense, currency)}</span>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-ink-muted">{t('transactionsCount', { count: period.transactionCount })}</p>
        </div>
      ))}
    </div>
  );
}
