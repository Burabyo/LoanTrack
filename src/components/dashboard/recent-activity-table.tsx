import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Activity } from '@/lib/types';
import { format } from 'date-fns';

const variantMap: Record<Activity['type'], 'default' | 'secondary' | 'outline'> = {
  Loan: 'default',
  Payment: 'secondary',
  Expense: 'outline',
};

export function RecentActivityTable({ data }: { data: Activity[] }) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((activity, index) => (
            <TableRow key={index}>
              <TableCell>
                <Badge variant={variantMap[activity.type]}>{activity.type}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                ${activity.amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-xs">
                {format(new Date(activity.date), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
