'use client';
import { useState } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Expense } from '@/lib/types';
import { columns } from '@/components/expenses/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddExpenseForm } from '@/components/cash-flow/add-expense-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ExpensesPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const expensesRef = useMemoFirebase(() => firestore ? collection(firestore, 'expenses') : null, [firestore]);
  const { data: expenses, isLoading } = useCollection<Expense>(expensesRef);

  if (isLoading) {
    return <div>Loading expenses...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Management</CardTitle>
        <CardDescription>Record and manage all operational expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={expenses || []}
          filterColumn="description"
          newRecordButton={
            <AddExpenseForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              trigger={
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Expense
                  </span>
                </Button>
              }
            />
          }
        />
      </CardContent>
    </Card>
  );
}
