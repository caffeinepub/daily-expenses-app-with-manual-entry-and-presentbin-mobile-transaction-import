import type { ExpenseRecord } from '../backend';

export function formatCurrency(amountInCents: number, currency: string): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDateRangeForView(
  view: 'today' | 'day' | 'month',
  selectedDate: Date
): { start: Date; end: Date } {
  switch (view) {
    case 'today':
      return {
        start: getStartOfDay(new Date()),
        end: getEndOfDay(new Date()),
      };
    case 'day':
      return {
        start: getStartOfDay(selectedDate),
        end: getEndOfDay(selectedDate),
      };
    case 'month':
      return {
        start: getStartOfMonth(selectedDate),
        end: getEndOfMonth(selectedDate),
      };
  }
}

export function filterExpensesByDate(
  expenses: ExpenseRecord[],
  startDate: Date,
  endDate: Date
): ExpenseRecord[] {
  const startTimestamp = BigInt(startDate.getTime()) * BigInt(1_000_000);
  const endTimestamp = BigInt(endDate.getTime()) * BigInt(1_000_000);

  return expenses
    .filter((expense) => {
      return expense.transactionDateTime >= startTimestamp && expense.transactionDateTime <= endTimestamp;
    })
    .sort((a, b) => {
      // Sort by transaction date descending (newest first)
      if (a.transactionDateTime > b.transactionDateTime) return -1;
      if (a.transactionDateTime < b.transactionDateTime) return 1;
      return 0;
    });
}

