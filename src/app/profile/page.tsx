
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Loader2, UserCircle, Edit3, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
  email: z.string().email().readonly(),
  profile_picture_url: z.string().url({ message: "Invalid URL. Please enter a valid image URL or leave empty." }).optional().or(z.literal('')),
  id: z.string().readonly(), // Added ID field for display
});

type ProfileFormValues = Omit<z.infer<typeof profileSchema>, 'email' | 'id'>;

interface InterviewHistoryItem {
  id: string;
  scheduled_time: string;
  interviewer: { id: string; name: string };
  interviewee: { id: string; name: string };
  topic: string;
  status: 'Completed' | 'Cancelled' | 'Scheduled' | 'in_progress';
  feedback_status: 'Received' | 'Provided' | 'Pending' | 'N/A';
  role_played?: 'Interviewer' | 'Interviewee';
  counterpart_name?: string;
}

export default function ProfilePage() {
  const { user, token, isLoading: isAuthLoading, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", profile_picture_url: "", id: "" },
  });

 useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        profile_picture_url: user.profile_picture_url || "",
        id: user.id || "",
      });
    }
  }, [user, form]);

  useEffect(() => {
    const fetchHistory = async () => {
       if (!user?.id || !token) {
           setIsHistoryLoading(false);
           return;
       }
      setIsHistoryLoading(true);
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/interviews?status=completed,cancelled,in_progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch interview history');

        const historyWithDetails = (data || []).map((item: InterviewHistoryItem) => ({
             ...item,
             role_played: item.interviewer.id === user.id ? 'Interviewer' : 'Interviewee',
             counterpart_name: item.interviewer.id === user.id ? item.interviewee.name : item.interviewer.name,
         })).sort((a: InterviewHistoryItem, b: InterviewHistoryItem) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

        setHistory(historyWithDetails);
      } catch (error: any) {
        console.error("Failed to fetch interview history:", error);
        toast({ title: "Error", description: `Could not load interview history: ${error.message}`, variant: "destructive" });
        setHistory([]);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    if (!isAuthLoading) fetchHistory();
  }, [user?.id, token, toast, isAuthLoading]);

   async function onSubmit(values: z.infer<typeof profileSchema>) {
     if (!user || !token) {
         toast({ title: "Authentication Error", description: "Please log in to update your profile.", variant: "destructive" });
         return;
     }
     setIsSubmitting(true);
     const submissionData: ProfileFormValues = { name: values.name, profile_picture_url: values.profile_picture_url || undefined };
     if (values.profile_picture_url === '') submissionData.profile_picture_url = '';

     try {
       const response = await fetch(`${API_URL}/users/profile`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(submissionData),
       });
       const updatedUserData = await response.json();
       if (!response.ok) throw new Error(updatedUserData.error || `Profile update failed: ${response.status}`);
       if (token && updatedUserData) login(token, updatedUserData); // login updates the user in AuthContext
       else throw new Error("Failed to update local user state after profile update.");
       toast({ title: "Profile Updated!", description: "Your information has been successfully saved.", variant: "default" });
     } catch (error: any) {
       toast({ title: "Update Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
     } finally {
       setIsSubmitting(false);
     }
   }

   const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id).then(() => {
        setCopiedId(true);
        toast({ title: "Copied!", description: "Your Peer ID has been copied to the clipboard.", variant: "default" });
        setTimeout(() => setCopiedId(false), 2000);
      }).catch(err => {
        toast({ title: "Copy Failed", description: "Could not copy ID to clipboard.", variant: "destructive" });
      });
    }
  };

   const getInitials = (name?: string | null) => (name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "??");
   const formatHistoryDate = (isoString: string): string => {
       try {
           return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
       } catch (e) { return "Invalid Date"; }
   };

   const getFeedbackBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Received': return 'default';
        case 'Provided': return 'default';
        case 'Pending': return 'secondary';
        case 'N/A':
        case 'Cancelled': return 'outline';
        default: return 'outline';
    }
   };

    const renderHistoryLoadingSkeletons = (count: number) => (
        <Table>
            <TableHeader>
                <TableRow>
                    {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>)}
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(count)].map((_, index) => (
                    <TableRow key={index}>
                        {[...Array(6)].map((_, i) => <TableCell key={i}><Skeleton className="h-4 w-full" /></TableCell>)}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

  if (isAuthLoading) {
      return (
          <AppLayout>
              <div className="space-y-8 p-2 md:p-0">
                <Skeleton className="h-10 w-1/3" />
                <Card className="shadow-sm border-border">
                    <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-10 flex-1" /></div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                     <CardFooter><Skeleton className="h-10 w-28 rounded-md" /></CardFooter>
                </Card>
                 <Card className="shadow-sm border-border">
                    <CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader>
                    <CardContent>{renderHistoryLoadingSkeletons(3)}</CardContent>
                 </Card>
              </div>
          </AppLayout>
      )
  }

  if (!user) {
       return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center gap-4 pt-12 text-center">
                    <UserCircle className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg font-medium">Please log in to view your profile.</p>
                    <Link href="/auth/login"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Login</Button></Link>
                </div>
            </AppLayout>
       )
   }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center"><UserCircle className="mr-3 w-8 h-8"/>Your Profile</h1>

        <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center text-xl"><Edit3 className="mr-2 h-5 w-5"/>Account Information</CardTitle>
                <CardDescription>Manage your personal details. Email address and Peer ID cannot be changed.</CardDescription>
            </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                    <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
                        <AvatarImage src={form.watch('profile_picture_url') || user.profile_picture_url || undefined} alt={user.name || 'User Avatar'} />
                        <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <FormField
                        control={form.control}
                        name="profile_picture_url"
                        render={({ field }) => (
                        <FormItem className="flex-1 w-full sm:w-auto">
                            <FormLabel className="text-foreground">Profile Picture URL</FormLabel>
                            <FormControl>
                            <Input placeholder="https://example.com/your-avatar.png" {...field} value={field.value || ""} className="bg-background border-input focus:border-primary focus:ring-primary"/>
                            </FormControl>
                             <FormDescription className="text-xs">Enter a valid image URL (e.g., PNG, JPG) or leave empty for initials.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </div>

                 <FormField
                   control={form.control}
                   name="name"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-foreground">Full Name</FormLabel>
                       <FormControl>
                         <Input {...field} value={field.value ?? ""} className="bg-background border-input focus:border-primary focus:ring-primary"/>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-foreground">Email Address</FormLabel>
                           <FormControl>
                               <Input type="email" value={user.email || ""} readOnly disabled className="bg-muted/60 border-input cursor-not-allowed"/>
                           </FormControl>
                           <FormDescription className="text-xs">Email address is linked to your account and cannot be changed.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-foreground">Peer ID</FormLabel>
                           <div className="flex items-center gap-2">
                               <FormControl>
                                   <Input value={user.id || ""} readOnly disabled className="bg-muted/60 border-input cursor-not-allowed flex-grow"/>
                               </FormControl>
                               <Button type="button" variant="outline" size="icon" onClick={handleCopyId} title="Copy Peer ID" className="shrink-0">
                                   {copiedId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                               </Button>
                           </div>
                           <FormDescription className="text-xs">This is your unique identifier for scheduling interviews.</FormDescription>
                           <FormMessage />
                        </FormItem>
                    )}
                 />
                 <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
                   {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</> : "Save Changes"}
                 </Button>
               </form>
             </Form>
           </CardContent>
        </Card>

        <Card id="history" className="shadow-lg border-border hover:shadow-xl transition-shadow">
            <CardHeader>
                <CardTitle className="flex items-center text-xl"><History className="mr-2 h-5 w-5"/> Interview History</CardTitle>
                <CardDescription>A record of your past and ongoing interviews.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                {isHistoryLoading ? (
                     renderHistoryLoadingSkeletons(5)
                ) : history.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Your Role</TableHead>
                                <TableHead>Counterpart</TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Feedback</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id} className="hover:bg-secondary/50 transition-colors">
                                    <TableCell className="whitespace-nowrap font-medium">{formatHistoryDate(item.scheduled_time)}</TableCell>
                                    <TableCell><Badge variant={item.role_played === 'Interviewer' ? 'default' : 'secondary'}>{item.role_played}</Badge></TableCell>
                                    <TableCell>{item.counterpart_name}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={item.topic}>{item.topic}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            item.status === 'Completed' ? 'default' :
                                            item.status === 'Cancelled' ? 'destructive' :
                                            item.status === 'in_progress' ? 'outline' :
                                            'secondary'
                                        }>
                                        {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                       <Badge variant={getFeedbackBadgeVariant(item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status)}>
                                            {item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-center py-6">No interview history found. Start by scheduling an interview!</p>
                )}
            </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
