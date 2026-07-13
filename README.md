# Expense Dashboard

A clean, chart-driven dashboard for tracking income and expenses: category breakdowns, monthly trends, date-range filtering, and CSV import/export. Built to demonstrate data visualization — a skill not covered elsewhere in this portfolio.

**Live demo:** https://Firqan.github.io/expense-dashboard/

## Features

- **Add income/expense entries** with category, amount, date, and an optional note
- **Explicit type selection required** — Expense/Income is never pre-selected, so a transaction can't be logged as the wrong type by accident
- **No future-dated transactions** — the date picker won't accept a date past today
- **Edit any transaction** — fix a mistake without deleting and re-entering it from scratch
- **Delete with confirmation** — a stray click can't wipe out an entry
- **Multi-currency**: pick a home currency (persisted, changeable anytime) from a small selector in the header. For a purchase made in a different currency, toggle "This was in a different currency," enter the foreign amount and the exchange rate, and the app computes and stores the home-currency equivalent — while still showing the original amount and rate as a detail on that entry
- **Recurring bills & income + a 30-day projection**: register anything that happens on a fixed day every month (rent, a paycheck, a subscription) and see how your balance is expected to move over the next 30 days, based on today's actual balance plus what's scheduled to land
- **Category breakdown** — a donut chart per transaction type (spending vs. income)
- **Monthly trend** — a bar chart comparing income and expense month over month
- **Date-range filtering** — every chart, summary card, and list respects the selected range
- **CSV import/export** — take your data out, or bulk-load transactions from a spreadsheet
- **Persistence** via `localStorage` — no account, no backend
- **Tested**: all the money math (totals, category grouping, monthly aggregation, currency conversion, recurring-item projection, CSV parsing) is pure functions with full unit test coverage, independent of the UI
- **CI/CD**: every push to `main` runs the test suite and deploys to GitHub Pages automatically

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Vitest + Testing Library.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm test           # 61 tests
npm run build
```

## Design notes

Financial UIs live or die on precision, so all monetary figures use a monospaced font (`Space Mono`) with tabular numerals — amounts line up visually the way they would on a real statement, and a column of numbers doesn't jitter as digits change.

The calculation layer (`src/lib/calculations.ts`) is deliberately free of any date-range or UI state — it just takes a list of transactions and returns totals, category sums, or a monthly series. Filtering by date range happens once, upstream, and every chart and summary card consumes the same filtered list. That's what keeps the numbers on screen consistent with each other, and what makes the math independently testable.

CSV parsing (`src/lib/csv.ts`) round-trips through the same format it exports, and it validates every row — a malformed amount or an unrecognized transaction type raises a clear error instead of silently corrupting the ledger.

## Possible extensions

- Budgets per category with over/under indicators
- Cloud sync / multi-device

## License

MIT
