'use client';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  calculateTotalRepayments,
  calculateTotalLoans,
  calculateTotalExpenses,
  getRecentActivity,
  getChartData,
} from '@/lib/data';
import StatCard from '@/components/dashboard/stat-card';
import { DollarSign, Landmark, TrendingDown, Users } from 'lucide-react';
import OverviewChart from '@/components/dashboard/overview-chart';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import type { Loan, Payment, Expense, Client } from '@/lib/types';

export default function DashboardPage() {
  const firestore = useFirestore();

  const loansRef = useMemoFirebase(() => collection(firestore, 'loans'), [firestore]);
  const paymentsRef = useMemoFirebase(() => collection(firestore, 'payments'), [firestore]);
  const expensesRef = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);
  const clientsRef = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);

  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: clientsData, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  const isLoading = loansLoading || paymentsLoading || expensesLoading || clientsLoading;

  const totalLoans = useMemo(() => calculateTotalLoans(loansData || []), [loansData]);
  const totalRepayments = useMemo(() => calculateTotalRepayments(paymentsData || []), [paymentsData]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(expensesData || []), [expensesData]);
  const netCashFlow = totalRepayments - (totalLoans + totalExpenses);
  
  const recentActivity = useMemo(() => getRecentActivity(loansData || [], paymentsData || [], expensesData || [], clientsData || [], 5), [loansData, paymentsData, expensesData, clientsData]);
  const chartData = useMemo(() => getChartData(loansData || [], paymentsData || []), [loansData, paymentsData]);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Loans Issued"
          value={`$${totalLoans.toLocaleString()}`}
          icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
          description="Total principal amount given out"
        />
        <StatCard
          title="Total Repayments"
          value={`$${totalRepayments.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total cash collected from clients"
        />
        <StatCard
          title="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          description="Total operational expenses"
        />
        <StatCard
          title="Net Cash Flow"
          value={`$${netCashFlow.toLocaleString()}`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={
            netCashFlow >= 0
              ? 'Positive cash flow'
              : 'Negative cash flow'
          }
          variant={netCashFlow >= 0 ? 'default' : 'destructive'}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityTable data={recentActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
