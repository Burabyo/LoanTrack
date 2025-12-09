'use client';
import { useFirestore, useUser, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CashierInvestmentsPage() {
  const firestore = useFirestore();
  const { appUser } = useUser();

  const investmentsRef = collection(firestore!, 'investments');
  const q = query(investmentsRef, where('cashierId', '==', appUser?.id || ''));

  const { data: investmentsData } = useCollection<any>(q);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle>Your Investments Received</CardTitle></CardHeader>
        <CardContent>
          {investmentsData?.length === 0 && <p>No investments received yet.</p>}
          <ul className="space-y-2">
            {investmentsData?.map(inv => (
              <li key={inv.id} className="border p-2 rounded bg-gray-100">
                <div className="flex justify-between">
                  <span>{inv.description}</span>
                  <span>UGX {inv.amount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Received from: {inv.source} on {new Date(inv.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
