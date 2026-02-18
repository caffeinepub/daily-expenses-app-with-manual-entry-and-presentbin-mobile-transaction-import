import { useDeleteExpenseRecord } from '../../hooks/useExpenses';
import type { ExpenseRecord } from '../../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2 } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/dates';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExpenseListProps {
  expenses: ExpenseRecord[];
  isLoading: boolean;
}

export default function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  const deleteExpense = useDeleteExpenseRecord();

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <img
          src="/assets/generated/empty-state-receipt.dim_1200x800.png"
          alt="No expenses"
          className="w-64 h-auto mx-auto opacity-60"
        />
        <div className="space-y-2">
          <p className="text-lg font-medium text-muted-foreground">No expenses yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first expense or import transactions from Presentbin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {formatDateTime(expense.transactionDateTime)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{expense.category}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{expense.note}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(expense.amount, expense.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={expense.source === 'manual' ? 'outline' : 'default'}>
                  {expense.source}
                </Badge>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteExpense.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this expense? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(expense.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

