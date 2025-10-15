import { subDays, formatISO, addDays } from 'date-fns';
import type { Client, Loan, Payment, Expense, Transaction, Cashier, Activity } from './types';

const today = new Date();

// Mock Data
export const clients: Client[] = [
  { id: 'cli-1', name: 'Alice Johnson', phone: '555-0101', type: 'returning', status: 'good' },
  { id: 'cli-2', name: 'Bob Williams', phone: '555-0102', type: 'new', status: 'overdue' },
  { id: 'cli-3', name: 'Charlie Brown', phone: '555-0103', type: 'returning', status: 'default' },
  { id: 'cli-4', name: 'Diana Miller', phone: '555-0104', type: 'returning', status: 'delinquent' },
  { id: 'cli-5', name: 'Ethan Davis', phone: '555-0105', type: 'new', status: 'good' },
];

export const loans: Loan[] = [
  { id: 'loan-1', clientId: 'cli-1', principal: 500, interest: 100, processingFee: 20, totalRepayable: 600, amountDisbursed: 480, amountPaid: 600, issueDate: formatISO(subDays(today, 40)), dueDate: formatISO(subDays(today, 10)), status: 'paid' },
  { id: 'loan-2', clientId: 'cli-2', principal: 1000, interest: 200, processingFee: 40, totalRepayable: 1200, amountDisbursed: 960, amountPaid: 400, issueDate: formatISO(subDays(today, 25)), dueDate: formatISO(addDays(today, 5)), status: 'overdue' },
  { id: 'loan-3', clientId: 'cli-3', principal: 300, interest: 60, processingFee: 12, totalRepayable: 360, amountDisbursed: 288, amountPaid: 100, issueDate: formatISO(subDays(today, 10)), dueDate: formatISO(addDays(today, 20)), status: 'active' },
  { id: 'loan-4', clientId: 'cli-4', principal: 1500, interest: 300, processingFee: 60, totalRepayable: 1800, amountDisbursed: 1440, amountPaid: 200, issueDate: formatISO(subDays(today, 60)), dueDate: formatISO(subDays(today, 30)), status: 'overdue' },
  { id: 'loan-5', clientId: 'cli-5', principal: 800, interest: 160, processingFee: 32, totalRepayable: 960, amountDisbursed: 768, amountPaid: 960, issueDate: formatISO(subDays(today, 15)), dueDate: formatISO(addDays(today, 15)), status: 'paid' },
  { id: 'loan-6', clientId: 'cli-1', principal: 200, interest: 40, processingFee: 8, totalRepayable: 240, amountDisbursed: 192, amountPaid: 0, issueDate: formatISO(subDays(today, 2)), dueDate: formatISO(addDays(today, 28)), status: 'active' },
];

export const payments: Payment[] = [
  { id: 'pay-1', loanId: 'loan-1', amount: 600, paymentDate: formatISO(subDays(today, 12)) },
  { id: 'pay-2', loanId: 'loan-2', amount: 200, paymentDate: formatISO(subDays(today, 15)) },
  { id: 'pay-3', loanId: 'loan-2', amount: 200, paymentDate: formatISO(subDays(today, 5)) },
  { id: 'pay-4', loanId: 'loan-3', amount: 100, paymentDate: formatISO(subDays(today, 3)) },
  { id: 'pay-5', loanId: 'loan-4', amount: 200, paymentDate: formatISO(subDays(today, 40)) },
  { id: 'pay-6', loanId: 'loan-5', amount: 960, paymentDate: formatISO(subDays(today, 1)) },
];

export const expenses: Expense[] = [
  { id: 'exp-1', category: 'transport', description: 'Office commute', amount: 10, date: formatISO(today) },
  { id: 'exp-2', category: 'lunch', description: 'Team lunch', amount: 35, date: formatISO(today) },
  { id: 'exp-3', category: 'airtime', description: 'Client calls credit', amount: 15, date: formatISO(subDays(today, 1)) },
  { id: 'exp-4', category: 'other', description: 'Stationery', amount: 20, date: formatISO(subDays(today, 2)) },
];

export const cashiers: Cashier[] = [
  { id: 'cash-1', name: 'John Doe', avatarUrl: '1' },
  { id: 'cash-2', name: 'Jane Smith', avatarUrl: '2' },
  { id: 'cash-3', name: 'Sam Wilson', avatarUrl: '3' },
];

export const transactions: Transaction[] = [
  // John Doe's Transactions
  { id: 't-1', cashierId: 'cash-1', type: 'loan_disbursed', amount: 480, date: formatISO(subDays(today, 40)), description: 'Loan to Alice Johnson' },
  { id: 't-2', cashierId: 'cash-1', type: 'repayment', amount: 600, date: formatISO(subDays(today, 12)), description: 'Payment from Alice Johnson' },
  { id: 't-3', cashierId: 'cash-1', type: 'loan_disbursed', amount: 288, date: formatISO(subDays(today, 10)), description: 'Loan to Charlie Brown' },
  { id: 't-4', cashierId: 'cash-1', type: 'expense', amount: 10, date: formatISO(today), description: 'Transport expense' },
  
  // Jane Smith's Transactions
  { id: 't-5', cashierId: 'cash-2', type: 'loan_disbursed', amount: 960, date: formatISO(subDays(today, 25)), description: 'Loan to Bob Williams' },
  { id: 't-6', cashierId: 'cash-2', type: 'repayment', amount: 200, date: formatISO(subDays(today, 15)), description: 'Payment from Bob Williams' },
  { id: 't-7', cashierId: 'cash-2', type: 'loan_disbursed', amount: 1440, date: formatISO(subDays(today, 60)), description: 'Loan to Diana Miller' },
  { id: 't-8', cashierId: 'cash-2', type: 'expense', amount: 35, date: formatISO(today), description: 'Lunch expense' },
  { id: 't-9', cashierId: 'cash-2', type: 'repayment', amount: 200, date: formatISO(subDays(today, 5)), description: 'Payment from Bob Williams' },

  // Sam Wilson's Transactions
  { id: 't-10', cashierId: 'cash-3', type: 'loan_disbursed', amount: 768, date: formatISO(subDays(today, 15)), description: 'Loan to Ethan Davis' },
  { id: 't-11', cashierId: 'cash-3', type: 'repayment', amount: 960, date: formatISO(subDays(today, 1)), description: 'Payment from Ethan Davis' },
  { id: 't-12', cashierId: 'cash-3', type: 'loan_disbursed', amount: 192, date: formatISO(subDays(today, 2)), description: 'Loan to Alice Johnson' },
  { id: 't-13', cashierId: 'cash-3', type: 'expense', amount: 15, date: formatISO(subDays(today, 1)), description: 'Airtime expense' },
];

// Data Calculation Functions
const isToday = (date: string) => new Date(date).toDateString() === today.toDateString();

export const calculateTotalLoans = (loans: Loan[], filter: 'all' | 'today' = 'all') => {
  return loans
    .filter(l => filter === 'all' || isToday(l.issueDate))
    .reduce((sum, loan) => sum + loan.principal, 0);
};

export const calculateTotalRepayments = (payments: Payment[], filter: 'all' | 'today' = 'all') => {
  return payments
    .filter(p => filter === 'all' || isToday(p.paymentDate))
    .reduce((sum, payment) => sum + payment.amount, 0);
};

export const calculateTotalExpenses = (expenses: Expense[], filter: 'all' | 'today' = 'all') => {
  return expenses
    .filter(e => filter === 'all' || isToday(e.date))
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getChartData = (loans: Loan[], payments: Payment[]) => {
  const data = [];
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
    const combined: Activity[] = [
        ...loans.map(l => ({
            type: 'Loan' as const,
            description: `Loan of $${l.principal} to ${clients.find(c => c.id === l.clientId)?.name}`,
            amount: l.principal,
            date: l.issueDate
        })),
        ...payments.map(p => ({
            type: 'Payment' as const,
            description: `Payment of $${p.amount} for loan ${p.loanId}`,
            amount: p.amount,
            date: p.paymentDate
        })),
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
