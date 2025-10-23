export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  isNewClient: boolean;
  status: 'good' | 'default' | 'overdue' | 'delinquent';
};

export type Loan = {
  id: string;
  clientId: string;
  principal: number;
  interest: number;
  processingFee: number;
  totalRepayable: number;
  amountDisbursed: number;
  amountPaid: number;
  issueDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue';
  clientName?: string;
};

export type Payment = {
  id: string;
  loanId: string;
  clientId: string;
  amount: number;
  paymentDate: string;
};

export type Expense = {
  id: string;
  category: 'lunch' | 'transport' | 'airtime' | 'other';
  description: string;
  amount: number;
  date: string;
};

export type User = {
  id: string;
  username: string;
  email: string | null;
  role: 'cashier' | 'admin';
};

export type Transaction = {
  id:string;
  cashierId: string;
  type: 'loan_disbursed' | 'repayment' | 'expense';
  amount: number;
  date: string;
  description: string;
};

export type Activity = {
    type: 'Loan' | 'Payment' | 'Expense';
    description: string;
    amount: number;
    date: string;
};

export type AppUser = User & {
    role: 'admin' | 'cashier';
}
