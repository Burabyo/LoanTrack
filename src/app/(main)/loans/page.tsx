'use client';
import { useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { columns } from '@/components/loans/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Loan, Client } from '@/lib/types';
import { AddLoanForm } from '@/components/loans/add-loan-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function LoansPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loansRef = useMemoFirebase(() => firestore ? collection(firestore, 'loans') : null, [firestore]);
  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : null, [firestore]);

  const { data: loans, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  const isLoading = loansLoading || clientsLoading;

  const loansWithClientNames = useMemo(() => {
    if (!loans || !clients) return [];
    return loans.map((loan) => {
      const client = clients.find((c) => c.id === loan.clientId);
      return {
        ...loan,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      };
    });
  }, [loans, clients]);


  if (isLoading) {
    return <div>Loading loans...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={loansWithClientNames as (Loan & { clientName: string })[]}
          filterColumn="clientName"
          newRecordButton={
            <AddLoanForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              clients={clients || []}
              trigger={
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Loan
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
