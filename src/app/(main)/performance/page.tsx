'use client';

import { useMemo, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { User, Loan, Payment, Expense } from '@/lib/types';
import { CashierAnalysisCard } from '@/components/performance/cashier-analysis-card';
import { useRouter } from 'next/navigation';


export default function PerformancePage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isUserLoading, router]);

  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: usersData, isLoading: usersLoading } = useCollection<User>(usersRef);
  
  const loansRef = useMemoFirebase(() => collection(firestore, 'loans'), [firestore]);
  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);

  const paymentsRef = useMemoFirebase(() => collection(firestore, 'payments'), [firestore]);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);

  const expensesRef = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);

  const isLoading = usersLoading || loansLoading || paymentsLoading || expensesLoading || isUserLoading;

  const cashiers = useMemo(() => {
    return usersData?.filter(user => user.role === 'cashier') || [];
  }, [usersData]);

  const cashiersWithData = useMemo(() => {
    if (!loansData || !paymentsData || !expensesData) {
      return [];
    }

    return cashiers.map((cashier) => {
      const cashierLoans = loansData.filter(l => l.cashierId === cashier.id);
      const cashierPayments = paymentsData.filter(p => p.cashierId === cashier.id);
      const cashierExpenses = expensesData.filter(e => e.cashierId === cashier.id);

      return {
        ...cashier,
        loans: cashierLoans,
        payments: cashierPayments,
        expenses: cashierExpenses,
      };
    });
  }, [cashiers, loansData, paymentsData, expensesData]);

  if (isLoading || appUser?.role !== 'admin') {
    return <div>Loading performance data...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Cashier Performance</h1>
        <p className="text-muted-foreground">
          Review key performance metrics for each cashier.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cashiersWithData.map((cashier) => (
          <CashierAnalysisCard
            key={cashier.id}
            cashier={cashier}
          />
        ))}
      </div>
    </div>
  );
}
