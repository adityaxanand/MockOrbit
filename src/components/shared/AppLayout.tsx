
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Calendar, User, Settings, LogOut, Rocket, Menu, Users, MessageSquare, LayoutDashboard, Mic, Video, ClipboardEdit, BrainCircuit, Repeat } from 'lucide-react'; // Added Repeat icon
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('interviewer' | 'interviewee')[]; // Roles that can see this item
  dashboardRole?: 'interviewer' | 'interviewee'; // Specific dashboard role, if applicable
}

// Define base navigation items
const baseNavItemsRaw: Omit<NavItem, 'href' | 'dashboardRole'>[] = [
  { label: 'Schedule', icon: Calendar, roles: ['interviewer', 'interviewee'] },
  { label: 'Profile', icon: User, roles: ['interviewer', 'interviewee'] },
  { label: 'AI Questions', icon: BrainCircuit, roles: ['interviewer', 'interviewee'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading, activeRole, canSwitchRole, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Dynamically build navigation items based on user roles and active role
  const navItems: NavItem[] = React.useMemo(() => {
    const items: NavItem[] = [];

    // Ensure user and availableRoles are loaded before building the menu
    if (isLoading || !user || !user.availableRoles) {
        return items; // Return empty if still loading or user/roles undefined
    }

    // Add dashboards based on available roles
    if (user.availableRoles.includes('interviewee')) {
      items.push({
        href: '/dashboard/interviewee',
        label: 'Interviewee Dashboard',
        icon: LayoutDashboard,
        roles: ['interviewee'], // Only visible when interviewee role is available
        dashboardRole: 'interviewee',
      });
    }
    if (user.availableRoles.includes('interviewer')) {
       items.push({
        href: '/dashboard/interviewer',
        label: 'Interviewer Dashboard',
        icon: LayoutDashboard, // Could use a different icon if desired
        roles: ['interviewer'], // Only visible when interviewer role is available
        dashboardRole: 'interviewer',
      });
    }

     // Add other base items, filtered by user's available roles
     baseNavItemsRaw.forEach(item => {
        // Check if the user has at least one of the required roles for this item
        const userHasRequiredRole = item.roles.some(role => user.availableRoles?.includes(role));
        if (userHasRequiredRole) {
            items.push({
                ...item,
                // Generate href based on label (ensure matches actual file paths)
                href: `/${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            });
        }
     });


    return items;
  }, [user, isLoading]); // Depend on user and isLoading


  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden" prefetch={false}>
                <Rocket className="h-6 w-6 text-primary" />
                <span className="font-semibold text-primary">Mock Orbit</span>
             </Link>
             <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center" prefetch={false}>
                 <Rocket className="h-6 w-6 text-primary" />
                 <span className="sr-only">Mock Orbit</span>
             </Link>
             {/* Mobile Trigger - Only shown on mobile if sidebar component hides it */}
             <SidebarTrigger className="md:hidden" />
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarMenu>
            {isLoading ? (
              <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
              </>
            ) : user && activeRole && navItems.length > 0 ? ( // Check navItems length too
               <>
                {/* Nav Items */}
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      // Highlight if it's the active dashboard OR if it's another page and the path matches
                      isActive={
                         (item.dashboardRole && item.dashboardRole === activeRole && pathname.startsWith('/dashboard')) ||
                         (!item.dashboardRole && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))))
                      }
                      tooltip={{ children: item.label, side: 'right' }}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Role Switch Button */}
                {canSwitchRole && (
                    <SidebarMenuItem key="switch-role">
                        <SidebarMenuButton
                            onClick={switchRole}
                            variant="ghost" // Use ghost variant for less emphasis
                            tooltip={{ children: `Switch to ${activeRole === 'interviewee' ? 'Interviewer' : 'Interviewee'}`, side: 'right' }}
                        >
                            <Repeat />
                            <span>Switch Role</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
               </>
            ) : !isLoading && user ? (
                 <div className="p-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                     No navigation items available for the current role or user setup.
                 </div>
            ): null /* Render nothing if not loading and no user/activeRole */ }
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
           {isLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                </div>
             </div>
           ) : user ? (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start h-auto p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center">
                        <div className="flex items-center gap-2">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profile_picture_url || undefined} alt={user.name || ''} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                             </Avatar>
                             <div className="text-left group-data-[collapsible=icon]:hidden">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                             </div>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            ) : (
                 <Link href="/auth/login" className="w-full group-data-[collapsible=icon]:justify-center">
                     <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0">
                        <LogOut className="group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
                        <span className="group-data-[collapsible=icon]:hidden">Login</span>
                    </Button>
                 </Link>
            )}
        </SidebarFooter>
      </Sidebar>
       <SidebarInset>
          {/* Optional Top Bar within the main content area */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
             {/* Mobile Sidebar Trigger */}
              <SidebarTrigger className="sm:hidden" />
              <span className="font-semibold text-lg">Mock Orbit</span>
          </header>
         <main className="flex-1 overflow-auto p-4 md:p-6">
            {isLoading ? <Skeleton className="h-[calc(100vh-8rem)] w-full" /> : children}
         </main>
       </SidebarInset>
    </SidebarProvider>
  );
}
