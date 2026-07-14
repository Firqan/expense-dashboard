import { useMemo, useRef, useState } from 'react';
import { useTransactionsStore } from './lib/useTransactionsStore';
import { useCurrency } from './lib/useCurrency';
import { useRecurringStore } from './lib/useRecurringStore';
import { useTheme } from './lib/useTheme';
import { useCycleStartDay } from './lib/useCycleStartDay';
import { filterByDateRange, calculateTotals, groupByCategory, monthlyTrend } from './lib/calculations';
import { getUpcomingOccurrences, projectedBalance } from './lib/planning';
import { groupTransactionsByPeriod } from './lib/periods';
import { todayKey } from './lib/date';
import type { Transaction } from './lib/types';
import type { TransactionInput } from './lib/useTransactionsStore';
import { LanguageProvider, useTranslation } from './lib/i18n';
import { SummaryCards } from './components/SummaryCards';
import { CategoryPieChart } from './components/CategoryPieChart';
import { MonthlyTrendChart } from './components/MonthlyTrendChart';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DateRangeFilter } from './components/DateRangeFilter';
import { CsvControls } from './components/CsvControls';
import { CurrencySelector } from './components/CurrencySelector';
import { LanguageSelector } from './components/LanguageSelector';
import { CycleDaySelector } from './components/CycleDaySelector';
import { StatementHistory } from './components/StatementHistory';
import { ThemeToggle } from './components/ThemeToggle';
import { RecurringItemForm } from './components/RecurringItemForm';
import { UpcomingList } from './components/UpcomingList';
import { ProjectionCard } from './components/ProjectionCard';

const PLANNING_WINDOW_DAYS = 30;

function AppContent() {
  const { t } = useTranslation();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, importTransactions, makeId } =
    useTransactionsStore();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { items: recurringItems, addRecurringItem, deleteRecurringItem } = useRecurringStore();
  const { cycleStartDay, setCycleStartDay } = useCycleStartDay();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  const periods = useMemo(
    () => groupTransactionsByPeriod(transactions, cycleStartDay),
    [transactions, cycleStartDay]
  );

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
    // Scroll the form into view where it already lives on the page, instead
    // of jumping to the very top (which would show the header, not the form).
    if (typeof formSectionRef.current?.scrollIntoView === 'function') {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleUpdate(id: string, input: TransactionInput) {
    updateTransaction(id, input);
    // Without this, the form stayed in "edit mode" after saving — the data
    // updated correctly, but it looked like nothing happened.
    setEditingTransaction(null);
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
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t('appName')}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t('appTitle')}</h1>
            <p className="mt-1 max-w-md text-sm text-ink-muted">{t('appSubtitle')}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <CsvControls
                transactions={transactions}
                periods={periods}
                homeCurrency={currency}
                onImport={importTransactions}
                makeId={makeId}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <CurrencySelector currency={currency} onChange={setCurrency} />
              <CycleDaySelector cycleStartDay={cycleStartDay} onChange={setCycleStartDay} />
              <LanguageSelector />
            </div>
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
          <CategoryPieChart data={expenseByCategory} title={t('spendingByCategory')} currency={currency} />
          <CategoryPieChart data={incomeByCategory} title={t('incomeByCategory')} currency={currency} />
        </div>

        <MonthlyTrendChart data={trend} currency={currency} />

        <div className="border-t border-border pt-6">
          <h2 className="text-xl font-bold text-ink">{t('statementHistory')}</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">{t('statementHistoryDescription')}</p>
          <div className="mt-4">
            <StatementHistory periods={periods} currency={currency} />
          </div>
        </div>

        <div ref={formSectionRef} className="grid gap-4 lg:grid-cols-[380px_1fr] scroll-mt-6">
          <TransactionForm
            key={editingTransaction?.id ?? 'new'}
            onAdd={addTransaction}
            onUpdate={handleUpdate}
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
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{t('planning')}</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{t('recurringBillsIncome')}</h2>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">
            {t('planningDescription', { days: PLANNING_WINDOW_DAYS })}
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
        <p className="text-xs uppercase tracking-wide text-ink-muted">{t('footerNote')}</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
