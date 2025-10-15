'use client';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Client } from '@/lib/types';
import { columns } from '@/components/clients/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const firestore = useFirestore();

  const clientsRef = useMemo(() => collection(firestore, 'clients'), [firestore]);
  const { data: clients, isLoading } = useCollection<Client>(clientsRef as any);

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={clients || []} />
      </CardContent>
    </Card>
  );
}
