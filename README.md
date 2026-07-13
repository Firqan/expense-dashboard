# Expense Dashboard

A clean, chart-driven dashboard for tracking income and expenses: category breakdowns, monthly trends, date-range filtering, and CSV import/export. Built to demonstrate data visualization — a skill not covered elsewhere in this portfolio.

**Live demo:** https://Firqan.github.io/expense-dashboard/

## Features

- **Add income/expense entries** with category, amount, date, and an optional note
- **Category breakdown** — a donut chart per transaction type (spending vs. income)
- **Monthly trend** — a bar chart comparing income and expense month over month
- **Date-range filtering** — every chart, summary card, and list respects the selected range
- **CSV import/export** — take your data out, or bulk-load transactions from a spreadsheet
- **Persistence** via `localStorage` — no account, no backend
- **Tested**: all the money math (totals, category grouping, monthly aggregation, CSV parsing) is pure functions with full unit test coverage, independent of the UI
- **CI/CD**: every push to `main` runs the test suite and deploys to GitHub Pages automatically

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Vitest + Testing Library.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm test           # 29 tests
npm run build
```

## Design notes

Financial UIs live or die on precision, so all monetary figures use a monospaced font (`Space Mono`) with tabular numerals — amounts line up visually the way they would on a real statement, and a column of numbers doesn't jitter as digits change.

The calculation layer (`src/lib/calculations.ts`) is deliberately free of any date-range or UI state — it just takes a list of transactions and returns totals, category sums, or a monthly series. Filtering by date range happens once, upstream, and every chart and summary card consumes the same filtered list. That's what keeps the numbers on screen consistent with each other, and what makes the math independently testable.

CSV parsing (`src/lib/csv.ts`) round-trips through the same format it exports, and it validates every row — a malformed amount or an unrecognized transaction type raises a clear error instead of silently corrupting the ledger.

## Possible extensions

- Recurring transactions (rent, subscriptions)
- Budgets per category with over/under indicators
- Multi-currency support
- Cloud sync / multi-device

## License

MIT
