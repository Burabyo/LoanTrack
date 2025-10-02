import { loans, clients } from '@/lib/data';
import { columns } from '@/components/loans/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Loan } from '@/lib/types';

export default function LoansPage() {
  const loansWithClientNames = loans.map((loan) => {
    const client = clients.find((c) => c.id === loan.clientId);
    return {
      ...loan,
      clientName: client ? client.name : 'Unknown Client',
    };
  });

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
