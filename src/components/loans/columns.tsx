'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Loan, Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { RecordPaymentForm } from './record-payment-form';
import Link from 'next/link';

const statusVariantMap: Record<Loan['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  paid: 'secondary',
  overdue: 'outline',
};

export function LoanActions({ loan }: { loan: Loan & { clientName: string } }) {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  return (
    <>
      <RecordPaymentForm
        isOpen={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        loan={loan}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsPaymentFormOpen(true)}>
            Record Payment
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/loans/${loan.id}`}>View Loan Details</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}


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
   {
    id: 'actions',
    cell: ({ row }) => <LoanActions loan={row.original} />,
  },
];
