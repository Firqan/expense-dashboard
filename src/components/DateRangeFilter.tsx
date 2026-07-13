import { useTranslation } from '../lib/i18n';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onClear: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
}: DateRangeFilterProps) {
  const { t } = useTranslation();
  const hasFilter = startDate || endDate;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="start-date">
          {t('from')}
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/40"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-muted" htmlFor="end-date">
          {t('to')}
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/40"
        />
      </div>
      {hasFilter && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          {t('clear')}
        </button>
      )}
    </div>
  );
}
