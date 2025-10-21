'use client';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Payment, Client, Loan } from '@/lib/types';
import { columns } from '@/components/payments/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentsPage() {
  const firestore = useFirestore();

  const paymentsRef = useMemoFirebase(() => firestore ? collection(firestore, 'payments') : null, [firestore]);
  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : null, [firestore]);
  const loansRef = useMemoFirebase(() => firestore ? collection(firestore, 'loans') : null, [firestore]);

  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);
  const { data: loans, isLoading: loansLoading } = useCollection<Loan>(loansRef);

  const isLoading = paymentsLoading || clientsLoading || loansLoading;

  const paymentsWithDetails = useMemo(() => {
    if (!payments || !clients || !loans) return [];
    return payments.map((payment) => {
      const client = clients.find((c) => c.id === payment.clientId);
      return {
        ...payment,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      };
    });
  }, [payments, clients, loans]);


  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={paymentsWithDetails}
          filterColumn="clientName"
        />
      </CardContent>
    </Card>
  );
}
