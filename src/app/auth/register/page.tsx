
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
// import { Label } from "@/components/ui/label"; // FormLabel is preferred with FormField
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
import { UserPlus, Rocket, Loader2 } from 'lucide-react'; // Changed icon
import { GrTechnology } from 'react-icons/gr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, {message: "Name cannot exceed 50 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).max(100, {message: "Password too long."}),
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

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || `Registration failed with status: ${response.status}`);
      }

      toast({
        title: "Registration Successful!",
        description: "Your Mock Orbit account has been created. Please log in to continue.",
        variant: "default",
      });
      router.push('/auth/login');

    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
     <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
       <Card className="w-full max-w-lg shadow-xl border-border"> {/* Increased max-width and shadow */}
          <CardHeader className="space-y-2 text-center p-6"> {/* Increased padding */}
            <div className="flex justify-center items-center mb-3">
                <GrTechnology className="h-10 w-10 text-primary" /> {/* Changed icon and size */}
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Join Mock Orbit</CardTitle>
           <CardDescription className="text-muted-foreground">
             Create your account to start practicing and conducting mock interviews.
           </CardDescription>
         </CardHeader>
         <CardContent className="p-6"> {/* Increased padding */}
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased spacing */}
               <FormField
                 control={form.control}
                 name="name"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="text-foreground">Full Name</FormLabel>
                     <FormControl>
                       <Input 
                        placeholder="e.g., Jane Doe" 
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
                     <FormLabel className="text-foreground">Create Password</FormLabel>
                     <FormControl>
                       <Input 
                        type="password" 
                        placeholder="Minimum 6 characters" 
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
                 name="role"
                 render={({ field }) => (
                   <FormItem className="space-y-3">
                     <FormLabel className="text-foreground">I want to register as a...</FormLabel>
                     <FormControl>
                       <RadioGroup
                         onValueChange={field.onChange}
                         defaultValue={field.value}
                         className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1" // Grid layout for roles
                         disabled={isLoading}
                       >
                         <FormItem className="flex items-center space-x-3 p-3 border rounded-md hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-all">
                           <FormControl>
                             <RadioGroupItem value="interviewee" id="role-interviewee" />
                           </FormControl>
                           <FormLabel htmlFor="role-interviewee" className="font-normal cursor-pointer flex-1">
                             Interviewee <span className="block text-xs text-muted-foreground">I want to practice for interviews.</span>
                           </FormLabel>
                         </FormItem>
                         <FormItem className="flex items-center space-x-3 p-3 border rounded-md hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-all">
                           <FormControl>
                             <RadioGroupItem value="interviewer" id="role-interviewer" />
                           </FormControl>
                           <FormLabel htmlFor="role-interviewer" className="font-normal cursor-pointer flex-1">
                             Interviewer <span className="block text-xs text-muted-foreground">I want to help others practice.</span>
                           </FormLabel>
                         </FormItem>
                       </RadioGroup>
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all" // Enhanced button style
                disabled={isLoading}
                >
                 {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...</> : <><UserPlus className="mr-2 h-5 w-5"/>Register</>}
               </Button>
             </form>
           </Form>
         </CardContent>
         <CardFooter className="flex justify-center text-sm p-6"> {/* Increased padding */}
            <p className="text-muted-foreground">Already have an account?&nbsp;</p>
           <Link href="/auth/login" className={`font-semibold text-accent hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`} prefetch={false}>
             Log in
           </Link>
         </CardFooter>
       </Card>
     </div>
  );
}
