
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



// "use client";

// import { useState, useEffect } from 'react';
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import AppLayout from "@/components/shared/AppLayout";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from '@/providers/AuthProvider';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { History, UserCircle, Edit3, Copy, Check, Users, Loader2 } from 'lucide-react'; // Added Users for table role
// import Link from 'next/link';
// import { Badge } from "@/components/ui/badge";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// const profileSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
//   email: z.string().email().readonly(), // Email is read-only in the form
//   profile_picture_url: z.string().url({ message: "Invalid URL. Please enter a valid image URL or leave empty." }).optional().or(z.literal('')),
//   id: z.string().readonly(),
// });

// // For submission, we omit readonly fields that aren't part of the PATCH body
// type ProfileFormSubmissionValues = Pick<z.infer<typeof profileSchema>, 'name' | 'profile_picture_url'>;


// interface InterviewHistoryItem {
//   id: string;
//   scheduled_time: string;
//   interviewer: { id: string; name: string };
//   interviewee: { id: string; name: string };
//   topic: string;
//   status: 'Completed' | 'Cancelled' | 'Scheduled' | 'in_progress';
//   feedback_status: 'Received' | 'Provided' | 'Pending' | 'N/A';
//   role_played?: 'Interviewer' | 'Interviewee';
//   counterpart_name?: string;
// }

// export default function ProfilePage() {
//   const { user, token, isLoading: isAuthLoading, login } = useAuth();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const { toast } = useToast();
//   const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
//   const [isHistoryLoading, setIsHistoryLoading] = useState(true);
//   const [copiedId, setCopiedId] = useState(false);

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
//     destructive: "#E57373", // Slightly softer red
//     destructiveRgb: "229, 115, 115",
//     success: "#81C784", // Softer green
//     successRgb: "129, 199, 132",
//     info: "#64B5F6", // Softer blue
//     infoRgb: "100, 181, 246",
//     warning: "#FFB74D", // Amber for pending/warning
//     accentPrimaryRgb: "201, 164, 97",
//     borderPrimaryRgb: "48, 52, 56", // For skeleton shimmer (uses border-color)
//   };

//   const form = useForm<z.infer<typeof profileSchema>>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: { name: "", email: "", profile_picture_url: "", id: "" },
//   });

//  useEffect(() => {
//     if (user) {
//       form.reset({
//         name: user.name || "",
//         email: user.email || "", // Will be displayed as read-only
//         profile_picture_url: user.profile_picture_url || "",
//         id: user.id || "", // Will be displayed as read-only
//       });
//     }
//   }, [user, form]);

//   useEffect(() => {
//     const fetchHistory = async () => {
//         if (!user?.id || !token) {
//             setIsHistoryLoading(false); return;
//         }
//       setIsHistoryLoading(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?status=completed,cancelled,in_progress,scheduled`, { // Added scheduled
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch interview history');

//         const historyWithDetails = ((Array.isArray(data) ? data : []).map((item: any) => ({ // Use any for raw item
//           id: item.id,
//           scheduled_time: item.scheduled_time,
//           interviewer: item.interviewer,
//           interviewee: item.interviewee,
//           topic: item.topic,
//           status: item.status, // Assuming status is correctly cased from API
//           feedback_status: item.feedback_status,
//           role_played: item.interviewer.id === user.id ? 'Interviewer' as 'Interviewer' : 'Interviewee' as 'Interviewee',
//           counterpart_name: item.interviewer.id === user.id ? item.interviewee.name : item.interviewer.name,
//         })) as InterviewHistoryItem[]).sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

//         setHistory(historyWithDetails);
//       } catch (error: any) {
//         toast({ title: "Error", description: `History: ${error.message}`, variant: "destructive" });
//         setHistory([]);
//       } finally {
//         setIsHistoryLoading(false);
//       }
//     };
//     if (!isAuthLoading && user?.id && token) fetchHistory();
//      else if (!isAuthLoading) setIsHistoryLoading(false);
//   }, [user?.id, token, toast, isAuthLoading]);

//   async function onSubmit(values: z.infer<typeof profileSchema>) {
//     if (!user || !token) {
//         toast({ title: "Authentication Error", description: "Please log in.", variant: "destructive" });
//         return;
//     }
//     setIsSubmitting(true);
//     const submissionData: ProfileFormSubmissionValues = { 
//         name: values.name, 
//         profile_picture_url: values.profile_picture_url === "" ? "" : values.profile_picture_url || undefined, // Send "" if empty, else undefined if nullish
//     };

//     try {
//       const response = await fetch(`${API_URL}/users/profile`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//         body: JSON.stringify(submissionData),
//       });
//       const updatedUserData = await response.json();
//       if (!response.ok) throw new Error(updatedUserData.error || `Profile update failed`);
      
//       // The 'login' function from useAuth should handle updating the user context and local storage
//       if (token && updatedUserData) login(token, updatedUserData); 
//       else throw new Error("Failed to update local user state.");
      
//       toast({ title: "Profile Updated!", description: "Your information saved.", variant: "default" });
//     } catch (error: any) {
//       toast({ title: "Update Failed", description: error.message, variant: "destructive" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   const handleCopyId = () => { /* ... (same as before) ... */ 
//     if (user?.id) {
//         navigator.clipboard.writeText(user.id).then(() => {
//             setCopiedId(true);
//             toast({ title: "Copied!", description: "Peer ID copied to clipboard." });
//             setTimeout(() => setCopiedId(false), 2000);
//         }).catch(err => {
//             toast({ title: "Copy Failed", description: "Could not copy ID.", variant: "destructive" });
//         });
//     }
//   };

//   const getInitials = (name?: string | null) => (name ? name.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('').toUpperCase() : "MO");

//   const formatHistoryDate = (isoString: string): string => { /* ... (same) ... */ 
//     try { return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString)); } catch (e) { return "Invalid Date"; }
//   };

//   const getBadgeStyling = (type: 'role' | 'status' | 'feedback', value?: string): { text: string, style: React.CSSProperties, className?: string } => {
//     const baseBadgeStyle: React.CSSProperties = { borderWidth: '1px', borderStyle: 'solid' };
//     let specificStyle: React.CSSProperties = {};
//     let text = value || 'N/A';

//     if (type === 'role') {
//         if (value === 'Interviewer') {
//             specificStyle = { backgroundColor: `rgba(var(--accent-primary-rgb), 0.15)`, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' };
//         } else { // Interviewee
//             specificStyle = { backgroundColor: `rgba(${theme.infoRgb}, 0.15)`, color: `var(--info)`, borderColor: `var(--info)` };
//         }
//     } else if (type === 'status') {
//         text = value?.replace('_', ' ') || 'Unknown';
//         switch (value) {
//             case 'Completed': specificStyle = { backgroundColor: `rgba(${theme.successRgb}, 0.15)`, color: `var(--success)`, borderColor: `var(--success)` }; break;
//             case 'Cancelled': specificStyle = { backgroundColor: `rgba(${theme.destructiveRgb}, 0.1)`, color: `var(--destructive)`, borderColor: `var(--destructive)` }; break;
//             case 'in_progress': specificStyle = { backgroundColor: `rgba(${theme.infoRgb}, 0.15)`, color: `var(--info)`, borderColor: `var(--info)` }; text="In Progress"; break;
//             case 'Scheduled':
//             default: specificStyle = { backgroundColor: `var(--bg-surface-lighter)`, color: `var(--text-secondary)`, borderColor: `var(--border-color)` }; break;
//         }
//     } else if (type === 'feedback') {
//          switch (value) {
//             case 'Received': case 'Provided': specificStyle = { backgroundColor: `rgba(var(--accent-primary-rgb), 0.15)`, color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }; break;
//             case 'Pending': specificStyle = { backgroundColor: `rgba(${theme.infoRgb},0.1)`, color: `var(--info)`, borderColor: `var(--info)` }; break; // Using info for pending
//             case 'N/A':
//             default: specificStyle = { backgroundColor: `transparent`, color: 'var(--text-secondary)', borderColor: 'var(--border-color-subtle)'}; return { text, style: { ...baseBadgeStyle, ...specificStyle }, className: 'themed-badge themed-badge-outline' };
//         }
//     }
//     return { text, style: { ...baseBadgeStyle, ...specificStyle }, className: 'themed-badge' };
//   };

//   const renderHistoryLoadingSkeletons = (count: number) => ( /* ... (use themed-skeleton) ... */
//     <Table className="themed-table">
//         <TableHeader>
//             <TableRow>
//                 {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="themed-skeleton h-4 w-full my-1" /></TableHead>)}
//             </TableRow>
//         </TableHeader>
//         <TableBody>
//             {[...Array(count)].map((_, index) => (
//                 <TableRow key={index}>
//                     {[...Array(6)].map((_, i) => <TableCell key={i}><Skeleton className="themed-skeleton h-4 w-full my-1" /></TableCell>)}
//                 </TableRow>
//             ))}
//         </TableBody>
//     </Table>
//   );

//   if (isAuthLoading) { /* ... (use themed-skeleton for page load) ... */ 
//     return (
//         <AppLayout>
//             <div className="space-y-8 p-4 md:p-6 lg:p-8">
//                 <Skeleton className="themed-skeleton h-10 w-1/3 mb-4" /> {/* Page Title */}
//                 <Card className="themed-card">
//                     <CardHeader><Skeleton className="themed-skeleton h-7 w-1/2" /></CardHeader>
//                     <CardContent className="space-y-6 pt-6">
//                         <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
//                             <Skeleton className="themed-skeleton h-24 w-24 rounded-full flex-shrink-0" />
//                             <div className="space-y-3 flex-1 w-full"><Skeleton className="themed-skeleton h-10 w-full" /> <Skeleton className="themed-skeleton h-6 w-3/4" /></div>
//                         </div>
//                         <Skeleton className="themed-skeleton h-10 w-full" />
//                         <Skeleton className="themed-skeleton h-10 w-full" />
//                         <Skeleton className="themed-skeleton h-10 w-full" />
//                     </CardContent>
//                     <CardFooter className="pt-6"><Skeleton className="themed-skeleton h-10 w-28 rounded-md" /></CardFooter>
//                 </Card>
//                 <Card className="themed-card">
//                     <CardHeader><Skeleton className="themed-skeleton h-7 w-1/3" /></CardHeader>
//                     <CardContent className="pt-6">{renderHistoryLoadingSkeletons(3)}</CardContent>
//                 </Card>
//             </div>
//         </AppLayout>
//     )
//   }
//   if (!user) { /* ... (use themed button and text) ... */ 
//     return (
//         <AppLayout>
//             <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4 text-center p-6">
//                 <UserCircle className="w-16 h-16" style={{color: 'var(--text-secondary)'}} />
//                 <p className="text-lg font-medium" style={{color: 'var(--text-primary)'}}>Please log in to view your profile.</p>
//                 <Link href="/auth/login"><Button className="premium-button">Login</Button></Link>
//             </div>
//         </AppLayout>
//     )
//   }

//   return (
//     <>
//       <style jsx global>{`
//         /* Paste the full CSS from previous dashboards/auth pages here */
//         /* Ensure .themed-card, .premium-button, .premium-button-outline, .themed-input, .themed-skeleton, .form-message-destructive, .animate-item-entry etc. are defined */
//         :root {
//           --bg-main: ${theme.bgMain}; --bg-surface: ${theme.bgSurface}; --bg-surface-lighter: ${theme.bgSurfaceLighter};
//           --text-primary: ${theme.textPrimary}; --text-secondary: ${theme.textSecondary}; --accent-primary: ${theme.accentPrimary};
//           --accent-primary-hover: ${theme.accentPrimaryHover}; --border-color: ${theme.borderColor}; --border-color-subtle: ${theme.borderColorSubtle};
//           --border-primary-rgb: ${theme.borderPrimaryRgb}; --shadow-color: ${theme.shadowColor};
//           --destructive: ${theme.destructive}; --destructive-rgb: ${theme.destructiveRgb}; --destructive-foreground: ${theme.textPrimary}; /* For contrast on destructive bg */
//           --success: ${theme.success}; --success-rgb: ${theme.successRgb};
//           --info: ${theme.info}; --info-rgb: ${theme.infoRgb};
//           --warning: ${theme.warning};
//           --accent-primary-rgb: ${theme.accentPrimaryRgb};
//         }
//         body { background-color: var(--bg-main); color: var(--text-primary); }
//         @keyframes elegant-fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-item-entry { opacity: 0; animation: elegant-fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        
//         .premium-button { /* ... (same as before) ... */ 
//             background-color: var(--accent-primary); color: var(--bg-main); font-weight: 600; border-radius: 0.375rem;
//             padding: 0.65rem 1.25rem; transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08);
//         }
//         .premium-button:hover:not(:disabled) { background-color: var(--accent-primary-hover); transform: translateY(-2px) scale(1.02); box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1); }
//         .premium-button-outline { /* ... (same as before) ... */ 
//             background-color: transparent; color: var(--accent-primary); font-weight: 500; border: 1px solid var(--accent-primary);
//             border-radius: 0.375rem; padding: 0.6rem 1.2rem; /* Adjusted to match premium-button effective padding */
//             transition: all 0.2s ease-in-out;
//         }
//         .premium-button-outline:hover:not(:disabled) { background-color: rgba(var(--accent-primary-rgb), 0.1); border-color: var(--accent-primary); }
        
//         .themed-card { /* ... (same as before) ... */
//             background-color: var(--bg-surface); border: 1px solid var(--border-color-subtle); border-radius: 0.6rem; 
//             box-shadow: 0 8px 20px -5px var(--shadow-color), 0 15px 30px -15px var(--shadow-color);
//             transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//         }
//         .themed-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px -6px var(--shadow-color), 0 20px 40px -20px var(--shadow-color); }
//         .themed-card .card-header { border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 0.75rem; }
//         .themed-card .card-header .lucide { color: var(--accent-primary); }
//         .themed-card .card-title { color: var(--text-primary); font-size: 1.1rem; font-weight: 600;}
//         .themed-card .card-description { color: var(--text-secondary); font-size: 0.85rem; }


//         .themed-input { /* ... (same as before) ... */ 
//             background-color: var(--bg-main) !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important;
//             border-radius: 0.375rem; padding: 0.75rem; transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out; font-size: 0.9rem;
//         }
//         .themed-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
//         .themed-input:focus { border-color: var(--accent-primary) !important; box-shadow: 0 0 0 2.5px rgba(var(--accent-primary-rgb), 0.25) !important; outline: none !important; }
//         .themed-input-readonly { background-color: var(--bg-surface-lighter) !important; color: var(--text-secondary) !important; cursor: default !important; opacity: 0.8 !important; border-color: var(--border-color-subtle) !important;}
//         .form-message-destructive { color: var(--destructive) !important; font-size: 0.8rem; margin-top: 0.25rem; }

//         /* Skeleton Theming */
//         @keyframes shimmer { 100% {transform: translateX(100%);} }
//         .themed-skeleton { background-color: var(--border-color); position: relative; overflow: hidden; border-radius: 0.25rem; }
//         .themed-skeleton::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(var(--border-primary-rgb), 0.2), transparent); transform: translateX(-100%); animation: shimmer 1.5s infinite; }
//         .themed-skeleton-card { background-color: var(--bg-surface); border: 1px solid var(--border-color-subtle); border-radius: 0.5rem; }

//         /* Themed Table */
//         .themed-table { width: 100%; border-collapse: separate; border-spacing: 0; } /* separate for rounded corners if needed on table directly */
//         .themed-table th { color: var(--text-secondary); border-bottom: 2px solid var(--border-color); padding: 0.85rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
//         .themed-table td { color: var(--text-primary); border-bottom: 1px solid var(--border-color-subtle); padding: 0.85rem 1rem; font-size: 0.875rem; }
//         .themed-table tr:hover td { background-color: var(--bg-surface-lighter); }
//         .themed-table tr:last-child td { border-bottom: none; }

//         /* Themed Avatar */
//         .themed-avatar { /* Wrapper for Avatar */
//             border: 2px solid var(--accent-primary);
//             padding: 2px; /* Inner padding to make the ring appear outside */
//             border-radius: 9999px; /* Ensure it's circular */
//             box-shadow: 0 0 10px rgba(var(--accent-primary-rgb), 0.2);
//         }
//         .themed-avatar-fallback {
//             background-color: var(--bg-surface-lighter) !important;
//             color: var(--accent-primary) !important;
//             font-weight: 500; /* Slightly less bold */
//             border: none; /* Remove default border if any */
//         }

//         /* Themed Badge */
//         .themed-badge {
//             border-width: 1px; border-style: solid; padding: 0.25rem 0.65rem; /* Slightly more padding */
//             font-size: 0.7rem; font-weight: 500; border-radius: 0.3rem; /* Less pill-like, more like a tag */
//             text-transform: capitalize; line-height: 1.2;
//         }
//          .themed-badge-outline { background-color: transparent !important; }
//       `}</style>
//       <AppLayout>
//         <div className="space-y-10 p-4 md:p-6 lg:p-8"> {/* Overall page padding */}
//           <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//             <h1 className="text-3xl font-bold tracking-tight flex items-center" style={{ color: 'var(--text-primary)' }}>
//                 <UserCircle className="mr-3 w-8 h-8" style={{color: 'var(--accent-primary)'}}/>Your Profile
//             </h1>
//           </div>

//           <Card className="themed-card animate-item-entry" style={{animationDelay: '0.2s'}}>
//             <CardHeader className="card-header">
//                 <CardTitle className="card-title"><Edit3 className="lucide mr-2.5 w-5 h-5"/>Account Information</CardTitle>
//                 <CardDescription className="card-description">Manage your personal details. Email and Peer ID are read-only.</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-6"> {/* Added pt-6 for spacing from header line */}
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
//                   <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
//                     <div className="themed-avatar">
//                         <Avatar className="h-24 w-24 text-3xl">
//                             <AvatarImage src={form.watch('profile_picture_url') || user.profile_picture_url || undefined} alt={user.name || 'User Avatar'} />
//                             <AvatarFallback className="themed-avatar-fallback">{getInitials(user.name)}</AvatarFallback>
//                         </Avatar>
//                     </div>
//                     <FormField
//                       control={form.control} name="profile_picture_url"
//                       render={({ field }) => (
//                         <FormItem className="flex-1 w-full sm:w-auto">
//                           <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Profile Picture URL</FormLabel>
//                           <FormControl><Input placeholder="https://image.url/avatar.png" {...field} value={field.value || ""} className="themed-input mt-1"/></FormControl>
//                           <FormDescription style={{fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8}}>Or leave empty for initials.</FormDescription>
//                           <FormMessage className="form-message-destructive" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <FormField control={form.control} name="name" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Full Name</FormLabel>
//                         <FormControl><Input {...field} value={field.value ?? ""} className="themed-input mt-1"/></FormControl>
//                         <FormMessage className="form-message-destructive" />
//                       </FormItem>
//                   )}/>
//                   <FormField control={form.control} name="email" render={({ field }) => ( // field is not directly used for value here as it's readonly
//                       <FormItem>
//                         <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email Address</FormLabel>
//                         <FormControl><Input type="email" value={user.email || ""} readOnly disabled className="themed-input themed-input-readonly mt-1"/></FormControl>
//                         <FormDescription style={{fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8}}>Email cannot be changed.</FormDescription>
//                       </FormItem>
//                   )}/>
//                   <FormField control={form.control} name="id" render={({ field }) => ( // field not used for value
//                       <FormItem>
//                         <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your Peer ID</FormLabel>
//                         <div className="flex items-center gap-2 mt-1">
//                             <FormControl><Input value={user.id || ""} readOnly disabled className="themed-input themed-input-readonly flex-grow"/></FormControl>
//                             <Button type="button" variant="outline" size="icon" onClick={handleCopyId} title="Copy Peer ID" className="premium-button-outline !p-2 h-auto w-auto aspect-square shrink-0">
//                                 {copiedId ? <Check className="w-4 h-4" style={{color: 'var(--success)'}}/> : <Copy className="w-4 h-4" style={{color: 'var(--accent-primary)'}}/>}
//                             </Button>
//                         </div>
//                         <FormDescription style={{fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8}}>Share this ID for direct interview scheduling.</FormDescription>
//                       </FormItem>
//                   )}/>
//                   <Button type="submit" className="premium-button py-2.5 px-6 text-sm" disabled={isSubmitting}>
//                     {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>

//           <Card id="history" className="themed-card animate-item-entry" style={{animationDelay: '0.3s'}}>
//             <CardHeader className="card-header">
//                 <CardTitle className="card-title"><History className="lucide mr-2.5 w-5 h-5"/>Interview History</CardTitle>
//                 <CardDescription className="card-description">A record of your past and ongoing interviews.</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-2 overflow-x-auto"> {/* Added pt-2 */}
//               {isHistoryLoading ? (
//                   renderHistoryLoadingSkeletons(4)
//               ) : history.length > 0 ? (
//                 <Table className="themed-table min-w-[700px]"> {/* Min width for better layout on small screens before scroll */}
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Date & Time</TableHead>
//                       <TableHead>Your Role</TableHead>
//                       <TableHead>Counterpart</TableHead>
//                       <TableHead>Topic</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Feedback</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {history.map((item) => (
//                       <TableRow key={item.id}>
//                         <TableCell className="whitespace-nowrap font-medium" style={{color: 'var(--text-primary)'}}>{formatHistoryDate(item.scheduled_time)}</TableCell>
//                         <TableCell><Badge style={getBadgeStyling('role', item.role_played).style} className={getBadgeStyling('role', item.role_played).className}>{getBadgeStyling('role', item.role_played).text}</Badge></TableCell>
//                         <TableCell style={{color: 'var(--text-secondary)'}}>{item.counterpart_name}</TableCell>
//                         <TableCell className="max-w-[180px] truncate" title={item.topic} style={{color: 'var(--text-secondary)'}}>{item.topic}</TableCell>
//                         <TableCell><Badge style={getBadgeStyling('status', item.status).style} className={getBadgeStyling('status', item.status).className}>{getBadgeStyling('status', item.status).text}</Badge></TableCell>
//                         <TableCell><Badge style={getBadgeStyling('feedback', item.status === 'Cancelled' || item.status === 'in_progress' || item.status === 'Scheduled' ? 'N/A' : item.feedback_status).style} className={getBadgeStyling('feedback', item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status).className}>{getBadgeStyling('feedback', item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status).text}</Badge></TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               ) : (
//                 <p className="text-center py-8" style={{color: 'var(--text-secondary)'}}>No interview history found.</p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </AppLayout>
//     </>
//   );
// }