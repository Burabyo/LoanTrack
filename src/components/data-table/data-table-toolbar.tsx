'use client';

import type { Table } from '@tanstack/react-table';
import { PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReactNode } from 'react';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterColumn?: string;
  newRecordButton?: ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  filterColumn = 'name',
  newRecordButton,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const filterValue = (table.getColumn(filterColumn)?.getFilterValue() as string) ?? '';

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter records..."
          value={filterValue}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {newRecordButton}
    </div>
  );
}
