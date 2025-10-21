'use client';

import type { Cashier, Transaction, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type CashierAnalysisCardProps = {
  cashier: User & { transactions: Transaction[] };
};

export function CashierAnalysisCard({
  cashier,
}: CashierAnalysisCardProps) {
  // A simple way to get an avatar ID from the user's name
  const avatarId = `cashier-${(cashier.username.charCodeAt(0) % 3) + 1}`;
  const cashierAvatar = PlaceHolderImages.find((img) => img.id === avatarId);

  const transactionCount = cashier.transactions.length;
  const totalValue = cashier.transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgValue = transactionCount > 0 ? totalValue / transactionCount : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage
            src={cashierAvatar?.imageUrl}
            alt={cashier.username}
            data-ai-hint={cashierAvatar?.imageHint}
          />
          <AvatarFallback>{cashier.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="font-headline">{cashier.username}</CardTitle>
          <CardDescription>Cashier ID: {cashier.id}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex justify-around text-center text-sm">
          <div>
            <p className="font-bold text-lg">{transactionCount}</p>
            <p className="text-muted-foreground">Transactions</p>
          </div>
          <div>
            <p className="font-bold text-lg">${totalValue.toLocaleString()}</p>
            <p className="text-muted-foreground">Total Value</p>
          </div>
          <div>
            <p className="font-bold text-lg">${avgValue.toFixed(2)}</p>
            <p className="text-muted-foreground">Avg. Value</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {/* The AI analysis button has been removed */}
      </CardFooter>
    </Card>
  );
}
