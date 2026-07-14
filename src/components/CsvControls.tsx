import { useRef, useState } from 'react';
import { transactionsToCsv, csvToTransactions, downloadCsv, CsvParseError } from '../lib/csv';
import { exportToExcel } from '../lib/xlsxExport';
import type { Transaction } from '../lib/types';
import type { PeriodSummary } from '../lib/periods';
import { useTranslation } from '../lib/i18n';

interface CsvControlsProps {
  transactions: Transaction[];
  periods: PeriodSummary[];
  homeCurrency: string;
  onImport: (imported: Transaction[]) => void;
  makeId: () => string;
}

export function CsvControls({ transactions, periods, homeCurrency, onImport, makeId }: CsvControlsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExportCsv() {
    const csv = transactionsToCsv(transactions);
    downloadCsv(csv, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async function handleExportExcel() {
    await exportToExcel(
      transactions,
      periods,
      homeCurrency,
      `expense-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  function handleImportClick() {
    setError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = csvToTransactions(text, makeId);
      onImport(imported);
      setError(null);
    } catch (err) {
      setError(err instanceof CsvParseError ? err.message : t('csvReadError'));
    } finally {
      e.target.value = '';
    }
  }

  const disabled = transactions.length === 0;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={disabled}
          className="rounded-lg border border-border bg-ink px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 dark:text-bg"
        >
          {t('exportExcel')}
        </button>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={disabled}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('exportCsv')}
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
        >
          {t('importCsv')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-expense">{error}</p>}
    </div>
  );
}
