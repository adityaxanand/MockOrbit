"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button"; // Keep for shadcn/ui base
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Keep for shadcn/ui base
// import { Label } from "@/components/ui/label"; // Not directly used, FormLabel is
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
import { LogIn, Loader2 } from 'lucide-react';
import { GrTechnology } from 'react-icons/gr'; // For brand icon
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
  const router = useRouter();
  const { login } = useAuth();

  const theme = { // Re-defining for clarity within this component's scope for styled-jsx
    bgMain: "#16181A",
    bgSurface: "#1F2123",
    textPrimary: "#F0F2F5",
    textSecondary: "#A8B2C0",
    accentPrimary: "#C9A461",
    accentPrimaryHover: "#B8914B",
    borderColor: "#303438",
    borderColorSubtle: "#2A2D30",
    shadowColor: "rgba(0, 0, 0, 0.4)", // Slightly stronger shadow for cards
    destructive: "#D32F2F", // A more muted red for dark theme
    destructiveForeground: "#F0F2F5",
    accentPrimaryRgb: "201, 164, 97",
  };

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
        throw new Error(data.error || `Login failed: ${response.statusText}`);
      }
      if (!data.user || !data.token) {
        throw new Error("Invalid response from server. Missing user or token.");
      }
      login(data.token, data.user);
      toast({
        title: "Login Successful!",
        description: "Welcome back to Mock Orbit.",
        // Ensure your Toast component picks up themed variants
      });
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
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-entry {
            animation: elegant-fade-in-scale-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .themed-input {
            background-color: var(--bg-main) !important;
            border: 1px solid var(--border-color) !important;
            color: var(--text-primary) !important;
            border-radius: 0.375rem; /* 6px */
            padding: 0.75rem;
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .themed-input::placeholder {
            color: var(--text-secondary);
            opacity: 0.7;
        }
        .themed-input:focus {
            border-color: var(--accent-primary) !important;
            box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.3) !important;
            outline: none !important;
        }
        .themed-input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .premium-login-button {
            background-color: var(--accent-primary);
            color: var(--bg-main);
            font-weight: 600;
            border-radius: 0.375rem; /* 6px */
            padding: 0.75rem 1.5rem;
            transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15), 0 2px 6px rgba(var(--accent-primary-rgb), 0.1);
        }
        .premium-login-button:hover:not(:disabled) {
            background-color: var(--accent-primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.2), 0 3px 8px rgba(var(--accent-primary-rgb), 0.15);
        }
        .premium-login-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        /* Ensure FormMessage uses destructive color */
        .form-message-destructive {
            color: var(--destructive) !important;
            font-size: 0.8rem; /* slightly smaller */
        }
      `}</style>

      <div className="flex items-center justify-center min-h-dvh p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--bg-main)' }}>
        <Card 
          className="w-full max-w-md animate-card-entry"
          style={{ 
            backgroundColor: 'var(--bg-surface)', 
            borderColor: 'var(--border-color-subtle)',
            boxShadow: `0 10px 25px -5px ${theme.shadowColor}, 0 20px 40px -20px ${theme.shadowColor}`
          }}
        >
          <CardHeader className="space-y-2 text-center p-6 pt-8">
            <Link href="/" aria-label="Back to homepage" className="inline-block mx-auto mb-3">
                <GrTechnology className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
            </Link>
            <CardTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome to Mock Orbit
            </CardTitle>
            <CardDescription style={{ color: 'var(--text-secondary)' }}>
              Sign in to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--text-secondary)' }}>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          disabled={isLoading}
                          className="themed-input"
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
                      <FormLabel style={{ color: 'var(--text-secondary)' }}>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                          className="themed-input"
                        />
                      </FormControl>
                      <FormMessage className="form-message-destructive" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="premium-login-button py-3 text-base" // py-3 and text-base already part of the class
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" style={{ color: 'var(--bg-main)'}} /> Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" style={{ color: 'var(--bg-main)'}}/> Login
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center text-sm p-6 space-y-3">
            <div className="flex">
              <p style={{ color: 'var(--text-secondary)' }}>Don&apos;t have an account?&nbsp;</p>
              <Link 
                href="/auth/register" 
                className={`font-semibold hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                style={{ color: 'var(--accent-primary)' }}
                prefetch={false}
              >
                Sign up now
              </Link>
            </div>
            {/* Optional: Add a "Forgot Password?" link here, styled similarly */}
             <Link 
                href="/auth/forgot-password" // Assuming this route exists
                className={`text-xs hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                prefetch={false}
             >
               Forgot Password?
             </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}