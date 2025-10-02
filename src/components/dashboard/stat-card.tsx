import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
  variant?: 'default' | 'destructive';
};

export default function StatCard({
  title,
  value,
  icon,
  description,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold',
            variant === 'destructive' && 'text-destructive'
          )}
        >
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
