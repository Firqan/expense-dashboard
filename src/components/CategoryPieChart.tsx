import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryTotal } from '../lib/types';
import { colorForIndex } from '../lib/chartColors';
import { formatCurrency } from '../lib/calculations';
import { useTranslation } from '../lib/i18n';
import { categoryLabel } from '../lib/categoryLabels';
import { useIsMobile } from '../lib/useIsMobile';

interface CategoryPieChartProps {
  data: CategoryTotal[];
  title: string;
  currency: string;
}

export function CategoryPieChart({ data, title, currency }: CategoryPieChartProps) {
  const { t, dir } = useTranslation();
  const isMobile = useIsMobile();
  const displayData = data.map((d) => ({ ...d, label: categoryLabel(d.category, t) }));

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          {t('noDataForPeriod')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={isMobile ? 320 : 260}>
          <PieChart>
            <Pie
              data={displayData}
              dataKey="total"
              nameKey="label"
              cx="50%"
              cy={isMobile ? '40%' : '50%'}
              innerRadius={isMobile ? 45 : 55}
              outerRadius={isMobile ? 75 : 90}
              paddingAngle={2}
            >
              {displayData.map((entry, index) => (
                <Cell key={entry.category} fill={colorForIndex(index)} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency)}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-ink)',
                fontSize: 13,
              }}
              itemStyle={{ color: 'var(--color-ink)' }}
              labelStyle={{ color: 'var(--color-ink)' }}
            />
            {isMobile ? (
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: 'var(--color-ink-muted)' }}
              />
            ) : (
              <Legend
                layout="vertical"
                align={dir === 'rtl' ? 'left' : 'right'}
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: 'var(--color-ink-muted)' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
