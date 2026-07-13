import { useTranslation } from '../lib/i18n';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? t('day') : t('night')}
      className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs text-ink-muted transition-colors hover:text-ink"
    >
      <span
        className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors ${
          isDark ? 'bg-ink' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 transform rounded-full bg-surface transition-transform ${
            isDark ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </span>
      {isDark ? t('night') : t('day')}
    </button>
  );
}
