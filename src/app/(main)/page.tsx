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
import type { Loan, Payment, Expense, Client, Investment } from '@/lib/types';
import { OverdueLoansCard } from '@/components/dashboard/overdue-loans-card';
import { getAuth } from 'firebase/auth';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

export default function DashboardPage() {
  const firestore = useFirestore();
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCashierReport, setSelectedCashierReport] = useState<any>(null);

  // Auth
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

  // Check admin role
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

  // Collection refs
  const loansRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return undefined;
    return isAdmin
      ? collection(firestore, 'loans')
      : query(collection(firestore, 'loans'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const paymentsRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return undefined;
    return isAdmin
      ? collection(firestore, 'payments')
      : query(collection(firestore, 'payments'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const expensesRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return undefined;
    return isAdmin
      ? collection(firestore, 'expenses')
      : query(collection(firestore, 'expenses'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  // NEW: investments
  const investmentsRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return undefined;
    return isAdmin
      ? collection(firestore, 'investments')
      : query(collection(firestore, 'investments'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const clientsRef = useMemoFirebase(() => firestore ? collection(firestore, 'clients') : undefined, [firestore]);
  const usersRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null) return undefined;
    return isAdmin ? collection(firestore, 'users') : undefined;
  }, [firestore, isAdmin]);

  // Hooks
  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: investmentsData, isLoading: investmentsLoading } = useCollection<Investment>(investmentsRef);
  const { data: clientsData, isLoading: clientsLoading } = useCollection<Client>(clientsRef);
  const { data: usersData, isLoading: usersLoading } = useCollection<any>(usersRef);

  const loadingRole = isAdmin === null || currentUid === null;
  const isLoading = loadingRole || loansLoading || paymentsLoading || expensesLoading || investmentsLoading || clientsLoading || usersLoading;

  // Totals
  const totalLoans = useMemo(() => calculateTotalLoans(loansData || []), [loansData]);
  const totalRepayments = useMemo(() => calculateTotalRepayments(paymentsData || []), [paymentsData]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(expensesData || []), [expensesData]);
  const totalInvestments = useMemo(() => (investmentsData || []).reduce((sum, i) => sum + (i.amount || 0), 0), [investmentsData]);
  const netCashFlow = totalRepayments - (totalLoans + totalExpenses + totalInvestments);

  const recentActivity = useMemo(() =>
    getRecentActivity(loansData || [], paymentsData || [], expensesData || [], clientsData || [], 5), 
    [loansData, paymentsData, expensesData, clientsData]
  );

  const chartData = useMemo(() => getChartData(loansData || [], paymentsData || []), [loansData, paymentsData]);

  const overdueLoans = useMemo(() => {
    if (!loansData || !clientsData) return [];
    return loansData
      .filter(loan => loan.status === 'overdue' || (new Date(loan.dueDate) < new Date() && loan.status !== 'paid'))
      .map(loan => {
        const client = clientsData.find(c => c.id === loan.clientId);
        return { ...loan, clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client' };
      });
  }, [loansData, clientsData]);

  // Admin cashier reports
  const cashierReports = useMemo(() => {
    if (!isAdmin || !(loansData || paymentsData || expensesData || usersData)) return [];
    const reportsMap = new Map<string, any>();
    (usersData || []).forEach((u: any) => {
      if (u.role === 'cashier') {
        reportsMap.set(u.id, { cashierId: u.id, username: u.username || u.email || u.id, totalLoans: 0, totalRepayments: 0, totalExpenses: 0, totalInvestments: 0, loans: [], payments: [], expenses: [], investments: [] });
      }
    });
    const ensure = (id: string) => {
      if (!reportsMap.has(id)) {
        reportsMap.set(id, { cashierId: id, username: id, totalLoans: 0, totalRepayments: 0, totalExpenses: 0, totalInvestments: 0, loans: [], payments: [], expenses: [], investments: [] });
      }
      return reportsMap.get(id)!;
    };
    (loansData || []).forEach(l => { const r = ensure(l.cashierId || 'unknown'); r.totalLoans += l.amountDisbursed || 0; r.loans.push(l); });
    (paymentsData || []).forEach(p => { const r = ensure(p.cashierId || 'unknown'); r.totalRepayments += p.amount || 0; r.payments.push(p); });
    (expensesData || []).forEach(e => { const r = ensure(e.cashierId || 'unknown'); r.totalExpenses += e.amount || 0; r.expenses.push(e); });
    (investmentsData || []).forEach(i => { const r = ensure(i.id || 'unknown'); r.totalInvestments += i.amount || 0; r.investments.push(i); });
    return Array.from(reportsMap.values());
  }, [isAdmin, loansData, paymentsData, expensesData, investmentsData, usersData]);

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Total Loans Issued" value={formatCurrency(totalLoans)} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} description="Total principal amount given out" />
        <StatCard title="Total Repayments" value={formatCurrency(totalRepayments)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total cash collected from clients" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />} description="Total operational expenses" />
        <StatCard title="Total Investments" value={formatCurrency(totalInvestments)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total investments processed" />
        <StatCard title="Net Cash Flow" value={formatCurrency(netCashFlow)} icon={<Users className="h-4 w-4 text-muted-foreground" />} description={netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'} variant={netCashFlow >= 0 ? 'default' : 'destructive'} />
      </div>

      {/* Overview and Overdue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="pl-2"><OverviewChart data={chartData} /></CardContent>
          </Card>
          <OverdueLoansCard loans={overdueLoans} />
        </div>

        {/* Admin cashier reports and recent activity */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {isAdmin && <Card>
            <CardHeader><CardTitle>Cashier Reports</CardTitle></CardHeader>
            <CardContent>
              {cashierReports.length === 0 ? <div className="text-sm text-muted-foreground">No cashier data yet.</div> : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th>Cashier</th><th>Total Loans</th><th>Total Repaid</th><th>Total Expenses</th><th>Total Investments</th><th>Net</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashierReports.map((r: any) => (
                      <tr key={r.cashierId} className="border-t">
                        <td className="py-2">{r.username}</td>
                        <td className="py-2">{formatCurrency(r.totalLoans)}</td>
                        <td className="py-2">{formatCurrency(r.totalRepayments)}</td>
                        <td className="py-2">{formatCurrency(r.totalExpenses)}</td>
                        <td className="py-2">{formatCurrency(r.totalInvestments)}</td>
                        <td className="py-2">{formatCurrency((r.totalRepayments || 0) - (r.totalLoans || 0) - (r.totalExpenses || 0) - (r.totalInvestments || 0))}</td>
                        <td className="py-2">
                          <button className="underline text-blue-600" onClick={() => { setSelectedCashierReport(r); setIsModalOpen(true); }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>}

          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent><RecentActivityTable data={recentActivity} /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
