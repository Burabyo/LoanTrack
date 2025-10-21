'use client';
import {
  calculateTotalRepayments,
  calculateTotalLoans,
  calculateTotalExpenses,
} from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import type { Loan, Payment, Expense } from '@/lib/types';

type CashFlowSummaryProps = {
    loans: Loan[];
    payments: Payment[];
    expenses: Expense[];
}

export function CashFlowSummary({ loans, payments, expenses }: CashFlowSummaryProps) {
  const openingBalance = 5000; // Mock opening balance
  const cashIn = calculateTotalRepayments(payments, 'today');
  const cashOutLoans = calculateTotalLoans(loans, 'today');
  const cashOutExpenses = calculateTotalExpenses(expenses, 'today');
  const totalCashOut = cashOutLoans + cashOutExpenses;
  const closingBalance = openingBalance + cashIn - totalCashOut;

  const summaryItems = [
    { label: 'Opening Balance', value: openingBalance, isPositive: true },
    { label: 'Cash In (Repayments)', value: cashIn, isPositive: true },
    { label: 'Cash Out (Loans)', value: cashOutLoans, isPositive: false },
    { label: 'Cash Out (Expenses)', value: cashOutExpenses, isPositive: false },
  ];

  const todaysExpenses = expenses.filter(e => new Date(e.date).toDateString() === new Date().toDateString());

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
                        {todaysExpenses.length > 0 ? todaysExpenses.map(expense => (
                            <div key={expense.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{expense.description}</p>
                                    <Badge variant="outline" className="text-xs capitalize">{expense.category}</Badge>
                                </div>
                                <p className="text-muted-foreground font-mono">
                                    ${expense.amount.toFixed(2)}
                                </p>
                            </div>
                        )) : <p className="text-muted-foreground text-center">No expenses recorded today.</p>}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
