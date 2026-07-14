import { useTranslation } from '../lib/i18n';

interface CycleDaySelectorProps {
  cycleStartDay: number;
  onChange: (day: number) => void;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function CycleDaySelector({ cycleStartDay, onChange }: CycleDaySelectorProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-muted">
      {t('cycleStartDayLabel')}
      <select
        value={cycleStartDay}
        onChange={(e) => onChange(Number(e.target.value))}
        title="If a month is shorter than this day, the period starts on that month's last day instead."
        className="rounded-md border border-border bg-surface px-1.5 py-1 text-xs text-ink-muted focus:outline-none focus:border-ink/40"
      >
        {DAYS.map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
    </label>
  );
}
