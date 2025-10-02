'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Loan } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';

const statusVariantMap: Record<Loan['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paid: 'secondary',
  overdue: 'outline',
};

export const columns: ColumnDef<Loan & { clientName: string }>[] = [
  {
    accessorKey: 'clientName',
    header: 'Client',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Loan['status'];
      return <Badge variant={statusVariantMap[status]} className="capitalize">{status}</Badge>;
    },
  },
  {
    accessorKey: 'principal',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Principal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('principal'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'totalRepayable',
    header: 'Total Repayable',
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalRepayable'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid',
     cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amountPaid'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => format(new Date(row.getValue('issueDate')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => format(new Date(row.getValue('dueDate')), 'MMM d, yyyy'),
  },
];
