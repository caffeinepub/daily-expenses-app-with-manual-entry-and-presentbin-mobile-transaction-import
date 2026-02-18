import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ManualExpenseForm from '../components/expenses/ManualExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseTotals from '../components/expenses/ExpenseTotals';
import PresentbinImportPanel from '../components/import/PresentbinImportPanel';
import { useGetExpenseRecords } from '../hooks/useExpenses';
import { filterExpensesByDate, getDateRangeForView } from '../utils/dates';
import { Calendar, Plus, Upload } from 'lucide-react';

type ViewType = 'today' | 'day' | 'month';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: allExpenses = [], isLoading } = useGetExpenseRecords();

  const dateRange = getDateRangeForView(activeView, selectedDate);
  const filteredExpenses = filterExpensesByDate(allExpenses, dateRange.start, dateRange.end);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage your daily expenses
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="w-4 h-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="day" className="gap-2">
              <Calendar className="w-4 h-4" />
              Day
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <Calendar className="w-4 h-4" />
              Month
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* Today View */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Expense
                  </CardTitle>
                  <CardDescription>Record a new expense manually</CardDescription>
                </CardHeader>
                <CardContent>
                  <ManualExpenseForm />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Summary</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExpenseTotals expenses={filteredExpenses} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Expenses</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={filteredExpenses} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Day View */}
          <TabsContent value="day" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>View expenses for a specific day</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTotals expenses={filteredExpenses} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={filteredExpenses} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Month View */}
          <TabsContent value="month" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Month</CardTitle>
                <CardDescription>View expenses for a specific month</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="month"
                  value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseTotals expenses={filteredExpenses} isLoading={isLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={filteredExpenses} isLoading={isLoading} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import View */}
          <TabsContent value="import" className="space-y-6">
            <PresentbinImportPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

