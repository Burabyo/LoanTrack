// components/clients/client-details-modal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { Client, Loan } from '@/lib/types';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';

type Props = {
  client: Client;
};

export default function ClientDetailsModal({ client }: Props) {
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [loanCount, setLoanCount] = useState<number | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      if (!firestore) return;
      setLoading(true);
      setError(null);
      try {
        const loansRef = collection(firestore, 'loans');
        const q = query(loansRef, where('clientId', '==', client.id), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);
        if (!mounted) return;
        const loans: Loan[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Loan[];
        setRecentLoans(loans);
        // count all loans (simple approach: query without limit)
        const qCount = query(loansRef, where('clientId', '==', client.id));
        const snapAll = await getDocs(qCount);
        if (!mounted) return;
        setLoanCount(snapAll.size);
      } catch (err: any) {
        console.error('Failed to fetch client loans', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [open, firestore, client.id]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">View</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client.firstName} {client.lastName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="font-medium">{client.phoneNumber || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Address</div>
              <div className="font-medium">{client.address || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">National ID</div>
              <div className="font-medium">{(client as any).nationalId || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Guarantor</div>
              <div className="font-medium">
                {(client as any).guarantorName ? `${(client as any).guarantorName} • ${(client as any).guarantorPhone || '-'}` : '-'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Client Type</div>
              <div className="font-medium">
                {(client as any).isNewClient ? 'New client' : 'Returning'}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Loans</div>
              <div className="font-medium">
                {loanCount === null ? (loading ? 'Loading...' : '-') : `${loanCount}`}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Recent loans</div>
            {loading && <div className="py-2">Loading...</div>}
            {error && <div className="text-destructive py-2">{error}</div>}
            {!loading && recentLoans.length === 0 && <div className="py-2 text-muted-foreground">No recent loans</div>}
            {!loading && recentLoans.length > 0 && (
              <div className="space-y-2">
                {recentLoans.map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                    <div>
                      <div className="text-sm font-medium">{r.id}</div>
                      <div className="text-xs text-muted-foreground">{r.status}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency((r.amountDisbursed || 0))}</div>
                      <div className="text-xs text-muted-foreground">{r.issueDate ? format(new Date(r.issueDate), 'MMM d, yyyy') : '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
