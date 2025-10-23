'use client';

import type { Loan, Payment, Expense, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

type CashierWithData = User & {
  loans: Loan[];
  payments: Payment[];
  expenses: Expense[];
};

type CashierAnalysisCardProps = {
  cashier: CashierWithData;
};

export function CashierAnalysisCard({
  cashier,
}: CashierAnalysisCardProps) {
  
  const loansIssued = cashier.loans.length;
  const totalLoanValue = cashier.loans.reduce((sum, l) => sum + l.principal, 0);
  const paymentsReceived = cashier.payments.length;
  const totalPaymentValue = cashier.payments.reduce((sum, p) => sum + p.amount, 0);
  const expensesRecorded = cashier.expenses.length;
  const totalExpenseValue = cashier.expenses.reduce((sum, e) => sum + e.amount, 0);


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle className="font-headline">{cashier.username}</CardTitle>
          <CardDescription>Cashier ID: {cashier.id}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex justify-around text-center text-sm">
          <div>
            <p className="font-bold text-lg">{loansIssued}</p>
            <p className="text-muted-foreground">Loans Issued</p>
          </div>
          <div>
            <p className="font-bold text-lg">${totalLoanValue.toLocaleString()}</p>
            <p className="text-muted-foreground">Total Value</p>
          </div>
          <div>
            <p className="font-bold text-lg">{paymentsReceived}</p>
            <p className="text-muted-foreground">Payments</p>
          </div>
        </div>
         <div className="flex justify-around text-center text-sm">
          <div>
            <p className="font-bold text-lg">${totalPaymentValue.toLocaleString()}</p>
            <p className="text-muted-foreground">Payments Value</p>
          </div>
          <div>
            <p className="font-bold text-lg">{expensesRecorded}</p>
            <p className="text-muted-foreground">Expenses</p>
          </div>
          <div>
            <p className="font-bold text-lg">${totalExpenseValue.toFixed(2)}</p>
            <p className="text-muted-foreground">Expense Value</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/performance/${cashier.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
