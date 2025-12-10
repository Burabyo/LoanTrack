// src/app/(main)/investments/page.tsx
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddInvestmentForm } from '@/components/investments/add-investment-form';
import { InvestmentsList } from '@/components/investments/investments-list';
import type { Investment } from '@/lib/types';

export default function InvestmentsPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading } = useUser();

  // Properly memoized Firestore reference
  const investmentsRef = useMemoFirebase(() => {
    if (!firestore) return undefined;
    return collection(firestore, 'investments');
  }, [firestore]);

  // Subscribe to Firestore collection
  const { data: investmentsData, isLoading } = useCollection<Investment>(investmentsRef);

  // Wait until user is loaded
  if (isUserLoading) return <div>Loading...</div>;

  // Check if user is admin
  const isAdmin = appUser?.role === 'admin';
  const currentUid = appUser?.id ?? null;

  // Filter investments based on role
  const visibleInvestments = useMemo(() => {
    if (!investmentsData) return [];
    if (isAdmin) return investmentsData; // Admin sees all
    if (!currentUid) return [];
    return investmentsData.filter(inv => inv.cashierId === currentUid); // Cashier sees only theirs
  }, [investmentsData, isAdmin, currentUid]);

  // Debugging logs
  console.log('appUser:', appUser);
  console.log('investmentsData:', investmentsData);
  console.log('visibleInvestments:', visibleInvestments);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Investments</CardTitle>
          {/* Only admin can add new investments */}
          {isAdmin && <AddInvestmentForm />}
        </CardHeader>
        <CardContent>
          {/* Show loading state if investments are loading */}
          {isLoading ? (
            <div>Loading investments...</div>
          ) : (
            <InvestmentsList investments={visibleInvestments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
