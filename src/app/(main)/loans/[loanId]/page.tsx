'use client';
import { useParams } from 'next/navigation';
import { doc, collection, query, where } from 'firebase/firestore';
import {
  useDoc,
  useCollection,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import type { Loan, Payment, Client } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

function LoanDetail({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={`text-sm text-foreground ${className}`}>{value}</dd>
    </div>
  );
}

export default function LoanDetailsPage() {
  const { loanId } = useParams();
  const firestore = useFirestore();

  const loanRef = useMemoFirebase(
    () => (firestore && loanId ? doc(firestore, 'loans', loanId as string) : null),
    [firestore, loanId]
  );
  const { data: loan, isLoading: loanLoading } = useDoc<Loan>(loanRef);

  const clientRef = useMemoFirebase(
    () => (firestore && loan ? doc(firestore, 'clients', loan.clientId) : null),
    [firestore, loan]
  );
  const { data: client, isLoading: clientLoading } = useDoc<Client>(clientRef);

  const paymentsQuery = useMemoFirebase(
    () =>
      firestore && loanId
        ? query(collection(firestore, 'payments'), where('loanId', '==', loanId))
        : null,
    [firestore, loanId]
  );
  const { data: payments, isLoading: paymentsLoading } = useCollection<Payment>(
    paymentsQuery
  );

  const isLoading = loanLoading || clientLoading || paymentsLoading;

  if (isLoading) {
    return <div>Loading loan details...</div>;
  }

  if (!loan || !client) {
    return <div>Loan or client not found.</div>;
  }

  const progress = (loan.amountPaid / loan.totalRepayable) * 100;
  const remainingBalance = loan.totalRepayable - loan.amountPaid;

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <div className="md:col-span-3 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
            <CardDescription>
              For {client.firstName} {client.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2">
              <LoanDetail label="Loan ID" value={loan.id} className="font-mono text-xs" />
            <LoanDetail
  label="Status"
  value={<Badge className="capitalize">{loan.status}</Badge>}
/>

              <LoanDetail
                label="Principal"
                value={currencyFormatter.format(loan.principal)}
              />
              <LoanDetail
                label="Total Repayable"
                value={currencyFormatter.format(loan.totalRepayable)}
              />
              <LoanDetail
                label="Amount Paid"
                value={currencyFormatter.format(loan.amountPaid)}
                className="text-green-500"
              />
              <LoanDetail
                label="Remaining Balance"
                value={currencyFormatter.format(remainingBalance)}
                className="font-semibold"
              />
              <LoanDetail
                label="Issue Date"
                value={format(new Date(loan.issueDate), 'PPP')}
              />
              <LoanDetail
                label="Due Date"
                value={format(new Date(loan.dueDate), 'PPP')}
              />
            </dl>
            <div>
              <Label className="text-sm text-muted-foreground">Repayment Progress</Label>
              <Progress value={progress} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-5 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              All payments recorded for this loan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments && payments.length > 0 ? (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.paymentDate), 'PPP')}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {currencyFormatter.format(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
