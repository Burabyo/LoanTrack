'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Payment } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { formatCurrency } from '@/lib/format';

export const columns: ColumnDef<Payment & { clientName: string }>[] = [
  {
    accessorKey: 'paymentDate',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Payment Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => format(new Date(row.getValue('paymentDate')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'clientName',
    header: 'Client',
  },
  {
    accessorKey: 'loanId',
    header: 'Loan ID',
  },
  {
    accessorKey: 'amount',
    header: 'Amount Paid',
     cell: ({ row }) => {
      const raw = row.getValue('amount');
      const amount = Number(raw || 0);
      const formatted = formatCurrency(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
export default columns;
