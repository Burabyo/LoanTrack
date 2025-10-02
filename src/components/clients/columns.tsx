'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';

const statusVariantMap: Record<Client['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  good: 'secondary',
  default: 'outline',
  overdue: 'default',
  delinquent: 'destructive',
};

const statusColorMap: Record<Client['status'], string> = {
  good: 'bg-green-500',
  default: 'bg-gray-500',
  overdue: 'bg-yellow-500',
  delinquent: 'bg-red-500',
};


export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
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
    accessorKey: 'type',
    header: 'Client Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return <Badge variant={type === 'returning' ? "default" : "secondary"} className="capitalize">{type}</Badge>;
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number',
  },
];
