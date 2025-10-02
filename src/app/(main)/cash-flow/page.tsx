import { CashFlowSummary } from '@/components/cash-flow/summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CashFlowPage() {
  return (
    <div className="flex justify-center">
       <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Daily Cash Flow</CardTitle>
          <CardDescription>
            Summary of today's financial movements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowSummary />
        </CardContent>
      </Card>
    </div>
  );
}
