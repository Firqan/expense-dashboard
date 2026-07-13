import { formatCurrency } from '../lib/calculations';

interface ProjectionCardProps {
  currentBalance: number;
  projected: number;
  daysAhead: number;
  currency: string;
}

export function ProjectionCard({ currentBalance, projected, daysAhead, currency }: ProjectionCardProps) {
  const change = projected - currentBalance;
  const isUp = change >= 0;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        Projected balance in {daysAhead} days
      </p>
      <p className={`font-numeric mt-1 text-2xl font-bold ${projected >= 0 ? 'text-ink' : 'text-expense'}`}>
        {formatCurrency(projected, currency)}
      </p>
      <p className={`font-numeric mt-1 text-xs ${isUp ? 'text-income' : 'text-expense'}`}>
        {isUp ? '+' : ''}
        {formatCurrency(change, currency)} from today's {formatCurrency(currentBalance, currency)}
      </p>
    </div>
  );
}
