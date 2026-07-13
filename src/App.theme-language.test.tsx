import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App — theme and language', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.dir = 'ltr';
  });

  it('defaults to light theme (no "dark" class on <html>)', () => {
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles to dark theme and back', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByRole('button', { name: /night/i });
    await user.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const toggleBack = screen.getByRole('button', { name: /day/i });
    await user.click(toggleBack);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists the theme choice to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /night/i }));
    expect(localStorage.getItem('expense-dashboard-theme-v1')).toBe('dark');
  });

  it('defaults to English', () => {
    render(<App />);
    expect(screen.getByText('Expense Dashboard')).toBeInTheDocument();
  });

  it('switches the visible UI text when a different language is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'tr');

    expect(screen.getByText('Gider Kontrol Paneli')).toBeInTheDocument();
    expect(screen.queryByText('Expense Dashboard')).not.toBeInTheDocument();
  });

  it('persists the language choice to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'de');
    expect(localStorage.getItem('expense-dashboard-language-v1')).toBe('de');
  });

  it('translates the transaction type buttons', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'fr');

    expect(screen.getAllByRole('button', { name: 'Dépense' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Revenus' }).length).toBeGreaterThan(0);
  });

  it('defaults to left-to-right layout direction', () => {
    render(<App />);
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('switches to right-to-left layout direction for Arabic', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'ar');

    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('switches to right-to-left layout direction for Persian', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/^language$/i), 'fa');

    expect(document.documentElement.dir).toBe('rtl');
  });

  it('switches back to left-to-right when leaving an RTL language', async () => {
    const user = userEvent.setup();
    render(<App />);
    const selector = screen.getByLabelText(/^language$/i);

    await user.selectOptions(selector, 'ar');
    expect(document.documentElement.dir).toBe('rtl');

    await user.selectOptions(selector, 'tr');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('stays left-to-right for Kurdish, German, and Turkish', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Grab the select element once — its accessible label text itself
    // changes per language, so we can't keep re-querying it by English text.
    const selector = screen.getByLabelText(/^language$/i);

    for (const code of ['ku', 'de', 'tr']) {
      await user.selectOptions(selector, code);
      expect(document.documentElement.dir).toBe('ltr');
    }
  });
});
