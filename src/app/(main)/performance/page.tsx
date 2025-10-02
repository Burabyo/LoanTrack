import { CashierAnalysisCard } from '@/components/performance/cashier-analysis-card';
import { cashiers, transactions } from '@/lib/data';

export default function PerformancePage() {
  // Calculate averages across all transactions
  const totalTransactionValue = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const averageTransactionValue =
    transactions.length > 0 ? totalTransactionValue / transactions.length : 0;

  const cashiersWithTransactions = cashiers.map((cashier) => {
    const cashierTransactions = transactions.filter(
      (t) => t.cashierId === cashier.id
    );
    return {
      ...cashier,
      transactions: cashierTransactions,
    };
  });
  
  const averageTransactionCount = transactions.length / cashiers.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold font-headline">Cashier Performance</h1>
        <p className="text-muted-foreground">
          Analyze cashier performance using AI-powered insights.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cashiersWithTransactions.map((cashier) => (
          <CashierAnalysisCard
            key={cashier.id}
            cashier={cashier}
            averageTransactionValue={averageTransactionValue}
            averageTransactionCount={averageTransactionCount}
          />
        ))}
      </div>
    </div>
  );
}
