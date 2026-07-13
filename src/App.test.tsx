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

  it('adds an expense and reflects it in the summary and list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/amount/i), '42.50');
    await user.type(screen.getByLabelText(/description/i), 'Groceries');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    // Expense summary card should now show the amount
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

  it('deletes a transaction', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/amount/i), '20');
    await user.type(screen.getByLabelText(/description/i), 'Coffee');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    expect(screen.getByText('Coffee')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete transaction: coffee/i }));

    expect(screen.queryByText('Coffee')).not.toBeInTheDocument();
    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('persists transactions to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/amount/i), '15');
    await user.type(screen.getByLabelText(/description/i), 'Snack');
    await user.click(screen.getByRole('button', { name: /add transaction/i }));

    const stored = JSON.parse(localStorage.getItem('expense-dashboard-transactions-v1') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].description).toBe('Snack');
  });
});
