import {
  calculateTotalRepayments,
  calculateTotalLoans,
  calculateTotalExpenses,
  expenses
} from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export function CashFlowSummary() {
  const openingBalance = 5000; // Mock opening balance
  const cashIn = calculateTotalRepayments('today');
  const cashOutLoans = calculateTotalLoans('today');
  const cashOutExpenses = calculateTotalExpenses('today');
  const totalCashOut = cashOutLoans + cashOutExpenses;
  const closingBalance = openingBalance + cashIn - totalCashOut;

  const summaryItems = [
    { label: 'Opening Balance', value: openingBalance, isPositive: true },
    { label: 'Cash In (Repayments)', value: cashIn, isPositive: true },
    { label: 'Cash Out (Loans)', value: cashOutLoans, isPositive: false },
    { label: 'Cash Out (Expenses)', value: cashOutExpenses, isPositive: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
        {summaryItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between animate-fade-in transition-all" style={{ animationDelay: `${index * 100}ms` }}>
            <span className="text-muted-foreground">{item.label}</span>
            <span
                className={`font-semibold ${
                item.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
            >
                {item.isPositive ? '+' : '-'} ${item.value.toLocaleString()}
            </span>
            </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between font-bold text-lg">
            <span>Closing Balance</span>
            <span>${closingBalance.toLocaleString()}</span>
        </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Today's Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-48">
                    <div className="space-y-4">
                        {expenses.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).map(expense => (
                            <div key={expense.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{expense.description}</p>
                                    <Badge variant="outline" className="text-xs capitalize">{expense.category}</Badge>
                                </div>
                                <p className="text-muted-foreground font-mono">
                                    ${expense.amount.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
