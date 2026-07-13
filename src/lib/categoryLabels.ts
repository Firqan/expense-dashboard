import type { TranslationKey } from './i18n';

// Transactions always store the category using this stable, English canonical
// value (so CSV exports and imports stay language-independent and portable).
// Only the on-screen label is translated.
const CATEGORY_KEY_MAP: Record<string, TranslationKey> = {
  Food: 'catFood',
  Transport: 'catTransport',
  Housing: 'catHousing',
  Utilities: 'catUtilities',
  Entertainment: 'catEntertainment',
  Health: 'catHealth',
  Shopping: 'catShopping',
  Other: 'catOther',
  Salary: 'catSalary',
  Freelance: 'catFreelance',
  Investment: 'catInvestment',
  Gift: 'catGift',
};

export function categoryLabel(category: string, t: (key: TranslationKey) => string): string {
  const key = CATEGORY_KEY_MAP[category];
  return key ? t(key) : category;
}
