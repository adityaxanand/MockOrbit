"use client";

import React, { useEffect, useRef } from 'react';
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
  SidebarMenuSkeleton,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Calendar, 
  User, 
  LogOut, 
  LayoutDashboard, 
  BrainCircuit, 
  Repeat, 
  Terminal, 
  Shield, 
  Command,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- VISUAL COMPONENTS ---

const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: any[] = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: Math.random() * 0.2
        });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(124, 58, 237, 0.2)"; // Subtle violet star tint
      stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) star.y = height;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
    }
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen" />;
};

const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
);

// --- NAVIGATION CONFIG ---

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ('interviewer' | 'interviewee')[];
  dashboardRole?: 'interviewer' | 'interviewee';
}

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

    if (isLoading || !user || !user.availableRoles) {
        return items;
    }

    // Add specific dashboard links based on active role context
    if (user.availableRoles.includes('interviewee')) {
      items.push({
        href: '/dashboard/interviewee',
        label: 'Mission Control',
        icon: LayoutDashboard,
        roles: ['interviewee'],
        dashboardRole: 'interviewee',
      });
    }
    if (user.availableRoles.includes('interviewer')) {
       items.push({
        href: '/dashboard/interviewer',
        label: 'Command Deck',
        icon: Shield,
        roles: ['interviewer'],
        dashboardRole: 'interviewer',
      });
    }

     // Add base items
     baseNavItemsRaw.forEach(item => {
        const userHasRequiredRole = item.roles.some(role => user.availableRoles?.includes(role));
        if (userHasRequiredRole) {
            items.push({
                ...item,
                href: `/${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            });
        }
     });

    return items;
  }, [user, isLoading]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-[#02040a] min-h-screen text-white font-sans selection:bg-violet-500/30 relative">
        <Starfield />
        <GridBackground />
        
        <SidebarProvider defaultOpen={true}>
          {/* Sidebar with Glassmorphism */}
          <Sidebar 
            side="left" 
            collapsible="icon" 
            className="border-r border-white/10 bg-[#050505]/70 backdrop-blur-xl z-50 transition-all duration-300"
          >
            <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:justify-center w-full">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                        <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                        <span className="font-bold tracking-tight text-white text-lg">MockOrbit</span>
                        <span className="text-[9px] text-emerald-400 font-mono tracking-widest flex items-center gap-1">
                             <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                        </span>
                    </div>
                </Link>
                <SidebarTrigger className="md:hidden text-gray-400 hover:text-white" />
            </SidebarHeader>

            <SidebarContent className="p-3 space-y-1">
              <SidebarMenu>
                {isLoading ? (
                  <>
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                  </>
                ) : user && activeRole && navItems.length > 0 ? (
                   <>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2 group-data-[collapsible=icon]:hidden">
                        Navigation
                    </div>
                    {navItems.map((item) => {
                        // Logic to determine active state
                        const isActive = (item.dashboardRole && item.dashboardRole === activeRole && pathname.startsWith('/dashboard')) || (!item.dashboardRole && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))));
                        
                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={{ children: item.label, side: 'right' }}
                              className={cn(
                                  "h-11 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                  isActive 
                                    ? "bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <Link href={item.href} className="flex items-center gap-3 w-full">
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full shadow-[0_0_10px_#8b5cf6]" />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-violet-400" : "text-gray-500 group-hover:text-gray-300")} />
                                <span className="font-medium truncate">{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                    })}

                    {canSwitchRole && (
                        <>
                            <div className="h-px bg-white/5 my-4 mx-2" />
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 py-2 group-data-[collapsible=icon]:hidden">
                                System
                            </div>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={switchRole}
                                    className="h-12 rounded-xl border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 group text-gray-400 hover:text-white transition-all"
                                    tooltip={{ children: `Switch to ${activeRole === 'interviewee' ? 'Interviewer' : 'Interviewee'}`, side: 'right' }}
                                >
                                    <div className="flex items-center justify-center w-5 h-5">
                                        <Repeat className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500 text-indigo-400" />
                                    </div>
                                    <div className="flex flex-col text-left leading-none gap-0.5">
                                        <span className="font-medium">Switch Role</span>
                                        <span className="text-[10px] text-gray-600 group-hover:text-violet-400 uppercase tracking-wider">Current: {activeRole}</span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </>
                    )}
                   </>
                ) : !isLoading && user ? (
                    <div className="p-4 text-center text-sm text-gray-500 group-data-[collapsible=icon]:hidden">
                        No modules available for current clearance level.
                    </div>
                ) : null}
              </SidebarMenu>
            </SidebarContent>
            
            <SidebarFooter className="p-4 border-t border-white/5 bg-[#080808]/50">
               {isLoading ? (
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                    <div className="flex-1 group-data-[collapsible=icon]:hidden">
                        <Skeleton className="h-4 w-20 bg-white/10 mb-1" />
                        <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                 </div>
               ) : user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start h-auto p-2 hover:bg-white/5 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 transition-colors">
                            <div className="flex items-center gap-3 w-full">
                                <Avatar className="h-9 w-9 border border-white/10 ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all">
                                    <AvatarImage src={user.profile_picture_url || undefined} alt={user.name || ''} />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-900 to-indigo-900 text-white text-xs font-bold">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
                                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                                </div>
                                <div className="group-data-[collapsible=icon]:hidden text-gray-500">
                                    <Settings className="w-4 h-4" />
                                </div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-60 bg-[#0A0A0A]/95 border-white/10 text-white shadow-2xl backdrop-blur-xl rounded-xl p-1">
                        <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1.5">User Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={() => router.push('/profile')} className="focus:bg-violet-600 focus:text-white cursor-pointer rounded-lg my-1">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-white focus:bg-red-600 cursor-pointer rounded-lg my-1">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
               ) : (
                 <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 hover:text-white text-gray-400">
                        <LogOut className="mr-2 h-4 w-4" /> 
                        <span className="group-data-[collapsible=icon]:hidden">Login</span>
                    </Button>
                 </Link>
               )}
            </SidebarFooter>
          </Sidebar>
          
          <SidebarInset className="bg-transparent overflow-hidden">
             {/* Mobile Header (Visible only on small screens) */}
             <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#02040a]/80 backdrop-blur-md px-6 md:hidden">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-white hover:bg-white/10" />
                    <span className="font-bold text-lg text-white">MockOrbit</span>
                </div>
                {user && (
                    <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarFallback className="bg-violet-900 text-xs text-white">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                )}
             </header>
             
             {/* Main Content Area */}
             <main className="flex-1 overflow-auto relative z-10 p-6 md:p-8 lg:p-10">
                 {/* Breadcrumb-like path indicator */}
                 {!isLoading && (
                     <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                        <span className="hover:text-white cursor-pointer transition-colors">Home</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-violet-400 font-medium capitalize">
                            {pathname === '/' ? 'Overview' : pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')}
                        </span>
                     </div>
                 )}

                {isLoading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-white/5" />)}
                        </div>
                    </div>
                ) : children}
             </main>
          </SidebarInset>
        </SidebarProvider>
    </div>
  );
}




// "use client";

// import React from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   Sidebar,
//   SidebarProvider,
//   SidebarHeader,
//   SidebarContent,
//   SidebarFooter,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarTrigger,
//   SidebarInset,
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenuSkeleton
// } from "@/components/ui/sidebar";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Home, Calendar, User, Settings, LogOut, Rocket, Menu, Users, MessageSquare, LayoutDashboard, Mic, Video, ClipboardEdit, BrainCircuit, Repeat } from 'lucide-react'; // Added Repeat icon
// import { useAuth } from '@/providers/AuthProvider';
// import { Skeleton } from '@/components/ui/skeleton';
// import { GrTechnology } from "react-icons/gr";


// interface NavItem {
//   href: string;
//   label: string;
//   icon: React.ElementType;
//   roles: ('interviewer' | 'interviewee')[]; // Roles that can see this item
//   dashboardRole?: 'interviewer' | 'interviewee'; // Specific dashboard role, if applicable
// }

// // Define base navigation items
// const baseNavItemsRaw: Omit<NavItem, 'href' | 'dashboardRole'>[] = [
//   { label: 'Schedule', icon: Calendar, roles: ['interviewer', 'interviewee'] },
//   { label: 'Profile', icon: User, roles: ['interviewer', 'interviewee'] },
//   { label: 'AI Questions', icon: BrainCircuit, roles: ['interviewer', 'interviewee'] },
// ];

// export default function AppLayout({ children }: { children: React.ReactNode }) {
//   const { user, logout, isLoading, activeRole, canSwitchRole, switchRole } = useAuth();
//   const pathname = usePathname();
//   const router = useRouter();

//   const getInitials = (name?: string | null) => {
//     if (!name) return "??";
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   // Dynamically build navigation items based on user roles and active role
//   const navItems: NavItem[] = React.useMemo(() => {
//     const items: NavItem[] = [];

//     // Ensure user and availableRoles are loaded before building the menu
//     if (isLoading || !user || !user.availableRoles) {
//         return items; // Return empty if still loading or user/roles undefined
//     }

//     // Add dashboards based on available roles
//     if (user.availableRoles.includes('interviewee')) {
//       items.push({
//         href: '/dashboard/interviewee',
//         label: 'Interviewee Dashboard',
//         icon: LayoutDashboard,
//         roles: ['interviewee'], // Only visible when interviewee role is available
//         dashboardRole: 'interviewee',
//       });
//     }
//     if (user.availableRoles.includes('interviewer')) {
//        items.push({
//         href: '/dashboard/interviewer',
//         label: 'Interviewer Dashboard',
//         icon: LayoutDashboard, // Could use a different icon if desired
//         roles: ['interviewer'], // Only visible when interviewer role is available
//         dashboardRole: 'interviewer',
//       });
//     }

//      // Add other base items, filtered by user's available roles
//      baseNavItemsRaw.forEach(item => {
//         // Check if the user has at least one of the required roles for this item
//         const userHasRequiredRole = item.roles.some(role => user.availableRoles?.includes(role));
//         if (userHasRequiredRole) {
//             items.push({
//                 ...item,
//                 // Generate href based on label (ensure matches actual file paths)
//                 href: `/${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
//             });
//         }
//      });


//     return items;
//   }, [user, isLoading]); // Depend on user and isLoading


//   const handleLogout = () => {
//     logout();
//   };

//   return (
//     <SidebarProvider defaultOpen={true}>
//       <Sidebar side="left" variant="sidebar" collapsible="icon">
//         <SidebarHeader className="p-4 flex items-center justify-between">
//              <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden" prefetch={false}>
//                 <GrTechnology className="h-6 w-6 text-primary" />
//                 <span className="font-semibold text-primary">Mock Orbit</span>
//              </Link>
//              <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center" prefetch={false}>
//                  <GrTechnology className="h-6 w-6 text-primary" />
//                  <span className="sr-only">Mock Orbit</span>
//              </Link>
//              {/* Mobile Trigger - Only shown on mobile if sidebar component hides it */}
//              <SidebarTrigger className="md:hidden" />
//         </SidebarHeader>

//         <SidebarContent className="p-2">
//           <SidebarMenu>
//             {isLoading ? (
//               <>
//                 <SidebarMenuSkeleton showIcon />
//                 <SidebarMenuSkeleton showIcon />
//                 <SidebarMenuSkeleton showIcon />
//               </>
//             ) : user && activeRole && navItems.length > 0 ? ( // Check navItems length too
//                <>
//                 {/* Nav Items */}
//                 {navItems.map((item) => (
//                   <SidebarMenuItem key={item.href}>
//                     <SidebarMenuButton
//                       asChild
//                       // Highlight if it's the active dashboard OR if it's another page and the path matches
//                       isActive={
//                          (item.dashboardRole && item.dashboardRole === activeRole && pathname.startsWith('/dashboard')) ||
//                          (!item.dashboardRole && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))))
//                       }
//                       tooltip={{ children: item.label, side: 'right' }}
//                     >
//                       <Link href={item.href}>
//                         <item.icon />
//                         <span>{item.label}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}

//                 {/* Role Switch Button */}
//                 {canSwitchRole && (
//                     <SidebarMenuItem key="switch-role">
//                         <SidebarMenuButton
//                             onClick={switchRole}
//                             variant="outline" // Use outline variant for less emphasis
//                             tooltip={{ children: `Switch to ${activeRole === 'interviewee' ? 'Interviewer' : 'Interviewee'}`, side: 'right' }}
//                         >
//                             <Repeat />
//                             <span>Switch Role</span>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 )}
//                </>
//             ) : !isLoading && user ? (
//                  <div className="p-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
//                      No navigation items available for the current role or user setup.
//                  </div>
//             ): null /* Render nothing if not loading and no user/activeRole */ }
//           </SidebarMenu>
//         </SidebarContent>
//         <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
//            {isLoading ? (
//              <div className="flex items-center gap-2">
//                 <Skeleton className="h-8 w-8 rounded-full" />
//                 <div className="flex-1 group-data-[collapsible=icon]:hidden">
//                     <Skeleton className="h-4 w-20 mb-1" />
//                     <Skeleton className="h-3 w-24" />
//                 </div>
//              </div>
//            ) : user ? (
//             <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" className="w-full justify-start h-auto p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center">
//                         <div className="flex items-center gap-2">
//                              <Avatar className="h-8 w-8">
//                                 <AvatarImage src={user.profile_picture_url || undefined} alt={user.name || ''} />
//                                 <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
//                              </Avatar>
//                              <div className="text-left group-data-[collapsible=icon]:hidden">
//                                 <p className="text-sm font-medium truncate">{user.name}</p>
//                                 <p className="text-xs text-muted-foreground truncate">{user.email}</p>
//                              </div>
//                         </div>
//                     </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent side="right" align="start" className="w-56">
//                     <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={() => router.push('/profile')}>
//                         <User className="mr-2 h-4 w-4" />
//                         <span>Profile</span>
//                     </DropdownMenuItem>
//                     {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
//                         <Settings className="mr-2 h-4 w-4" />
//                         <span>Settings</span>
//                     </DropdownMenuItem> */}
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem onClick={handleLogout}>
//                         <LogOut className="mr-2 h-4 w-4" />
//                         <span>Log out</span>
//                     </DropdownMenuItem>
//                 </DropdownMenuContent>
//             </DropdownMenu>
//             ) : (
//                  <Link href="/auth/login" className="w-full group-data-[collapsible=icon]:justify-center">
//                      <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0">
//                         <LogOut className="group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
//                         <span className="group-data-[collapsible=icon]:hidden">Login</span>
//                     </Button>
//                  </Link>
//             )}
//         </SidebarFooter>
//       </Sidebar>
//        <SidebarInset>
//           {/* Optional Top Bar within the main content area */}
//           <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
//              {/* Mobile Sidebar Trigger */}
//               <SidebarTrigger className="sm:hidden" />
//               <span className="font-semibold text-lg">Mock Orbit</span>
//           </header>
//          <main className="flex-1 overflow-auto p-4 md:p-6">
//             {isLoading ? <Skeleton className="h-[calc(100vh-8rem)] w-full" /> : children}
//          </main>
//        </SidebarInset>
//     </SidebarProvider>
//   );
// }
