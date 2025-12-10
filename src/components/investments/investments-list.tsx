// src/components/investments/investments-list.tsx
'use client';

import type { Investment } from '@/lib/types';
import { format } from 'date-fns';

export function InvestmentsList({ investments }: { investments: Investment[] }) {
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
          {investments.map((inv, idx) => (
            <tr key={inv.id ?? idx} className="border-t">
              <td className="py-2">{inv.date ? format(new Date(inv.date), 'MMM d, yyyy') : '—'}</td>
              <td className="py-2 font-mono">UGX {Number(inv.amount || 0).toLocaleString()}</td>
              <td className="py-2">{inv.source || 'Unknown'}</td>
              <td className="py-2">{inv.cashierId || '—'}</td>
              <td className="py-2">{inv.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
