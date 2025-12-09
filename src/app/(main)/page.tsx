'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, doc, getDoc } from 'firebase/firestore';
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
import { OverdueLoansCard } from '@/components/dashboard/overdue-loans-card';
import { getAuth } from 'firebase/auth';

export default function DashboardPage() {
  const firestore = useFirestore();

  // --- role / uid state
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = still checking

  // get current uid
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUid(user.uid);
      return;
    }
    const unsub = auth.onAuthStateChanged(u => setCurrentUid(u ? u.uid : null));
    return () => unsub();
  }, []);

  // check roles_admin/{uid} to determine admin
  useEffect(() => {
    if (!firestore || !currentUid) return;
    let mounted = true;
    (async () => {
      try {
        const adminRef = doc(firestore, 'roles_admin', currentUid);
        const snap = await getDoc(adminRef);
        if (!mounted) return;
        setIsAdmin(snap.exists());
      } catch (err) {
        console.error('Error checking admin role:', err);
        if (!mounted) return;
        setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, [firestore, currentUid]);

  // -------------------------
  // Build collection refs (always defined synchronously - may be null while loading)
  // -------------------------
  const loansRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // while we're still determining role or uid, return null so hooks order is stable
    if (isAdmin === null || currentUid === null) return null;
    if (isAdmin) return collection(firestore, 'loans');
    return query(collection(firestore, 'loans'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const paymentsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null || currentUid === null) return null;
    if (isAdmin) return collection(firestore, 'payments');
    return query(collection(firestore, 'payments'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const expensesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null || currentUid === null) return null;
    if (isAdmin) return collection(firestore, 'expenses');
    return query(collection(firestore, 'expenses'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const clientsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // keep clients unfiltered for now; change if you want cashier-scoped clients
    return collection(firestore, 'clients');
  }, [firestore]);

  // -------------------------
  // Hooks called in consistent order (must support null refs)
  // -------------------------
  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: clientsData, isLoading: clientsLoading } = useCollection<Client>(clientsRef);

  // while role/uid or collections loading, show loading
  const loadingRole = isAdmin === null || currentUid === null;
  const isLoading = loadingRole || loansLoading || paymentsLoading || expensesLoading || clientsLoading;

  const totalLoans = useMemo(() => calculateTotalLoans(loansData || []), [loansData]);
  const totalRepayments = useMemo(() => calculateTotalRepayments(paymentsData || []), [paymentsData]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(expensesData || []), [expensesData]);
  const netCashFlow = totalRepayments - (totalLoans + totalExpenses);
  
  const recentActivity = useMemo(() => getRecentActivity(loansData || [], paymentsData || [], expensesData || [], clientsData || [], 5), [loansData, paymentsData, expensesData, clientsData]);
  const chartData = useMemo(() => getChartData(loansData || [], paymentsData || []), [loansData, paymentsData]);

  const overdueLoans = useMemo(() => {
    if (!loansData || !clientsData) return [];
    return loansData
      .filter(loan => loan.status === 'overdue' || (new Date(loan.dueDate) < new Date() && loan.status !== 'paid'))
      .map(loan => {
        const client = clientsData.find(c => c.id === loan.clientId);
        return {
          ...loan,
          clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
        };
      });
  }, [loansData, clientsData]);

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
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <OverviewChart data={chartData} />
              </CardContent>
            </Card>
            <OverdueLoansCard loans={overdueLoans} />
        </div>
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
