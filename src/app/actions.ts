'use server';

import {
  analyzeCashierPerformance,
  type AnalyzeCashierPerformanceInput,
} from '@/ai/flows/analyze-cashier-performance';

export async function getCashierAnalysis(
  input: AnalyzeCashierPerformanceInput
) {
  try {
    const result = await analyzeCashierPerformance(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing cashier performance:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while analyzing performance.',
    };
  }
}
