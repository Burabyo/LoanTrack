'use client';
import { useState } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Client } from '@/lib/types';
import { columns } from '@/components/clients/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddClientForm } from '@/components/clients/add-client-form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function ClientsPage() {
  const firestore = useFirestore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : null, [firestore]);
  const { data: clients, isLoading } = useCollection<Client>(clientsRef);

  if (isLoading) {
    return <div>Loading clients...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={clients || []}
          newRecordButton={
            <AddClientForm
              isOpen={isFormOpen}
              onOpenChange={setIsFormOpen}
              trigger={
                <Button size="sm" className="h-8 gap-1" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Client
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
