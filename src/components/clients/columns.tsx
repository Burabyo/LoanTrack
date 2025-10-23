'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';

const statusColorMap: Record<Client['status'], string> = {
  good: 'bg-green-500',
  default: 'bg-gray-500',
  overdue: 'bg-yellow-500',
  delinquent: 'bg-red-500',
};


export const columns: ColumnDef<Client>[] = [
  {
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as Client['status'];
        return (
            <div className="flex items-center gap-2">
                <span className={ `h-2 w-2 rounded-full ${statusColorMap[status]}` } />
                <span className="capitalize">{status}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'isNewClient',
    header: 'Client Type',
    cell: ({ row }) => {
      const isNew = row.getValue('isNewClient') as boolean;
      return <Badge variant={!isNew ? "default" : "secondary"} className="capitalize">{isNew ? 'New' : 'Returning'}</Badge>;
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  }
];
