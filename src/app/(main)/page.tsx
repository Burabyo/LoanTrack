// src/app/(main)/page.tsx
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
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';

export default function DashboardPage() {
  const firestore = useFirestore();

  // role / uid
  const [currentUid, setCurrentUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // modal state (Tailwind modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCashierReport, setSelectedCashierReport] = useState<any>(null);

  // auth
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

  // check admin role doc at roles_admin/{uid}
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

  // collection refs (role-aware)
  const loansRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null || currentUid === null) return null;
    return isAdmin ? collection(firestore, 'loans') : query(collection(firestore, 'loans'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const paymentsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null || currentUid === null) return null;
    return isAdmin ? collection(firestore, 'payments') : query(collection(firestore, 'payments'), where('cashierId', '==', currentUid));
  }, [firestore, isAdmin, currentUid]);

  const expensesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin === null || currentUid === null) return null;
    return isAdmin ? collection(firestore, 'expenses') : query(collection(firestore, 'expenses'), where('cashierId', '==', currentUid));
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

  // hooks
  const { data: loansData, isLoading: loansLoading } = useCollection<Loan>(loansRef);
  const { data: paymentsData, isLoading: paymentsLoading } = useCollection<Payment>(paymentsRef);
  const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesRef);
  const { data: clientsData, isLoading: clientsLoading } = useCollection<Client>(clientsRef);
  const { data: usersData, isLoading: usersLoading } = useCollection<any>(usersRef);

  const loadingRole = isAdmin === null || currentUid === null;
  const isLoading = loadingRole || loansLoading || paymentsLoading || expensesLoading || clientsLoading || usersLoading;

  // totals and derived data (numbers only)
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

  // admin cashier aggregated reports
  const cashierReports = useMemo(() => {
    if (!isAdmin || !(loansData || paymentsData || expensesData || usersData)) return [];
    const reportsMap = new Map<string, any>();
    (usersData || []).forEach((u: any) => {
      if (u.role === 'cashier') {
        reportsMap.set(u.id, {
          cashierId: u.id,
          username: u.username || u.email || u.id,
          totalLoans: 0,
          totalRepayments: 0,
          totalExpenses: 0,
          loans: [] as Loan[],
          payments: [] as Payment[],
          expenses: [] as Expense[],
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
          loans: [] as Loan[],
          payments: [] as Payment[],
          expenses: [] as Expense[],
        });
      }
      return reportsMap.get(id)!;
    };
    (loansData || []).forEach(l => {
      const r = ensure(l.cashierId || 'unknown');
      r.totalLoans += (l.amountDisbursed || 0);
      r.loans.push(l);
    });
    (paymentsData || []).forEach(p => {
      const r = ensure(p.cashierId || 'unknown');
      r.totalRepayments += (p.amount || 0);
      r.payments.push(p);
    });
    (expensesData || []).forEach(e => {
      const r = ensure(e.cashierId || 'unknown');
      r.totalExpenses += (e.amount || 0);
      r.expenses.push(e);
    });
    return Array.from(reportsMap.values()).sort((a, b) => (b.totalRepayments - b.totalLoans) - (a.totalRepayments - a.totalLoans));
  }, [isAdmin, loansData, paymentsData, expensesData, usersData]);

  if (isLoading) return <div>Loading dashboard...</div>;

  // helpers for modal totals & categories (safe defaults)
  const modalLoansForSelected = (selectedCashierReport?.loans || []) as Loan[];
  const modalPaymentsForSelected = (selectedCashierReport?.payments || []) as Payment[];
  const modalExpensesForSelected = (selectedCashierReport?.expenses || []) as Expense[];

  const modalLoansTotals = {
    total: modalLoansForSelected.reduce((s, l) => s + (l.amountDisbursed || 0), 0),
    paidCount: modalLoansForSelected.filter(l => l.status === 'paid').length,
    activeCount: modalLoansForSelected.filter(l => l.status === 'active').length,
    overdueCount: modalLoansForSelected.filter(l => l.status === 'overdue').length,
  };

  const modalPaymentsTotal = modalPaymentsForSelected.reduce((s, p) => s + (p.amount || 0), 0);
  const modalExpensesTotal = modalExpensesForSelected.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Loans Issued"
          value={formatCurrency(totalLoans)}
          icon={<Landmark className="h-4 w-4 text-muted-foreground" />}
          description="Total principal amount given out"
        />
        <StatCard
          title="Total Repayments"
          value={formatCurrency(totalRepayments)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total cash collected from clients"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          description="Total operational expenses"
        />
        <StatCard
          title="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          variant={netCashFlow >= 0 ? 'default' : 'destructive'}
        />
      </div>

      {/* Main layout */}
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
                      {cashierReports.map((r: any) => (
                        <tr key={r.cashierId} className="border-t">
                          <td className="py-2">{r.username}</td>
                          <td className="py-2">{formatCurrency(r.totalLoans)}</td>
                          <td className="py-2">{formatCurrency(r.totalRepayments)}</td>
                          <td className="py-2">{formatCurrency(r.totalExpenses)}</td>
                          <td className="py-2">{formatCurrency((r.totalRepayments || 0) - (r.totalLoans || 0) - (r.totalExpenses || 0))}</td>
                          <td className="py-2">
                            <button
                              className="underline text-blue-600"
                              onClick={() => {
                                setSelectedCashierReport(r);
                                setIsModalOpen(true);
                              }}
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

          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <RecentActivityTable data={recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tailwind modal (categorized & colored layout) */}
      {isModalOpen && selectedCashierReport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* overlay */}
          <div className="fixed inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />

          <div className="relative z-50 w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-auto max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{selectedCashierReport.username}</h3>
                <p className="text-sm text-muted-foreground">Cashier activities summary</p>
              </div>
              <div>
                <button className="px-3 py-1 rounded bg-gray-100 text-sm" onClick={() => setIsModalOpen(false)}>Close</button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Loans section (blue) */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold">Loans</h4>
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-medium">{formatCurrency(modalLoansTotals.total)}</span>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-blue-50 p-3 flex items-center justify-between">
                    <div className="text-sm text-blue-900">Overview</div>
                    <div className="flex gap-3 text-sm">
                      <div className="text-blue-900">Paid: {modalLoansTotals.paidCount}</div>
                      <div className="text-blue-900">Active: {modalLoansTotals.activeCount}</div>
                      <div className="text-blue-900">Overdue: {modalLoansTotals.overdueCount}</div>
                    </div>
                  </div>

                  <div className="p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th>Client</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Due</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(modalLoansForSelected || []).map((l: Loan) => {
                          const client = (clientsData || []).find(c => c.id === l.clientId);
                          return (
                            <tr key={l.id} className="border-t">
                              <td className="py-2 text-blue-900 font-medium">{client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</td>
                              <td className="py-2 text-blue-900">{formatCurrency(l.amountDisbursed || 0)}</td>
                              <td className="py-2 text-blue-900">{l.status}</td>
                              <td className="py-2 text-blue-900">{new Date(l.dueDate).toLocaleDateString()}</td>
                              <td className="py-2 text-right">
                                <Link href={`/loans/${l.id}`} className="text-sm underline text-blue-700">View</Link>
                              </td>
                            </tr>
                          );
                        })}
                        {((modalLoansForSelected || []).length === 0) && (
                          <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">No loans for this cashier.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Payments section (green) */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold">Payments</h4>
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-medium">{formatCurrency(modalPaymentsTotal)}</span>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-green-50 p-3 flex items-center justify-between">
                    <div className="text-sm text-green-900">Payments overview</div>
                    <div className="text-sm text-green-900">{(modalPaymentsForSelected || []).length} payments</div>
                  </div>

                  <div className="p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th>Loan ID</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(modalPaymentsForSelected || []).map((p: Payment) => (
                          <tr key={p.id} className="border-t">
                            <td className="py-2 text-green-900">{p.loanId}</td>
                            <td className="py-2 text-green-900">{formatCurrency(p.amount || 0)}</td>
                            <td className="py-2 text-green-900">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {((modalPaymentsForSelected || []).length === 0) && (
                          <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No payments for this cashier.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Expenses section (red) */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-semibold">Expenses</h4>
                  <div className="text-sm text-muted-foreground">
                    Total: <span className="font-medium">{formatCurrency(modalExpensesTotal)}</span>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-red-50 p-3 flex items-center justify-between">
                    <div className="text-sm text-red-900">Expenses overview</div>
                    <div className="text-sm text-red-900">{(modalExpensesForSelected || []).length} expenses</div>
                  </div>

                  <div className="p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th>Description</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(modalExpensesForSelected || []).map((e: Expense) => (
                          <tr key={e.id} className="border-t">
                            <td className="py-2 text-red-900">{e.description}</td>
                            <td className="py-2 text-red-900">{formatCurrency(e.amount || 0)}</td>
                            <td className="py-2 text-red-900">{new Date(e.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {((modalExpensesForSelected || []).length === 0) && (
                          <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No expenses for this cashier.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
