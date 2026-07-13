import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the empty state before any transaction is added', () => {
    render(<App />);
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('does not default to Expense or Income — neither is pre-selected', () => {
    render(<App />);
    const expenseBtn = screen.getByRole('button', { name: /^expense$/i });
    const incomeBtn = screen.getByRole('button', { name: /^income$/i });
    // Neither button should carry the "selected" (filled) styling class
    expect(expenseBtn.className).not.toContain('bg-expense text-white');
    expect(incomeBtn.className).not.toContain('bg-income text-white');
  });

  it('shows a warning and does not add a transaction if type was never selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getByText(/before continuing/i)).toBeInTheDocument();
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('adds an expense once Expense is explicitly selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '42.50');
    await user.type(screen.getByLabelText(/description/i), 'Groceries');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getAllByText('-$42.50').length).toBeGreaterThan(0);
  });

  it('adds income and updates the balance to be positive', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^income$/i }));
    await user.type(screen.getByLabelText(/amount/i), '1000');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getAllByText('$1,000.00').length).toBeGreaterThan(0);
  });

  it('rejects a future-dated transaction', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '10');

    const dateInput = screen.getByLabelText(/^date$/i) as HTMLInputElement;
    // The date input should not allow a value past today via its max attribute
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().slice(0, 10);
    expect(dateInput.max).not.toBe('');
    expect(futureDate > dateInput.max).toBe(true);
  });

  it('deletes a transaction after confirming', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getByText('Coffee')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete transaction: coffee/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('canceling a delete keeps the transaction', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await user.click(screen.getByRole('button', { name: /delete transaction: coffee/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getByText('Coffee')).toBeInTheDocument();
  });

  it('edits an existing transaction instead of requiring delete + re-add', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await user.click(screen.getByRole('button', { name: /edit transaction: coffee/i }));

    // The form should now be pre-filled and in edit mode
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    expect(amountInput.value).toBe('20');

    await user.clear(amountInput);
    await user.type(amountInput, '99');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getAllByText('-$99.00').length).toBeGreaterThan(0);
    expect(screen.queryByText('-$20.00')).not.toBeInTheDocument();
  });

  it('canceling an edit leaves the original transaction unchanged', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await user.click(screen.getByRole('button', { name: /edit transaction: coffee/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.getAllByText('-$20.00').length).toBeGreaterThan(0);
  });

  it('regression: exits edit mode after saving, instead of staying stuck on "Save changes"', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await user.click(screen.getByRole('button', { name: /edit transaction: coffee/i }));
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    await user.clear(amountInput);
    await user.type(amountInput, '30');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // The form should have returned to "Add transaction" mode, not stayed on "Save changes".
    expect(screen.getByRole('button', { name: /add transaction/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });

  it('converts a foreign-currency transaction into the home currency', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.click(screen.getByLabelText(/different currency/i));

    const foreignAmountInput = screen.getByLabelText(/^amount \(/i);
    await user.type(foreignAmountInput, '50');
    await user.type(screen.getByLabelText(/exchange rate/i), '1.08');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    // 50 * 1.08 = 54.00, recorded in the home currency (USD by default)
    expect(screen.getAllByText('-$54.00').length).toBeGreaterThan(0);
  });

  it('persists transactions to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^expense$/i }));
    await user.type(screen.getByLabelText(/amount/i), '15');
    await user.type(screen.getByLabelText(/description/i), 'Snack');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    const stored = JSON.parse(localStorage.getItem('expense-dashboard-transactions-v1') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].description).toBe('Snack');
  });

  it('persists the selected home currency', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^currency$/i), 'EUR');

    expect(localStorage.getItem('expense-dashboard-currency-v1')).toBe('EUR');
  });
});
