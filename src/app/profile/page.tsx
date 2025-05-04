
"use client";

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { History, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';


const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).readonly(), // Make email read-only in the form
  profile_picture_url: z.string().url({ message: "Invalid URL format. Please enter a valid URL or leave empty." }).optional().or(z.literal('')), // Allow empty string or valid URL
});

// Type for form values (excluding email for submission)
type ProfileFormValues = Omit<z.infer<typeof profileSchema>, 'email'>;

// Interface for interview history item matching backend response
interface InterviewHistoryItem {
  id: string;
  scheduled_time: string; // ISO Date string
  interviewer: { id: string; name: string };
  interviewee: { id: string; name: string };
  topic: string;
  status: 'Completed' | 'Cancelled' | 'Scheduled'; // Adjust statuses as needed
  feedback_status: 'Received' | 'Provided' | 'Pending' | 'N/A';
  // Add feedback_id or feedback_link if available
}


export default function ProfilePage() {
  const { user, token, isLoading: isAuthLoading, login, activeRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);


  const form = useForm<z.infer<typeof profileSchema>>({ // Use the full schema type for the form
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "", // Will be set from user context, not editable
      profile_picture_url: "",
    },
  });

 // Populate form with user data when available
 useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "", // Set email here, it's read-only in the form field
        profile_picture_url: user.profile_picture_url || "",
      });
    }
  }, [user, form]);


  // Fetch interview history
  useEffect(() => {
    const fetchHistory = async () => {
       if (!user?.id || !token) { // Check user and token
           setIsHistoryLoading(false);
           return;
       }
      setIsHistoryLoading(true);
      try {
        // Fetch all completed/cancelled interviews involving the user
        const response = await fetch(`${API_URL}/users/${user.id}/interviews?status=completed,cancelled`, { // Fetch all roles' past interviews
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch history');
        }

        // Add role_played field based on user context
        const historyWithRole = data.map((item: InterviewHistoryItem) => ({
             ...item,
             role_played: item.interviewer.id === user.id ? 'Interviewer' : 'Interviewee',
             counterpart_name: item.interviewer.id === user.id ? item.interviewee.name : item.interviewer.name,
         })).sort((a: InterviewHistoryItem, b: InterviewHistoryItem) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime()); // Sort by date descending


        setHistory(historyWithRole || []); // Ensure data is an array

      } catch (error: any) {
        console.error("Failed to fetch interview history:", error);
        toast({ title: "Error", description: `Could not load interview history: ${error.message}`, variant: "destructive" });
        setHistory([]); // Clear history on error
      } finally {
        setIsHistoryLoading(false);
      }
    };

    if (!isAuthLoading) { // Only fetch when auth state is resolved
        fetchHistory();
    }
  }, [user?.id, token, toast, isAuthLoading]); // Removed activeRole dependency as we fetch all


   async function onSubmit(values: z.infer<typeof profileSchema>) {
     if (!user || !token) {
         toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
         return;
     }
     setIsSubmitting(true);

     // Prepare data for submission (exclude email)
     const submissionData: ProfileFormValues = {
         name: values.name,
         // Send null if URL is empty, otherwise send the URL
         profile_picture_url: values.profile_picture_url ? values.profile_picture_url : undefined, // Send undefined/omit if empty to potentially clear it
     };

      // Explicitly check if profile_picture_url is an empty string to send null
     if (values.profile_picture_url === '') {
         submissionData.profile_picture_url = ''; // Send empty string to backend if it expects that to clear
         // Or, if backend expects null to clear:
         // delete submissionData.profile_picture_url; // or set to null if PATCH allows it
     }


     try {
       // Use PATCH for partial updates
       const response = await fetch(`${API_URL}/users/profile`, { // Use the new /profile endpoint
         method: 'PATCH',
         headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`
          },
         body: JSON.stringify(submissionData),
       });

       const updatedUser = await response.json();

       if (!response.ok) {
         throw new Error(updatedUser.error || `Profile update failed: ${response.status}`);
       }


       // Update user data in AuthContext using the login function which handles updates
       if (token && updatedUser) {
           login(token, updatedUser); // Re-use login to update context state
       } else {
           throw new Error("Failed to update local user state after profile update.");
       }


       toast({
         title: "Profile Updated",
         description: "Your profile information has been saved.",
       });

     } catch (error: any) {
       toast({
         title: "Update Failed",
         description: error.message || "An unexpected error occurred.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   }

   const getInitials = (name?: string | null) => {
     if (!name) return "??";
     return name.split(' ').map(n => n[0]).join('').toUpperCase();
   };

   const formatHistoryDate = (isoString: string): string => {
       try {
           return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(isoString)); // Use locale
       } catch (e) {
           return "Invalid Date";
       }
   };

    const renderHistoryLoadingSkeletons = (count: number) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(count)].map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );


  if (isAuthLoading) {
      return (
          <AppLayout>
              <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                     <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                    <CardContent>{renderHistoryLoadingSkeletons(3)}</CardContent>
                 </Card>
              </div>
          </AppLayout>
      )
  }

  if (!user) {
       // Handled by AuthProvider redirect, but good fallback.
       return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center gap-4 pt-10">
                    <p>Please log in to view your profile.</p>
                    <Link href="/auth/login"><Button>Login</Button></Link>
                </div>
            </AppLayout>
       )
   }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Your Profile</h1>

        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your personal details. Email cannot be changed.</CardDescription>
            </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="h-20 w-20">
                        {/* Use form state for preview, fallback to user data */}
                        <AvatarImage src={form.watch('profile_picture_url') || user.profile_picture_url || undefined} alt={user.name || ''} />
                        <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <FormField
                        control={form.control}
                        name="profile_picture_url"
                        render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                            {/* Ensure value is controlled and defaults to empty string if null/undefined */}
                            <Input placeholder="https://example.com/image.png" {...field} value={field.value || ""} />
                            </FormControl>
                             <FormDescription>Enter a valid image URL or leave empty.</FormDescription>
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
                       <FormLabel>Name</FormLabel>
                       <FormControl>
                         <Input {...field} value={field.value ?? ""} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 {/* Email - Display Only */}
                 <FormField
                    control={form.control}
                    name="email" // Still need to include in form for validation/display purposes
                    render={({ field }) => (
                        <FormItem>
                           <FormLabel>Email</FormLabel>
                           <FormControl>
                               {/* Display value from user context, field value is just for form state */}
                               <Input type="email" value={user.email || ""} readOnly disabled className="bg-muted/50 cursor-not-allowed"/>
                           </FormControl>
                           <FormDescription>Email address cannot be changed.</FormDescription>
                            <FormMessage /> {/* Show validation errors if any (though it's readonly) */}
                        </FormItem>
                    )}
                 />


                 <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                   {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                 </Button>
               </form>
             </Form>
           </CardContent>
        </Card>

        <Card id="history">
            <CardHeader>
                <CardTitle className="flex items-center"><History className="mr-2 h-5 w-5"/> Interview History</CardTitle>
                <CardDescription>A record of your past interviews.</CardDescription>
            </CardHeader>
            <CardContent>
                {isHistoryLoading ? (
                     renderHistoryLoadingSkeletons(5) // Show more skeletons while loading
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
                                {/* Add Action column if needed */}
                                {/* <TableHead>Action</TableHead> */}
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="whitespace-nowrap">{formatHistoryDate(item.scheduled_time)}</TableCell>
                                    {/* Display role played in this specific interview */}
                                    <TableCell>{item.interviewer.id === user.id ? 'Interviewer' : 'Interviewee'}</TableCell>
                                    {/* Display counterpart name */}
                                    <TableCell>{item.interviewer.id === user.id ? item.interviewee.name : item.interviewer.name}</TableCell>
                                    <TableCell>{item.topic}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell>
                                       <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                                            item.status === 'Cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                                            item.feedback_status === 'Received' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            item.feedback_status === 'Provided' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            item.feedback_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            'bg-secondary text-secondary-foreground' // For N/A or other statuses
                                        }`}>
                                            {item.status === 'Cancelled' ? 'N/A' : item.feedback_status || 'Pending'} {/* Show N/A if cancelled */}
                                        </span>
                                    </TableCell>
                                    {/* Optional Action Cell */}
                                    {/* <TableCell>
                                        {item.feedback_status === 'Received' && <Button variant="link" size="sm" asChild><Link href={`/feedback/${item.id}`}>View</Link></Button>}
                                        {item.feedback_status === 'Pending' && item.role_played === 'Interviewer' && <Button variant="link" size="sm" asChild><Link href={`/feedback/provide/${item.id}`}>Provide</Link></Button>}
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No interview history found.</p>
                )}
            </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
}
