import { useEffect, useState } from 'react';

const STORAGE_KEY = 'expense-dashboard-cycle-start-day-v1';
const DEFAULT_CYCLE_START_DAY = 1;

function loadCycleStartDay(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : DEFAULT_CYCLE_START_DAY;
    if (parsed >= 1 && parsed <= 31) return parsed;
  } catch {
    // ignore
  }
  return DEFAULT_CYCLE_START_DAY;
}

export function useCycleStartDay() {
  const [cycleStartDay, setCycleStartDayState] = useState<number>(loadCycleStartDay);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(cycleStartDay));
    } catch {
      // localStorage unavailable — setting won't persist, app still works.
    }
  }, [cycleStartDay]);

  function setCycleStartDay(day: number) {
    setCycleStartDayState(day);
  }

  return { cycleStartDay, setCycleStartDay };
}
