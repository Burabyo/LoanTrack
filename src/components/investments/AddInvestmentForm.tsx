'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { addDocumentNonBlocking, useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  cashierId: z.string().min(1),
  source: z.string().min(3, { message: 'Source is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  date: z.date(),
  description: z.string().min(3, { message: 'Description is required' }),
});

type AddInvestmentFormProps = {
  onSuccess?: () => void;
};

export function AddInvestmentForm({ onSuccess }: AddInvestmentFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashierId: '',
      source: '',
      amount: 0,
      date: new Date(),
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;

    const investmentsRef = collection(firestore, 'investments');

    await addDocumentNonBlocking(investmentsRef, {
      ...values,
      createdAt: serverTimestamp(),
      addedBy: user.uid, // admin who added the investment
    });

    toast({
      title: 'Investment Added',
      description: `UGX ${values.amount.toLocaleString()} assigned to cashier successfully.`,
    });

    form.reset();
    if (onSuccess) onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cashierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cashier ID</FormLabel>
              <FormControl>
                <Input placeholder="Cashier UID or email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source</FormLabel>
              <FormControl>
                <Input placeholder="Admin or Manager" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="500000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
          type="date"
          {...field}
          value={field.value ? field.value.toISOString().split('T')[0] : ''}
          onChange={(e) => field.onChange(new Date(e.target.value))}
        />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Investment</Button>
      </form>
    </Form>
  );
}
