
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
import { Rocket, Loader2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
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

      const data = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        // Use error message from backend response if available
        throw new Error(data.error || `Login failed with status: ${response.status}`);
      }


      if (!data.user || !data.token) {
         throw new Error("Invalid response received from server.");
      }

      // Call the login function from AuthProvider - it handles setting roles
      login(data.token, data.user);

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      // Redirect is now handled by AuthProvider's useEffect based on activeRole

    } catch (error: any) {
      toast({
        title: "Login Failed",
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
                <Rocket className="h-8 w-8 mr-2 text-primary" />
                <CardTitle className="text-2xl font-bold text-primary">Mock Orbit Login</CardTitle>
            </div>
           <CardDescription>
             Enter your email and password to access your account.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                       <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                 {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Login"}
               </Button>
             </form>
           </Form>
         </CardContent>
         <CardFooter className="flex justify-center text-sm">
           <p>Don&apos;t have an account?&nbsp;</p>
           <Link href="/auth/register" className={`text-accent hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} prefetch={false}>
             Sign up
           </Link>
         </CardFooter>
       </Card>
     </div>
  );
}
