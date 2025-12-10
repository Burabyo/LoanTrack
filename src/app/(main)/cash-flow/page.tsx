'use client';
import { useMemo, useEffect } from 'react';
import { collection, FirestoreDataConverter, CollectionReference } from 'firebase/firestore';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { CashFlowSummary } from '@/components/cash-flow/summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Loan, Payment, Expense, Investment } from '@/lib/types';
import { useRouter } from 'next/navigation';

// ----------------------------------
// MOVE converters OUTSIDE the component
// ----------------------------------
const loanConverter: FirestoreDataConverter<Loan> = {
  toFirestore: (loan) => loan,
  fromFirestore: (snap) => snap.data() as Loan,
};

const paymentConverter: FirestoreDataConverter<Payment> = {
  toFirestore: (p) => p,
  fromFirestore: (snap) => snap.data() as Payment,
};

const expenseConverter: FirestoreDataConverter<Expense> = {
  toFirestore: (e) => e,
  fromFirestore: (snap) => snap.data() as Expense,
};

const investmentConverter: FirestoreDataConverter<Investment> = {
  toFirestore: (i) => i,
  fromFirestore: (snap) => snap.data() as Investment,
};

export default function CashFlowPage() {
  const firestore = useFirestore();
  const { appUser, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && appUser?.role !== 'admin') {
      router.push('/');
    }
  }, [appUser, isAuthLoading, router]);

  // ---------------------------
  // Stable memoized collection refs
  // ---------------------------
  const loansRef = useMemo(
    () =>
      firestore
        ? collection(firestore, 'loans').withConverter(loanConverter)
        : undefined,
    [firestore]
  );

  const paymentsRef = useMemo(
    () =>
      firestore
        ? collection(firestore, 'payments').withConverter(paymentConverter)
        : undefined,
    [firestore]
  );

  const expensesRef = useMemo(
    () =>
      firestore
        ? collection(firestore, 'expenses').withConverter(expenseConverter)
        : undefined,
    [firestore]
  );

  const investmentsRef = useMemo(
    () =>
      firestore
        ? collection(firestore, 'investments').withConverter(investmentConverter)
        : undefined,
    [firestore]
  );

  // ---------------------------
  // useCollection safely
  // ---------------------------
  const { data: loansData, isLoading: loansLoading } = useCollection(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection(expensesRef);
  const { data: investmentsData, isLoading: investmentsLoading } = useCollection(investmentsRef);

  const isLoading =
    loansLoading ||
    paymentsLoading ||
    expensesLoading ||
    investmentsLoading ||
    isAuthLoading;

  if (isLoading || appUser?.role !== 'admin') {
    return <div>Loading cash flow...</div>;
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Daily Cash Flow</CardTitle>
          <CardDescription>Summary of today's financial movements.</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowSummary
            loans={loansData || []}
            payments={paymentsData || []}
            expenses={expensesData || []}
            investments={investmentsData || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
