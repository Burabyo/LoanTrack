'use client';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { CashFlowSummary } from '@/components/cash-flow/summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Loan, Payment, Expense } from '@/lib/types';

export default function CashFlowPage() {
  const firestore = useFirestore();

  const loansRef = useMemoFirebase(() => collection(firestore, 'loans'), [firestore]);
  const paymentsRef = useMemoFirebase(() => collection(firestore, 'payments'), [firestore]);
  const expensesRef = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);

  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);

  const isLoading = loansLoading || paymentsLoading || expensesLoading;

  if (isLoading) {
    return <div>Loading cash flow...</div>;
  }

  return (
    <div className="flex justify-center">
       <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Daily Cash Flow</CardTitle>
          <CardDescription>
            Summary of today's financial movements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowSummary 
            loans={loansData || []}
            payments={paymentsData || []}
            expenses={expensesData || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
