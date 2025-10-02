import { clients } from '@/lib/data';
import { columns } from '@/components/clients/columns';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Management</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={clients} />
      </CardContent>
    </Card>
  );
}
