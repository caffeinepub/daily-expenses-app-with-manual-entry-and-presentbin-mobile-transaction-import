import type { ExpenseRecord } from '../../backend';
import { formatCurrency } from '../../utils/dates';
import { Loader2 } from 'lucide-react';

interface ExpenseTotalsProps {
  expenses: ExpenseRecord[];
  isLoading: boolean;
}

export default function ExpenseTotals({ expenses, isLoading }: ExpenseTotalsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group expenses by currency
  const totalsByCurrency = expenses.reduce((acc, expense) => {
    const currency = expense.currency;
    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const currencies = Object.keys(totalsByCurrency);

  if (currencies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-3xl font-bold text-muted-foreground">$0.00</p>
        <p className="text-sm text-muted-foreground mt-2">No expenses recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currencies.map((currency) => (
        <div key={currency} className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{currency}</p>
          <p className="text-4xl font-bold tracking-tight">
            {formatCurrency(totalsByCurrency[currency], currency)}
          </p>
        </div>
      ))}
      <div className="pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
        </p>
      </div>
    </div>
  );
}

