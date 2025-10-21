'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import type { Loan } from '@/lib/types';
import { format } from 'date-fns';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  paymentDate: z.date(),
});

type RecordPaymentFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  loan: Loan;
};

export function RecordPaymentForm({ isOpen, onOpenChange, loan }: RecordPaymentFormProps) {
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '' as unknown as number, // Set a default value to prevent uncontrolled input warning
      paymentDate: new Date(),
    },
  });

  const remainingBalance = loan.totalRepayable - loan.amountPaid;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    // 1. Add to payments collection
    const paymentsRef = collection(firestore, 'payments');
    addDocumentNonBlocking(paymentsRef, {
      loanId: loan.id,
      clientId: loan.clientId,
      amount: values.amount,
      paymentDate: values.paymentDate.toISOString(),
      createdAt: serverTimestamp(),
    });

    // 2. Update the loan document
    const loanRef = doc(firestore, 'loans', loan.id);
    const newAmountPaid = loan.amountPaid + values.amount;
    const newStatus = newAmountPaid >= loan.totalRepayable ? 'paid' : loan.status;

    updateDocumentNonBlocking(loanRef, {
      amountPaid: newAmountPaid,
      status: newStatus,
    });

    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment for Loan</DialogTitle>
          <DialogDescription>
            {`Client: ${loan.clientName}. Remaining Balance: $${remainingBalance.toFixed(2)}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
