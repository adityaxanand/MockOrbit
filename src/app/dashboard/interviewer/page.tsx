
"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Star, MessageSquareWarning, Loader2, CheckCircle, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface Interview {
  id: string;
  interviewee?: { id: string; name: string; };
  scheduled_time: string;
  topic: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface PerformanceStats {
  interviewsConducted: number;
  averageRating: number | null;
  feedbackPending: number;
}

export default function InterviewerDashboardPage() {
  const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
  const { toast } = useToast();
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

   useEffect(() => {
    if (!isAuthLoading && activeRole && activeRole !== 'interviewer') {
        // router.push(`/dashboard/${activeRole}`); // AuthProvider handles this
    }
   }, [isAuthLoading, activeRole]);

  useEffect(() => {
    const fetchScheduled = async () => {
       if (!user?.id || !token || activeRole !== 'interviewer') {
           setIsLoadingInterviews(false);
           return;
       }
       setIsLoadingInterviews(true);
       try {
         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled,in_progress`, { // Also fetch in_progress
           headers: { Authorization: `Bearer ${token}` },
         });
         const data = await response.json();
         if (!response.ok) throw new Error(data.error || 'Failed to fetch scheduled interviews');
         setScheduledInterviews(data || []);
       } catch (error: any) {
         console.error("Failed to fetch scheduled interviews:", error);
         toast({ title: "Error", description: `Could not load scheduled interviews: ${error.message}`, variant: "destructive" });
         setScheduledInterviews([]);
       } finally {
         setIsLoadingInterviews(false);
       }
     };
     if (!isAuthLoading) fetchScheduled();
   }, [user?.id, token, toast, isAuthLoading, activeRole]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id || !token || activeRole !== 'interviewer') {
                setIsLoadingStats(false);
                return;
            }
            setIsLoadingStats(true);
            try {
                const response = await fetch(`${API_URL}/users/${user.id}/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch performance stats');
                setPerformanceStats(data);
            } catch (error: any) {
                console.error("Failed to fetch performance stats:", error);
                toast({ title: "Error", description: `Could not load performance stats: ${error.message}`, variant: "destructive" });
                setPerformanceStats(null);
            } finally {
                setIsLoadingStats(false);
            }
        };
        if (!isAuthLoading) fetchStats();
    }, [user?.id, token, toast, isAuthLoading, activeRole]);

   const formatDate = (isoString: string): string => {
       try {
           return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
       } catch (e) { return "Invalid Date"; }
   };

    const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading?: boolean }) => (
        <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <div className="text-2xl font-bold text-primary">{value}</div>}
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );

     const renderInterviewListSkeleton = (count: number) => (
        <div className="space-y-4">
           {[...Array(count)].map((_, index) => (
                <Card key={index} className="p-4 border rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-3 sm:mb-0 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                </Card>
           ))}
        </div>
     );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-primary">Interviewer Dashboard</h1>
             {/* Maybe a link to availability settings or general schedule view if different from interviewee's */}
            <Link href="/schedule" passHref>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow">
                    <CalendarDays className="mr-2 h-5 w-5"/> Manage Availability
                </Button>
            </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           <StatCard
             title="Interviews Conducted"
             value={performanceStats?.interviewsConducted ?? 0}
             icon={CheckCircle}
             description="Total interviews completed"
             isLoading={isLoadingStats}
           />
           <StatCard
             title="Average Rating"
             value={performanceStats?.averageRating !== null && performanceStats?.averageRating !== undefined ? `${performanceStats.averageRating.toFixed(1)} / 5` : 'N/A'}
             icon={Star}
             description="Based on interviewee feedback"
             isLoading={isLoadingStats}
           />
          <StatCard
             title="Feedback Pending"
             value={performanceStats?.feedbackPending ?? 0}
             icon={MessageSquareWarning}
             description="Interviews awaiting your feedback"
             isLoading={isLoadingStats}
           />
        </div>

        <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-6 w-6 text-primary"/>Upcoming Sessions</CardTitle>
            <CardDescription>Interviews you are scheduled to conduct. Be prepared!</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInterviews ? renderInterviewListSkeleton(2)
             : scheduledInterviews.length > 0 ? (
              <ul className="space-y-4">
                {scheduledInterviews.map((interview) => (
                  <Card key={interview.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-3 sm:mb-0">
                          <p className="font-semibold text-lg">{interview.topic}</p>
                          <p className="text-sm text-muted-foreground">Interviewee: {interview.interviewee?.name || 'N/A'}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                             <CalendarDays className="w-4 h-4 mr-1.5" />
                             <span>{formatDate(interview.scheduled_time)}</span>
                          </div>
                        </div>
                        <Link href={`/interview-room/${interview.id}`} passHref>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto" disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}>
                                {interview.status === 'in_progress' ? 'Rejoin Room' : 'Start Interview'}
                                <ExternalLink className="ml-2 h-4 w-4"/>
                            </Button>
                        </Link>
                    </div>
                     {interview.status === 'in_progress' && <Badge variant="default" className="mt-2 inline-block bg-green-500 text-white">In Progress</Badge>}
                  </Card>
                ))}
              </ul>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">No Upcoming Interviews</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  You have no interviews scheduled to conduct. Check your availability settings or wait for interviewees to schedule with you.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
            {/* Potentially add a footer link to history or settings */}
            {/* <CardFooter>
                <Link href="/profile#history" passHref className="w-full">
                     <Button variant="outline" size="sm" className="w-full">View Full Interview History</Button>
                </Link>
            </CardFooter> */}
        </Card>
      </div>
    </AppLayout>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import AppLayout from "@/components/shared/AppLayout"; // Assuming this is themed
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { 
//     CalendarDays, Users, Star, MessageSquareWarning, CheckCircle, ExternalLink, Info,
//     Activity // Using Activity for "Interviews Conducted" for consistency
// } from "lucide-react";
// import Link from "next/link";
// import { useAuth } from "@/providers/AuthProvider";
// import { useToast } from "@/hooks/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// interface Interview {
//   id: string;
//   interviewee?: { id: string; name: string; };
//   scheduled_time: string;
//   topic: string;
//   status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }

// interface PerformanceStats {
//   interviewsConducted: number;
//   averageRating: number | null;
//   feedbackPending: number;
// }

// // Helper StatCard Component (defined within or imported)
// const ThemedStatCard = ({ title, value, icon: Icon, description, isLoading, delay }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading?: boolean, delay?: string }) => (
//     <div className="animate-item-entry" style={{animationDelay: delay}}>
//         <Card className="themed-card p-5 h-full flex flex-col justify-between"> {/* Ensure consistent height if desired or let content dictate */}
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
//                 <CardTitle className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>{title}</CardTitle>
//                 <Icon className="h-5 w-5" style={{color: 'var(--accent-primary)'}}/>
//             </CardHeader>
//             <CardContent className="p-0">
//                 {isLoading ? 
//                     <>
//                         <Skeleton className="themed-skeleton h-8 w-16 my-1" /> 
//                         {description && <Skeleton className="themed-skeleton h-3 w-full mt-1" />}
//                     </>
//                     : 
//                     <>
//                         <div className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>{value}</div>
//                         {description && <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>{description}</p>}
//                     </>
//                 }
//             </CardContent>
//         </Card>
//     </div>
// );


// export default function InterviewerDashboardPage() {
//   const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
//   const { toast } = useToast();
//   const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
//   const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
//   const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
//   const [isLoadingStats, setIsLoadingStats] = useState(true);

//   const theme = { // Consistent theme variables
//     bgMain: "#16181A",
//     bgSurface: "#1F2123",
//     bgSurfaceLighter: "#292C2E",
//     textPrimary: "#F0F2F5",
//     textSecondary: "#A8B2C0",
//     accentPrimary: "#C9A461",
//     accentPrimaryHover: "#B8914B",
//     borderColor: "#303438",
//     borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)",
//     destructive: "#D32F2F",
//     destructiveRgb: "211, 47, 47",
//     destructiveForeground: "#fff",
//     success: "#4CAF50",
//     successRgb: "76, 175, 80",
//     info: "#2196F3", // Consistent info blue
//     infoRgb: "33, 150, 243",
//     accentPrimaryRgb: "201, 164, 97",
//     borderPrimaryRgb: "48, 52, 56", // For skeleton shimmer
//   };
  
//   useEffect(() => {
//     const fetchScheduled = async () => {
//         if (!user?.id || !token || activeRole !== 'interviewer') {
//             setIsLoadingInterviews(false); return;
//         }
//       setIsLoadingInterviews(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled,in_progress`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch scheduled interviews');
//         setScheduledInterviews(Array.isArray(data) ? data : []);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Scheduled interviews: ${error.message}`, variant: "destructive" });
//         setScheduledInterviews([]);
//       } finally {
//         setIsLoadingInterviews(false);
//       }
//     };
//     if (!isAuthLoading) fetchScheduled();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   useEffect(() => {
//     const fetchStats = async () => {
//         if (!user?.id || !token || activeRole !== 'interviewer') {
//             setIsLoadingStats(false); return;
//         }
//       setIsLoadingStats(true);
//       try {
//         // MOCKING STATS API
//         // const response = await fetch(`${API_URL}/users/${user.id}/stats/interviewer`, { // Assuming a specific endpoint
//         //   headers: { Authorization: `Bearer ${token}` },
//         // });
//         // const data = await response.json();
//         // if (!response.ok) throw new Error(data.error || 'Failed to fetch performance stats');
//         await new Promise(resolve => setTimeout(resolve, 700)); // Simulate fetch
//         const data: PerformanceStats = {
//             interviewsConducted: 28,
//             averageRating: 4.7,
//             feedbackPending: 3,
//         };
//         setPerformanceStats(data);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Performance stats: ${error.message}`, variant: "destructive" });
//         setPerformanceStats(null);
//       } finally {
//         setIsLoadingStats(false);
//       }
//     };
//     if (!isAuthLoading) fetchStats();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   const formatDate = (isoString: string): string => {
//     try {
//         return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
//     } catch (e) { return "Invalid Date"; }
//   };

//   const getStatusBadgeStyling = (status?: string): { text: string, style: React.CSSProperties, className?: string } => {
//     switch (status) {
//         case 'in_progress': return { text: "In Progress", style: { backgroundColor: `rgba(var(--success-rgb), 0.15)`, color: 'var(--success)', borderColor: 'var(--success)'}, className: 'themed-badge' };
//         // Add other interviewer-specific statuses if any
//         default: return { text: status || 'Scheduled', style: { backgroundColor: `transparent`, color: 'var(--text-secondary)', borderColor: 'var(--border-color-subtle)'}, className: 'themed-badge themed-badge-outline' };
//     }
//   };

//   const renderInterviewListSkeleton = (count: number) => (
//     <>
//       {[...Array(count)].map((_, index) => (
//         <Card key={index} className="themed-skeleton-card p-5 space-y-3">
//             <div className="flex justify-between items-start">
//                 <div className="space-y-2">
//                     <Skeleton className="themed-skeleton h-5 w-40" />
//                     <Skeleton className="themed-skeleton h-4 w-32" />
//                 </div>
//                 <Skeleton className="themed-skeleton h-9 w-28 rounded-md" /> {/* Button size */}
//             </div>
//             <Skeleton className="themed-skeleton h-4 w-48" />
//         </Card>
//       ))}
//     </>
//   );

//   return (
//     <>
//       <style jsx global>{`
//         /* Paste the full CSS from IntervieweeDashboardPage here, it's identical for the theme */
//         :root {
//           --bg-main: ${theme.bgMain};
//           --bg-surface: ${theme.bgSurface};
//           --bg-surface-lighter: ${theme.bgSurfaceLighter};
//           --text-primary: ${theme.textPrimary};
//           --text-secondary: ${theme.textSecondary};
//           --accent-primary: ${theme.accentPrimary};
//           --accent-primary-hover: ${theme.accentPrimaryHover};
//           --border-color: ${theme.borderColor};
//           --border-color-subtle: ${theme.borderColorSubtle};
//           --border-primary-rgb: ${theme.borderPrimaryRgb}; /* for skeleton */
//           --shadow-color: ${theme.shadowColor};
//           --destructive: ${theme.destructive};
//           --destructive-rgb: ${theme.destructiveRgb};
//           --destructive-foreground: ${theme.destructiveForeground};
//           --success: ${theme.success};
//           --success-rgb: ${theme.successRgb};
//           --info: ${theme.info};
//           --info-rgb: ${theme.infoRgb};
//           --accent-primary-rgb: ${theme.accentPrimaryRgb};
//         }
//         @keyframes elegant-fade-in-up {
//             from { opacity: 0; transform: translateY(15px); }
//             to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-item-entry {
//             opacity: 0;
//             animation: elegant-fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//         }
//         .premium-button {
//             background-color: var(--accent-primary);
//             color: var(--bg-main); 
//             font-weight: 600;
//             border-radius: 0.375rem;
//             padding: 0.65rem 1.25rem;
//             transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08);
//         }
//         .premium-button:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px) scale(1.02);
//             box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .premium-button-secondary {
//              background-color: var(--accent-primary);
//             color: var(--bg-main);
//             font-weight: 500; /* Slightly less bold for secondary actions */
//             padding: 0.5rem 1rem; /* Smaller padding */
//             border-radius: 0.375rem;
//             transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 2px 8px rgba(var(--accent-primary-rgb), 0.1);
//         }
//          .premium-button-secondary:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15);
//         }

//          .premium-button-outline {
//             background-color: transparent;
//             color: var(--accent-primary);
//             font-weight: 500;
//             border: 1px solid var(--accent-primary);
//             border-radius: 0.375rem;
//             padding: 0.5rem 1rem;
//             transition: all 0.2s ease-in-out;
//         }
//         .premium-button-outline:hover:not(:disabled) {
//             background-color: rgba(var(--accent-primary-rgb), 0.1);
//             border-color: var(--accent-primary);
//         }
//         .themed-card {
//             background-color: var(--bg-surface);
//             border: 1px solid var(--border-color-subtle);
//             border-radius: 0.6rem;
//             box-shadow: 0 8px 20px -5px var(--shadow-color), 0 15px 30px -15px var(--shadow-color);
//             transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//         }
//         .themed-card:hover {
//              transform: translateY(-4px);
//              box-shadow: 0 12px 28px -6px var(--shadow-color), 0 20px 40px -20px var(--shadow-color);
//         }
//         .themed-nested-card {
//             background-color: var(--bg-surface-lighter);
//             border: 1px solid var(--border-color);
//             border-radius: 0.5rem;
//             transition: background-color 0.2s ease, border-color 0.2s ease;
//         }
//         .themed-nested-card:hover {
//             background-color: var(--bg-main);
//             border-color: var(--accent-primary);
//         }
//         .themed-alert {
//             background-color: rgba(var(--info-rgb), 0.08);
//             border: 1px solid rgba(var(--info-rgb), 0.3);
//             border-left-width: 4px;
//             border-left-color: var(--info);
//             border-radius: 0.375rem;
//             padding: 1rem;
//         }
//         .themed-alert-title { color: var(--info); font-weight: 600; }
//         .themed-alert-description { color: var(--text-secondary); }
//         .themed-alert .lucide { color: var(--info); }
//         .themed-badge {
//             border-width: 1px;
//             border-style: solid;
//             padding: 0.2rem 0.6rem;
//             font-size: 0.75rem;
//             font-weight: 500;
//             border-radius: 9999px;
//             text-transform: capitalize;
//         }
//          .themed-badge-outline {
//             background-color: transparent !important;
//          }
//         @keyframes shimmer {
//             100% {transform: translateX(100%);}
//         }
//         .themed-skeleton {
//             background-color: var(--border-color); /* Darker base for skeleton */
//             position: relative;
//             overflow: hidden;
//             border-radius: 0.25rem;
//         }
//         .themed-skeleton::after {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: linear-gradient(90deg, transparent, rgba(var(--border-primary-rgb), 0.2), transparent); /* Use border-primary-rgb, ensure it's light enough */
//             transform: translateX(-100%);
//             animation: shimmer 1.5s infinite;
//         }
//         .themed-skeleton-card {
//              background-color: var(--bg-surface);
//              border: 1px solid var(--border-color-subtle);
//              border-radius: 0.5rem;
//         }
//       `}</style>
//       <AppLayout>
//         <div className="space-y-10 p-4 md:p-6 lg:p-8">
//             {/* Header Section */}
//             <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"> {/* Increased mb */}
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
//                             Welcome, {user?.name ? user.name.split(' ')[0] : 'Interviewer'}!
//                         </h1>
//                         <p style={{ color: 'var(--text-secondary)' }}>Manage your sessions and track your contributions.</p>
//                     </div>
//                     <Link href="/interviewer/availability" passHref> {/* Example link for interviewer availability */}
//                         <Button className="premium-button w-full sm:w-auto">
//                             <CalendarDays className="mr-2 h-5 w-5"/> Manage Availability
//                         </Button>
//                     </Link>
//                 </div>

//                 {/* Performance Stats Section */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     <ThemedStatCard
//                         title="Interviews Conducted"
//                         value={performanceStats?.interviewsConducted ?? "0"}
//                         icon={Activity} // Changed for thematic consistency
//                         description="Total sessions you've led."
//                         isLoading={isLoadingStats}
//                         delay="0.2s"
//                     />
//                     <ThemedStatCard
//                         title="Average Rating Received"
//                         value={performanceStats?.averageRating !== null && performanceStats?.averageRating !== undefined ? `${performanceStats.averageRating.toFixed(1)} / 5` : 'N/A'}
//                         icon={Star}
//                         description="From interviewee feedback."
//                         isLoading={isLoadingStats}
//                         delay="0.3s"
//                     />
//                     <ThemedStatCard
//                         title="Feedback Pending"
//                         value={performanceStats?.feedbackPending ?? "0"}
//                         icon={MessageSquareWarning}
//                         description="Sessions needing your review."
//                         isLoading={isLoadingStats}
//                         delay="0.4s"
//                     />
//                 </div>
//             </div>

//           <div className="animate-item-entry" style={{animationDelay: '0.5s'}}>
//           <Card className="themed-card">
//             <CardHeader className="pb-4 border-b" style={{borderColor: 'var(--border-color)'}}>
//               <CardTitle className="flex items-center text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//                 <Users className="mr-3 h-6 w-6" style={{color: 'var(--accent-primary)'}}/>Upcoming Sessions
//               </CardTitle>
//               <CardDescription style={{ color: 'var(--text-secondary)' }}>Interviews you are scheduled to conduct. Be prepared!</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-5">
//               {isLoadingInterviews ? renderInterviewListSkeleton(2)
//                 : scheduledInterviews.length > 0 ? (
//                   <ul className="space-y-4">
//                     {scheduledInterviews.map((interview, idx) => (
//                       <li key={interview.id} className="animate-item-entry" style={{animationDelay: `${idx * 0.1}s`}}>
//                       <Card className="themed-nested-card p-4">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                             <div className="flex-grow">
//                                 <p className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>{interview.topic}</p>
//                                 <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Interviewee: {interview.interviewee?.name || 'N/A'}</p>
//                                 <div className="flex items-center text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
//                                     <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
//                                     <span>{formatDate(interview.scheduled_time)}</span>
//                                 </div>
//                                 {interview.status === 'in_progress' && 
//                                     <Badge style={getStatusBadgeStyling('in_progress').style} className={`mt-2 inline-block ${getStatusBadgeStyling('in_progress').className}`}>
//                                         {getStatusBadgeStyling('in_progress').text}
//                                     </Badge>
//                                 }
//                             </div>
//                             <Link href={`/interview-room/${interview.id}`} passHref className="w-full sm:w-auto">
//                                 <Button size="sm" className="premium-button-secondary w-full" disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}>
//                                     {interview.status === 'in_progress' ? 'Rejoin Room' : 'Start Interview'}
//                                     <ExternalLink className="ml-2 h-4 w-4"/>
//                                 </Button>
//                             </Link>
//                         </div>
//                       </Card>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                     <Alert className="themed-alert">
//                         <Info className="h-5 w-5" />
//                         <AlertTitle className="themed-alert-title">No Upcoming Interviews</AlertTitle>
//                         <AlertDescription className="themed-alert-description">
//                             You have no interviews scheduled to conduct. Ensure your availability is up to date!
//                         </AlertDescription>
//                     </Alert>
//                 )}
//             </CardContent>
//              {/* Optional Footer for quick links, e.g., to past conducted interviews */}
//             {/* <CardFooter className="pt-4 border-t" style={{borderColor: 'var(--border-color)'}}>
//                 <Link href="/interviewer/history" passHref className="w-full">
//                     <Button variant="outline" size="sm" className="premium-button-outline w-full">View All Conducted Interviews</Button>
//                 </Link>
//             </CardFooter> */}
//           </Card>
//           </div>
//         </div>
//       </AppLayout>
//     </>
//   );
// }