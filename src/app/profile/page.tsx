"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppLayout from "@/components/shared/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { 
  motion, 
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate 
} from "framer-motion";
import {
  User, Mail, Hash, Save, Copy, Check, Edit3, History, Calendar, 
  Clock, Shield, Cpu, Activity, ChevronRight, X, Loader2, Code2, Briefcase, Lock, Globe
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- SCHEMA ---
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
  email: z.string().email().readonly(),
  profile_picture_url: z.string().url({ message: "Invalid URL." }).optional().or(z.literal('')),
  id: z.string().readonly(),
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

// --- VISUAL COMPONENTS ---

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
    const stars: any[] = [];
    for (let i = 0; i < 150; i++) stars.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2, speed: Math.random() * 0.2 });
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(160, 180, 255, 0.4)";
      stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) star.y = height;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen" />;
};

const BorderBeam = ({ className }: { className?: string }) => (
  <div className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]", className)}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      className="absolute aspect-square w-full bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-20"
      style={{ offsetPath: "rect(0% 100% 100% 0% round 1.5rem)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    />
  </div>
);

const ProfileField = ({ 
  label, 
  value, 
  icon: Icon, 
  isEditable = false, 
  register, 
  name, 
  copyable = false,
  onCopy 
}: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5 flex items-center gap-2">
        {label}
        {copyable && copied && <span className="text-emerald-400 text-[9px] normal-case tracking-normal animate-pulse">- Copied to clipboard</span>}
      </label>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-300",
        isEditable 
          ? "bg-[#0A0A0A] border-white/10 group-focus-within:border-violet-500/50 group-focus-within:shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]" 
          : "bg-white/5 border-transparent cursor-not-allowed"
      )}>
        {Icon && <Icon className={cn("w-4 h-4", isEditable ? "text-gray-400 group-focus-within:text-violet-400" : "text-gray-600")} />}
        
        {isEditable && register ? (
          <input 
            {...register(name)} 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-700 focus:ring-0"
          />
        ) : (
          <span className={cn("text-sm flex-1 font-mono truncate", isEditable ? "text-white" : "text-gray-400")}>
            {value}
          </span>
        )}

        {copyable && (
          <button 
            type="button"
            onClick={handleCopy}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
        
        {!isEditable && !copyable && (
          <Lock className="w-3.5 h-3.5 text-gray-700" />
        )}
      </div>
    </div>
  );
};

const HistoryRow = ({ item, index }: { item: InterviewHistoryItem, index: number }) => {
  const date = new Date(item.scheduled_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  
  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
    >
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full",
            item.status === 'Completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
            item.status === 'Cancelled' ? "bg-red-500" : "bg-yellow-500"
          )} />
          <span className="font-mono text-sm text-gray-300">{date}</span>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          {item.role_played === 'Interviewer' ? <Briefcase className="w-3 h-3 text-indigo-400" /> : <Code2 className="w-3 h-3 text-violet-400" />}
          <span className="text-sm font-medium text-white">{item.role_played}</span>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[10px] font-bold uppercase">
            {item.counterpart_name?.substring(0, 2)}
          </div>
          <span className="text-sm text-gray-300">{item.counterpart_name}</span>
        </div>
      </td>
      <td className="py-4 text-sm text-gray-400 max-w-[150px] truncate" title={item.topic}>{item.topic}</td>
      <td className="py-4 pr-4 text-right">
        <div className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          item.status === 'Completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          item.status === 'Cancelled' ? "bg-red-500/10 border-red-500/20 text-red-400" :
          "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
        )}>
          {item.status}
        </div>
      </td>
    </motion.tr>
  );
};

// --- MAIN PAGE ---

export default function ProfilePage() {
  const { user, token, isLoading: isAuthLoading, login } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

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
        toast({ title: "System Error", description: `Could not load mission log: ${error.message}`, variant: "destructive" });
        setHistory([]);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    if (!isAuthLoading) fetchHistory();
  }, [user?.id, token, toast, isAuthLoading]);

   async function onSubmit(values: z.infer<typeof profileSchema>) {
     if (!user || !token) {
        toast({ title: "Auth Error", description: "You are not logged in.", variant: "destructive" });
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
       if (token && updatedUserData) login(token, updatedUserData);
       
       toast({ title: "Configuration Saved", description: "Identity matrix updated successfully.", variant: "default" });
       setIsEditing(false);
     } catch (error: any) {
       toast({ title: "Update Failed", description: error.message, variant: "destructive" });
     } finally {
       setIsSubmitting(false);
     }
   }

   const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
        .then(() => toast({ title: "ID Copied", description: "Identity token copied to clipboard.", variant: "default" }))
        .catch(() => toast({ title: "Copy Failed", variant: "destructive" }));
    }
  };

  if (isAuthLoading) return (
    <AppLayout>
        <div className="h-[80vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        </div>
    </AppLayout>
  );

  if (!user) {
      return (
          <AppLayout>
              <div className="flex flex-col items-center justify-center gap-4 pt-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-gray-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Access Denied</h2>
                  <p className="text-gray-400">You must be logged in to view this dossier.</p>
                  <Link href="/auth/login" className="px-6 py-2 bg-violet-600 rounded-lg text-white font-medium hover:bg-violet-500 transition-colors">
                      Initialize Login
                  </Link>
              </div>
          </AppLayout>
      )
  }

  return (
    <AppLayout>
      <div className="min-h-screen text-white font-sans pb-20 relative overflow-hidden">
        <Starfield />
        
        <div className="grid lg:grid-cols-12 gap-8 relative z-10">
          
          {/* --- LEFT COLUMN: IDENTITY --- */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden p-1 backdrop-blur-xl">
                <BorderBeam />
                
                <div className="bg-[#080808] rounded-[1.8rem] p-6 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-violet-500 via-white/20 to-indigo-500">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                        {form.watch('profile_picture_url') || user.profile_picture_url ? (
                          <img src={form.watch('profile_picture_url') || user.profile_picture_url || ""} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-200 to-indigo-200">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "??"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#080808] rounded-full flex items-center justify-center border border-white/10">
                      <Shield className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">L4 ENGINEER</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-xs text-gray-400">Earth Station</span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-2xl font-bold text-white">{history.length}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Missions</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                      <span className="text-2xl font-bold text-emerald-400">98%</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Reputation</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
                      isEditing 
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" 
                        : "bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/5"
                    )}
                  >
                    {isEditing ? <><X className="w-4 h-4" /> Cancel Edits</> : <><Edit3 className="w-4 h-4" /> Edit Identity</>}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Identity Form */}
            <motion.div
              initial={false}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0" />
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" /> Identity Matrix
              </h3>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <ProfileField label="Commander Name" name="name" value={user.name} icon={User} isEditable={isEditing} register={form.register} />
                
                {isEditing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                     <ProfileField label="Avatar Uplink" name="profile_picture_url" value={user.profile_picture_url} icon={Globe} isEditable={true} register={form.register} />
                  </motion.div>
                )}

                <div className="h-px bg-white/5 my-2" />
                
                <ProfileField label="Secure Channel" name="email" value={user.email} icon={Mail} />
                <ProfileField label="Unique Identifier" name="id" value={user.id} icon={Hash} copyable onCopy={handleCopyId} />

                <AnimatePresence>
                  {isEditing && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="pt-2"
                    >
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-violet-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        Save Configuration
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: HISTORY & STATS --- */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Header Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Hours Practiced", value: "24.5", icon: Clock, color: "text-blue-400" },
                  { label: "Feedback Score", value: "4.8", icon: Activity, color: "text-emerald-400" },
                  { label: "Next Session", value: "TBD", icon: Calendar, color: "text-purple-400" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    className="bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-colors relative overflow-hidden group"
                  >
                     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />
                     <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-white/5", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                     </div>
                  </motion.div>
                ))}
             </div>

             {/* Mission Log */}
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4 }}
               className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden min-h-[500px] flex flex-col"
             >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0C0C0C]">
                   <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                         <History className="w-5 h-5 text-violet-400" /> Mission Log
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Archive of all simulation encounters</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead className="bg-white/5 text-xs uppercase font-bold text-gray-500">
                         <tr>
                            <th className="text-left py-4 pl-4 font-bold tracking-wider">Timeline</th>
                            <th className="text-left py-4 font-bold tracking-wider">Role</th>
                            <th className="text-left py-4 font-bold tracking-wider">Counterpart</th>
                            <th className="text-left py-4 font-bold tracking-wider">Objective</th>
                            <th className="text-right py-4 pr-4 font-bold tracking-wider">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {isHistoryLoading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Loading data...</td></tr>
                         ) : history.length === 0 ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">No mission data available.</td></tr>
                         ) : (
                            history.map((item, i) => (
                               <HistoryRow key={item.id} item={item} index={i} />
                            ))
                         )}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          </div>
        </div>
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
// import { History, Loader2, UserCircle, Edit3, Copy, Check } from 'lucide-react';
// import Link from 'next/link';
// import { Badge } from "@/components/ui/badge";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// const profileSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
//   email: z.string().email().readonly(),
//   profile_picture_url: z.string().url({ message: "Invalid URL. Please enter a valid image URL or leave empty." }).optional().or(z.literal('')),
//   id: z.string().readonly(), // Added ID field for display
// });

// type ProfileFormValues = Omit<z.infer<typeof profileSchema>, 'email' | 'id'>;

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

//   const form = useForm<z.infer<typeof profileSchema>>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: { name: "", email: "", profile_picture_url: "", id: "" },
//   });

//  useEffect(() => {
//     if (user) {
//       form.reset({
//         name: user.name || "",
//         email: user.email || "",
//         profile_picture_url: user.profile_picture_url || "",
//         id: user.id || "",
//       });
//     }
//   }, [user, form]);

//   useEffect(() => {
//     const fetchHistory = async () => {
//        if (!user?.id || !token) {
//            setIsHistoryLoading(false);
//            return;
//        }
//       setIsHistoryLoading(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?status=completed,cancelled,in_progress`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch interview history');

//         const historyWithDetails = (data || []).map((item: InterviewHistoryItem) => ({
//              ...item,
//              role_played: item.interviewer.id === user.id ? 'Interviewer' : 'Interviewee',
//              counterpart_name: item.interviewer.id === user.id ? item.interviewee.name : item.interviewer.name,
//          })).sort((a: InterviewHistoryItem, b: InterviewHistoryItem) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime());

//         setHistory(historyWithDetails);
//       } catch (error: any) {
//         console.error("Failed to fetch interview history:", error);
//         toast({ title: "Error", description: `Could not load interview history: ${error.message}`, variant: "destructive" });
//         setHistory([]);
//       } finally {
//         setIsHistoryLoading(false);
//       }
//     };
//     if (!isAuthLoading) fetchHistory();
//   }, [user?.id, token, toast, isAuthLoading]);

//    async function onSubmit(values: z.infer<typeof profileSchema>) {
//      if (!user || !token) {
//          toast({ title: "Authentication Error", description: "Please log in to update your profile.", variant: "destructive" });
//          return;
//      }
//      setIsSubmitting(true);
//      const submissionData: ProfileFormValues = { name: values.name, profile_picture_url: values.profile_picture_url || undefined };
//      if (values.profile_picture_url === '') submissionData.profile_picture_url = '';

//      try {
//        const response = await fetch(`${API_URL}/users/profile`, {
//          method: 'PATCH',
//          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//          body: JSON.stringify(submissionData),
//        });
//        const updatedUserData = await response.json();
//        if (!response.ok) throw new Error(updatedUserData.error || `Profile update failed: ${response.status}`);
//        if (token && updatedUserData) login(token, updatedUserData); // login updates the user in AuthContext
//        else throw new Error("Failed to update local user state after profile update.");
//        toast({ title: "Profile Updated!", description: "Your information has been successfully saved.", variant: "default" });
//      } catch (error: any) {
//        toast({ title: "Update Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
//      } finally {
//        setIsSubmitting(false);
//      }
//    }

//    const handleCopyId = () => {
//     if (user?.id) {
//       navigator.clipboard.writeText(user.id).then(() => {
//         setCopiedId(true);
//         toast({ title: "Copied!", description: "Your Peer ID has been copied to the clipboard.", variant: "default" });
//         setTimeout(() => setCopiedId(false), 2000);
//       }).catch(err => {
//         toast({ title: "Copy Failed", description: "Could not copy ID to clipboard.", variant: "destructive" });
//       });
//     }
//   };

//    const getInitials = (name?: string | null) => (name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : "??");
//    const formatHistoryDate = (isoString: string): string => {
//        try {
//            return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
//        } catch (e) { return "Invalid Date"; }
//    };

//    const getFeedbackBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
//     switch (status) {
//         case 'Received': return 'default';
//         case 'Provided': return 'default';
//         case 'Pending': return 'secondary';
//         case 'N/A':
//         case 'Cancelled': return 'outline';
//         default: return 'outline';
//     }
//    };

//     const renderHistoryLoadingSkeletons = (count: number) => (
//         <Table>
//             <TableHeader>
//                 <TableRow>
//                     {[...Array(6)].map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-full" /></TableHead>)}
//                 </TableRow>
//             </TableHeader>
//             <TableBody>
//                 {[...Array(count)].map((_, index) => (
//                     <TableRow key={index}>
//                         {[...Array(6)].map((_, i) => <TableCell key={i}><Skeleton className="h-4 w-full" /></TableCell>)}
//                     </TableRow>
//                 ))}
//             </TableBody>
//         </Table>
//     );

//   if (isAuthLoading) {
//       return (
//           <AppLayout>
//               <div className="space-y-8 p-2 md:p-0">
//                 <Skeleton className="h-10 w-1/3" />
//                 <Card className="shadow-sm border-border">
//                     <CardHeader><Skeleton className="h-7 w-1/4" /></CardHeader>
//                     <CardContent className="space-y-6">
//                         <div className="flex items-center space-x-4"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-10 flex-1" /></div>
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-full" />
//                     </CardContent>
//                      <CardFooter><Skeleton className="h-10 w-28 rounded-md" /></CardFooter>
//                 </Card>
//                  <Card className="shadow-sm border-border">
//                     <CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader>
//                     <CardContent>{renderHistoryLoadingSkeletons(3)}</CardContent>
//                  </Card>
//               </div>
//           </AppLayout>
//       )
//   }

//   if (!user) {
//        return (
//             <AppLayout>
//                 <div className="flex flex-col items-center justify-center gap-4 pt-12 text-center">
//                     <UserCircle className="w-16 h-16 text-muted-foreground" />
//                     <p className="text-lg font-medium">Please log in to view your profile.</p>
//                     <Link href="/auth/login"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">Login</Button></Link>
//                 </div>
//             </AppLayout>
//        )
//    }

//   return (
//     <AppLayout>
//       <div className="space-y-8">
//         <h1 className="text-3xl font-bold text-primary flex items-center"><UserCircle className="mr-3 w-8 h-8"/>Your Profile</h1>

//         <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
//             <CardHeader>
//                 <CardTitle className="flex items-center text-xl"><Edit3 className="mr-2 h-5 w-5"/>Account Information</CardTitle>
//                 <CardDescription>Manage your personal details. Email address and Peer ID cannot be changed.</CardDescription>
//             </CardHeader>
//            <CardContent>
//              <Form {...form}>
//                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
//                     <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 ring-offset-background">
//                         <AvatarImage src={form.watch('profile_picture_url') || user.profile_picture_url || undefined} alt={user.name || 'User Avatar'} />
//                         <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{getInitials(user.name)}</AvatarFallback>
//                     </Avatar>
//                     <FormField
//                         control={form.control}
//                         name="profile_picture_url"
//                         render={({ field }) => (
//                         <FormItem className="flex-1 w-full sm:w-auto">
//                             <FormLabel className="text-foreground">Profile Picture URL</FormLabel>
//                             <FormControl>
//                             <Input placeholder="https://example.com/your-avatar.png" {...field} value={field.value || ""} className="bg-background border-input focus:border-primary focus:ring-primary"/>
//                             </FormControl>
//                              <FormDescription className="text-xs">Enter a valid image URL (e.g., PNG, JPG) or leave empty for initials.</FormDescription>
//                             <FormMessage />
//                         </FormItem>
//                         )}
//                     />
//                  </div>

//                  <FormField
//                    control={form.control}
//                    name="name"
//                    render={({ field }) => (
//                      <FormItem>
//                        <FormLabel className="text-foreground">Full Name</FormLabel>
//                        <FormControl>
//                          <Input {...field} value={field.value ?? ""} className="bg-background border-input focus:border-primary focus:ring-primary"/>
//                        </FormControl>
//                        <FormMessage />
//                      </FormItem>
//                    )}
//                  />
//                  <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                         <FormItem>
//                            <FormLabel className="text-foreground">Email Address</FormLabel>
//                            <FormControl>
//                                <Input type="email" value={user.email || ""} readOnly disabled className="bg-muted/60 border-input cursor-not-allowed"/>
//                            </FormControl>
//                            <FormDescription className="text-xs">Email address is linked to your account and cannot be changed.</FormDescription>
//                             <FormMessage />
//                         </FormItem>
//                     )}
//                  />
//                   <FormField
//                     control={form.control}
//                     name="id"
//                     render={({ field }) => (
//                         <FormItem>
//                            <FormLabel className="text-foreground">Peer ID</FormLabel>
//                            <div className="flex items-center gap-2">
//                                <FormControl>
//                                    <Input value={user.id || ""} readOnly disabled className="bg-muted/60 border-input cursor-not-allowed flex-grow"/>
//                                </FormControl>
//                                <Button type="button" variant="outline" size="icon" onClick={handleCopyId} title="Copy Peer ID" className="shrink-0">
//                                    {copiedId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
//                                </Button>
//                            </div>
//                            <FormDescription className="text-xs">This is your unique identifier for scheduling interviews.</FormDescription>
//                            <FormMessage />
//                         </FormItem>
//                     )}
//                  />
//                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
//                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...</> : "Save Changes"}
//                  </Button>
//                </form>
//              </Form>
//            </CardContent>
//         </Card>

//         <Card id="history" className="shadow-lg border-border hover:shadow-xl transition-shadow">
//             <CardHeader>
//                 <CardTitle className="flex items-center text-xl"><History className="mr-2 h-5 w-5"/> Interview History</CardTitle>
//                 <CardDescription>A record of your past and ongoing interviews.</CardDescription>
//             </CardHeader>
//             <CardContent className="overflow-x-auto">
//                 {isHistoryLoading ? (
//                      renderHistoryLoadingSkeletons(5)
//                 ) : history.length > 0 ? (
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Date & Time</TableHead>
//                                 <TableHead>Your Role</TableHead>
//                                 <TableHead>Counterpart</TableHead>
//                                 <TableHead>Topic</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead>Feedback</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                          <TableBody>
//                             {history.map((item) => (
//                                 <TableRow key={item.id} className="hover:bg-secondary/50 transition-colors">
//                                     <TableCell className="whitespace-nowrap font-medium">{formatHistoryDate(item.scheduled_time)}</TableCell>
//                                     <TableCell><Badge variant={item.role_played === 'Interviewer' ? 'default' : 'secondary'}>{item.role_played}</Badge></TableCell>
//                                     <TableCell>{item.counterpart_name}</TableCell>
//                                     <TableCell className="max-w-[200px] truncate" title={item.topic}>{item.topic}</TableCell>
//                                     <TableCell>
//                                         <Badge variant={
//                                             item.status === 'Completed' ? 'default' :
//                                             item.status === 'Cancelled' ? 'destructive' :
//                                             item.status === 'in_progress' ? 'outline' :
//                                             'secondary'
//                                         }>
//                                         {item.status}
//                                         </Badge>
//                                     </TableCell>
//                                     <TableCell>
//                                        <Badge variant={getFeedbackBadgeVariant(item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status)}>
//                                             {item.status === 'Cancelled' || item.status === 'in_progress' ? 'N/A' : item.feedback_status || 'Pending'}
//                                         </Badge>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 ) : (
//                     <p className="text-muted-foreground text-center py-6">No interview history found. Start by scheduling an interview!</p>
//                 )}
//             </CardContent>
//         </Card>

//       </div>
//     </AppLayout>
//   );
// }



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