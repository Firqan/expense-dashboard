import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryTotal } from '../lib/types';
import { colorForIndex } from '../lib/chartColors';
import { formatCurrency } from '../lib/calculations';

interface CategoryPieChartProps {
  data: CategoryTotal[];
  title: string;
}

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={colorForIndex(index)} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
