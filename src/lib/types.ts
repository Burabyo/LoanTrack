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
  cashierId: string;
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
  // convenience field for dashboards
  amount?: number;
  title?: string;
  date?: string;
};

export type Payment = {
  id: string;
  loanId: string;
  clientId: string;
  cashierId: string;
  amount: number;
  paymentDate: string;
  // convenience fields
  date?: string;
  title?: string;
};

export type Expense = {
  id: string;
  cashierId: string;
  category: 'lunch' | 'transport' | 'airtime' | 'other';
  description: string;
  amount: number;
  date: string;
  // convenience fields
  title?: string;
};

export type User = {
  id: string;
  username: string;
  email: string | null;
  role: 'cashier' | 'admin';
};

export type Transaction = {
  id: string;
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
};

export interface Investment {
  id?: string;             // optional when building object client-side; set by Firestore doc id
  amount: number;
  date: string;           // ISO date string, or store serverTimestamp separately
  source: string;         // e.g., "Boss" or "Manager"
  receivedFrom?: string;  // optional: person/entity from whom money was received
  description?: string;
  cashierId?: string;     // which cashier received the cash (optional)
}
