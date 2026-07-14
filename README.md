# Expense Dashboard

A clean, chart-driven dashboard for tracking income and expenses: category breakdowns, monthly trends, date-range filtering, and CSV import/export. Built to demonstrate data visualization — a skill not covered elsewhere in this portfolio.

**Live demo:** https://Firqan.github.io/expense-dashboard/

## Features

- **Add income/expense entries** with category, amount, date, and an optional note
- **Explicit type selection required** — Expense/Income is never pre-selected, so a transaction can't be logged as the wrong type by accident
- **No future-dated transactions** — the date picker won't accept a date past today
- **Edit any transaction** — fix a mistake without deleting and re-entering it from scratch. Saving correctly returns the form to its normal state instead of staying stuck in edit mode
- **Delete with confirmation** — a stray click can't wipe out an entry
- **Multi-currency**: choose from 55 world currencies (persisted, changeable anytime) via a small selector in the header. For a purchase made in a different currency, toggle "This was in a different currency," enter the foreign amount and the exchange rate, and the app computes and stores the home-currency equivalent — while still showing the original amount and rate as a detail on that entry
- **Recurring bills & income + a 30-day projection**: register anything that happens on a fixed day every month (rent, a paycheck, a subscription) and see how your balance is expected to move over the next 30 days, based on today's actual balance plus what's scheduled to land
- **Category breakdown** — a donut chart per transaction type (spending vs. income)
- **Monthly trend** — a bar chart comparing income and expense month over month, with a tooltip that stays put vertically instead of chasing the cursor
- **Date-range filtering** — every chart, summary card, and list respects the selected range
- **CSV import/export that actually opens correctly in Excel** — a UTF-8 byte-order mark and an explicit `sep=` directive are included, so accented characters, non-Latin scripts, and currency symbols render correctly and the columns don't collapse into one under non-US regional settings. The foreign-currency detail (original amount, currency, exchange rate) round-trips through export/import too
- **Light and dark themes**, toggleable and persisted
- **7 languages** — English, Arabic, French, German, Kurdish (Kurmanji), Persian, Turkish — switchable from the header, sorted alphabetically by language name and persisted. Arabic and Persian switch the entire page to a right-to-left layout (not just the text) — the same UI, mirrored, not a separate design. On a first visit with no saved preference, the app checks the browser's own language and opens in it automatically if it's one of the 7 — otherwise it opens in English
- **Responsive down to a phone-sized screen** — form fields that used to force two columns collapse to one below the `sm` breakpoint, and the category charts switch from a side legend to a bottom legend so the pie doesn't get squeezed on narrow viewports
- **Statement history with a configurable cycle day** — instead of always grouping by the calendar month, you can set which day of the month your "statement" starts on (payday is rarely the 1st). Each statement card shows an opening balance carried over from the previous period, income, expenses, and a closing balance — the same chaining logic a real bank statement uses
- **A real Excel export**, not just CSV — a two-sheet `.xlsx` workbook (statement history + full transaction list) with proper column widths, generated client-side and only loaded into the page when you actually click the button
- **Room to grow**: transactions live in IndexedDB rather than `localStorage`, which typically caps out around 5MB — enough for years of normal use, but not unlimited. IndexedDB's quota is dramatically larger (commonly tens of megabytes or more), so the app can hold a much longer history without needing an account or a server. Existing data from before this change migrates over automatically, once, the first time the app loads
- **Persistence** via `localStorage` — no account, no backend
- **Tested**: all the money math (totals, category grouping, monthly aggregation, currency conversion, recurring-item projection, CSV parsing) is pure functions with full unit test coverage, independent of the UI
- **CI/CD**: every push to `main` runs the test suite and deploys to GitHub Pages automatically

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, SheetJS (xlsx), Vitest + Testing Library.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm test           # 119 tests
npm run build
```

## Design notes

Financial UIs live or die on precision, so all monetary figures use a monospaced font (`Space Mono`) with tabular numerals — amounts line up visually the way they would on a real statement, and a column of numbers doesn't jitter as digits change.

The calculation layer (`src/lib/calculations.ts`) is deliberately free of any date-range or UI state — it just takes a list of transactions and returns totals, category sums, or a monthly series. Filtering by date range happens once, upstream, and every chart and summary card consumes the same filtered list. That's what keeps the numbers on screen consistent with each other, and what makes the math independently testable.

CSV parsing (`src/lib/csv.ts`) uses a real character-by-character tokenizer rather than a fixed regex, so it handles quoted fields, embedded commas, and escaped quotes correctly, and looks up columns by name — which is also what lets it stay backward-compatible with exports from before the currency-conversion feature existed. It validates every row: a malformed amount or an unrecognized transaction type raises a clear error instead of silently corrupting the ledger.

Translation (`src/lib/i18n/`) is a small custom context + dictionary system rather than a heavier library, since the app's string set is bounded and known in advance. Category names are a deliberate exception to full translation: a transaction's `category` field always stores the English canonical value (e.g. `"Food"`), and only the on-screen label is translated (`src/lib/categoryLabels.ts`). That keeps CSV exports and imports language-independent — a file exported while using the German UI opens the same way when re-imported under Arabic.

Dark mode doesn't touch component files at all. The color tokens defined in `@theme` are CSS custom properties under the hood; `html.dark { --color-surface: ...; }` simply overrides the same variables, so every existing `bg-surface` / `text-ink` / `border-border` utility class picks up the new palette automatically the moment the `dark` class is toggled on `<html>`.

Right-to-left support follows the same "change one thing at the root, let CSS do the rest" approach: switching to Arabic or Persian sets `dir="rtl"` on `<html>`, and because the layout is built entirely from flexbox and grid (`flex`, `grid`, `gap`, `justify-between`) rather than hardcoded `margin-left` / `text-right` style utilities, the browser mirrors the whole page on its own — no per-component RTL styling was needed. The one exception is monetary figures: `.font-numeric` explicitly forces `direction: ltr` so a negative sign or currency symbol can't get visually reordered by the bidi algorithm inside RTL text.

Statement periods (`src/lib/periods.ts`) deliberately don't assume a calendar month. A "period" is defined purely by its configurable start day (default: the 1st, which reproduces normal calendar months); everything else — the end date, which transactions fall inside it, and how one period's closing balance becomes the next period's opening balance — is derived from that single number. There's no separate archive or snapshot store: since every transaction already lives in the database indefinitely, period summaries are recomputed on demand from the full history. That avoids the class of bugs where a cached summary goes stale after someone edits an old transaction.

`src/lib/transactionsDb.ts` wraps IndexedDB with a plain Promise-based API — a single connection is opened once and reused (rather than opening and leaking a new one per call), and every write updates React state immediately while persisting in the background, so the UI never blocks on it. Testing this against a real browser API from Vitest/jsdom is handled by `fake-indexeddb`, which is wired in globally in `src/test/setup.ts`.

## Possible extensions

- Budgets per category with over/under indicators
- Cloud sync / multi-device

## License

MIT
