import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { resetTransactionsDbForTests } from './lib/transactionsDb';

function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('App — statement history', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetTransactionsDbForTests();
  });

  it('shows an empty state before any transaction exists', () => {
    render(<App />);
    expect(screen.getByText(/no statements yet/i)).toBeInTheDocument();
  });

  it('shows a statement card once a transaction is added, defaulting to the calendar month', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^income$/i }));
    await user.type(screen.getByLabelText(/amount \(usd\)/i), '1000');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.queryByText(/no statements yet/i)).not.toBeInTheDocument();
    expect(screen.getByText(/closing balance/i)).toBeInTheDocument();
    expect(screen.getAllByText('$1,000.00').length).toBeGreaterThan(0);
  });

  it('regrouping by a different statement day changes which period a transaction belongs to', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^income$/i }));
    const amountInput = screen.getByLabelText(/amount \(usd\)/i) as HTMLInputElement;
    setNativeValue(amountInput, '500');
    const dateInput = screen.getByLabelText(/^date$/i) as HTMLInputElement;
    setNativeValue(dateInput, '2026-07-03');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    // Default cycle day is 1 (calendar month) — period should start July 1st.
    expect(screen.getByText(/2026-07-01/)).toBeInTheDocument();

    // Switch the statement day to the 5th — July 3rd now belongs to the
    // period that started June 5th, since the 5th hasn't happened yet.
    await user.selectOptions(screen.getByLabelText(/statement day/i), '5');
    expect(screen.getByText(/2026-06-05/)).toBeInTheDocument();
  });

  it('persists the statement day setting', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/statement day/i), '15');
    expect(localStorage.getItem('expense-dashboard-cycle-start-day-v1')).toBe('15');
  });

  it('regression: allows selecting day 31 (previously capped at 28)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const selector = screen.getByLabelText(/statement day/i) as HTMLSelectElement;
    await user.selectOptions(selector, '31');

    expect(selector.value).toBe('31');
    expect(localStorage.getItem('expense-dashboard-cycle-start-day-v1')).toBe('31');
  });

  it('shows an "Export Excel" button that is disabled with no data and enabled once data exists', async () => {
    const user = userEvent.setup();
    render(<App />);

    const excelBtn = screen.getByRole('button', { name: /export excel/i });
    expect(excelBtn).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount \(usd\)/i), '20');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(excelBtn).toBeEnabled();
  });

  it('clicking "Export Excel" does not throw', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount \(usd\)/i), '20');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await expect(
      user.click(screen.getByRole('button', { name: /export excel/i }))
    ).resolves.not.toThrow();
  });
});
