
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
import { Label } from "@/components/ui/label"; // Keep if used, but FormLabel is preferred with FormField
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
import { Rocket, LogIn, Loader2, ShieldCheck } from 'lucide-react'; // Changed icon
import { useAuth } from '@/providers/AuthProvider';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Keep router if needed for other logic, but AuthProvider handles redirect
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Login failed with status: ${response.status}`);
      }

      if (!data.user || !data.token) {
         throw new Error("Invalid response received from server. Missing user or token.");
      }

      login(data.token, data.user); // AuthProvider handles storing user, token, and activeRole

      toast({
        title: "Login Successful!",
        description: "Welcome back to Mock Orbit.",
        variant: "default", // Use default or a success variant if defined
      });

      // Redirect is handled by AuthProvider based on activeRole
      // Router push here might conflict if AuthProvider also tries to redirect.

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
       <Card className="w-full max-w-md shadow-xl border-border"> {/* Added shadow-xl and border */}
         <CardHeader className="space-y-2 text-center p-6"> {/* Increased padding */}
            <div className="flex justify-center items-center mb-3">
                <ShieldCheck className="h-10 w-10 text-primary" /> {/* Changed icon and size */}
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
           <CardDescription className="text-muted-foreground">
             Sign in to continue your interview preparation journey.
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6"> {/* Increased padding */}
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased spacing */}
               <FormField
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground">Email Address</FormLabel>
                     <FormControl>
                       <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        disabled={isLoading}
                        className="bg-background border-input focus:border-primary focus:ring-primary"
                        />
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
                     <FormLabel className="text-foreground">Password</FormLabel>
                     <FormControl>
                       <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                        className="bg-background border-input focus:border-primary focus:ring-primary"
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"  // Enhanced button style
                disabled={isLoading}
                >
                 {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...</> : <><LogIn className="mr-2 h-5 w-5"/>Login</>}
               </Button>
             </form>
           </Form>
         </CardContent>
         <CardFooter className="flex flex-col items-center justify-center text-sm p-6 space-y-2"> {/* Increased padding and spacing */}
           <div className="flex">
             <p className="text-muted-foreground">Don&apos;t have an account?&nbsp;</p>
             <Link href="/auth/register" className={`font-semibold text-accent hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} prefetch={false}>
               Sign up now
             </Link>
           </div>
           {/* Optional: Add a "Forgot Password?" link here */}
           {/* <Link href="/auth/forgot-password" className={`text-xs text-muted-foreground hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} prefetch={false}>
             Forgot Password?
           </Link> */}
         </CardFooter>
       </Card>
     </div>
  );
}
