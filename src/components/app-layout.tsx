'use client';

import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import type { ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 lg:p-6 bg-background/80">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
