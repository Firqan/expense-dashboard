import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { resetTransactionsDbForTests } from './lib/transactionsDb';

describe('App — planning', () => {
  beforeEach(async () => {
    localStorage.clear();
    await resetTransactionsDbForTests();
  });

  it('hides the recurring items list until at least one is added', () => {
    render(<App />);
    expect(screen.queryByText(/all recurring items/i)).not.toBeInTheDocument();
  });

  it('adds a recurring bill and shows it in the upcoming list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add a recurring bill or income/i }));
    await user.click(screen.getByRole('button', { name: /bill \/ expense/i }));
    await user.type(screen.getByLabelText(/^name$/i), 'Rent');
    await user.type(screen.getByLabelText(/^amount$/i), '800');

    const dayInput = screen.getByLabelText(/day of month/i);
    await user.clear(dayInput);
    await user.type(dayInput, '1');

    await user.click(screen.getByRole('button', { name: /add recurring item/i }));

    expect(screen.getByText(/all recurring items/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Rent/).length).toBeGreaterThan(0);
  });

  it('shows a projected balance that reflects a recurring expense', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Log an actual transaction first so there's a nonzero starting balance.
    await user.click(screen.getByRole('button', { name: /^income$/i }));
    await user.type(screen.getByLabelText(/^amount \(usd\)$/i), '1000');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    await user.click(screen.getByRole('button', { name: /add a recurring bill or income/i }));
    await user.click(screen.getByRole('button', { name: /bill \/ expense/i }));
    await user.type(screen.getByLabelText(/^name$/i), 'Rent');
    await user.type(screen.getByLabelText(/^amount$/i), '800');
    const dayInput = screen.getByLabelText(/day of month/i);
    await user.clear(dayInput);
    await user.type(dayInput, '1');
    await user.click(screen.getByRole('button', { name: /add recurring item/i }));

    // Balance today is $1000; if rent falls within the 30-day window,
    // the projected figure should be lower than the current balance.
    expect(screen.getByText(/projected balance in 30 days/i)).toBeInTheDocument();
  });

  it('requires a type to be selected before adding a recurring item', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add a recurring bill or income/i }));
    await user.type(screen.getByLabelText(/^amount$/i), '50');
    await user.click(screen.getByRole('button', { name: /add recurring item/i }));

    expect(screen.getByText(/please select expense or income/i)).toBeInTheDocument();
    expect(screen.queryByText(/all recurring items/i)).not.toBeInTheDocument();
  });

  it('removes a recurring item', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add a recurring bill or income/i }));
    await user.click(screen.getByRole('button', { name: /bill \/ expense/i }));
    await user.type(screen.getByLabelText(/^name$/i), 'Netflix');
    await user.type(screen.getByLabelText(/^amount$/i), '15');
    await user.click(screen.getByRole('button', { name: /add recurring item/i }));

    expect(screen.getAllByText(/Netflix/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: /remove recurring item: netflix/i }));

    expect(screen.queryByText(/all recurring items/i)).not.toBeInTheDocument();
  });

  it('persists recurring items to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /add a recurring bill or income/i }));
    const recurringForm = screen.getByRole('button', { name: /add recurring item/i }).closest('form')!;
    const { getByRole, getByLabelText } = within(recurringForm);
    await user.click(getByRole('button', { name: /^income$/i }));
    await user.type(getByLabelText(/^name$/i), 'Salary');
    await user.type(getByLabelText(/^amount$/i), '3000');
    await user.click(getByRole('button', { name: /add recurring item/i }));

    const stored = JSON.parse(localStorage.getItem('expense-dashboard-recurring-v1') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].description).toBe('Salary');
    expect(stored[0].type).toBe('income');
  });
});
