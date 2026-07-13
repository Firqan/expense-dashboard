import { useMemo, useState } from 'react';
import { useTransactionsStore } from './lib/useTransactionsStore';
import { useCurrency } from './lib/useCurrency';
import { useRecurringStore } from './lib/useRecurringStore';
import { filterByDateRange, calculateTotals, groupByCategory, monthlyTrend } from './lib/calculations';
import { getUpcomingOccurrences, projectedBalance } from './lib/planning';
import { todayKey } from './lib/date';
import type { Transaction } from './lib/types';
import { SummaryCards } from './components/SummaryCards';
import { CategoryPieChart } from './components/CategoryPieChart';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DateRangeFilter } from './components/DateRangeFilter';
import { CsvControls } from './components/CsvControls';
import { CurrencySelector } from './components/CurrencySelector';
import { RecurringItemForm } from './components/RecurringItemForm';
import { UpcomingList } from './components/UpcomingList';
import { ProjectionCard } from './components/ProjectionCard';

const PLANNING_WINDOW_DAYS = 30;

function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, importTransactions, makeId } =
    useTransactionsStore();
  const { currency, setCurrency } = useCurrency();
  const { items: recurringItems, addRecurringItem, deleteRecurringItem } = useRecurringStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filtered = useMemo(
    () => filterByDateRange(transactions, startDate || null, endDate || null),
    [transactions, startDate, endDate]
  );

  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const expenseByCategory = useMemo(() => groupByCategory(filtered, 'expense'), [filtered]);
  const incomeByCategory = useMemo(() => groupByCategory(filtered, 'income'), [filtered]);
  const trend = useMemo(() => monthlyTrend(filtered), [filtered]);

  // The projection always starts from today's *actual* balance across all
  // transactions (not the filtered/date-ranged view above).
  const allTimeBalance = useMemo(() => calculateTotals(transactions).balance, [transactions]);
  const upcomingOccurrences = useMemo(
    () => getUpcomingOccurrences(recurringItems, todayKey(), PLANNING_WINDOW_DAYS),
    [recurringItems]
  );
  const projected = useMemo(
    () => projectedBalance(allTimeBalance, upcomingOccurrences),
    [allTimeBalance, upcomingOccurrences]
  );

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleDelete(id: string) {
    if (editingTransaction?.id === id) setEditingTransaction(null);
    deleteTransaction(id);
  }

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
          <div className="flex flex-col items-end gap-2">
            <CsvControls transactions={transactions} onImport={importTransactions} makeId={makeId} />
            <CurrencySelector currency={currency} onChange={setCurrency} />
          </div>
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

        <SummaryCards totals={totals} currency={currency} />

        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryPieChart data={expenseByCategory} title="Spending by category" currency={currency} />
          <CategoryPieChart data={incomeByCategory} title="Income by category" currency={currency} />
        </div>

        <MonthlyTrendChart data={trend} currency={currency} />

        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          <TransactionForm
            key={editingTransaction?.id ?? 'new'}
            onAdd={addTransaction}
            onUpdate={updateTransaction}
            editingTransaction={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
            homeCurrency={currency}
          />
          <TransactionList
            transactions={filtered}
            onDelete={handleDelete}
            onEdit={handleEdit}
            homeCurrency={currency}
            editingId={editingTransaction?.id ?? null}
          />
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Planning</p>
          <h2 className="mt-1 text-xl font-bold text-ink">Recurring bills &amp; income</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            Add anything that happens on a fixed day every month — rent, a paycheck, a
            subscription — to see how your balance is projected to look over the next{' '}
            {PLANNING_WINDOW_DAYS} days.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
            <div className="space-y-4">
              <ProjectionCard
                currentBalance={allTimeBalance}
                projected={projected}
                daysAhead={PLANNING_WINDOW_DAYS}
                currency={currency}
              />
              <RecurringItemForm onAdd={addRecurringItem} />
            </div>
            <UpcomingList
              occurrences={upcomingOccurrences}
              allItems={recurringItems}
              onDelete={deleteRecurringItem}
              currency={currency}
            />
          </div>
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
