'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { AddInvestmentForm } from '@/components/investments/add-investment-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function AdminInvestmentsPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading } = useUser();

  // Properly memoized collection reference
  const investmentsRef = useMemoFirebase(() => {
    if (!firestore) return undefined; // undefined instead of null
    return collection(firestore, 'investments');
  }, [firestore]);

  // Only call useCollection if we have a memoized reference
  const { data: investments, isLoading } = useCollection(investmentsRef);

  if (isUserLoading || !appUser || appUser.role !== 'admin') {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Investment</CardTitle>
        </CardHeader>
        <CardContent>
          <AddInvestmentForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {investments && investments.length > 0 ? (
                investments.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p><strong>Cashier ID:</strong> {inv.cashierId}</p>
                      <p><strong>Source:</strong> {inv.source}</p>
                      <p><strong>Description:</strong> {inv.description}</p>
                      <p><strong>Date:</strong> {new Date(inv.date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="text-green-600 font-mono">
                      UGX {inv.amount.toLocaleString()}
                    </Badge>
                  </div>
                ))
              ) : (
                <p>No investments recorded.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
