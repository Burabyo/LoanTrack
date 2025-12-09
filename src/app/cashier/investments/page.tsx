'use client';

import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function CashierInvestmentsPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading } = useUser();

  const investmentsRef = useMemoFirebase(() => {
    if (!firestore || !appUser) return null;
    // Only show investments for this cashier
    return query(collection(firestore, 'investments'), where('cashierId', '==', appUser.id));
  }, [firestore, appUser]);

  const { data: investments, isLoading } = useCollection(investmentsRef);

  if (isUserLoading || !appUser || appUser.role !== 'cashier') {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Investments</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {investments?.length ? investments.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <p><strong>Source:</strong> {inv.source}</p>
                  <p><strong>Description:</strong> {inv.description}</p>
                  <p><strong>Date:</strong> {new Date(inv.date).toLocaleDateString()}</p>
                </div>
                <Badge className="text-green-600 font-mono">UGX {inv.amount.toLocaleString()}</Badge>
              </div>
            )) : <p className="text-muted-foreground text-center">No investments assigned to you.</p>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
