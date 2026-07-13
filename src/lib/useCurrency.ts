import { useEffect, useState } from 'react';
import { DEFAULT_CURRENCY } from './types';

const STORAGE_KEY = 'expense-dashboard-currency-v1';

function loadCurrency(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function useCurrency() {
  const [currency, setCurrency] = useState<string>(loadCurrency);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {
      // localStorage unavailable — setting won't persist, but the app still works.
    }
  }, [currency]);

  return { currency, setCurrency };
}
