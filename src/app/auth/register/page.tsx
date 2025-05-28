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
import { UserPlus, Loader2 } from 'lucide-react';
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

  const theme = {
    bgMain: "#16181A",
    bgSurface: "#1F2123",
    textPrimary: "#F0F2F5",
    textSecondary: "#A8B2C0",
    accentPrimary: "#C9A461",
    accentPrimaryHover: "#B8914B",
    borderColor: "#303438",
    borderColorSubtle: "#2A2D30",
    shadowColor: "rgba(0, 0, 0, 0.4)",
    destructive: "#D32F2F",
    destructiveForeground: "#F0F2F5",
    accentPrimaryRgb: "201, 164, 97",
  };

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
        throw new Error(data.error || `Registration failed: ${response.statusText}`);
      }
      toast({
        title: "Registration Successful!",
        description: "Your Mock Orbit account has been created. Please log in.",
        // variant: "success" // if you have a success variant
      });
      router.push('/auth/login');
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
    <>
      <style jsx global>{`
        :root {
          --bg-main: ${theme.bgMain};
          --bg-surface: ${theme.bgSurface};
          --text-primary: ${theme.textPrimary};
          --text-secondary: ${theme.textSecondary};
          --accent-primary: ${theme.accentPrimary};
          --accent-primary-hover: ${theme.accentPrimaryHover};
          --border-color: ${theme.borderColor};
          --border-color-subtle: ${theme.borderColorSubtle};
          --shadow-color: ${theme.shadowColor};
          --destructive: ${theme.destructive};
          --destructive-foreground: ${theme.destructiveForeground};
          --accent-primary-rgb: ${theme.accentPrimaryRgb};
        }

        @keyframes elegant-fade-in-scale-up {
            from { opacity: 0; transform: translateY(10px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-entry {
            animation: elegant-fade-in-scale-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .themed-input {
            background-color: var(--bg-main) !important;
            border: 1px solid var(--border-color) !important;
            color: var(--text-primary) !important;
            border-radius: 0.375rem; /* 6px */
            padding: 0.75rem;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            font-size: 0.9rem;
        }
        .themed-input::placeholder {
            color: var(--text-secondary);
            opacity: 0.6;
        }
        .themed-input:focus {
            border-color: var(--accent-primary) !important;
            box-shadow: 0 0 0 2.5px rgba(var(--accent-primary-rgb), 0.25) !important;
            outline: none !important;
        }
        .themed-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .premium-register-button { /* Can be same as login or slightly different if needed */
            background-color: var(--accent-primary);
            color: var(--bg-main);
            font-weight: 600;
            border-radius: 0.375rem;
            padding: 0.75rem 1.5rem;
            transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15), 0 2px 6px rgba(var(--accent-primary-rgb), 0.1);
        }
        .premium-register-button:hover:not(:disabled) {
            background-color: var(--accent-primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.2), 0 3px 8px rgba(var(--accent-primary-rgb), 0.15);
        }
        .premium-register-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .form-message-destructive {
            color: var(--destructive) !important;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        }

        /* Styling for RadioGroup options */
        .themed-radio-option {
            border: 1px solid var(--border-color) !important;
            background-color: var(--bg-main) !important; /* Slightly different from card surface for depth */
            border-radius: 0.375rem; /* 6px */
            transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .themed-radio-option:hover {
            border-color: var(--accent-primary) !important;
            box-shadow: 0 0 10px rgba(var(--accent-primary-rgb), 0.1);
        }
        .themed-radio-option[data-state="checked"] { /* Using data-state on the FormItem wrapper */
            border-color: var(--accent-primary) !important;
            background-color: rgba(var(--accent-primary-rgb), 0.07) !important; /* Subtle accent background */
            box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.15);
        }
        /* Styling for the actual radio button circle (RadioGroupItem) */
        /* This assumes shadcn/ui RadioGroupItem uses CSS variables or can be targeted */
        /* If shadcn/ui uses a class like .radio-indicator for the dot, target that */
        .themed-radio-item[data-state="checked"] {
            border-color: var(--accent-primary) !important;
            background-color: var(--accent-primary) !important; /* This will be the fill of the circle */
        }
        /* This styles the inner dot if it's a separate element, often it is */
        .themed-radio-item[data-state="checked"] > span:first-child { /* Assuming indicator is the first span */
             background-color: var(--bg-main) !important; /* Dot color for contrast */
        }
        .themed-radio-item { /* Unchecked state */
            border-color: var(--border-color-subtle) !important;
        }

      `}</style>

      <div className="flex items-center justify-center min-h-dvh p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--bg-main)' }}>
        <Card 
          className="w-full max-w-lg animate-card-entry" // max-w-lg for register form
          style={{ 
            backgroundColor: 'var(--bg-surface)', 
            borderColor: 'var(--border-color-subtle)',
            borderWidth: '1px',
            boxShadow: `0 12px 28px -8px ${theme.shadowColor}, 0 20px 45px -20px ${theme.shadowColor}`
          }}
        >
          <CardHeader className="space-y-2 text-center p-6 pt-8">
            <Link href="/" aria-label="Back to homepage" className="inline-block mx-auto mb-4">
                <GrTechnology className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
            </Link>
            <CardTitle className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Join Mock Orbit
            </CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Create your account to start your interview journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-7"> {/* Consistent padding */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5"> {/* Adjusted space-y */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Jane Doe" 
                          {...field} 
                          disabled={isLoading}
                          className="themed-input mt-1"
                        />
                      </FormControl>
                      <FormMessage className="form-message-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="you@example.com" 
                          {...field} 
                          disabled={isLoading}
                          className="themed-input mt-1"
                        />
                      </FormControl>
                      <FormMessage className="form-message-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Create Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Minimum 6 characters" 
                          {...field} 
                          disabled={isLoading} 
                          className="themed-input mt-1"
                        />
                      </FormControl>
                      <FormMessage className="form-message-destructive" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-2.5 pt-1"> {/* Added pt-1 */}
                      <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select Your Primary Role</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3" // gap-3
                          disabled={isLoading}
                        >
                          <FormItem 
                            data-state={field.value === "interviewee" ? "checked" : "unchecked"}
                            className="flex items-start space-x-3 p-3.5 themed-radio-option cursor-pointer" // Added p-3.5, cursor
                            onClick={() => field.onChange("interviewee")} // Make whole item clickable
                          >
                            <FormControl>
                              <RadioGroupItem value="interviewee" id="role-interviewee" className="themed-radio-item mt-0.5" />
                            </FormControl>
                            <FormLabel htmlFor="role-interviewee" className="font-normal cursor-pointer flex-1 leading-tight" style={{color: 'var(--text-primary)'}}>
                              Interviewee
                              <span className="block text-xs mt-0.5" style={{color: 'var(--text-secondary)', opacity: 0.8}}>I want to practice for interviews.</span>
                            </FormLabel>
                          </FormItem>
                          <FormItem 
                            data-state={field.value === "interviewer" ? "checked" : "unchecked"}
                            className="flex items-start space-x-3 p-3.5 themed-radio-option cursor-pointer"
                            onClick={() => field.onChange("interviewer")}
                          >
                            <FormControl>
                              <RadioGroupItem value="interviewer" id="role-interviewer" className="themed-radio-item mt-0.5"/>
                            </FormControl>
                            <FormLabel htmlFor="role-interviewer" className="font-normal cursor-pointer flex-1 leading-tight" style={{color: 'var(--text-primary)'}}>
                              Interviewer
                              <span className="block text-xs mt-0.5" style={{color: 'var(--text-secondary)', opacity: 0.8}}>I want to help others practice.</span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="form-message-destructive" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="premium-register-button py-3 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" style={{color: 'var(--bg-main)'}}/> Creating Account...</> : <><UserPlus className="mr-2 h-5 w-5" style={{color: 'var(--bg-main)'}}/>Register</>}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm p-6 pt-5"> {/* Adjusted padding */}
            <p style={{ color: 'var(--text-secondary)' }}>Already have an account?&nbsp;</p>
            <Link href="/auth/login" 
                className={`font-semibold hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                style={{ color: 'var(--accent-primary)' }}
                prefetch={false}>
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}