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
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useUser } from '@/firebase';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/clients',
      label: 'Clients',
      icon: Users,
    },
    {
      href: '/loans',
      label: 'Loans',
      icon: Landmark,
    },
    {
      href: '/cash-flow',
      label: 'Cash Flow',
      icon: ArrowRightLeft,
    },
    {
      href: '/performance',
      label: 'Performance',
      icon: Sparkles,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <DollarSignIcon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg font-headline">LoanTrack</span>
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1 justify-between">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className="w-full">
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </div>

        <div className="flex flex-col gap-2">
           <SidebarMenuItem>
              <Link href="#" className="w-full">
                <SidebarMenuButton tooltip="Support">
                  <LifeBuoy />
                  <span>Support</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
           <SidebarMenuItem>
              <Link href="#" className="w-full">
                <SidebarMenuButton tooltip="Settings">
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
              <AvatarImage
                src={userAvatar?.imageUrl}
                alt="User Avatar"
                data-ai-hint={userAvatar?.imageHint}
              />
            )}
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              {user?.displayName || user?.email || 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
