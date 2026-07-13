import { LANGUAGES, useTranslation } from '../lib/i18n';
import type { LanguageCode } from '../lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-muted">
      {t('languageLabel')}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="rounded-md border border-border bg-surface px-1.5 py-1 text-xs text-ink-muted focus:outline-none focus:border-ink/40"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </label>
  );
}
