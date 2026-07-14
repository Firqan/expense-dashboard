import { CURRENCIES } from '../lib/types';
import { useTranslation } from '../lib/i18n';

interface CurrencySelectorProps {
  currency: string;
  onChange: (currency: string) => void;
}

export function CurrencySelector({ currency, onChange }: CurrencySelectorProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-muted">
      {t('currencyLabel')}
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
