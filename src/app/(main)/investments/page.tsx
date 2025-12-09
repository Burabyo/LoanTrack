'use client';
import { useFirestore, useUser, useCollection, addDocumentNonBlocking } from '@/firebase';
import { useState } from 'react';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function InvestmentsPage() {
  const firestore = useFirestore();
  const { appUser } = useUser();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [cashierId, setCashierId] = useState('');
  const [date, setDate] = useState(new Date());

  const investmentsRef = collection(firestore!, 'investments');

  const { data: investmentsData } = useCollection<any>(investmentsRef);

  const handleAddInvestment = async () => {
    if (!amount || !description || !source || !cashierId || !date) return;

    await addDocumentNonBlocking(investmentsRef, {
      amount: Number(amount),
      description,
      source,
      cashierId,
      date: date.toISOString(),
      createdAt: new Date().toISOString(),
    });

    setAmount('');
    setDescription('');
    setSource('');
    setCashierId('');
    setDate(new Date());
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle>Add New Investment</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="Source (Admin/Manager)" value={source} onChange={(e) => setSource(e.target.value)} />
          <Input placeholder="Cashier ID" value={cashierId} onChange={(e) => setCashierId(e.target.value)} />
          <Input type="date" value={format(date, 'yyyy-MM-dd')} onChange={(e) => setDate(new Date(e.target.value))} />
          <Button onClick={handleAddInvestment}>Add Investment</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Investments</CardTitle></CardHeader>
        <CardContent>
          {investmentsData?.length === 0 && <p>No investments yet.</p>}
          <ul className="space-y-2">
            {investmentsData?.map(inv => (
              <li key={inv.id} className="border p-2 rounded bg-gray-100">
                <div className="flex justify-between">
                  <span>{inv.description}</span>
                  <span>UGX {inv.amount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {inv.source} → Cashier: {inv.cashierId} on {new Date(inv.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
