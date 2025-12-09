'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Expense } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '@/lib/format';

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'date',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => format(new Date(row.getValue('date')), 'MMM d, yyyy'),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      return <Badge variant="outline" className="capitalize">{category}</Badge>;
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
     cell: ({ row }) => {
      const raw = row.getValue('amount');
      const amount = Number(raw || 0);
      const formatted = formatCurrency(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
export default columns;
