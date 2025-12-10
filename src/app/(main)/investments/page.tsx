// src/app/(main)/investments/page.tsx
'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddInvestmentForm } from '@/components/investments/add-investment-form';
import { InvestmentsList } from '@/components/investments/investments-list';
import type { Investment } from '@/lib/types';

export default function InvestmentsPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading } = useUser();

  // build a stable ref using useMemo (returns undefined until firestore ready)
  const investmentsRef = useMemo(() => {
    if (!firestore) return undefined;
    return collection(firestore, 'investments');
  }, [firestore]);

  const { data: investmentsData, isLoading } = useCollection<Investment>(investmentsRef);

  if (isUserLoading) return <div>Loading...</div>;

  const isAdmin = appUser?.role === 'admin';
  const currentUid = appUser?.id ?? (appUser as any)?.id ?? null;

  const visibleInvestments = useMemo(() => {
    if (!investmentsData) return [];
    if (isAdmin) return investmentsData;
    if (!currentUid) return [];
    return investmentsData.filter(inv => (inv.cashierId || '') === currentUid);
  }, [investmentsData, isAdmin, currentUid]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Investments</CardTitle>
          {isAdmin && <AddInvestmentForm />}
        </CardHeader>
        <CardContent>
          <InvestmentsList investments={visibleInvestments} />
        </CardContent>
      </Card>
    </div>
  );
}
