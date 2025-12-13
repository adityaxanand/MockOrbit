"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { 
  motion, 
  AnimatePresence, 
  useMotionTemplate, 
  useMotionValue 
} from "framer-motion";
import { 
  Mail, 
  Lock, 
  Loader2, 
  Check, 
  X, 
  LogIn, 
  Command, 
  ShieldCheck, 
  Globe, 
  Activity, 
  Users,
  ChevronRight,
  Shield,
  Code
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- API CONFIG ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- SCHEMA ---
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// --- VISUAL COMPONENTS ---

// 1. Moving Grid Background
const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
        }}
      />
    </div>
  );
};

// 2. Starfield
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    const numStars = 300; 
    const speed = 0.4;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        size: Math.random() * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.z -= speed;
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
        }

        const x = (star.x / star.z) * width + width / 2;
        const y = (star.y / star.z) * height + height / 2;
        const s = (1 - star.z / width) * star.size;

        const opacity = 1 - star.z / width;
        ctx.fillStyle = `rgba(160, 180, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, s > 0 ? s : 0, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);
    
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };

    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60 pointer-events-none mix-blend-screen" />;
};

// 3. Border Beam Effect
const BorderBeam = ({ className }: { className?: string }) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        className="absolute aspect-square w-full bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-20"
        style={{ offsetPath: "rect(0% 100% 100% 0% round 1.5rem)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
};

// 4. Input Field
const InputField = ({ name, label, icon: Icon, type = "text", placeholder, form }: {
  name: string, 
  label: string, 
  icon: any, 
  type?: string, 
  placeholder?: string,
  form: UseFormReturn<LoginFormValues>
}) => {
  const { register, formState: { errors } } = form;
  const error = errors[name as keyof LoginFormValues];
  const [focused, setFocused] = useState(false);

  const { onBlur, onChange, ref, name: fieldName } = register(name as any);

  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center px-1">
         <label className={cn("text-xs font-bold uppercase tracking-wider transition-colors duration-300", focused ? "text-violet-400" : "text-gray-500")}>{label}</label>
         {error && (
           <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-400 flex items-center gap-1">
             <X className="w-3 h-3" /> {String(error.message)}
           </motion.span>
         )}
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Icon className={cn("h-5 w-5 transition-colors duration-300", error ? "text-red-400" : focused ? "text-violet-400" : "text-gray-500")} />
        </div>
        <input
          name={fieldName}
          ref={ref}
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            onBlur(e);
            setFocused(false);
          }}
          className={cn(
            "w-full bg-[#0a0a0a]/50 backdrop-blur-xl border text-white text-sm rounded-xl pl-11 pr-4 py-4 transition-all duration-300 outline-none placeholder:text-gray-700 shadow-inner",
            error 
              ? "border-red-500/50 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]" 
              : focused 
                ? "border-violet-500/50 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]" 
                : "border-white/10 hover:border-white/20"
          )}
        />
        {/* Animated Bottom Line */}
        <div className={cn("absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent transition-transform duration-500 origin-center", focused ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0")} />
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange"
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setToast(null);
    try {
      // Optional: Cinematic delay for feel
      await new Promise(resolve => setTimeout(resolve, 800)); 
      
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
        throw new Error("Invalid response from server. Missing user token."); 
      }

      // Execute login logic from context
      login(data.token, data.user);
      
      setToast({ 
        title: "Access Granted", 
        message: "Welcome back, Commander. Initializing dashboard...", 
        type: "success" 
      });
      
      // Navigate to dashboard
      router.push('/dashboard');

    } catch (error: any) {
      setToast({ 
        title: "Access Denied", 
        message: String(error.message || "Invalid credentials."), 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex relative overflow-hidden font-sans selection:bg-violet-500/30">
      <Starfield />
      <GridBackground />
      
      {/* --- LEFT SIDE: CINEMATIC VISUALS --- */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center p-16 overflow-hidden">
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" 
        />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500">
              <Command className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tighter">MockOrbit</span>
          </Link>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl font-bold leading-tight">
              Welcome Back <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-indigo-400">
                to the Flight Deck.
              </span>
            </h1>
            
            {/* Live Stats Simulation */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
               <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                     <Activity className="w-4 h-4 text-emerald-400" />
                     <span className="text-xs uppercase tracking-wider font-bold">System Status</span>
                  </div>
                  <div className="text-lg font-bold text-white">All Systems Go</div>
               </div>
               <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                     <Users className="w-4 h-4 text-blue-400" />
                     <span className="text-xs uppercase tracking-wider font-bold">Active Peers</span>
                  </div>
                  <div className="text-lg font-bold text-white">1,248 Online</div>
               </div>
            </div>

            {/* Feature Pills */}
            <div className="flex gap-3 pt-4">
               <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-violet-400" /> Secure
               </div>
               <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
                  <Code className="w-3 h-3 text-blue-400" /> Developer First
               </div>
            </div>

            <div className="pt-8 border-t border-white/10 max-w-md">
               <p className="text-sm text-gray-400 leading-relaxed">
                  "Success isn't about the destination, it's about the <span className="text-white font-bold">trajectory</span> you set. Prepare for lift-off."
               </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col items-center justify-center p-6 sm:p-12">
         {/* Mobile Brand */}
         <div className="lg:hidden mb-8 w-full max-w-md">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
               <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center"><Command className="w-4 h-4"/></div>
               MockOrbit
            </Link>
         </div>

         <div className="w-full max-w-[420px] relative">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold tracking-tight mb-2">Secure Login</h2>
               <p className="text-gray-400 text-sm">Enter your credentials to access the console.</p>
            </div>

            {/* Glass Card */}
            <div className="relative group rounded-[1.5rem] bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 p-1">
               <BorderBeam /> 
               
               <div className="bg-[#050505]/80 rounded-[1.3rem] p-6 sm:p-8 relative z-10 overflow-hidden">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <div className="space-y-4">
                        <InputField name="email" label="Email Address" icon={Mail} type="email" placeholder="commander@orbit.com" form={form} />
                        <div className="space-y-1">
                           <InputField name="password" label="Password" icon={Lock} type="password" placeholder="••••••••" form={form} />
                           <div className="flex justify-end">
                              <Link href="/auth/forgot-password" className="text-[10px] text-gray-500 hover:text-violet-400 transition-colors cursor-pointer">
                                 Forgot access key?
                              </Link>
                           </div>
                        </div>
                     </div>

                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       type="submit"
                       disabled={isLoading}
                       className="w-full bg-white text-black font-bold rounded-xl py-3.5 hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] relative overflow-hidden"
                     >
                       {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
                       ) : (
                          <><LogIn className="w-4 h-4" /> Access Console</>
                       )}
                     </motion.button>
                  </form>
               </div>
            </div>

            <div className="text-center mt-8">
               <p className="text-gray-500 text-sm">
                  New to the platform?{" "}
                  <Link href="/auth/register" className="text-violet-400 hover:text-white transition-colors font-medium flex items-center justify-center gap-1 mt-2 group cursor-pointer">
                     Initialize new account <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </p>
            </div>
         </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={cn(
              "fixed bottom-8 left-1/2 z-50 px-6 py-4 rounded-xl border shadow-2xl flex items-center gap-4 min-w-[320px] backdrop-blur-md",
              toast.type === 'success' ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200" : "bg-red-950/80 border-red-500/30 text-red-200"
            )}
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", toast.type === 'success' ? "bg-emerald-500/20" : "bg-red-500/20")}>
               {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </div>
            <div>
               <h4 className="font-bold text-sm">{toast.title}</h4>
               <p className="text-xs opacity-80">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}










// "use client";

// import { useState } from 'react';
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Button } from "@/components/ui/button"; // Keep for shadcn/ui base
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input"; // Keep for shadcn/ui base
// // import { Label } from "@/components/ui/label"; // Not directly used, FormLabel is
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { LogIn, Loader2 } from 'lucide-react';
// import { GrTechnology } from 'react-icons/gr'; // For brand icon
// import { useAuth } from '@/providers/AuthProvider';

// const loginSchema = z.object({
//   email: z.string().email({ message: "Invalid email address." }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// export default function LoginPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();
//   const { login } = useAuth();

//   const theme = { // Re-defining for clarity within this component's scope for styled-jsx
//     bgMain: "#16181A",
//     bgSurface: "#1F2123",
//     textPrimary: "#F0F2F5",
//     textSecondary: "#A8B2C0",
//     accentPrimary: "#C9A461",
//     accentPrimaryHover: "#B8914B",
//     borderColor: "#303438",
//     borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)", // Slightly stronger shadow for cards
//     destructive: "#D32F2F", // A more muted red for dark theme
//     destructiveForeground: "#F0F2F5",
//     accentPrimaryRgb: "201, 164, 97",
//   };

//   const form = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   async function onSubmit(values: LoginFormValues) {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(values),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || `Login failed: ${response.statusText}`);
//       }
//       if (!data.user || !data.token) {
//         throw new Error("Invalid response from server. Missing user or token.");
//       }
//       login(data.token, data.user);
//       toast({
//         title: "Login Successful!",
//         description: "Welcome back to Mock Orbit.",
//         // Ensure your Toast component picks up themed variants
//       });
//     } catch (error: any) {
//       toast({
//         title: "Login Failed",
//         description: error.message || "An unexpected error occurred.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <>
//       <style jsx global>{`
//         :root {
//           --bg-main: ${theme.bgMain};
//           --bg-surface: ${theme.bgSurface};
//           --text-primary: ${theme.textPrimary};
//           --text-secondary: ${theme.textSecondary};
//           --accent-primary: ${theme.accentPrimary};
//           --accent-primary-hover: ${theme.accentPrimaryHover};
//           --border-color: ${theme.borderColor};
//           --border-color-subtle: ${theme.borderColorSubtle};
//           --shadow-color: ${theme.shadowColor};
//           --destructive: ${theme.destructive};
//           --destructive-foreground: ${theme.destructiveForeground};
//           --accent-primary-rgb: ${theme.accentPrimaryRgb};
//         }

//         @keyframes elegant-fade-in-scale-up {
//             from { opacity: 0; transform: translateY(20px) scale(0.98); }
//             to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         .animate-card-entry {
//             animation: elegant-fade-in-scale-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//         }

//         .themed-input {
//             background-color: var(--bg-main) !important;
//             border: 1px solid var(--border-color) !important;
//             color: var(--text-primary) !important;
//             border-radius: 0.375rem; /* 6px */
//             padding: 0.75rem;
//             transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
//         }
//         .themed-input::placeholder {
//             color: var(--text-secondary);
//             opacity: 0.7;
//         }
//         .themed-input:focus {
//             border-color: var(--accent-primary) !important;
//             box-shadow: 0 0 0 2px rgba(var(--accent-primary-rgb), 0.3) !important;
//             outline: none !important;
//         }
//         .themed-input:disabled {
//             opacity: 0.6;
//             cursor: not-allowed;
//         }
//         .premium-login-button {
//             background-color: var(--accent-primary);
//             color: var(--bg-main);
//             font-weight: 600;
//             border-radius: 0.375rem; /* 6px */
//             padding: 0.75rem 1.5rem;
//             transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             width: 100%;
//             box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15), 0 2px 6px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .premium-login-button:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px);
//             box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.2), 0 3px 8px rgba(var(--accent-primary-rgb), 0.15);
//         }
//         .premium-login-button:disabled {
//             opacity: 0.7;
//             cursor: not-allowed;
//         }
//         /* Ensure FormMessage uses destructive color */
//         .form-message-destructive {
//             color: var(--destructive) !important;
//             font-size: 0.8rem; /* slightly smaller */
//         }
//       `}</style>

//       <div className="flex items-center justify-center min-h-dvh p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--bg-main)' }}>
//         <Card 
//           className="w-full max-w-md animate-card-entry"
//           style={{ 
//             backgroundColor: 'var(--bg-surface)', 
//             borderColor: 'var(--border-color-subtle)',
//             boxShadow: `0 10px 25px -5px ${theme.shadowColor}, 0 20px 40px -20px ${theme.shadowColor}`
//           }}
//         >
//           <CardHeader className="space-y-2 text-center p-6 pt-8">
//             <Link href="/" aria-label="Back to homepage" className="inline-block mx-auto mb-3">
//                 <GrTechnology className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
//             </Link>
//             <CardTitle className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
//               Welcome to Mock Orbit
//             </CardTitle>
//             <CardDescription style={{ color: 'var(--text-secondary)' }}>
//               Sign in to access your account.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="p-6 sm:p-8">
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel style={{ color: 'var(--text-secondary)' }}>Email Address</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="email"
//                           placeholder="you@example.com"
//                           {...field}
//                           disabled={isLoading}
//                           className="themed-input"
//                         />
//                       </FormControl>
//                       <FormMessage className="form-message-destructive" />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="password"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel style={{ color: 'var(--text-secondary)' }}>Password</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="password"
//                           placeholder="••••••••"
//                           {...field}
//                           disabled={isLoading}
//                           className="themed-input"
//                         />
//                       </FormControl>
//                       <FormMessage className="form-message-destructive" />
//                     </FormItem>
//                   )}
//                 />
//                 <Button
//                   type="submit"
//                   className="premium-login-button py-3 text-base" // py-3 and text-base already part of the class
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="mr-2 h-5 w-5 animate-spin" style={{ color: 'var(--bg-main)'}} /> Logging in...
//                     </>
//                   ) : (
//                     <>
//                       <LogIn className="mr-2 h-5 w-5" style={{ color: 'var(--bg-main)'}}/> Login
//                     </>
//                   )}
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//           <CardFooter className="flex flex-col items-center text-sm p-6 space-y-3">
//             <div className="flex">
//               <p style={{ color: 'var(--text-secondary)' }}>Don&apos;t have an account?&nbsp;</p>
//               <Link 
//                 href="/auth/register" 
//                 className={`font-semibold hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
//                 style={{ color: 'var(--accent-primary)' }}
//                 prefetch={false}
//               >
//                 Sign up now
//               </Link>
//             </div>
//             {/* Optional: Add a "Forgot Password?" link here, styled similarly */}
//              <Link 
//                 href="/auth/forgot-password" // Assuming this route exists
//                 className={`text-xs hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
//                 style={{ color: 'var(--text-secondary)' }}
//                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
//                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
//                 prefetch={false}
//              >
//                Forgot Password?
//              </Link>
//           </CardFooter>
//         </Card>
//       </div>
//     </>
//   );
// }