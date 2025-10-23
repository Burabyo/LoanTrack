'use client';
import { useParams } from 'next/navigation';
import {
  collection,
  query,
  where,
  doc,
} from 'firebase/firestore';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import type { Loan, Payment, Expense, User, Client } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { columns as loansColumns } from '@/components/loans/columns';
import { columns as paymentsColumns } from '@/components/payments/columns';
import { columns as expensesColumns } from '@/components/expenses/columns';
import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CashierDetailsPage() {
  const { cashierId } = useParams();
  const firestore = useFirestore();
  const router = useRouter();
  const { appUser, isUserLoading } = useUser();

   useEffect(() => {
    if (!isUserLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isUserLoading, router]);

  const cashierRef = useMemoFirebase(
    () => (firestore && cashierId ? doc(firestore, 'users', cashierId as string) : null),
    [firestore, cashierId]
  );
  const { data: cashier, isLoading: cashierLoading } = useDoc<User>(cashierRef);

  const clientsRef = useMemoFirebase(() => (firestore ? collection(firestore, 'clients') : null), [firestore]);
  const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  // Queries for the cashier's data
  const loansQuery = useMemoFirebase(
    () =>
      firestore && cashierId
        ? query(collection(firestore, 'loans'), where('cashierId', '==', cashierId))
        : null,
    [firestore, cashierId]
  );
  const { data: loans, isLoading: loansLoading } = useCollection<Loan>(loansQuery);
  
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

  const paymentsQuery = useMemoFirebase(
    () =>
      firestore && cashierId
        ? query(collection(firestore, 'payments'), where('cashierId', '==', cashierId))
        : null,
    [firestore, cashierId]
  );
  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(paymentsQuery);

  const paymentsWithClientNames = useMemo(() => {
    if (!payments || !clients) return [];
    return payments.map((payment) => {
        const client = clients.find((c) => c.id === payment.clientId);
        return {
            ...payment,
            clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
        };
    });
}, [payments, clients]);


  const expensesQuery = useMemoFirebase(
    () =>
      firestore && cashierId
        ? query(collection(firestore, 'expenses'), where('cashierId', '==', cashierId))
        : null,
    [firestore, cashierId]
  );
  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const isLoading = cashierLoading || loansLoading || paymentsLoading || expensesLoading || clientsLoading || isUserLoading;
  
  if (isLoading || appUser?.role !== 'admin') {
    return <div>Loading cashier details...</div>;
  }

  if (!cashier) {
    return <div>Cashier not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Details</CardTitle>
          <CardDescription>
            Detailed activity for {cashier.username} (ID: {cashier.id})
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loans Issued</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable filterColumn={undefined} columns={loansColumns} data={loansWithClientNames as (Loan & { clientName: string; })[]} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payments Received</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable filterColumn={undefined} columns={paymentsColumns} data={paymentsWithClientNames as (Payment & { clientName: string; })[]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses Recorded</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable filterColumn={undefined} columns={expensesColumns} data={expenses || []} />
        </CardContent>
      </Card>
    </div>
  );
}
