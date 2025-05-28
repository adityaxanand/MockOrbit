
"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, History, BookOpen, Lightbulb, Loader2, UserCheck, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; // Added Badge component


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface Interview {
  id: string;
  interviewer?: { id: string; name: string; };
  interviewee?: { id: string; name: string; };
  scheduled_time: string;
  topic: string;
  feedback_status?: 'Received' | 'Pending' | 'Provided' | 'N/A';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export default function IntervieweeDashboardPage() {
  const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
  const { toast } = useToast();
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(true);

   useEffect(() => {
        if (!isAuthLoading && activeRole && activeRole !== 'interviewee') {
             // This redirect is now primarily handled by AuthProvider, but it's a good safeguard.
            // router.push(`/dashboard/${activeRole}`);
        }
    }, [isAuthLoading, activeRole]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      if (!user?.id || !token || activeRole !== 'interviewee') {
          setIsLoadingUpcoming(false);
          return;
      }
      setIsLoadingUpcoming(true);
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=scheduled,in_progress`, { // Also fetch in_progress
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch upcoming interviews');
        setUpcomingInterviews(data || []);
      } catch (error: any) {
        console.error("Failed to fetch upcoming interviews:", error);
        toast({ title: "Error", description: `Could not load upcoming interviews: ${error.message}`, variant: "destructive" });
        setUpcomingInterviews([]);
      } finally {
        setIsLoadingUpcoming(false);
      }
    };
    if (!isAuthLoading) fetchUpcoming();
  }, [user?.id, token, toast, isAuthLoading, activeRole]);

  useEffect(() => {
     const fetchPast = async () => {
       if (!user?.id || !token || activeRole !== 'interviewee') {
           setIsLoadingPast(false);
           return;
       }
       setIsLoadingPast(true);
       try {
         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=completed,cancelled`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         const data = await response.json();
         if (!response.ok) throw new Error(data.error || 'Failed to fetch past interviews');
         setPastInterviews(data || []);
       } catch (error: any) {
         console.error("Failed to fetch past interviews:", error);
         toast({ title: "Error", description: `Could not load past interviews: ${error.message}`, variant: "destructive" });
         setPastInterviews([]);
       } finally {
         setIsLoadingPast(false);
       }
     };
     if (!isAuthLoading) fetchPast();
   }, [user?.id, token, toast, isAuthLoading, activeRole]);

   const formatDate = (isoString: string, style: 'medium' | 'short' = 'medium'): string => {
       try {
           const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: style };
           if (style === 'medium') {
               dateOptions.timeStyle = 'short';
           }
           return new Intl.DateTimeFormat(undefined, dateOptions).format(new Date(isoString));
       } catch (e) { return "Invalid Date"; }
   };

   const getFeedbackBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Received': return 'default'; // Primary color for received
        case 'Pending': return 'secondary'; // Muted for pending
        case 'N/A':
        case 'Cancelled': return 'outline'; // Outline for N/A or Cancelled
        default: return 'outline';
    }
   };

   const renderLoadingSkeletons = (count: number, type: 'upcoming' | 'history') => (
    <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
             type === 'upcoming' ? (
                 <Card key={index} className="p-4 border rounded-lg shadow-sm">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-2 sm:mb-0 space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-md" />
                     </div>
                 </Card>
             ) : (
                 <div key={index} className="flex items-center justify-between text-sm py-3 border-b">
                     <div className="space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                     </div>
                     <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
             )
        ))}
    </div>
   );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-primary">Interviewee Dashboard</h1>
            <Link href="/schedule" passHref>
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow">
                    <CalendarDays className="mr-2 h-5 w-5"/> Schedule New Interview
                 </Button>
            </Link>
        </div>

        <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl"><UserCheck className="mr-3 h-6 w-6 text-primary"/>Upcoming Interviews</CardTitle>
            <CardDescription>Your scheduled practice interviews. Join the room when it's time!</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUpcoming ? renderLoadingSkeletons(2, 'upcoming')
             : upcomingInterviews.length > 0 ? (
              <ul className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-3 sm:mb-0">
                          <p className="font-semibold text-lg text-primary">{interview.topic}</p>
                          <p className="text-sm text-muted-foreground">With: {interview.interviewer?.name || 'N/A'}</p>
                           <div className="flex items-center text-sm text-muted-foreground mt-1">
                             <CalendarDays className="w-4 h-4 mr-1.5" />
                             <span>{formatDate(interview.scheduled_time)}</span>
                          </div>
                        </div>
                         <Link href={`/interview-room/${interview.id}`} passHref>
                             <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto" disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}>
                                 {interview.status === 'in_progress' ? 'Rejoin Room' : 'Join Room'}
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
                  You don&apos;t have any interviews scheduled yet. Click &quot;Schedule New Interview&quot; to get started!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
            <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl"><History className="mr-3 h-6 w-6 text-primary"/>Interview History</CardTitle>
                 <CardDescription>Review your past interviews and feedback status.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPast ? renderLoadingSkeletons(3, 'history')
                 : pastInterviews.length > 0 ? (
                  <ul className="space-y-1 divide-y divide-border">
                    {pastInterviews.map((interview) => (
                      <li key={interview.id} className="flex items-center justify-between py-3">
                        <div>
                           <p className="font-medium">{interview.topic}</p>
                           <p className="text-xs text-muted-foreground">vs {interview.interviewer?.name || 'N/A'} on {formatDate(interview.scheduled_time, 'short')}</p>
                        </div>
                        <Badge variant={getFeedbackBadgeVariant(interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status)}>
                             {interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status || 'N/A'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-3">No past interview history found.</p>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/profile#history" passHref className="w-full">
                     <Button variant="outline" size="sm" className="w-full">View Full Profile History</Button>
                </Link>
              </CardFooter>
            </Card>

             <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl"><BookOpen className="mr-3 h-6 w-6 text-primary"/>Preparation Tools</CardTitle>
                 <CardDescription>Utilize these resources to sharpen your interview skills.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Link href="/question-generator" className="block p-4 border rounded-lg hover:bg-secondary/50 hover:border-primary transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-accent mt-1"/>
                        <div>
                            <p className="font-medium">AI Question Generator</p>
                            <p className="text-sm text-muted-foreground">Practice with AI-generated questions tailored to your needs.</p>
                        </div>
                    </div>
                 </Link>
                 {/* Add other resource links here if available */}
              </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import AppLayout from "@/components/shared/AppLayout"; // Assuming this is themed
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { 
//     CalendarDays, History, BookOpen, Lightbulb, UserCheck, ExternalLink, Info, 
//     Activity, BarChart3, Clock // For stats section
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
//   interviewer?: { id: string; name: string; };
//   interviewee?: { id: string; name: string; };
//   scheduled_time: string;
//   topic: string;
//   feedback_status?: 'Received' | 'Pending' | 'Provided' | 'N/A';
//   status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }

// // Conceptual Stats Data
// interface DashboardStats {
//     totalInterviews: number | null;
//     avgFeedbackScore: number | null; // e.g., 4.5
//     nextInterviewIn: string | null; // e.g., "2 days" or "Today"
// }

// export default function IntervieweeDashboardPage() {
//   const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
//   const { toast } = useToast();
//   const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
//   const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
//   const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
//   const [isLoadingPast, setIsLoadingPast] = useState(true);
//   const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
//     totalInterviews: null,
//     avgFeedbackScore: null,
//     nextInterviewIn: null,
//   });
//   const [isLoadingStats, setIsLoadingStats] = useState(true);


//   const theme = { // Consistent theme variables
//     bgMain: "#16181A",
//     bgSurface: "#1F2123",
//     bgSurfaceLighter: "#292C2E", // For nested elements or hover
//     textPrimary: "#F0F2F5",
//     textSecondary: "#A8B2C0",
//     accentPrimary: "#C9A461",
//     accentPrimaryHover: "#B8914B",
//     borderColor: "#303438",
//     borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)",
//     destructive: "#D32F2F", // Muted red for dark theme
//     destructiveRgb: "211, 47, 47",
//     destructiveForeground: "#fff",
//     success: "#4CAF50", // A suitable green for success states
//     successRgb: "76, 175, 80",
//     info: "#2196F3", // A suitable blue for info states
//     infoRgb: "33, 150, 243",
//     accentPrimaryRgb: "201, 164, 97",
//   };

//   // Fetch Stats (Conceptual)
//   useEffect(() => {
//     const fetchStats = async () => {
//         if (!user?.id || !token) {
//             setIsLoadingStats(false);
//             return;
//         }
//         setIsLoadingStats(true);
//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 800));
//         setDashboardStats({
//             totalInterviews: 12, // Mock data
//             avgFeedbackScore: 4.2, // Mock data
//             nextInterviewIn: upcomingInterviews.length > 0 ? "Today!" : "None", // Mock data
//         });
//         setIsLoadingStats(false);
//     };
//     if (!isAuthLoading) fetchStats();
//   }, [user?.id, token, isAuthLoading, upcomingInterviews]);


//   useEffect(() => {
//     const fetchUpcoming = async () => {
//       if (!user?.id || !token || activeRole !== 'interviewee') {
//           setIsLoadingUpcoming(false); return;
//       }
//       setIsLoadingUpcoming(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=scheduled,in_progress`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch upcoming interviews');
//         setUpcomingInterviews(Array.isArray(data) ? data : []);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Upcoming interviews: ${error.message}`, variant: "destructive" });
//         setUpcomingInterviews([]);
//       } finally {
//         setIsLoadingUpcoming(false);
//       }
//     };
//     if (!isAuthLoading) fetchUpcoming();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   useEffect(() => {
//     const fetchPast = async () => {
//         if (!user?.id || !token || activeRole !== 'interviewee') {
//             setIsLoadingPast(false); return;
//         }
//       setIsLoadingPast(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=completed,cancelled`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch past interviews');
//         setPastInterviews(Array.isArray(data) ? data : []);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Past interviews: ${error.message}`, variant: "destructive" });
//         setPastInterviews([]);
//       } finally {
//         setIsLoadingPast(false);
//       }
//     };
//     if (!isAuthLoading) fetchPast();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   const formatDate = (isoString: string, style: 'medium' | 'short' = 'medium'): string => {
//     try {
//         const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: style };
//         if (style === 'medium') dateOptions.timeStyle = 'short';
//         return new Intl.DateTimeFormat('en-US', dateOptions).format(new Date(isoString));
//     } catch (e) { return "Invalid Date"; }
//   };

//   const getStatusBadgeStyling = (status?: string): { text: string, style: React.CSSProperties, className?: string } => {
//     switch (status) {
//         case 'Received': return { text: status, style: { backgroundColor: `rgba(var(--accent-primary-rgb), 0.15)`, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)'}, className: 'themed-badge' };
//         case 'Pending': return { text: status, style: { backgroundColor: `var(--bg-surface-lighter)`, color: 'var(--text-secondary)', borderColor: 'var(--border-color)'}, className: 'themed-badge' };
//         case 'Cancelled': return { text: status, style: { backgroundColor: `rgba(var(--destructive-rgb), 0.1)`, color: 'var(--destructive)', borderColor: 'var(--destructive)'}, className: 'themed-badge' };
//         case 'in_progress': return { text: "In Progress", style: { backgroundColor: `rgba(var(--success-rgb), 0.15)`, color: 'var(--success)', borderColor: 'var(--success)'}, className: 'themed-badge' };
//         case 'N/A':
//         default: return { text: status || 'N/A', style: { backgroundColor: `transparent`, color: 'var(--text-secondary)', borderColor: 'var(--border-color-subtle)'}, className: 'themed-badge themed-badge-outline' };
//     }
//   };


//   const renderLoadingSkeletons = (count: number, type: 'upcoming' | 'history' | 'stat') => (
//     <>
//       {[...Array(count)].map((_, index) => {
//         if (type === 'stat') {
//           return (
//             <Card key={index} className="themed-skeleton-card p-4 flex flex-col justify-between">
//                 <Skeleton className="themed-skeleton h-6 w-3/4 mb-2" />
//                 <Skeleton className="themed-skeleton h-8 w-1/2" />
//             </Card>
//           );
//         }
//         if (type === 'upcoming') {
//           return (
//             <Card key={index} className="themed-skeleton-card p-5 space-y-3">
//                 <div className="flex justify-between items-start">
//                     <div className="space-y-2">
//                         <Skeleton className="themed-skeleton h-5 w-40" />
//                         <Skeleton className="themed-skeleton h-4 w-32" />
//                     </div>
//                     <Skeleton className="themed-skeleton h-9 w-24 rounded-md" />
//                 </div>
//                 <Skeleton className="themed-skeleton h-4 w-48" />
//             </Card>
//           );
//         }
//         // history
//         return (
//           <div key={index} className="flex items-center justify-between py-3.5 themed-skeleton-list-item">
//             <div className="space-y-1.5">
//               <Skeleton className="themed-skeleton h-4 w-36" />
//               <Skeleton className="themed-skeleton h-3 w-28" />
//             </div>
//             <Skeleton className="themed-skeleton h-6 w-20 rounded-full" />
//           </div>
//         );
//       })}
//     </>
//   );


//   return (
//     <>
//       <style jsx global>{`
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
//         .animate-item-entry { /* For list items */
//             opacity: 0;
//             animation: elegant-fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//         }
        
//         .premium-button { /* Main CTA like "Schedule New Interview" */
//             background-color: var(--accent-primary);
//             color: var(--bg-main); 
//             font-weight: 600;
//             border-radius: 0.375rem;
//             padding: 0.65rem 1.25rem; /* Adjusted padding */
//             transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08);
//         }
//         .premium-button:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px) scale(1.02);
//             box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .premium-button-secondary { /* For "Join Room" */
//              background-color: var(--accent-primary); /* Keep accent for primary action */
//             color: var(--bg-main);
//             /* ... same as premium-button or slightly more subtle if needed */
//         }
//          .premium-button-outline {
//             background-color: transparent;
//             color: var(--accent-primary);
//             font-weight: 500; /* Slightly less bold */
//             border: 1px solid var(--accent-primary); /* Thinner border */
//             border-radius: 0.375rem;
//             padding: 0.5rem 1rem;
//             transition: all 0.2s ease-in-out;
//         }
//         .premium-button-outline:hover:not(:disabled) {
//             background-color: rgba(var(--accent-primary-rgb), 0.1);
//             border-color: var(--accent-primary);
//             color: var(--accent-primary); /* Ensure text color stays */
//         }

//         /* Themed Card (base for all dashboard cards) */
//         .themed-card {
//             background-color: var(--bg-surface);
//             border: 1px solid var(--border-color-subtle);
//             border-radius: 0.6rem; /* Slightly larger radius */
//             box-shadow: 0 8px 20px -5px var(--shadow-color), 0 15px 30px -15px var(--shadow-color);
//             transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//         }
//         .themed-card:hover {
//              transform: translateY(-4px);
//              box-shadow: 0 12px 28px -6px var(--shadow-color), 0 20px 40px -20px var(--shadow-color);
//         }
        
//         /* Nested Card (e.g. upcoming interview item) */
//         .themed-nested-card {
//             background-color: var(--bg-surface-lighter);
//             border: 1px solid var(--border-color);
//             border-radius: 0.5rem;
//             transition: background-color 0.2s ease, border-color 0.2s ease;
//         }
//         .themed-nested-card:hover {
//             background-color: var(--bg-main); /* Darken on hover */
//             border-color: var(--accent-primary);
//         }

//         /* Themed Alert */
//         .themed-alert {
//             background-color: rgba(var(--info-rgb), 0.08);
//             border: 1px solid rgba(var(--info-rgb), 0.3);
//             border-left-width: 4px; /* Accent border */
//             border-left-color: var(--info);
//             border-radius: 0.375rem;
//             padding: 1rem;
//         }
//         .themed-alert-title { color: var(--info); }
//         .themed-alert-description { color: var(--text-secondary); }
//         .themed-alert .lucide { color: var(--info); } /* Icon color */

//         /* Themed Badge */
//         .themed-badge {
//             border-width: 1px;
//             border-style: solid;
//             padding: 0.2rem 0.6rem;
//             font-size: 0.75rem;
//             font-weight: 500;
//             border-radius: 9999px; /* pill shape */
//             text-transform: capitalize;
//         }
//          .themed-badge-outline {
//             background-color: transparent !important; /* Ensure it's really outline */
//          }

//         /* Skeleton Theming */
//         @keyframes shimmer {
//             100% {transform: translateX(100%);}
//         }
//         .themed-skeleton {
//             background-color: var(--border-color-subtle); /* Base color */
//             position: relative;
//             overflow: hidden;
//             border-radius: 0.25rem;
//         }
//         .themed-skeleton::after { /* Shimmer effect */
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: linear-gradient(90deg, transparent, rgba(var(--border-color-rgb, 48, 52, 56), 0.3), transparent); /* Use --border-color-rgb */
//             transform: translateX(-100%);
//             animation: shimmer 1.5s infinite;
//         }
//         .themed-skeleton-card { /* For skeleton cards */
//              background-color: var(--bg-surface);
//              border: 1px solid var(--border-color-subtle);
//              border-radius: 0.5rem;
//         }
//         .themed-skeleton-list-item {
//             border-bottom: 1px solid var(--border-color-subtle);
//         }
//         :root { /* Add --border-color-rgb */
//             --border-color-rgb: 48, 52, 56; /* Corresponds to #303438 */
//         }

//       `}</style>
//       <AppLayout>
//         <div className="space-y-10 p-4 md:p-6 lg:p-8"> {/* Added padding to main content area */}
//             {/* Header Section */}
//             <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
//                             Welcome back, {user?.name ? user.name.split(' ')[0] : 'Interviewee'}!
//                         </h1>
//                         <p style={{ color: 'var(--text-secondary)' }}>Here's your Mock Orbit dashboard.</p>
//                     </div>
//                     <Link href="/schedule" passHref>
//                         <Button className="premium-button w-full sm:w-auto">
//                             <CalendarDays className="mr-2 h-5 w-5"/> Schedule New Interview
//                         </Button>
//                     </Link>
//                 </div>

//                 {/* Quick Stats Section */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
//                     {isLoadingStats ? renderLoadingSkeletons(3, 'stat') : (
//                         <>
//                         <StatCard icon={Activity} title="Total Interviews" value={dashboardStats.totalInterviews ?? 'N/A'} delay="0.2s" />
//                         <StatCard icon={BarChart3} title="Avg. Feedback" value={dashboardStats.avgFeedbackScore ? `${dashboardStats.avgFeedbackScore}/5` : 'N/A'} delay="0.3s"/>
//                         <StatCard icon={Clock} title="Next Up" value={dashboardStats.nextInterviewIn ?? 'N/A'} delay="0.4s"/>
//                         </>
//                     )}
//                 </div>
//             </div>


//           <div className="animate-item-entry" style={{animationDelay: '0.5s'}}>
//           <Card className="themed-card">
//             <CardHeader className="pb-4 border-b" style={{borderColor: 'var(--border-color)'}}>
//               <CardTitle className="flex items-center text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//                 <UserCheck className="mr-3 h-6 w-6" style={{color: 'var(--accent-primary)'}}/>Upcoming Interviews
//               </CardTitle>
//               <CardDescription style={{ color: 'var(--text-secondary)' }}>Your scheduled practice. Join the room when it's time!</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-5">
//               {isLoadingUpcoming ? renderLoadingSkeletons(2, 'upcoming')
//                 : upcomingInterviews.length > 0 ? (
//                   <ul className="space-y-4">
//                     {upcomingInterviews.map((interview, idx) => (
//                       <li key={interview.id} className="animate-item-entry" style={{animationDelay: `${idx * 0.1}s`}}>
//                       <Card className="themed-nested-card p-4">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                             <div className="flex-grow">
//                                 <p className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>{interview.topic}</p>
//                                 <p className="text-sm" style={{color: 'var(--text-secondary)'}}>With: {interview.interviewer?.name || 'N/A'}</p>
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
//                                     {interview.status === 'in_progress' ? 'Rejoin Room' : 'Join Room'}
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
//                         <Info className="h-5 w-5" /> {/* Icon color handled by .themed-alert .lucide */}
//                         <AlertTitle className="themed-alert-title">No Upcoming Interviews</AlertTitle>
//                         <AlertDescription className="themed-alert-description">
//                         You don&apos;t have any interviews scheduled yet. Click &quot;Schedule New Interview&quot; to get started!
//                         </AlertDescription>
//                     </Alert>
//                 )}
//             </CardContent>
//           </Card>
//           </div>

//           <div className="grid gap-8 md:grid-cols-2 mt-10">
//             <div className="animate-item-entry" style={{animationDelay: '0.6s'}}>
//             <Card className="themed-card">
//               <CardHeader className="pb-4 border-b" style={{borderColor: 'var(--border-color)'}}>
//                 <CardTitle className="flex items-center text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//                     <History className="mr-3 h-6 w-6" style={{color: 'var(--accent-primary)'}}/>Interview History
//                 </CardTitle>
//                 <CardDescription style={{ color: 'var(--text-secondary)' }}>Review your past interviews and feedback status.</CardDescription>
//               </CardHeader>
//               <CardContent className="pt-2"> {/* Reduced top padding as list items have py */}
//                 {isLoadingPast ? renderLoadingSkeletons(3, 'history')
//                   : pastInterviews.length > 0 ? (
//                     <ul className="space-y-0"> {/* No space, handled by li padding & border */}
//                       {pastInterviews.map((interview, idx) => (
//                         <li key={interview.id} className="flex items-center justify-between py-3.5 animate-item-entry" style={{borderBottom: `1px solid var(--border-color-subtle)`, animationDelay: `${idx * 0.08}s`}}>
//                           <div>
//                             <p className="font-medium" style={{color: 'var(--text-primary)'}}>{interview.topic}</p>
//                             <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
//                                 vs {interview.interviewer?.name || 'N/A'} on {formatDate(interview.scheduled_time, 'short')}
//                             </p>
//                           </div>
//                            <Badge style={getStatusBadgeStyling(interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status).style} className={getStatusBadgeStyling(interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status).className}>
//                                 {getStatusBadgeStyling(interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status).text}
//                            </Badge>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p className="text-center py-6 text-sm" style={{color: 'var(--text-secondary)'}}>No past interview history found.</p>
//                   )}
//               </CardContent>
//               {pastInterviews.length > 0 && (
//                 <CardFooter className="pt-2 pb-5 border-t" style={{borderColor: 'var(--border-color)'}}>
//                     <Link href="/profile#history" passHref className="w-full">
//                         <Button variant="outline" size="sm" className="premium-button-outline w-full">View Full Profile History</Button>
//                     </Link>
//                 </CardFooter>
//               )}
//             </Card>
//             </div>

//             <div className="animate-item-entry" style={{animationDelay: '0.7s'}}>
//             <Card className="themed-card">
//               <CardHeader className="pb-4 border-b" style={{borderColor: 'var(--border-color)'}}>
//                 <CardTitle className="flex items-center text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//                     <BookOpen className="mr-3 h-6 w-6" style={{color: 'var(--accent-primary)'}}/>Preparation Tools
//                 </CardTitle>
//                 <CardDescription style={{ color: 'var(--text-secondary)' }}>Utilize these resources to sharpen your interview skills.</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-3 pt-5">
//                 <Link href="/question-generator" className="block p-4 themed-nested-card">
//                     <div className="flex items-start gap-3">
//                         <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: 'var(--accent-primary)'}}/>
//                         <div>
//                             <p className="font-medium" style={{color: 'var(--text-primary)'}}>AI Question Generator</p>
//                             <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Practice with AI-generated questions tailored to your needs.</p>
//                         </div>
//                     </div>
//                 </Link>
//                 {/* Add more resource links here styled similarly */}
//               </CardContent>
//             </Card>
//             </div>
//           </div>
//         </div>
//       </AppLayout>
//     </>
//   );
// }


// // Helper component for StatCard
// const StatCard = ({ icon: Icon, title, value, delay }: { icon: React.ElementType, title: string, value: string | number, delay?: string }) => (
//     <div className="animate-item-entry" style={{animationDelay: delay}}>
//     <Card className="themed-card p-5"> {/* Use themed-card for consistency */}
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
//             <CardTitle className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>{title}</CardTitle>
//             <Icon className="h-5 w-5" style={{color: 'var(--text-secondary)'}}/>
//         </CardHeader>
//         <CardContent className="p-0">
//             <div className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{value}</div>
//             {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
//         </CardContent>
//     </Card>
//     </div>
// );