
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, UserPlus, Loader2 } from 'lucide-react';

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["interviewer", "interviewee"], { required_error: "Please select your primary role." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json(); // Always try parsing JSON

      if (!response.ok) {
         // Use error message from backend response if available
         throw new Error(data.error || `Registration failed with status: ${response.status}`);
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please log in.",
      });
      router.push('/auth/login'); // Redirect to login page after successful registration

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
     <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
       <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center items-center mb-4">
                <UserPlus className="h-8 w-8 mr-2 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary">Create an Account</CardTitle>
            </div>
           <CardDescription>
             Enter your details below to register for Mock Orbit.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Name</FormLabel>
                     <FormControl>
                       <Input placeholder="Your Name" {...field} disabled={isLoading} />
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
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                       <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="password"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Password</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder="Create a password (min. 6 characters)" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                 control={form.control}
                 name="role"
                 render={({ field }) => (
                   <FormItem className="space-y-3">
                     <FormLabel>Your Primary Role:</FormLabel>
                     <FormControl>
                       <RadioGroup
                         onValueChange={field.onChange}
                         defaultValue={field.value}
                         className="flex flex-col sm:flex-row sm:space-x-4"
                         disabled={isLoading}
                       >
                         <FormItem className="flex items-center space-x-2 space-y-0">
                           <FormControl>
                             <RadioGroupItem value="interviewee" id="role-interviewee" />
                           </FormControl>
                           <FormLabel htmlFor="role-interviewee" className="font-normal">
                             Interviewee (I want to practice)
                           </FormLabel>
                         </FormItem>
                         <FormItem className="flex items-center space-x-2 space-y-0">
                           <FormControl>
                             <RadioGroupItem value="interviewer" id="role-interviewer" />
                           </FormControl>
                           <FormLabel htmlFor="role-interviewer" className="font-normal">
                             Interviewer (I want to help others)
                           </FormLabel>
                         </FormItem>
                       </RadioGroup>
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                 {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register"}
               </Button>
             </form>
           </Form>
         </CardContent>
         <CardFooter className="flex justify-center text-sm">
            <p>Already have an account?&nbsp;</p>
           <Link href="/auth/login" className={`text-accent hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} prefetch={false}>
             Login
           </Link>
         </CardFooter>
       </Card>
     </div>
  );
}
