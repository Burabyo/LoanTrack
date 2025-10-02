'use client';

import { useState } from 'react';
import type { Cashier, Transaction } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getCashierAnalysis } from '@/app/actions';
import { Loader2, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type CashierAnalysisCardProps = {
  cashier: Cashier & { transactions: Transaction[] };
  averageTransactionValue: number;
  averageTransactionCount: number;
};

type AnalysisResult = {
  performanceSummary: string;
  potentialIssues: string;
  recommendations: string;
};

export function CashierAnalysisCard({
  cashier,
  averageTransactionValue,
  averageTransactionCount,
}: CashierAnalysisCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const cashierAvatar = PlaceHolderImages.find(
    (img) => img.id === `cashier-${cashier.avatarUrl}`
  );

  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);

    const transactionHistory = cashier.transactions
      .map(
        (t) =>
          `${t.date}: ${t.type} of $${t.amount} - ${t.description}`
      )
      .join('\n');

    const result = await getCashierAnalysis({
      transactionHistory,
      averageTransactionValue,
      averageTransactionCount,
    });

    setIsLoading(false);
    if (result.success && result.data) {
      setAnalysis(result.data);
      toast({
        title: 'Analysis Complete',
        description: `Successfully analyzed ${cashier.name}'s performance.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
    }
  };

  const transactionCount = cashier.transactions.length;
  const totalValue = cashier.transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgValue = transactionCount > 0 ? totalValue / transactionCount : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 border">
          <AvatarImage
            src={cashierAvatar?.imageUrl}
            alt={cashier.name}
            data-ai-hint={cashierAvatar?.imageHint}
          />
          <AvatarFallback>{cashier.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="font-headline">{cashier.name}</CardTitle>
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

        {analysis && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>View AI Analysis</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2 text-sm">
                <div>
                  <h4 className="font-semibold flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Performance Summary</h4>
                  <p className="text-muted-foreground pl-6">{analysis.performanceSummary}</p>
                </div>
                 <div>
                  <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Potential Issues</h4>
                  <p className="text-muted-foreground pl-6">{analysis.potentialIssues}</p>
                </div>
                 <div>
                  <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Recommendations</h4>
                  <p className="text-muted-foreground pl-6">{analysis.recommendations}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze Performance'}
        </Button>
      </CardFooter>
    </Card>
  );
}
