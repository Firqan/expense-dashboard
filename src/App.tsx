import { useMemo, useState } from 'react';
import { useTransactionsStore } from './lib/useTransactionsStore';
import { filterByDateRange, calculateTotals, groupByCategory, monthlyTrend } from './lib/calculations';
import { SummaryCards } from './components/SummaryCards';
import { CategoryPieChart } from './components/CategoryPieChart';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DateRangeFilter } from './components/DateRangeFilter';
import { CsvControls } from './components/CsvControls';

function App() {
  const { transactions, addTransaction, deleteTransaction, importTransactions, makeId } =
    useTransactionsStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(
    () => filterByDateRange(transactions, startDate || null, endDate || null),
    [transactions, startDate, endDate]
  );

  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const expenseByCategory = useMemo(() => groupByCategory(filtered, 'expense'), [filtered]);
  const incomeByCategory = useMemo(() => groupByCategory(filtered, 'income'), [filtered]);
  const trend = useMemo(() => monthlyTrend(filtered), [filtered]);

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-6xl px-6 pt-10 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Ledger</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Expense Dashboard
            </h1>
            <p className="mt-1 max-w-md text-sm text-ink-muted">
              Track income and spending, broken down by category and month.
            </p>
          </div>
          <CsvControls transactions={transactions} onImport={importTransactions} makeId={makeId} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-6 py-8 sm:px-8">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onClear={() => {
            setStartDate('');
            setEndDate('');
          }}
        />

        <SummaryCards totals={totals} />

        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryPieChart data={expenseByCategory} title="Spending by category" />
          <CategoryPieChart data={incomeByCategory} title="Income by category" />
        </div>

        <MonthlyTrendChart data={trend} />

        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <TransactionForm onAdd={addTransaction} />
          <TransactionList transactions={filtered} onDelete={deleteTransaction} />
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-8">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          Data lives only in this browser's local storage — nothing is sent anywhere.
        </p>
      </footer>
    </div>
  );
}

export default App;
