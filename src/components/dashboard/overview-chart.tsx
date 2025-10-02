'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { getChartData } from '@/lib/data';
import { format } from 'date-fns';

const chartData = getChartData();

const chartConfig = {
  Loans: {
    label: 'Loans',
    color: 'hsl(var(--primary))',
  },
  Repayments: {
    label: 'Repayments',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export default function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => format(new Date(value), 'MMM d')}
        />
        <YAxis
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="Loans" fill="var(--color-Loans)" radius={4} />
        <Bar dataKey="Repayments" fill="var(--color-Repayments)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
