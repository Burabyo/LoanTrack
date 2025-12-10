// src/components/investments/add-investment-form.tsx
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { formatISO } from 'date-fns';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.string().optional(),
  source: z.string().min(1, 'Source is required'),
  cashierId: z.string().min(1, 'Cashier UID is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddInvestmentForm() {
  const firestore = useFirestore();
  const { appUser } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: 0,
      date: formatISO(new Date()),
      source: '',
      cashierId: '',
      description: '',
    },
  });

  const investmentsRef = useMemo(() => {
    if (!firestore) return undefined;
    return collection(firestore, 'investments');
  }, [firestore]);

  async function onSubmit(values: FormValues) {
    if (!firestore || !appUser) return;
    try {
      // use non-blocking helper (keeps behavior consistent)
      await addDocumentNonBlocking(investmentsRef!, {
        amount: Number(values.amount),
        date: values.date || new Date().toISOString(),
        source: values.source,
        cashierId: values.cashierId,
        description: values.description || '',
        createdAt: new Date().toISOString(),
        createdBy: (appUser as any).uid ?? (appUser as any).id ?? null,
      });

      toast({ title: 'Investment added', description: 'Investment recorded successfully.' });
      form.reset();
      setOpen(false);
    } catch (err) {
      console.error('Add investment error', err);
      toast({ title: 'Error', description: 'Failed to add investment', variant: 'destructive' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Investment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Record Investment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="amount" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (UGX)</FormLabel>
                <FormControl>
                  <input type="number" {...field} className="w-full rounded border p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="date" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <input type="datetime-local" {...field} className="w-full rounded border p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="source" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Source (Owner / Manager)</FormLabel>
                <FormControl>
                  <input type="text" {...field} className="w-full rounded border p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="cashierId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Cashier UID (who received)</FormLabel>
                <FormControl>
                  <input type="text" {...field} className="w-full rounded border p-2" placeholder="cashier uid" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <input type="text" {...field} className="w-full rounded border p-2" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Investment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
