'use client';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { loans as mockLoans, clients as mockClients } from '@/lib/data';
import { columns } from '@/components/loans/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Loan, Client } from '@/lib/types';

export default function LoansPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const loansRef = useMemoFirebase(() => collection(firestore, 'loans'), [firestore]);
  const clientsRef = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);

  const { data: loans, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  const isLoading = loansLoading || clientsLoading;

  const loansWithClientNames = useMemo(() => {
    if (!loans || !clients) return [];
    return loans.map((loan) => {
      const client = clients.find((c) => c.id === loan.clientId);
      return {
        ...loan,
        clientName: client ? client.name : 'Unknown Client',
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
        <DataTable columns={columns} data={loansWithClientNames as (Loan & { clientName: string })[]} />
      </CardContent>
    </Card>
  );
}
