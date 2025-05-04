
"use client"; // This must be a client component to use hooks like useState, useEffect, useAuth

import { useState, useEffect } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, History, BookOpen, Lightbulb, Loader2 } from "lucide-react"; // Added Loader2
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider"; // Import useAuth
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Define interface for Interview data matching backend response
interface Interview {
  id: string;
  interviewer?: { id: string; name: string; }; // Optional because interviewer might conduct
  interviewee?: { id: string; name: string; }; // Optional because interviewee might attend
  scheduled_time: string; // ISO string format from backend
  topic: string;
  feedback_status?: 'Received' | 'Pending' | 'Provided' | 'N/A'; // Status for past interviews
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export default function IntervieweeDashboardPage() {
  const { user, token, isLoading: isAuthLoading, activeRole } = useAuth(); // Use activeRole
  const { toast } = useToast();
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [isLoadingPast, setIsLoadingPast] = useState(true);

   // Redirect if role is incorrect (handled by AuthProvider now, but keep as fallback)
   useEffect(() => {
        if (!isAuthLoading && activeRole && activeRole !== 'interviewee') {
            // This shouldn't happen if AuthProvider redirect works, but good safeguard
            toast({ title: "Access Denied", description: "Redirecting to your dashboard...", variant: "destructive" });
            // router.push(`/dashboard/${activeRole}`);
        }
    }, [isAuthLoading, activeRole, toast]);

  // Fetch Upcoming Interviews
  useEffect(() => {
    const fetchUpcoming = async () => {
      if (!user?.id || !token || activeRole !== 'interviewee') { // Check active role
          setIsLoadingUpcoming(false);
          return; // Don't fetch if user/token missing or wrong role active
      }
      setIsLoadingUpcoming(true);
      try {
        // Fetch interviews where the user is the interviewee and status is scheduled
        const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=scheduled`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json(); // Always parse JSON

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch upcoming interviews');
        }
        setUpcomingInterviews(data || []); // Ensure data is an array
      } catch (error: any) {
        console.error("Failed to fetch upcoming interviews:", error);
        toast({ title: "Error", description: `Could not load upcoming interviews: ${error.message}`, variant: "destructive" });
        setUpcomingInterviews([]); // Clear on error
      } finally {
        setIsLoadingUpcoming(false);
      }
    };
    if (!isAuthLoading) { // Fetch only when auth is resolved
        fetchUpcoming();
    }
  }, [user?.id, token, toast, isAuthLoading, activeRole]); // Add activeRole dependency


  // Fetch Past Interviews
  useEffect(() => {
     const fetchPast = async () => {
       if (!user?.id || !token || activeRole !== 'interviewee') { // Check active role
           setIsLoadingPast(false);
           return; // Don't fetch if user/token missing or wrong role active
       }
       setIsLoadingPast(true);
       try {
         // Fetch interviews where user is interviewee and status is completed or cancelled
         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewee&status=completed,cancelled`, {
           headers: { Authorization: `Bearer ${token}` },
         });

         const data = await response.json(); // Always parse JSON

         if (!response.ok) {
           throw new Error(data.error || 'Failed to fetch past interviews');
         }

         setPastInterviews(data || []); // Ensure data is an array
       } catch (error: any) {
         console.error("Failed to fetch past interviews:", error);
         toast({ title: "Error", description: `Could not load past interviews: ${error.message}`, variant: "destructive" });
         setPastInterviews([]); // Clear on error
       } finally {
         setIsLoadingPast(false);
       }
     };
     if (!isAuthLoading) { // Fetch only when auth is resolved
         fetchPast();
     }
   }, [user?.id, token, toast, isAuthLoading, activeRole]); // Add activeRole dependency


   const formatDate = (isoString: string): string => {
       try {
           // More robust formatting: Show date and time in local timezone
           return new Intl.DateTimeFormat(undefined, { // Use user's locale/timezone
               dateStyle: 'medium',
               timeStyle: 'short',
           }).format(new Date(isoString));
       } catch (e) {
           return "Invalid Date";
       }
   };

   const formatHistoryDate = (isoString: string): string => {
      try {
          return new Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(new Date(isoString)); // Use user's locale
      } catch (e) {
          return "Invalid Date";
      }
   };

   const renderLoadingSkeletons = (count: number, type: 'upcoming' | 'history') => (
    <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
             type === 'upcoming' ? (
                 <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                     <div className="mb-2 sm:mb-0 space-y-2">
                         <Skeleton className="h-4 w-48" />
                         <Skeleton className="h-4 w-32" />
                         <Skeleton className="h-4 w-40" />
                     </div>
                     <Skeleton className="h-9 w-20" />
                 </div>
             ) : (
                 <div key={index} className="flex items-center justify-between text-sm py-2">
                     <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                     </div>
                     <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
             )
        ))}
    </div>
   );


  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Interviewee Dashboard</h1>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Your scheduled practice interviews.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUpcoming ? (
                renderLoadingSkeletons(2, 'upcoming')
            ) : upcomingInterviews.length > 0 ? (
              <ul className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <li key={interview.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-secondary transition-colors">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium">Interviewer: {interview.interviewer?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Topic: {interview.topic}</p>
                       <div className="flex items-center text-sm text-muted-foreground mt-1">
                         <Calendar className="w-4 h-4 mr-1.5" />
                         <span>{formatDate(interview.scheduled_time)}</span>
                      </div>
                    </div>
                     <Link href={`/interview-room/${interview.id}`} passHref>
                         <Button size="sm" disabled={interview.status !== 'scheduled'}> {/* Disable if not scheduled */}
                             {interview.status === 'scheduled' ? 'Join Room' : interview.status}
                         </Button>
                     </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No upcoming interviews scheduled.</p>
            )}
             <div className="mt-6 flex justify-center">
                <Link href="/schedule" passHref>
                    <Button variant="outline">Schedule New Interview</Button>
                </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interview History</CardTitle>
                 <CardDescription>Review your past interviews and feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPast ? (
                   renderLoadingSkeletons(2, 'history')
                ) : pastInterviews.length > 0 ? (
                  <ul className="space-y-3">
                    {pastInterviews.map((interview) => (
                      <li key={interview.id} className="flex items-center justify-between text-sm">
                        <div>
                           <p>vs {interview.interviewer?.name || 'N/A'} ({formatHistoryDate(interview.scheduled_time)})</p>
                           <p className="text-xs text-muted-foreground">Topic: {interview.topic}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                            interview.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' : // Specific style for cancelled
                            interview.feedback_status === 'Received' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            interview.feedback_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-secondary text-secondary-foreground' // Default or other status
                            }`}>
                             {interview.status === 'cancelled' ? 'Cancelled' : interview.feedback_status || 'N/A'}
                        </span>
                         {/* Optional: Link to view feedback */}
                         {/* {interview.feedback_status === 'Received' && (
                            <Link href={`/feedback/${interview.id}`} className="ml-2 text-accent text-xs hover:underline">View</Link>
                         )} */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-3">No past interview history.</p>
                )}
                 <div className="mt-4 flex justify-center">
                    <Link href="/profile#history" passHref>
                         <Button variant="link" size="sm">View Full History</Button>
                    </Link>
                </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Preparation Resources</CardTitle>
                 <CardDescription>Tools and materials to help you prepare.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Link href="/question-generator" className="flex items-center p-3 border rounded-lg hover:bg-secondary transition-colors">
                    <Lightbulb className="w-5 h-5 mr-3 text-accent"/>
                    <div>
                        <p className="font-medium">AI Question Generator</p>
                        <p className="text-sm text-muted-foreground">Practice with AI-generated questions.</p>
                    </div>
                 </Link>
                  {/* <Link href="/articles" className="flex items-center p-3 border rounded-lg hover:bg-secondary transition-colors">
                     <BookOpen className="w-5 h-5 mr-3 text-accent"/>
                     <div>
                         <p className="font-medium">Interview Tips & Articles</p>
                         <p className="text-sm text-muted-foreground">Read guides and best practices.</p>
                     </div>
                  </Link> */}
              </CardContent>
            </Card>
        </div>
      </div>
    </AppLayout>
  );
}
