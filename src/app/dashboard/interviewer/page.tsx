
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
