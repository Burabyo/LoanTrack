'use client';
import { useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { columns } from '@/components/loans/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Loan, Client } from '@/lib/types';

export default function LoansPage() {
  const firestore = useFirestore();
  const { user } = useUser();

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
        <DataTable columns={columns} data={loansWithClientNames as (Loan & { clientName: string })[]} filterColumn="clientName" />
      </CardContent>
    </Card>
  );
}
