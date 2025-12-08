
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-lg border-destructive">
                 <CardHeader>
                    <CardTitle className="text-destructive">
                        Application Error
                    </CardTitle>
                    <CardDescription>
                        Something went wrong. Please try again.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        An unexpected error occurred. If this problem persists, please contact support.
                    </p>
                    {error?.message && (
                        <div className="rounded-md bg-muted/50 p-4 text-xs text-foreground">
                            <p className="font-mono">{error.message}</p>
                        </div>
                    )}
                    <Button onClick={() => reset()}>
                        Try again
                    </Button>
                </CardContent>
            </Card>
        </div>
      </body>
    </html>
  );
}
