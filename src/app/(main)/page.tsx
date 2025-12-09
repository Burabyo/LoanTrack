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
import { formatCurrency } from '@/lib/format';

export default function DashboardPage() {
  const firestore = useFirestore();

  // --- role / uid state
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = still checking

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCashierReport, setSelectedCashierReport] = useState<any>(null);

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
  // Build collection refs
  // -------------------------
  const loansRef = useMemoFirebase(() => {
    if (!firestore) return null;
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
    return collection(firestore, 'clients');
  }, [firestore]);

  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null) return null;
    return isAdmin ? collection(firestore, 'users') : null;
  }, [firestore, isAdmin]);

  // -------------------------
  // Hooks
  // -------------------------
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

  const cashierReports = useMemo(() => {
    if (!isAdmin || !(loansData || paymentsData || expensesData || usersData)) return [];
    const reportsMap = new Map<string, any>();
    (usersData || []).forEach(u => {
      if (u.role === 'cashier') {
        reportsMap.set(u.id, {
          cashierId: u.id,
          username: u.username || u.email || u.id,
          totalLoans: 0,
          totalRepayments: 0,
          totalExpenses: 0,
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
        });
      }
      return reportsMap.get(id)!;
    };
    (loansData || []).forEach(l => {
      const r = ensure(l.cashierId || 'unknown');
      r.totalLoans += l.amountDisbursed;
    });
    (paymentsData || []).forEach(p => {
      const r = ensure(p.cashierId || 'unknown');
      r.totalRepayments += p.amount;
    });
    (expensesData || []).forEach(e => {
      const r = ensure(e.cashierId || 'unknown');
      r.totalExpenses += e.amount;
    });
    return Array.from(reportsMap.values());
  }, [isAdmin, loansData, paymentsData, expensesData, usersData]);

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Loans Issued" value={formatCurrency(totalLoans)} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} description="Total principal amount given out" />
        <StatCard title="Total Repayments" value={formatCurrency(totalRepayments)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Total cash collected from clients" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />} description="Total operational expenses" />
        <StatCard title="Net Cash Flow" value={formatCurrency(netCashFlow)} icon={<Users className="h-4 w-4 text-muted-foreground" />} description={netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'} variant={netCashFlow >= 0 ? 'default' : 'destructive'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="pl-2"><OverviewChart data={chartData} /></CardContent>
          </Card>
          <OverdueLoansCard loans={overdueLoans} />
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          {isAdmin && (
            <Card>
              <CardHeader><CardTitle>Cashier Reports</CardTitle></CardHeader>
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
                          <td className="py-2">{formatCurrency(r.totalLoans)}</td>
                          <td className="py-2">{formatCurrency(r.totalRepayments)}</td>
                          <td className="py-2">{formatCurrency(r.totalExpenses)}</td>
                          <td className="py-2">{formatCurrency(r.totalRepayments - r.totalLoans - r.totalExpenses)}</td>
                          <td className="py-2">
                            <button className="underline text-blue-600" onClick={() => { setSelectedCashierReport(r); setIsModalOpen(true); }}>
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

          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <RecentActivityTable data={recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cashier Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-3xl rounded bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold mb-4">{selectedCashierReport?.username} Activities</Dialog.Title>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Loans</h3>
                <table className="w-full text-sm bg-blue-50">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loansData || []).filter(l => l.cashierId === selectedCashierReport?.cashierId).map(l => {
                      const client = clientsData?.find(c => c.id === l.clientId);
                      return (
                        <tr key={l.id}>
                          <td>{client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</td>
                          <td>{formatCurrency(l.amountDisbursed)}</td>
                          <td>{l.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payments</h3>
                <table className="w-full text-sm bg-blue-50">
                  <thead>
                    <tr>
                      <th>Loan ID</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(paymentsData || []).filter(p => p.cashierId === selectedCashierReport?.cashierId).map(p => (
                      <tr key={p.id}>
                        <td>{p.loanId}</td>
                        <td>{formatCurrency(p.amount)}</td>
                        <td>{p.paymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Expenses</h3>
                <table className="w-full text-sm bg-blue-50">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(expensesData || []).filter(e => e.cashierId === selectedCashierReport?.cashierId).map(e => (
                      <tr key={e.id}>
                        <td>{e.description}</td>
                        <td>{formatCurrency(e.amount)}</td>
                        <td>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
