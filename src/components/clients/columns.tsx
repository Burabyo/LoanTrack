// components/clients/columns.ts
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Client } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import ClientDetailsModal from './client-details-modal';

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
          <span className={`h-2 w-2 rounded-full ${statusColorMap[status]}`} />
          <span className="capitalize">{status}</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'isNewClient',
    header: 'Client Type',
    cell: ({ row }) => {
      const isNew = row.getValue('isNewClient') as boolean;
      // Clear labels: "New client" vs "Returning"
      return (
        <Badge
          variant={isNew ? "destructive" : "secondary"}
          className="capitalize"
        >
          {isNew ? 'New client' : 'Returning'}
        </Badge>
      );
    },
  },

  // contact & optional fields
  {
    accessorKey: 'nationalId',
    header: 'National ID',
    cell: ({ row }) => (row.getValue('nationalId') || '-') as string,
  },

  {
    accessorKey: 'guarantorName',
    header: 'Guarantor Name',
    cell: ({ row }) => (row.getValue('guarantorName') || '-') as string,
  },

  {
    accessorKey: 'guarantorPhone',
    header: 'Guarantor Phone',
    cell: ({ row }) => (row.getValue('guarantorPhone') || '-') as string,
  },

  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },

  // actions column -> opens client details modal
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const client = row.original as Client;
      return (
        <div className="flex gap-2">
          {/* ClientDetailsModal renders its own trigger */}
          <ClientDetailsModal client={client} />
        </div>
      );
    },
  },
];

export default columns;
