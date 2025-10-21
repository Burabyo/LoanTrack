'use client';

import { useMemo, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Cashier, Transaction, User } from '@/lib/types';
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

  const transactionsRef = useMemoFirebase(() => collection(firestore, 'transactions'), [firestore]);
  const { data: transactionsData, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsRef);

  const isLoading = usersLoading || transactionsLoading || isUserLoading;

  const cashiers = useMemo(() => {
    return usersData?.filter(user => user.role === 'cashier') || [];
  }, [usersData]);

  const { cashiersWithTransactions, averageTransactionValue, averageTransactionCount } = useMemo(() => {
    if (!transactionsData || !cashiers) {
      return {
        cashiersWithTransactions: [],
        averageTransactionValue: 0,
        averageTransactionCount: 0,
      };
    }

    const totalTransactionValue = transactionsData.reduce((sum, t) => sum + t.amount, 0);
    const avgTransactionValue = transactionsData.length > 0 ? totalTransactionValue / transactionsData.length : 0;
    const avgTransactionCount = cashiers.length > 0 ? transactionsData.length / cashiers.length : 0;

    const populatedCashiers = cashiers.map((cashier) => {
      const cashierTransactions = transactionsData.filter(t => t.cashierId === cashier.id);
      return {
        ...cashier,
        transactions: cashierTransactions,
      };
    });

    return {
      cashiersWithTransactions: populatedCashiers,
      averageTransactionValue: avgTransactionValue,
      averageTransactionCount: avgTransactionCount,
    };
  }, [transactionsData, cashiers]);

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
        {cashiersWithTransactions.map((cashier) => (
          <CashierAnalysisCard
            key={cashier.id}
            cashier={cashier}
          />
        ))}
      </div>
    </div>
  );
}
