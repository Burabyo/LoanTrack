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
import type { Loan, Payment, Expense, Investment } from '@/lib/types';
import { format } from 'date-fns';

type CashFlowSummaryProps = {
    loans: Loan[];
    payments: Payment[];
    expenses: Expense[];
    investments: Investment[];
}

export function CashFlowSummary({ loans, payments, expenses, investments }: CashFlowSummaryProps) {
  const openingBalance = 5000; // Mock opening balance

  // Filter today's data
  const today = new Date().toDateString();
  const todaysPayments = payments.filter(p => new Date(p.paymentDate).toDateString() === today);
  const todaysLoans = loans.filter(l => new Date(l.issueDate).toDateString() === today);
  const todaysExpenses = expenses.filter(e => new Date(e.date).toDateString() === today);
  const todaysInvestments = investments.filter(i => new Date(i.date).toDateString() === today);

  const cashIn = calculateTotalRepayments(todaysPayments, 'today') + todaysInvestments.reduce((sum, i) => sum + i.amount, 0);
  const cashOutLoans = calculateTotalLoans(todaysLoans, 'today');
  const cashOutExpenses = calculateTotalExpenses(todaysExpenses, 'today');
  const totalCashOut = cashOutLoans + cashOutExpenses;
  const closingBalance = openingBalance + cashIn - totalCashOut;

  const summaryItems = [
    { label: 'Opening Balance', value: openingBalance, isPositive: true },
    { label: 'Cash In (Repayments + Investments)', value: cashIn, isPositive: true },
    { label: 'Cash Out (Loans)', value: cashOutLoans, isPositive: false },
    { label: 'Cash Out (Expenses)', value: cashOutExpenses, isPositive: false },
  ];

  const formatCurrency = (amount: number) => `UGX ${amount.toLocaleString()}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Summary Panel */}
      <div className="space-y-6">
        {summaryItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between animate-fade-in transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className={`font-semibold ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {item.isPositive ? '+' : '-'} {formatCurrency(item.value)}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between font-bold text-lg">
          <span>Closing Balance</span>
          <span>{formatCurrency(closingBalance)}</span>
        </div>
      </div>

      {/* Today's Transactions */}
      <div className="space-y-4">
        {/* Expenses */}
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
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                )) : <p className="text-muted-foreground text-center">No expenses recorded today.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Investments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-4">
                {todaysInvestments.length > 0 ? todaysInvestments.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{inv.source}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(inv.date), 'MMM d, yyyy')}</p>
                    </div>
                    <p className="text-green-500 font-mono">{formatCurrency(inv.amount)}</p>
                  </div>
                )) : <p className="text-muted-foreground text-center">No investments recorded today.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
