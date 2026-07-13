import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { MonthlyTotal } from '../lib/types';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';

export function MonthlyTrendChart({ data, currency }: { data: MonthlyTotal[]; currency: string }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold text-ink">{t('monthlyTrend')}</p>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          {t('noDataForPeriod')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              // Fixing the vertical position means the tooltip no longer chases
              // the cursor up and down — only the hovered month (x) changes it.
              position={{ y: 10 }}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-ink)',
                fontSize: 13,
              }}
              itemStyle={{ color: 'var(--color-ink)' }}
              labelStyle={{ color: 'var(--color-ink)' }}
              cursor={{ fill: 'var(--color-border)', opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: 'var(--color-ink-muted)' }} />
            <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} name={t('income')} />
            <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} name={t('expense')} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
