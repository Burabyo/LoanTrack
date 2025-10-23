'use client';
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
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { Loan } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

type OverdueLoansCardProps = {
  loans: (Loan & { clientName: string })[];
};

export function OverdueLoansCard({ loans }: OverdueLoansCardProps) {
  const sortedLoans = loans.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <Card className="border-destructive">
      <CardHeader className="flex flex-row items-center gap-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <div>
          <CardTitle>Overdue Loans</CardTitle>
          <CardDescription>
            These loans have passed their due date and require attention.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {sortedLoans.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLoans.map((loan) => {
                const daysOverdue = differenceInDays(new Date(), new Date(loan.dueDate));
                const remainingBalance = loan.totalRepayable - loan.amountPaid;
                return (
                  <TableRow key={loan.id} className="hover:bg-destructive/10">
                    <TableCell className="font-medium">{loan.clientName}</TableCell>
                    <TableCell>{daysOverdue > 0 ? `${daysOverdue} days` : 'Today'}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${remainingBalance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/loans/${loan.id}`}>View</Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No overdue loans. Great work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
