'use server';

/**
 * @fileOverview Analyzes cashier performance using transaction history.
 *
 * - analyzeCashierPerformance - Analyzes the performance of a cashier based on their transaction history.
 * - AnalyzeCashierPerformanceInput - The input type for the analyzeCashierPerformance function.
 * - AnalyzeCashierPerformanceOutput - The return type for the analyzeCashierPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCashierPerformanceInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe('A detailed transaction history of the cashier.'),
  averageTransactionValue: z
    .number()
    .describe('The average transaction value for all cashiers.'),
  averageTransactionCount: z
    .number()
    .describe('The average transaction count for all cashiers.'),
});

export type AnalyzeCashierPerformanceInput = z.infer<
  typeof AnalyzeCashierPerformanceInputSchema
>;

const AnalyzeCashierPerformanceOutputSchema = z.object({
  performanceSummary: z
    .string()
    .describe('A summary of the cashier performance analysis.'),
  potentialIssues: z
    .string()
    .describe('Any potential issues identified in the transaction history.'),
  recommendations: z
    .string()
    .describe('Recommendations for addressing the identified issues.'),
});

export type AnalyzeCashierPerformanceOutput = z.infer<
  typeof AnalyzeCashierPerformanceOutputSchema
>;

export async function analyzeCashierPerformance(
  input: AnalyzeCashierPerformanceInput
): Promise<AnalyzeCashierPerformanceOutput> {
  return analyzeCashierPerformanceFlow(input);
}

const analyzeCashierPerformancePrompt = ai.definePrompt({
  name: 'analyzeCashierPerformancePrompt',
  input: {schema: AnalyzeCashierPerformanceInputSchema},
  output: {schema: AnalyzeCashierPerformanceOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing cashier performance based on transaction history.

You will be provided with the transaction history of a cashier, the average transaction value for all cashiers, and the average transaction count for all cashiers.

Analyze the cashier's performance, identify any potential issues or deviations from the average, and provide recommendations for improvement.

Transaction History: {{{transactionHistory}}}
Average Transaction Value: {{{averageTransactionValue}}}
Average Transaction Count: {{{averageTransactionCount}}}

Performance Summary:
Potential Issues:
Recommendations: `,
});

const analyzeCashierPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeCashierPerformanceFlow',
    inputSchema: AnalyzeCashierPerformanceInputSchema,
    outputSchema: AnalyzeCashierPerformanceOutputSchema,
  },
  async input => {
    const {output} = await analyzeCashierPerformancePrompt(input);
    return output!;
  }
);
