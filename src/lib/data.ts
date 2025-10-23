import { subDays, formatISO, addDays } from 'date-fns';
import type { Client, Loan, Payment, Expense, Activity, AppUser } from './types';

const today = new Date();

// Data Calculation Functions
const isToday = (date: string) => new Date(date).toDateString() === today.toDateString();

export const calculateTotalLoans = (loans: Loan[], filter: 'all' | 'today' = 'all') => {
  if (!loans) return 0;
  return loans
    .filter(l => filter === 'all' || isToday(l.issueDate))
    .reduce((sum, loan) => sum + loan.principal, 0);
};

export const calculateTotalRepayments = (payments: Payment[], filter: 'all' | 'today' = 'all') => {
  if (!payments) return 0;
  return payments
    .filter(p => filter === 'all' || isToday(p.paymentDate))
    .reduce((sum, payment) => sum + payment.amount, 0);
};

export const calculateTotalExpenses = (expenses: Expense[], filter: 'all' | 'today' = 'all') => {
  if (!expenses) return 0;
  return expenses
    .filter(e => filter === 'all' || isToday(e.date))
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getChartData = (loans: Loan[], payments: Payment[]) => {
  const data = [];
  if (!loans || !payments) return [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = formatISO(date, { representation: 'date' });
    
    const dailyLoans = loans
      .filter(l => formatISO(new Date(l.issueDate), { representation: 'date' }) === dateStr)
      .reduce((sum, l) => sum + l.amountDisbursed, 0);
      
    const dailyRepayments = payments
      .filter(p => formatISO(new Date(p.paymentDate), { representation: 'date' }) === dateStr)
      .reduce((sum, p) => sum + p.amount, 0);
      
    data.push({
      date: formatISO(date, { representation: 'date' }),
      Loans: dailyLoans,
      Repayments: dailyRepayments,
    });
  }
  return data;
};

export const getRecentActivity = (loans: Loan[], payments: Payment[], expenses: Expense[], clients: Client[], limit: number = 5): Activity[] => {
    if (!loans || !payments || !expenses || !clients) return [];
    
    const combined: Activity[] = [
        ...loans.map(l => {
          const client = clients.find(c => c.id === l.clientId);
          const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown';
          return {
            type: 'Loan' as const,
            description: `Loan to ${clientName}`,
            amount: l.principal,
            date: l.issueDate
          }
        }),
        ...payments.map(p => {
           const client = clients.find(c => c.id === p.clientId);
           const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown';
          return {
            type: 'Payment' as const,
            description: `Payment from ${clientName}`,
            amount: p.amount,
            date: p.paymentDate
          }
        }),
        ...expenses.map(e => ({
            type: 'Expense' as const,
            description: `Expense: ${e.description}`,
            amount: e.amount,
            date: e.date
        })),
    ];

    return combined
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
}
