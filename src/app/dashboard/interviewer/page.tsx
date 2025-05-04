
"use client"; // Must be a client component for hooks

import { useState, useEffect } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Star, Loader2 } from "lucide-react"; // Added Loader2
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Define interfaces for data matching backend
interface Interview {
  id: string;
  interviewee?: { id: string; name: string; };
  scheduled_time: string; // ISO string format recommended
  topic: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface PerformanceStats {
  interviewsConducted: number;
  averageRating: number | null; // Can be null if no ratings yet
  feedbackPending: number;
}

export default function InterviewerDashboardPage() {
  const { user, token, isLoading: isAuthLoading, activeRole } = useAuth(); // Use activeRole
  const { toast } = useToast();
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

   // Redirect if role is incorrect (handled by AuthProvider now)
   useEffect(() => {
    if (!isAuthLoading && activeRole && activeRole !== 'interviewer') {
         toast({ title: "Access Denied", description: "Redirecting to your dashboard...", variant: "destructive" });
        // router.push(`/dashboard/${activeRole}`);
    }
   }, [isAuthLoading, activeRole, toast]);

  // Fetch Scheduled Interviews
  useEffect(() => {
    const fetchScheduled = async () => {
       if (!user?.id || !token || activeRole !== 'interviewer') { // Check role
           setIsLoadingInterviews(false);
           return;
       }
       setIsLoadingInterviews(true);
       try {
         // Fetch interviews where the user is the interviewer and status is scheduled
         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled`, {
           headers: { Authorization: `Bearer ${token}` },
         });

         const data = await response.json();

         if (!response.ok) {
             throw new Error(data.error || 'Failed to fetch scheduled interviews');
         }

         setScheduledInterviews(data || []); // Ensure data is an array
       } catch (error: any) {
         console.error("Failed to fetch scheduled interviews:", error);
         toast({ title: "Error", description: `Could not load scheduled interviews: ${error.message}`, variant: "destructive" });
         setScheduledInterviews([]); // Clear on error
       } finally {
         setIsLoadingInterviews(false);
       }
     };
     if (!isAuthLoading) {
         fetchScheduled();
     }
   }, [user?.id, token, toast, isAuthLoading, activeRole]); // Add activeRole dependency


    // Fetch Performance Stats
    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id || !token || activeRole !== 'interviewer') { // Check role
                setIsLoadingStats(false);
                return;
            }
            setIsLoadingStats(true);
            try {
                // Fetch stats for the current user
                const response = await fetch(`${API_URL}/users/${user.id}/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch performance stats');
                }

                setPerformanceStats(data);
            } catch (error: any) {
                console.error("Failed to fetch performance stats:", error);
                toast({ title: "Error", description: `Could not load performance stats: ${error.message}`, variant: "destructive" });
                setPerformanceStats(null); // Clear on error
            } finally {
                setIsLoadingStats(false);
            }
        };
        if (!isAuthLoading) {
            fetchStats();
        }
    }, [user?.id, token, toast, isAuthLoading, activeRole]); // Add activeRole dependency


   const formatDate = (isoString: string): string => {
       try {
           return new Intl.DateTimeFormat(undefined, { // Use user's locale/timezone
               dateStyle: 'medium',
               timeStyle: 'short',
           }).format(new Date(isoString));
       } catch (e) {
           return "Invalid Date";
       }
   };

    const renderStatCardSkeleton = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-12 mb-1" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );

     const renderInterviewListSkeleton = () => (
        <div className="space-y-4">
           {[...Array(2)].map((_, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                    <div className="mb-2 sm:mb-0 space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                         <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                </div>
           ))}
        </div>
     );


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Interviewer Dashboard</h1>

        {/* Stats Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
           {isLoadingStats ? ( // Check isLoadingStats directly
               <>
                 {renderStatCardSkeleton()}
                 {renderStatCardSkeleton()}
                 {renderStatCardSkeleton()}
               </>
           ) : performanceStats ? ( // Check if performanceStats is not null
               <>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Interviews Conducted</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceStats.interviewsConducted}</div>
                      <p className="text-xs text-muted-foreground">Total interviews completed</p>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                          {performanceStats.averageRating !== null ? `${performanceStats.averageRating.toFixed(1)} / 5` : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">Based on interviewee feedback</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Feedback Pending</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceStats.feedbackPending}</div>
                       {/* Link to feedback page/section - Update href if needed */}
                       {/* Add Link component if needed */}
                       <p className="text-xs text-muted-foreground hover:underline text-accent cursor-pointer">View interviews</p> {/* Placeholder link */}
                    </CardContent>
                  </Card>
               </>
           ) : (
              // Render placeholder or error message if stats failed to load
               <p className="text-muted-foreground col-span-full text-center">Could not load performance statistics.</p>
           )}
        </div>

        {/* Upcoming Interviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Scheduled Interviews</CardTitle>
            <CardDescription>Interviews you are scheduled to conduct.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInterviews ? (
                renderInterviewListSkeleton()
            ) : scheduledInterviews.length > 0 ? (
              <ul className="space-y-4">
                {scheduledInterviews.map((interview) => (
                  <li key={interview.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium">{interview.interviewee?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Topic: {interview.topic}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                         <Calendar className="w-4 h-4 mr-1.5" />
                         <span>{formatDate(interview.scheduled_time)}</span>
                      </div>
                    </div>
                    <Link href={`/interview-room/${interview.id}`} passHref>
                        <Button size="sm" disabled={interview.status !== 'scheduled'}>
                            {interview.status === 'scheduled' ? 'Join Room' : interview.status}
                        </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming interviews scheduled.</p>
            )}
            {/* Keep the link to the full schedule */}
            <div className="mt-6 flex justify-center">
                <Link href="/schedule" passHref>
                    <Button variant="outline">View/Update Availability</Button> {/* Changed Button text */}
                </Link>
            </div>
          </CardContent>
        </Card>

         {/* Add more sections like recent feedback, performance charts, etc. */}
      </div>
    </AppLayout>
  );
}
