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
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

export default function DashboardPage() {
  const firestore = useFirestore();

  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCashierLoans, setSelectedCashierLoans] = useState<Loan[]>([]);
  const [selectedCashierPayments, setSelectedCashierPayments] = useState<Payment[]>([]);
  const [selectedCashierExpenses, setSelectedCashierExpenses] = useState<Expense[]>([]);
  const [selectedCashierName, setSelectedCashierName] = useState<string>('');

  // get current user uid
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

  // check if admin
  useEffect(() => {
    if (!firestore || !currentUid) return;
    let mounted = true;
    (async () => {
      try {
        const adminRef = doc(firestore, 'roles_admin', currentUid);
        const snap = await getDoc(adminRef);
        if (!mounted) return;
        setIsAdmin(snap.exists());
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      }
    })();
    return () => { mounted = false; };
  }, [firestore, currentUid]);

  // Collection refs
  const loansRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return null;
    return isAdmin
      ? collection(firestore, 'loans')
      : query(collection(firestore, 'loans'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const paymentsRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return null;
    return isAdmin
      ? collection(firestore, 'payments')
      : query(collection(firestore, 'payments'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const expensesRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null || currentUid === null) return null;
    return isAdmin
      ? collection(firestore, 'expenses')
      : query(collection(firestore, 'expenses'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const clientsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'clients');
  }, [firestore]);

  const usersRef = useMemoFirebase(() => {
    if (!firestore || isAdmin === null) return null;
    return isAdmin ? collection(firestore, 'users') : null;
  }, [firestore, isAdmin]);

  // Data hooks
  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: clientsData, isLoading: clientsLoading } = useCollection<Client>(clientsRef);
  const { data: usersData, isLoading: usersLoading } = useCollection<any>(usersRef);

  const loadingRole = isAdmin === null || currentUid === null;
  const isLoading = loadingRole || loansLoading || paymentsLoading || expensesLoading || clientsLoading || usersLoading;

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

  // Admin: Cashier Reports
  const cashierReports = useMemo(() => {
    if (!isAdmin || !loansData && !paymentsData && !expensesData) return [];
    const reportsMap = new Map<string, {
      cashierId: string;
      username?: string;
      totalLoans: number;
      totalRepayments: number;
      totalExpenses: number;
      loansCount: number;
      paymentsCount: number;
      expensesCount: number;
    }>();
    (usersData || []).forEach((u: any) => {
      if (u.role === 'cashier') {
        reportsMap.set(u.id, {
          cashierId: u.id,
          username: u.username || u.email || u.id,
          totalLoans: 0,
          totalRepayments: 0,
          totalExpenses: 0,
          loansCount: 0,
          paymentsCount: 0,
          expensesCount: 0,
        });
      }
    });
    const ensure = (id: string) => {
      if (!reportsMap.has(id)) {
        reportsMap.set(id, {
          cashierId: id,
          username: id,
          totalLoans: 0,
          totalRepayments: 0,
          totalExpenses: 0,
          loansCount: 0,
          paymentsCount: 0,
          expensesCount: 0,
        });
      }
      return reportsMap.get(id)!;
    };
    (loansData || []).forEach(loan => {
      const id = loan.cashierId || 'unknown';
      const r = ensure(id);
      r.totalLoans += Number((loan as any).amount || 0);
      r.loansCount += 1;
    });
    (paymentsData || []).forEach(p => {
      const id = p.cashierId || 'unknown';
      const r = ensure(id);
      r.totalRepayments += Number((p as any).amount || 0);
      r.paymentsCount += 1;
    });
    (expensesData || []).forEach(e => {
      const id = e.cashierId || 'unknown';
      const r = ensure(id);
      r.totalExpenses += Number((e as any).amount || 0);
      r.expensesCount += 1;
    });
    return Array.from(reportsMap.values()).sort((a,b) => (b.totalRepayments - b.totalLoans - b.totalExpenses) - (a.totalRepayments - a.totalLoans - a.totalExpenses));
  }, [isAdmin, usersData, loansData, paymentsData, expensesData]);

  if (isLoading) return <div>Loading dashboard...</div>;

  const openCashierModal = (cashierId: string, username: string) => {
    setSelectedCashierLoans((loansData || []).filter(l => l.cashierId === cashierId));
    setSelectedCashierPayments((paymentsData || []).filter(p => p.cashierId === cashierId));
    setSelectedCashierExpenses((expensesData || []).filter(e => e.cashierId === cashierId));
    setSelectedCashierName(username);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
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
          description={netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          variant={netCashFlow >= 0 ? 'default' : 'destructive'}
        />
      </div>

      {/* Main content */}
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

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {/* Admin: Cashier Reports */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Cashier Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {cashierReports.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No cashier data yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th>Cashier</th>
                        <th>Total Loans</th>
                        <th>Total Repaid</th>
                        <th>Total Expenses</th>
                        <th>Net</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashierReports.map(r => (
                        <tr key={r.cashierId} className="border-t">
                          <td className="py-2">{r.username}</td>
                          <td className="py-2">${r.totalLoans.toLocaleString()}</td>
                          <td className="py-2">${r.totalRepayments.toLocaleString()}</td>
                          <td className="py-2">${r.totalExpenses.toLocaleString()}</td>
                          <td className="py-2">${(r.totalRepayments - r.totalLoans - r.totalExpenses).toLocaleString()}</td>
                          <td className="py-2">
                            <button
                              className="underline"
                              onClick={() => openCashierModal(r.cashierId, r.username || r.cashierId)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityTable data={recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cashier modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl rounded bg-white p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold">Cashier Details: {selectedCashierName}</Dialog.Title>
              <button onClick={() => setModalOpen(false)}><X /></button>
            </div>

            <h4 className="font-medium mt-2 mb-1">Loans</h4>
            {selectedCashierLoans.length === 0 ? (
              <div className="text-sm text-muted-foreground">No loans.</div>
            ) : (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left">
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCashierLoans.map(l => {
                    const client = (clientsData || []).find(c => c.id === l.clientId);
                    return (
                      <tr key={l.id} className="border-t">
                        <td>{client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</td>
                        <td>${(l as any).amount?.toLocaleString() || 0}</td>
                        <td>{l.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <h4 className="font-medium mt-2 mb-1">Payments</h4>
            {selectedCashierPayments.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments.</div>
            ) : (
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left">
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCashierPayments.map(p => {
                    const client = (clientsData || []).find(c => c.id === p.clientId);
                    return (
                      <tr key={p.id} className="border-t">
                        <td>{client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</td>
                        <td>${(p as any).amount?.toLocaleString() || 0}</td>
                        <td>{(p as any).date || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <h4 className="font-medium mt-2 mb-1">Expenses</h4>
            {selectedCashierExpenses.length === 0 ? (
              <div className="text-sm text-muted-foreground">No expenses.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCashierExpenses.map(e => (
                    <tr key={e.id} className="border-t">
                      <td>{(e as any).title || 'N/A'}</td>
                      <td>${(e as any).amount?.toLocaleString() || 0}</td>
                      <td>{(e as any).date || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
