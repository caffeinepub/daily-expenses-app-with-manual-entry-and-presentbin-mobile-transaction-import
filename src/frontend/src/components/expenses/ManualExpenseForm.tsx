import { useState } from 'react';
import { useAddExpenseRecord } from '../../hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other'];

export default function ManualExpenseForm() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const addExpense = useAddExpenseRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    const dateTime = new Date(`${date}T${time}`);
    const transactionDateTime = BigInt(dateTime.getTime()) * BigInt(1_000_000);

    try {
      await addExpense.mutateAsync({
        amount: Math.round(amountNum * 100),
        currency,
        category,
        note: note.trim() || 'No description',
        transactionDateTime,
      });

      toast.success('Expense added successfully');
      
      // Reset form
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={addExpense.isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency} disabled={addExpense.isPending}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory} disabled={addExpense.isPending}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={addExpense.isPending}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={addExpense.isPending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note / Merchant</Label>
        <Textarea
          id="note"
          placeholder="e.g., Grocery shopping at Whole Foods"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={addExpense.isPending}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full gap-2" disabled={addExpense.isPending}>
        {addExpense.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add Expense
          </>
        )}
      </Button>
    </form>
  );
}

