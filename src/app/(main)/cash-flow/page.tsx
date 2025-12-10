// src/app/(main)/cash-flow/page.tsx
'use client';
import { useMemo, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { CashFlowSummary } from '@/components/cash-flow/summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Loan, Payment, Expense, Investment } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function CashFlowPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isAuthLoading, router]);

  const loansRef = useMemo(() => (firestore ? collection(firestore, 'loans') : undefined), [firestore]);
  const paymentsRef = useMemo(() => (firestore ? collection(firestore, 'payments') : undefined), [firestore]);
  const expensesRef = useMemo(() => (firestore ? collection(firestore, 'expenses') : undefined), [firestore]);
  const investmentsRef = useMemo(() => (firestore ? collection(firestore, 'investments') : undefined), [firestore]);

  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: investmentsData, isLoading: investmentsLoading } = useCollection<Investment>(investmentsRef);

  const isLoading =
    loansLoading ||
    paymentsLoading ||
    expensesLoading ||
    investmentsLoading ||
    isAuthLoading;

  if (isLoading || appUser?.role !== 'admin') {
    return <div>Loading cash flow...</div>;
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Daily Cash Flow</CardTitle>
          <CardDescription>Summary of today's financial movements.</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowSummary
            loans={loansData || []}
            payments={paymentsData || []}
            expenses={expensesData || []}
            investments={investmentsData || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
