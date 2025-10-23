'use client';
import { useMemo, useEffect, useState } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { CashFlowSummary } from '@/components/cash-flow/summary';
import { AddExpenseForm } from '@/components/cash-flow/add-expense-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Loan, Payment, Expense } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CashFlowPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isAuthLoading, router]);

  const loansRef = useMemoFirebase(() => firestore ? collection(firestore, 'loans'): null, [firestore]);
  const paymentsRef = useMemoFirebase(() => firestore ? collection(firestore, 'payments'): null, [firestore]);
  const expensesRef = useMemoFirebase(() => firestore ? collection(firestore, 'expenses'): null, [firestore]);

  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);

  const isLoading = loansLoading || paymentsLoading || expensesLoading || isAuthLoading;

  if (isLoading || appUser?.role !== 'admin') {
    return <div>Loading cash flow...</div>;
  }

  return (
    <div className="flex justify-center">
       <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Cash Flow</CardTitle>
            <CardDescription>
              Summary of today's financial movements.
            </CardDescription>
          </div>
          <AddExpenseForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            trigger={
              <Button size="sm" className="h-8 gap-1" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Expense
                </span>
              </Button>
            }
          />
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
