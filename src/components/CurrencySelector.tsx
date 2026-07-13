import { CURRENCIES } from '../lib/types';

interface CurrencySelectorProps {
  currency: string;
  onChange: (currency: string) => void;
}

export function CurrencySelector({ currency, onChange }: CurrencySelectorProps) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-muted">
      Currency
      <select
        value={currency}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-1.5 py-1 text-xs text-ink-muted focus:outline-none focus:border-ink/40"
      >
        {Object.entries(CURRENCIES).map(([code, info]) => (
          <option key={code} value={code}>
            {code} ({info.symbol})
          </option>
        ))}
      </select>
    </label>
  );
}
