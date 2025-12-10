// src/components/investments/investments-list.tsx
'use client';

import { useMemo, useEffect, useState } from 'react';
import type { Investment } from '@/lib/types';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserMap {
  [uid: string]: { email?: string; username?: string };
}

export function InvestmentsList({ investments }: { investments: Investment[] }) {
  const firestore = useFirestore();
  const [usersMap, setUsersMap] = useState<UserMap>({});

  const cashierIds = useMemo(
    () => investments.map(i => i.cashierId).filter(Boolean) as string[],
    [investments]
  );

  useEffect(() => {
    if (!firestore || cashierIds.length === 0) return;

    async function fetchUsers() {
      const map: UserMap = {};
      for (const uid of cashierIds) {
        try {
          const snap = await getDoc(doc(firestore, 'users', uid));
          if (snap.exists()) {
            map[uid] = snap.data() as { email?: string; username?: string };
          } else {
            map[uid] = { email: 'Unknown' };
          }
        } catch (err) {
          console.error('Error fetching user', uid, err);
          map[uid] = { email: 'Unknown' };
        }
      }
      setUsersMap(map);
    }

    fetchUsers();
  }, [firestore, cashierIds]);

  if (!investments || investments.length === 0) {
    return <div className="text-muted-foreground">No investments found.</div>;
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>Date</th>
            <th>Amount</th>
            <th>Source</th>
            <th>Received By</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv, idx) => {
            const uid = inv.cashierId;
            const user = uid ? usersMap[uid] : null;
            const receivedBy = user?.username || user?.email || '—';
            return (
              <tr key={inv.id ?? idx} className="border-t">
                <td className="py-2">{inv.date ? format(new Date(inv.date), 'MMM d, yyyy') : '—'}</td>
                <td className="py-2 font-mono">UGX {Number(inv.amount || 0).toLocaleString()}</td>
                <td className="py-2">{inv.source || 'Unknown'}</td>
                <td className="py-2">{receivedBy}</td>
                <td className="py-2">{inv.description || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
