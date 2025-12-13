"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  motion, 
  AnimatePresence, 
  useMotionTemplate, 
  useMotionValue, 
  useSpring,
  useTransform
} from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Check, 
  X, 
  Briefcase, 
  Code2, 
  Sparkles,
  Command,
  ChevronRight,
  ShieldCheck,
  Globe,
  Zap,
  Cpu,
  Video // Added missing import
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPATIBILITY LINK ---
const Link = ({ href, children, ...props }: any) => {
  return <a href={href} {...props}>{children}</a>;
};

// --- API CONFIG ---
const API_URL = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:8080/api/v1';

// --- SCHEMA ---
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  role: z.enum(["interviewer", "interviewee"], { required_error: "Please select a role." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

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
    return () => cancelAnimationFrame(animId);
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

// 4. 3D Tilt Card for Roles
const TiltCard = ({ children, isSelected, onClick }: any) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set(clientX - left - width / 2);
    y.set(clientY - top - height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]);
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]);

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-xl border p-4 transition-all duration-300 group overflow-hidden",
        isSelected 
          ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]" 
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      )}
    >
      {/* Dynamic Sheen */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)`
        }} 
      />
      
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// 5. Input Field (Defined OUTSIDE RegisterPage to prevent re-renders)
const InputField = ({ name, label, icon: Icon, type = "text", placeholder, form }: {
  name: string, 
  label: string, 
  icon: any, 
  type?: string, 
  placeholder?: string,
  form: UseFormReturn<RegisterFormValues>
}) => {
  const { register, formState: { errors } } = form;
  const error = errors[name as keyof RegisterFormValues];
  const [focused, setFocused] = useState(false);

  // Extract React Hook Form props to manually merge events
  const { onBlur, onChange, ref, name: fieldName } = register(name as any);

  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center px-1">
         <label className={cn("text-xs font-bold uppercase tracking-wider transition-colors duration-300", focused ? "text-violet-400" : "text-gray-500")}>{label}</label>
         {error && (
           <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-400 flex items-center gap-1">
             <X className="w-3 h-3" /> {error.message?.toString()}
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
            onBlur(e); // Propagate to RHF
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordScore, setPasswordScore] = useState(0);
  const [toast, setToast] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: undefined },
    mode: "onChange"
  });

  const passwordValue = form.watch("password");
  useEffect(() => {
    let score = 0;
    if (passwordValue?.length > 4) score += 1;
    if (passwordValue?.length > 7) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    setPasswordScore(score);
  }, [passwordValue]);

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setToast(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Cinematic delay
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Registration failed`);
      
      setToast({ title: "Orbit Established!", message: "Account created successfully. Initiating login sequence...", type: "success" });
      setTimeout(() => window.location.href = '/auth/login', 2500);
    } catch (error: any) {
      setToast({ title: "Launch Aborted", message: String(error.message || "An unexpected error occurred."), type: "error" });
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
              Master the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-white to-indigo-400">
                Technical Interview.
              </span>
            </h1>
            
            <div className="flex gap-4">
               {[
                 { icon: Code2, label: "Live IDE", color: "bg-blue-500/20 text-blue-300" },
                 { icon: Video, label: "HD Video", color: "bg-violet-500/20 text-violet-300" },
                 { icon: Cpu, label: "AI Analytics", color: "bg-emerald-500/20 text-emerald-300" }
               ].map((feature, i) => (
                 <div key={i} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 backdrop-blur-md", feature.color)}>
                    <feature.icon className="w-5 h-5" />
                    <span className="font-semibold text-sm">{feature.label}</span>
                 </div>
               ))}
            </div>

            <div className="pt-8 border-t border-white/10 max-w-md">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 p-0.5">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="rounded-full bg-white/10" />
                  </div>
                  <div>
                     <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map(star => <Sparkles key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                     </div>
                     <p className="text-sm text-gray-300 italic">"Mock Orbit's realism is unmatched. I felt fully prepared for my Meta onsite after just 3 sessions."</p>
                     <p className="text-xs font-bold text-white mt-2">— Sarah Jenkins, L5 Engineer</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 relative z-10 flex flex-col items-center justify-center p-6 sm:p-12">
         {/* Mobile Brand (Visible only on small screens) */}
         <div className="lg:hidden mb-8 w-full max-w-md">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
               <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center"><Command className="w-4 h-4"/></div>
               MockOrbit
            </Link>
         </div>

         <div className="w-full max-w-[420px] relative">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold tracking-tight mb-2">Initialize Account</h2>
               <p className="text-gray-400 text-sm">Join the elite network of engineers.</p>
            </div>

            {/* Glass Card */}
            <div className="relative group rounded-[1.5rem] bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 p-1">
               <BorderBeam /> {/* Rotating Glow */}
               
               <div className="bg-[#050505]/80 rounded-[1.3rem] p-6 sm:p-8 relative z-10 overflow-hidden">
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }} />

                  <form onSubmit={form.handleSubmit(onSubmit)}>
                     <AnimatePresence mode="wait">
                        {step === 1 ? (
                           <motion.div
                             key="step1"
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: -20 }}
                             className="space-y-5"
                           >
                              <div className="space-y-4">
                                 {/* Passed form object to InputField to prevent re-renders */}
                                 <InputField name="name" label="Identity" icon={User} placeholder="e.g. Alex Chen" form={form} />
                                 <InputField name="email" label="Communication" icon={Mail} type="email" placeholder="alex@tech.com" form={form} />
                                 <div className="space-y-1">
                                    <InputField name="password" label="Access Key" icon={Lock} type="password" placeholder="••••••••" form={form} />
                                    {/* Strength Meter */}
                                    <div className="flex gap-1 h-1 mt-2 px-1">
                                       {[...Array(5)].map((_, i) => (
                                          <motion.div 
                                            key={i} 
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ delay: i * 0.05 }}
                                            className={cn(
                                              "flex-1 rounded-full transition-colors duration-300",
                                              i < passwordScore 
                                                ? (passwordScore <= 2 ? "bg-red-500" : passwordScore <= 4 ? "bg-yellow-500" : "bg-emerald-500") 
                                                : "bg-white/10"
                                            )}
                                          />
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={async () => {
                                   const valid = await form.trigger(["name", "email", "password"]);
                                   if(valid) setStep(2);
                                }}
                                className="w-full mt-4 bg-white text-black font-bold rounded-xl py-3.5 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]"
                              >
                                 Proceed <ChevronRight className="w-4 h-4" />
                              </motion.button>
                           </motion.div>
                        ) : (
                           <motion.div
                             key="step2"
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, x: 20 }}
                             className="space-y-6"
                           >
                              <div className="flex items-center gap-2 mb-4">
                                 <button type="button" onClick={() => setStep(1)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-5 h-5 rotate-180 text-gray-400" /></button>
                                 <span className="text-sm font-medium text-gray-300">Select Primary Directive</span>
                              </div>

                              <div className="space-y-3">
                                 {/* Role: Interviewee */}
                                 <TiltCard 
                                    isSelected={form.watch("role") === "interviewee"} 
                                    onClick={() => form.setValue("role", "interviewee", { shouldValidate: true })}
                                 >
                                    <div className="flex items-start gap-4">
                                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", form.watch("role") === "interviewee" ? "bg-violet-500 text-white" : "bg-white/10 text-gray-400")}>
                                          <Code2 className="w-5 h-5" />
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-center">
                                             <span className="font-bold text-white">Interviewee</span>
                                             {form.watch("role") === "interviewee" && <Check className="w-4 h-4 text-violet-400" />}
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1">Practice coding & system design.</p>
                                       </div>
                                    </div>
                                 </TiltCard>

                                 {/* Role: Interviewer */}
                                 <TiltCard 
                                    isSelected={form.watch("role") === "interviewer"} 
                                    onClick={() => form.setValue("role", "interviewer", { shouldValidate: true })}
                                 >
                                    <div className="flex items-start gap-4">
                                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", form.watch("role") === "interviewer" ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-400")}>
                                          <Briefcase className="w-5 h-5" />
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex justify-between items-center">
                                             <span className="font-bold text-white">Interviewer</span>
                                             {form.watch("role") === "interviewer" && <Check className="w-4 h-4 text-indigo-400" />}
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1">Conduct interviews & earn reputation.</p>
                                       </div>
                                    </div>
                                 </TiltCard>
                                 
                                 {form.formState.errors.role && (
                                    <p className="text-red-400 text-xs text-center mt-2">{form.formState.errors.role.message}</p>
                                 )}
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl py-3.5 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden"
                              >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                {isLoading ? (
                                   <><Loader2 className="w-4 h-4 animate-spin" /> Igniting...</>
                                ) : (
                                   <>Launch Account <ArrowRight className="w-4 h-4" /></>
                                )}
                              </motion.button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </form>
               </div>
            </div>

            <div className="text-center mt-8">
               <p className="text-gray-500 text-sm">
                  Returning user?{" "}
                  <Link href="/auth/login" className="text-violet-400 hover:text-white transition-colors font-medium">
                     Re-establish connection
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
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
// import { UserPlus, Loader2 } from 'lucide-react';
// import { GrTechnology } from 'react-icons/gr';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// const registerSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, {message: "Name cannot exceed 50 characters."}),
//   email: z.string().email({ message: "Invalid email address." }),
//   password: z.string().min(6, { message: "Password must be at least 6 characters." }).max(100, {message: "Password too long."}),
//   role: z.enum(["interviewer", "interviewee"], { required_error: "Please select your primary role." }),
// });

// type RegisterFormValues = z.infer<typeof registerSchema>;

// export default function RegisterPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const router = useRouter();

//   const theme = {
//     bgMain: "#16181A",
//     bgSurface: "#1F2123",
//     textPrimary: "#F0F2F5",
//     textSecondary: "#A8B2C0",
//     accentPrimary: "#C9A461",
//     accentPrimaryHover: "#B8914B",
//     borderColor: "#303438",
//     borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)",
//     destructive: "#D32F2F",
//     destructiveForeground: "#F0F2F5",
//     accentPrimaryRgb: "201, 164, 97",
//   };

//   const form = useForm<RegisterFormValues>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//       role: undefined,
//     },
//   });

//   async function onSubmit(values: RegisterFormValues) {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(values),
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         throw new Error(data.error || `Registration failed: ${response.statusText}`);
//       }
//       toast({
//         title: "Registration Successful!",
//         description: "Your Mock Orbit account has been created. Please log in.",
//         // variant: "success" // if you have a success variant
//       });
//       router.push('/auth/login');
//     } catch (error: any) {
//       toast({
//         title: "Registration Failed",
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
//             from { opacity: 0; transform: translateY(10px) scale(0.99); }
//             to { opacity: 1; transform: translateY(0) scale(1); }
//         }
//         .animate-card-entry {
//             animation: elegant-fade-in-scale-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//         }

//         .themed-input {
//             background-color: var(--bg-main) !important;
//             border: 1px solid var(--border-color) !important;
//             color: var(--text-primary) !important;
//             border-radius: 0.375rem; /* 6px */
//             padding: 0.75rem;
//             transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
//             font-size: 0.9rem;
//         }
//         .themed-input::placeholder {
//             color: var(--text-secondary);
//             opacity: 0.6;
//         }
//         .themed-input:focus {
//             border-color: var(--accent-primary) !important;
//             box-shadow: 0 0 0 2.5px rgba(var(--accent-primary-rgb), 0.25) !important;
//             outline: none !important;
//         }
//         .themed-input:disabled {
//             opacity: 0.6;
//             cursor: not-allowed;
//         }

//         .premium-register-button { /* Can be same as login or slightly different if needed */
//             background-color: var(--accent-primary);
//             color: var(--bg-main);
//             font-weight: 600;
//             border-radius: 0.375rem;
//             padding: 0.75rem 1.5rem;
//             transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             width: 100%;
//             box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15), 0 2px 6px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .premium-register-button:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px);
//             box-shadow: 0 6px 16px rgba(var(--accent-primary-rgb), 0.2), 0 3px 8px rgba(var(--accent-primary-rgb), 0.15);
//         }
//         .premium-register-button:disabled {
//             opacity: 0.7;
//             cursor: not-allowed;
//         }

//         .form-message-destructive {
//             color: var(--destructive) !important;
//             font-size: 0.8rem;
//             margin-top: 0.25rem;
//         }

//         /* Styling for RadioGroup options */
//         .themed-radio-option {
//             border: 1px solid var(--border-color) !important;
//             background-color: var(--bg-main) !important; /* Slightly different from card surface for depth */
//             border-radius: 0.375rem; /* 6px */
//             transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
//         }
//         .themed-radio-option:hover {
//             border-color: var(--accent-primary) !important;
//             box-shadow: 0 0 10px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .themed-radio-option[data-state="checked"] { /* Using data-state on the FormItem wrapper */
//             border-color: var(--accent-primary) !important;
//             background-color: rgba(var(--accent-primary-rgb), 0.07) !important; /* Subtle accent background */
//             box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.15);
//         }
//         /* Styling for the actual radio button circle (RadioGroupItem) */
//         /* This assumes shadcn/ui RadioGroupItem uses CSS variables or can be targeted */
//         /* If shadcn/ui uses a class like .radio-indicator for the dot, target that */
//         .themed-radio-item[data-state="checked"] {
//             border-color: var(--accent-primary) !important;
//             background-color: var(--accent-primary) !important; /* This will be the fill of the circle */
//         }
//         /* This styles the inner dot if it's a separate element, often it is */
//         .themed-radio-item[data-state="checked"] > span:first-child { /* Assuming indicator is the first span */
//              background-color: var(--bg-main) !important; /* Dot color for contrast */
//         }
//         .themed-radio-item { /* Unchecked state */
//             border-color: var(--border-color-subtle) !important;
//         }

//       `}</style>

//       <div className="flex items-center justify-center min-h-dvh p-4 sm:p-6 md:p-8" style={{ backgroundColor: 'var(--bg-main)' }}>
//         <Card 
//           className="w-full max-w-lg animate-card-entry" // max-w-lg for register form
//           style={{ 
//             backgroundColor: 'var(--bg-surface)', 
//             borderColor: 'var(--border-color-subtle)',
//             borderWidth: '1px',
//             boxShadow: `0 12px 28px -8px ${theme.shadowColor}, 0 20px 45px -20px ${theme.shadowColor}`
//           }}
//         >
//           <CardHeader className="space-y-2 text-center p-6 pt-8">
//             <Link href="/" aria-label="Back to homepage" className="inline-block mx-auto mb-4">
//                 <GrTechnology className="h-10 w-10" style={{ color: 'var(--accent-primary)' }} />
//             </Link>
//             <CardTitle className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//               Join Mock Orbit
//             </CardTitle>
//             <CardDescription style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
//               Create your account to start your interview journey.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="p-6 sm:p-7"> {/* Consistent padding */}
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5"> {/* Adjusted space-y */}
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Full Name</FormLabel>
//                       <FormControl>
//                         <Input 
//                           placeholder="e.g., Jane Doe" 
//                           {...field} 
//                           disabled={isLoading}
//                           className="themed-input mt-1"
//                         />
//                       </FormControl>
//                       <FormMessage className="form-message-destructive" />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email Address</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="email"
//                           placeholder="you@example.com" 
//                           {...field} 
//                           disabled={isLoading}
//                           className="themed-input mt-1"
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
//                       <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Create Password</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="password" 
//                           placeholder="Minimum 6 characters" 
//                           {...field} 
//                           disabled={isLoading} 
//                           className="themed-input mt-1"
//                         />
//                       </FormControl>
//                       <FormMessage className="form-message-destructive" />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="role"
//                   render={({ field }) => (
//                     <FormItem className="space-y-2.5 pt-1"> {/* Added pt-1 */}
//                       <FormLabel style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select Your Primary Role</FormLabel>
//                       <FormControl>
//                         <RadioGroup
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                           className="grid grid-cols-1 sm:grid-cols-2 gap-3" // gap-3
//                           disabled={isLoading}
//                         >
//                           <FormItem 
//                             data-state={field.value === "interviewee" ? "checked" : "unchecked"}
//                             className="flex items-start space-x-3 p-3.5 themed-radio-option cursor-pointer" // Added p-3.5, cursor
//                             onClick={() => field.onChange("interviewee")} // Make whole item clickable
//                           >
//                             <FormControl>
//                               <RadioGroupItem value="interviewee" id="role-interviewee" className="themed-radio-item mt-0.5" />
//                             </FormControl>
//                             <FormLabel htmlFor="role-interviewee" className="font-normal cursor-pointer flex-1 leading-tight" style={{color: 'var(--text-primary)'}}>
//                               Interviewee
//                               <span className="block text-xs mt-0.5" style={{color: 'var(--text-secondary)', opacity: 0.8}}>I want to practice for interviews.</span>
//                             </FormLabel>
//                           </FormItem>
//                           <FormItem 
//                             data-state={field.value === "interviewer" ? "checked" : "unchecked"}
//                             className="flex items-start space-x-3 p-3.5 themed-radio-option cursor-pointer"
//                             onClick={() => field.onChange("interviewer")}
//                           >
//                             <FormControl>
//                               <RadioGroupItem value="interviewer" id="role-interviewer" className="themed-radio-item mt-0.5"/>
//                             </FormControl>
//                             <FormLabel htmlFor="role-interviewer" className="font-normal cursor-pointer flex-1 leading-tight" style={{color: 'var(--text-primary)'}}>
//                               Interviewer
//                               <span className="block text-xs mt-0.5" style={{color: 'var(--text-secondary)', opacity: 0.8}}>I want to help others practice.</span>
//                             </FormLabel>
//                           </FormItem>
//                         </RadioGroup>
//                       </FormControl>
//                       <FormMessage className="form-message-destructive" />
//                     </FormItem>
//                   )}
//                 />
//                 <Button 
//                   type="submit" 
//                   className="premium-register-button py-3 text-base"
//                   disabled={isLoading}
//                 >
//                   {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" style={{color: 'var(--bg-main)'}}/> Creating Account...</> : <><UserPlus className="mr-2 h-5 w-5" style={{color: 'var(--bg-main)'}}/>Register</>}
//                 </Button>
//               </form>
//             </Form>
//           </CardContent>
//           <CardFooter className="flex justify-center text-sm p-6 pt-5"> {/* Adjusted padding */}
//             <p style={{ color: 'var(--text-secondary)' }}>Already have an account?&nbsp;</p>
//             <Link href="/auth/login" 
//                 className={`font-semibold hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
//                 style={{ color: 'var(--accent-primary)' }}
//                 prefetch={false}>
//               Log in
//             </Link>
//           </CardFooter>
//         </Card>
//       </div>
//     </>
//   );
// }