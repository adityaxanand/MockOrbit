
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
