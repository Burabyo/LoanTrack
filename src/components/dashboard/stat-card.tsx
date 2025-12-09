'use client';
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive';
};

export default function StatCard({ title, value, description, icon, variant = 'default' }: StatCardProps) {
  return (
    <Card className={variant === 'destructive' ? 'border-destructive' : ''}>
      <CardHeader className="flex items-center gap-4">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
