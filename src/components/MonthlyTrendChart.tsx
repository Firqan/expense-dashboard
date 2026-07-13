import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { MonthlyTotal } from '../lib/types';
import { formatCurrency } from '../lib/calculations';

export function MonthlyTrendChart({ data }: { data: MonthlyTotal[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-semibold text-ink">Monthly trend</p>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-ink-muted">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DD" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E3DD' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={{ stroke: '#E5E3DD' }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }} />
            <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
