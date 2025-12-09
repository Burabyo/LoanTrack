'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Landmark,
  ArrowRightLeft,
  Sparkles,
  Cog,
  LogOut,
  Wallet,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function AppSidebar() {
  const pathname = usePathname();
  const { user, appUser } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  const isAdmin = appUser?.role === 'admin';

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'cashier'] },
    { href: '/clients', label: 'Clients', icon: Users, roles: ['admin', 'cashier'] },
    { href: '/loans', label: 'Loans', icon: Landmark, roles: ['admin', 'cashier'] },
    { href: '/payments', label: 'Payments', icon: Wallet, roles: ['admin', 'cashier'] },
    { href: '/expenses', label: 'Expenses', icon: Receipt, roles: ['admin', 'cashier'] },
    { href: '/cash-flow', label: 'Cash Flow', icon: ArrowRightLeft, roles: ['admin'] },
    { href: '/performance', label: 'Performance', icon: Sparkles, roles: ['admin'] },
    { href: '/investments', label: 'Investments', icon: DollarSign, roles: ['admin', 'cashier'] },
  ];

  const visibleMenuItems = menuItems.filter(item =>
    item.roles.includes(isAdmin ? 'admin' : 'cashier')
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg font-headline">LoanTrack</span>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 justify-between">
        <div className="flex flex-col gap-2">
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <SidebarMenuItem>
            <Link href="/settings" className="w-full">
              <SidebarMenuButton tooltip="Settings" isActive={pathname === '/settings'}>
                <Cog />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleSignOut}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarMenu>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL} alt="User Avatar" />
            ) : (
              <AvatarImage src={userAvatar?.imageUrl} alt="User Avatar" data-ai-hint={userAvatar?.imageHint} />
            )}
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              {user?.displayName || appUser?.username || user?.email || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {appUser?.role && <span className="capitalize">{appUser.role}</span>}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
