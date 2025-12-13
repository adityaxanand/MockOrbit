"use client";

import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/shared/AppLayout";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { 
  CalendarDays, 
  Users, 
  Star, 
  MessageSquareWarning, 
  Loader2, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Clock, 
  LayoutDashboard,
  Video,
  Target,
  Zap,
  BrainCircuit,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- TYPES ---
interface Interview {
  id: string;
  interviewee?: { id: string; name: string; };
  scheduled_time: string;
  topic: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface PerformanceStats {
  interviewsConducted: number;
  averageRating: number | null;
  feedbackPending: number;
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
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            speed: Math.random() * 0.2
        });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(124, 58, 237, 0.2)"; 
      stars.forEach(star => {
        star.y -= star.speed;
        if (star.y < 0) star.y = height;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
    }
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen" />;
};

const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
);

const BorderBeam = ({ className }: { className?: string }) => (
  <div className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]", className)}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      className="absolute aspect-square w-full bg-[conic-gradient(from_0deg,transparent_0_340deg,cyan_360deg)] opacity-40"
      style={{ offsetPath: "rect(0% 100% 100% 0% round 1.5rem)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    />
  </div>
);

const GlowingCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={cn("group relative border border-white/10 bg-[#080808]/80 backdrop-blur-xl overflow-hidden rounded-2xl", className)}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.1), transparent 80%)`,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatBox = ({ icon: Icon, label, value, subtext, color, delay, isLoading }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden bg-[#0A0A0A] border border-white/10 p-5 rounded-2xl group hover:border-white/20 transition-all duration-300"
  >
    <div className={cn("absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20", color)} />
    <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
            <div className={cn("p-2.5 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300", color.replace("bg-", "text-").replace("from-", "text-"))}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        </div>
        <div className="flex items-baseline gap-2">
            {isLoading ? (
                <Skeleton className="h-8 w-20 bg-white/10" />
            ) : (
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            )}
            {subtext && <span className="text-xs text-gray-400">{subtext}</span>}
        </div>
    </div>
  </motion.div>
);

const RadarScan = () => (
    <div className="relative w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent top-1/2 animate-[scan_3s_linear_infinite]" />
        <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-ping absolute top-1/3 left-1/3" />
        <LayoutDashboard className="w-8 h-8 text-gray-600 relative z-10" />
    </div>
);

// --- MAIN PAGE ---

export default function InterviewerDashboardPage() {
  const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
  const { toast } = useToast();
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // --- DATA FETCHING ---
  
  useEffect(() => {
    // AuthProvider handles redirect logic
  }, [isAuthLoading, activeRole]);

  useEffect(() => {
    const fetchScheduled = async () => {
      if (!user?.id || !token || activeRole !== 'interviewer') {
          setIsLoadingInterviews(false);
          return;
      }
      setIsLoadingInterviews(true);
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled,in_progress`, { 
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch scheduled interviews');
        setScheduledInterviews(data || []);
      } catch (error: any) {
        console.error("Failed to fetch interviews:", error);
        toast({ title: "Uplink Failed", description: "Unable to retrieve mission parameters.", variant: "destructive" });
        setScheduledInterviews([]);
      } finally {
        setIsLoadingInterviews(false);
      }
    };
    if (!isAuthLoading) fetchScheduled();
  }, [user?.id, token, toast, isAuthLoading, activeRole]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || !token || activeRole !== 'interviewer') {
        setIsLoadingStats(false);
        return;
      }
      setIsLoadingStats(true);
      try {
        const response = await fetch(`${API_URL}/users/${user.id}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch performance stats');
        setPerformanceStats(data);
      } catch (error: any) {
        console.error("Failed to fetch stats:", error);
        toast({ title: "Telemetry Error", description: "Could not load performance metrics.", variant: "destructive" });
        setPerformanceStats(null);
      } finally {
        setIsLoadingStats(false);
      }
    };
    if (!isAuthLoading) fetchStats();
  }, [user?.id, token, toast, isAuthLoading, activeRole]);

  // --- HELPERS ---

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'in_progress') {
        return (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </div>
        );
    }
    return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
           Scheduled
        </span>
    );
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen pb-20 text-white font-sans selection:bg-violet-500/30">
        <Starfield />
        <GridBackground />
        
        {/* --- HEADER SECTION --- */}
        <div className="relative z-10 space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 bg-indigo-500/10 px-3 py-1 text-xs">
                    INTERVIEWER DECK
                 </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
                Command Center
              </h1>
              <p className="text-gray-400 mt-2 max-w-xl text-lg">
                Manage your evaluation schedule and track your performance metrics from a central hub.
              </p>
            </div>
            
            <Link href="/schedule">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-8 py-1 text-sm font-bold text-white backdrop-blur-3xl gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-400" /> Manage Availability
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* --- STATS GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <StatBox 
                icon={CheckCircle2} 
                label="Evaluations Conducted" 
                value={isLoadingStats ? <Skeleton className="h-8 w-12 bg-white/10" /> : (performanceStats?.interviewsConducted ?? 0)}
                color="from-emerald-500 to-teal-500" 
                delay={0.1}
                isLoading={isLoadingStats}
             />
             <StatBox 
                icon={Star} 
                label="Candidate Rating" 
                value={isLoadingStats ? <Skeleton className="h-8 w-12 bg-white/10" /> : (performanceStats?.averageRating ? performanceStats.averageRating.toFixed(1) : 'N/A')}
                subtext="/ 5.0 Average"
                color="from-amber-500 to-yellow-500" 
                delay={0.2}
                isLoading={isLoadingStats}
             />
             <StatBox 
                icon={MessageSquareWarning} 
                label="Feedback Pending" 
                value={isLoadingStats ? <Skeleton className="h-8 w-12 bg-white/10" /> : (performanceStats?.feedbackPending ?? 0)}
                subtext="Reports awaiting submission"
                color="from-rose-500 to-red-500" 
                delay={0.3}
                isLoading={isLoadingStats}
             />
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
             
             {/* --- SCHEDULED SESSIONS (Main Panel) --- */}
             <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg"><LayoutDashboard className="w-5 h-5 text-indigo-400" /></div>
                      Scheduled Missions
                   </h2>
                   <div className="text-xs text-gray-500 font-mono">
                      {scheduledInterviews.length} PENDING
                   </div>
                </div>

                {isLoadingInterviews ? (
                   <div className="grid gap-4">
                      {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-white/5" />)}
                   </div>
                ) : scheduledInterviews.length > 0 ? (
                   <div className="grid gap-4">
                      {scheduledInterviews.map((interview, i) => (
                         <GlowingCard key={interview.id} className="p-6">
                            {/* Active Beam for In-Progress */}
                            {interview.status === 'in_progress' && <BorderBeam />}
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                               <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                     {getStatusBadge(interview.status || 'scheduled')}
                                     <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                        <Target className="w-3 h-3" /> {interview.topic}
                                     </span>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/20 ring-2 ring-white/10">
                                           {interview.interviewee?.name.charAt(0) || "U"}
                                        </div>
                                        <div>
                                           <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Candidate</p>
                                           <p className="text-white font-bold text-sm">{interview.interviewee?.name || 'Unknown'}</p>
                                        </div>
                                     </div>
                                     
                                     <div className="w-px h-8 bg-white/10 hidden sm:block" />
                                     
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                                           <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                           <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Time</p>
                                           <p className="text-white font-mono text-sm">{formatDate(interview.scheduled_time)}</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <Link href={`/interview-room/${interview.id}`}>
                                  <Button 
                                    size="lg" 
                                    className={cn(
                                       "font-bold shadow-lg transition-all min-w-[160px] h-12 text-sm rounded-xl border border-white/5",
                                       interview.status === 'in_progress' 
                                          ? "bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse" 
                                          : "bg-white text-black hover:bg-gray-200"
                                    )}
                                    disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}
                                  >
                                     {interview.status === 'in_progress' ? (
                                        <><Video className="mr-2 h-4 w-4" /> Rejoin Session</>
                                     ) : (
                                        <><ExternalLink className="mr-2 h-4 w-4" /> Launch Room</>
                                     )}
                                  </Button>
                               </Link>
                            </div>
                         </GlowingCard>
                      ))}
                   </div>
                ) : (
                   <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }}
                     className="bg-[#0A0A0A]/30 border border-dashed border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center group hover:border-white/20 transition-colors"
                   >
                      <RadarScan />
                      <h3 className="text-xl font-bold text-white mt-6 mb-2">System Idle</h3>
                      <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                         No active missions detected on the radar. Update your availability to intercept new candidates.
                      </p>
                      <Link href="/schedule">
                         <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/50 transition-all">
                            Update Availability
                         </Button>
                      </Link>
                   </motion.div>
                )}
             </div>

             {/* --- Right Col: Resources & Tips --- */}
             <div className="lg:col-span-4 space-y-6">
                 
                 {/* Quick Actions */}
                 <GlowingCard className="p-0">
                    <div className="p-5 border-b border-white/10 bg-white/5">
                       <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" /> Interviewer Toolkit
                       </h3>
                    </div>
                    <div className="p-2">
                       {[
                         { title: "Question Bank", desc: "Access verified technical questions", icon: BrainCircuit, color: "text-pink-400", href: "/questions" },
                         { title: "Evaluation Rubric", desc: "Standardized grading criteria", icon: Target, color: "text-blue-400", href: "/rubric" }
                       ].map((item, i) => (
                          <Link href={item.href} key={i}>
                             <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center border border-white/10 group-hover:border-white/20">
                                   <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{item.title}</p>
                                   <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                             </div>
                          </Link>
                       ))}
                    </div>
                 </GlowingCard>

                 {/* Pro Tip */}
                 <div className="bg-gradient-to-br from-indigo-900/20 to-[#0A0A0A] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-indigo-600/10 blur-[40px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                       <div className="flex items-center gap-2 mb-3">
                          <Info className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Pro Tip</span>
                       </div>
                       <p className="text-sm text-gray-300 leading-relaxed">
                          Remember to submit feedback within 24 hours of the interview. Timely feedback improves your reputation score and helps candidates grow.
                       </p>
                    </div>
                 </div>

                 {/* Alert Panel */}
                 {performanceStats && performanceStats.feedbackPending > 0 && (
                     <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-4">
                         <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                         <div>
                             <h4 className="text-sm font-bold text-rose-400">Action Required</h4>
                             <p className="text-xs text-gray-400 mt-1">You have pending feedback reports. Complete them to maintain your verified status.</p>
                         </div>
                     </div>
                 )}

             </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}




// "use client";

// import { useState, useEffect } from "react";
// import AppLayout from "@/components/shared/AppLayout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CalendarDays, Users, Star, MessageSquareWarning, Loader2, CheckCircle, ExternalLink, Info } from "lucide-react";
// import Link from "next/link";
// import { useAuth } from "@/providers/AuthProvider";
// import { useToast } from "@/hooks/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";


// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// interface Interview {
//   id: string;
//   interviewee?: { id: string; name: string; };
//   scheduled_time: string;
//   topic: string;
//   status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }

// interface PerformanceStats {
//   interviewsConducted: number;
//   averageRating: number | null;
//   feedbackPending: number;
// }

// export default function InterviewerDashboardPage() {
//   const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
//   const { toast } = useToast();
//   const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
//   const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
//   const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
//   const [isLoadingStats, setIsLoadingStats] = useState(true);

//    useEffect(() => {
//     if (!isAuthLoading && activeRole && activeRole !== 'interviewer') {
//         // router.push(`/dashboard/${activeRole}`); // AuthProvider handles this
//     }
//    }, [isAuthLoading, activeRole]);

//   useEffect(() => {
//     const fetchScheduled = async () => {
//        if (!user?.id || !token || activeRole !== 'interviewer') {
//            setIsLoadingInterviews(false);
//            return;
//        }
//        setIsLoadingInterviews(true);
//        try {
//          const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled,in_progress`, { // Also fetch in_progress
//            headers: { Authorization: `Bearer ${token}` },
//          });
//          const data = await response.json();
//          if (!response.ok) throw new Error(data.error || 'Failed to fetch scheduled interviews');
//          setScheduledInterviews(data || []);
//        } catch (error: any) {
//          console.error("Failed to fetch scheduled interviews:", error);
//          toast({ title: "Error", description: `Could not load scheduled interviews: ${error.message}`, variant: "destructive" });
//          setScheduledInterviews([]);
//        } finally {
//          setIsLoadingInterviews(false);
//        }
//      };
//      if (!isAuthLoading) fetchScheduled();
//    }, [user?.id, token, toast, isAuthLoading, activeRole]);

//     useEffect(() => {
//         const fetchStats = async () => {
//             if (!user?.id || !token || activeRole !== 'interviewer') {
//                 setIsLoadingStats(false);
//                 return;
//             }
//             setIsLoadingStats(true);
//             try {
//                 const response = await fetch(`${API_URL}/users/${user.id}/stats`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await response.json();
//                 if (!response.ok) throw new Error(data.error || 'Failed to fetch performance stats');
//                 setPerformanceStats(data);
//             } catch (error: any) {
//                 console.error("Failed to fetch performance stats:", error);
//                 toast({ title: "Error", description: `Could not load performance stats: ${error.message}`, variant: "destructive" });
//                 setPerformanceStats(null);
//             } finally {
//                 setIsLoadingStats(false);
//             }
//         };
//         if (!isAuthLoading) fetchStats();
//     }, [user?.id, token, toast, isAuthLoading, activeRole]);

//    const formatDate = (isoString: string): string => {
//        try {
//            return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
//        } catch (e) { return "Invalid Date"; }
//    };

//     const StatCard = ({ title, value, icon: Icon, description, isLoading }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading?: boolean }) => (
//         <Card className="shadow-md hover:shadow-lg transition-shadow border-border">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
//                 <Icon className="h-5 w-5 text-accent" />
//             </CardHeader>
//             <CardContent>
//                 {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : <div className="text-2xl font-bold text-primary">{value}</div>}
//                 {description && <p className="text-xs text-muted-foreground">{description}</p>}
//             </CardContent>
//         </Card>
//     );

//      const renderInterviewListSkeleton = (count: number) => (
//         <div className="space-y-4">
//            {[...Array(count)].map((_, index) => (
//                 <Card key={index} className="p-4 border rounded-lg shadow-sm">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between">
//                         <div className="mb-3 sm:mb-0 space-y-2">
//                             <Skeleton className="h-5 w-40" />
//                             <Skeleton className="h-4 w-32" />
//                             <Skeleton className="h-4 w-44" />
//                         </div>
//                         <Skeleton className="h-10 w-24 rounded-md" />
//                     </div>
//                 </Card>
//            ))}
//         </div>
//      );

//   return (
//     <AppLayout>
//       <div className="space-y-8">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <h1 className="text-3xl font-bold text-primary">Interviewer Dashboard</h1>
//              {/* Maybe a link to availability settings or general schedule view if different from interviewee's */}
//             <Link href="/schedule" passHref>
//                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow">
//                     <CalendarDays className="mr-2 h-5 w-5"/> Manage Availability
//                 </Button>
//             </Link>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//            <StatCard
//              title="Interviews Conducted"
//              value={performanceStats?.interviewsConducted ?? 0}
//              icon={CheckCircle}
//              description="Total interviews completed"
//              isLoading={isLoadingStats}
//            />
//            <StatCard
//              title="Average Rating"
//              value={performanceStats?.averageRating !== null && performanceStats?.averageRating !== undefined ? `${performanceStats.averageRating.toFixed(1)} / 5` : 'N/A'}
//              icon={Star}
//              description="Based on interviewee feedback"
//              isLoading={isLoadingStats}
//            />
//           <StatCard
//              title="Feedback Pending"
//              value={performanceStats?.feedbackPending ?? 0}
//              icon={MessageSquareWarning}
//              description="Interviews awaiting your feedback"
//              isLoading={isLoadingStats}
//            />
//         </div>

//         <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
//           <CardHeader className="pb-4">
//             <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-6 w-6 text-primary"/>Upcoming Sessions</CardTitle>
//             <CardDescription>Interviews you are scheduled to conduct. Be prepared!</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isLoadingInterviews ? renderInterviewListSkeleton(2)
//              : scheduledInterviews.length > 0 ? (
//               <ul className="space-y-4">
//                 {scheduledInterviews.map((interview) => (
//                   <Card key={interview.id} className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors shadow-sm">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between">
//                         <div className="mb-3 sm:mb-0">
//                           <p className="font-semibold text-lg">{interview.topic}</p>
//                           <p className="text-sm text-muted-foreground">Interviewee: {interview.interviewee?.name || 'N/A'}</p>
//                           <div className="flex items-center text-sm text-muted-foreground mt-1">
//                              <CalendarDays className="w-4 h-4 mr-1.5" />
//                              <span>{formatDate(interview.scheduled_time)}</span>
//                           </div>
//                         </div>
//                         <Link href={`/interview-room/${interview.id}`} passHref>
//                             <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-shadow w-full sm:w-auto" disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}>
//                                 {interview.status === 'in_progress' ? 'Rejoin Room' : 'Start Interview'}
//                                 <ExternalLink className="ml-2 h-4 w-4"/>
//                             </Button>
//                         </Link>
//                     </div>
//                      {interview.status === 'in_progress' && <Badge variant="default" className="mt-2 inline-block bg-green-500 text-white">In Progress</Badge>}
//                   </Card>
//                 ))}
//               </ul>
//             ) : (
//               <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
//                 <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                 <AlertTitle className="text-blue-700 dark:text-blue-300">No Upcoming Interviews</AlertTitle>
//                 <AlertDescription className="text-blue-600 dark:text-blue-400">
//                   You have no interviews scheduled to conduct. Check your availability settings or wait for interviewees to schedule with you.
//                 </AlertDescription>
//               </Alert>
//             )}
//           </CardContent>
//             {/* Potentially add a footer link to history or settings */}
//             {/* <CardFooter>
//                 <Link href="/profile#history" passHref className="w-full">
//                      <Button variant="outline" size="sm" className="w-full">View Full Interview History</Button>
//                 </Link>
//             </CardFooter> */}
//         </Card>
//       </div>
//     </AppLayout>
//   );
// }




// "use client";

// import { useState, useEffect } from "react";
// import AppLayout from "@/components/shared/AppLayout"; // Assuming this is themed
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { 
//     CalendarDays, Users, Star, MessageSquareWarning, CheckCircle, ExternalLink, Info,
//     Activity // Using Activity for "Interviews Conducted" for consistency
// } from "lucide-react";
// import Link from "next/link";
// import { useAuth } from "@/providers/AuthProvider";
// import { useToast } from "@/hooks/use-toast";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// interface Interview {
//   id: string;
//   interviewee?: { id: string; name: string; };
//   scheduled_time: string;
//   topic: string;
//   status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }

// interface PerformanceStats {
//   interviewsConducted: number;
//   averageRating: number | null;
//   feedbackPending: number;
// }

// // Helper StatCard Component (defined within or imported)
// const ThemedStatCard = ({ title, value, icon: Icon, description, isLoading, delay }: { title: string, value: string | number, icon: React.ElementType, description?: string, isLoading?: boolean, delay?: string }) => (
//     <div className="animate-item-entry" style={{animationDelay: delay}}>
//         <Card className="themed-card p-5 h-full flex flex-col justify-between"> {/* Ensure consistent height if desired or let content dictate */}
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
//                 <CardTitle className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>{title}</CardTitle>
//                 <Icon className="h-5 w-5" style={{color: 'var(--accent-primary)'}}/>
//             </CardHeader>
//             <CardContent className="p-0">
//                 {isLoading ? 
//                     <>
//                         <Skeleton className="themed-skeleton h-8 w-16 my-1" /> 
//                         {description && <Skeleton className="themed-skeleton h-3 w-full mt-1" />}
//                     </>
//                     : 
//                     <>
//                         <div className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>{value}</div>
//                         {description && <p className="text-xs mt-1" style={{color: 'var(--text-secondary)'}}>{description}</p>}
//                     </>
//                 }
//             </CardContent>
//         </Card>
//     </div>
// );


// export default function InterviewerDashboardPage() {
//   const { user, token, isLoading: isAuthLoading, activeRole } = useAuth();
//   const { toast } = useToast();
//   const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
//   const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
//   const [isLoadingInterviews, setIsLoadingInterviews] = useState(true);
//   const [isLoadingStats, setIsLoadingStats] = useState(true);

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
//     destructive: "#D32F2F",
//     destructiveRgb: "211, 47, 47",
//     destructiveForeground: "#fff",
//     success: "#4CAF50",
//     successRgb: "76, 175, 80",
//     info: "#2196F3", // Consistent info blue
//     infoRgb: "33, 150, 243",
//     accentPrimaryRgb: "201, 164, 97",
//     borderPrimaryRgb: "48, 52, 56", // For skeleton shimmer
//   };
  
//   useEffect(() => {
//     const fetchScheduled = async () => {
//         if (!user?.id || !token || activeRole !== 'interviewer') {
//             setIsLoadingInterviews(false); return;
//         }
//       setIsLoadingInterviews(true);
//       try {
//         const response = await fetch(`${API_URL}/users/${user.id}/interviews?role=interviewer&status=scheduled,in_progress`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (!response.ok) throw new Error(data.error || 'Failed to fetch scheduled interviews');
//         setScheduledInterviews(Array.isArray(data) ? data : []);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Scheduled interviews: ${error.message}`, variant: "destructive" });
//         setScheduledInterviews([]);
//       } finally {
//         setIsLoadingInterviews(false);
//       }
//     };
//     if (!isAuthLoading) fetchScheduled();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   useEffect(() => {
//     const fetchStats = async () => {
//         if (!user?.id || !token || activeRole !== 'interviewer') {
//             setIsLoadingStats(false); return;
//         }
//       setIsLoadingStats(true);
//       try {
//         // MOCKING STATS API
//         // const response = await fetch(`${API_URL}/users/${user.id}/stats/interviewer`, { // Assuming a specific endpoint
//         //   headers: { Authorization: `Bearer ${token}` },
//         // });
//         // const data = await response.json();
//         // if (!response.ok) throw new Error(data.error || 'Failed to fetch performance stats');
//         await new Promise(resolve => setTimeout(resolve, 700)); // Simulate fetch
//         const data: PerformanceStats = {
//             interviewsConducted: 28,
//             averageRating: 4.7,
//             feedbackPending: 3,
//         };
//         setPerformanceStats(data);
//       } catch (error: any) {
//         toast({ title: "Error", description: `Performance stats: ${error.message}`, variant: "destructive" });
//         setPerformanceStats(null);
//       } finally {
//         setIsLoadingStats(false);
//       }
//     };
//     if (!isAuthLoading) fetchStats();
//   }, [user?.id, token, toast, isAuthLoading, activeRole]);

//   const formatDate = (isoString: string): string => {
//     try {
//         return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(isoString));
//     } catch (e) { return "Invalid Date"; }
//   };

//   const getStatusBadgeStyling = (status?: string): { text: string, style: React.CSSProperties, className?: string } => {
//     switch (status) {
//         case 'in_progress': return { text: "In Progress", style: { backgroundColor: `rgba(var(--success-rgb), 0.15)`, color: 'var(--success)', borderColor: 'var(--success)'}, className: 'themed-badge' };
//         // Add other interviewer-specific statuses if any
//         default: return { text: status || 'Scheduled', style: { backgroundColor: `transparent`, color: 'var(--text-secondary)', borderColor: 'var(--border-color-subtle)'}, className: 'themed-badge themed-badge-outline' };
//     }
//   };

//   const renderInterviewListSkeleton = (count: number) => (
//     <>
//       {[...Array(count)].map((_, index) => (
//         <Card key={index} className="themed-skeleton-card p-5 space-y-3">
//             <div className="flex justify-between items-start">
//                 <div className="space-y-2">
//                     <Skeleton className="themed-skeleton h-5 w-40" />
//                     <Skeleton className="themed-skeleton h-4 w-32" />
//                 </div>
//                 <Skeleton className="themed-skeleton h-9 w-28 rounded-md" /> {/* Button size */}
//             </div>
//             <Skeleton className="themed-skeleton h-4 w-48" />
//         </Card>
//       ))}
//     </>
//   );

//   return (
//     <>
//       <style jsx global>{`
//         /* Paste the full CSS from IntervieweeDashboardPage here, it's identical for the theme */
//         :root {
//           --bg-main: ${theme.bgMain};
//           --bg-surface: ${theme.bgSurface};
//           --bg-surface-lighter: ${theme.bgSurfaceLighter};
//           --text-primary: ${theme.textPrimary};
//           --text-secondary: ${theme.textSecondary};
//           --accent-primary: ${theme.accentPrimary};
//           --accent-primary-hover: ${theme.accentPrimaryHover};
//           --border-color: ${theme.borderColor};
//           --border-color-subtle: ${theme.borderColorSubtle};
//           --border-primary-rgb: ${theme.borderPrimaryRgb}; /* for skeleton */
//           --shadow-color: ${theme.shadowColor};
//           --destructive: ${theme.destructive};
//           --destructive-rgb: ${theme.destructiveRgb};
//           --destructive-foreground: ${theme.destructiveForeground};
//           --success: ${theme.success};
//           --success-rgb: ${theme.successRgb};
//           --info: ${theme.info};
//           --info-rgb: ${theme.infoRgb};
//           --accent-primary-rgb: ${theme.accentPrimaryRgb};
//         }
//         @keyframes elegant-fade-in-up {
//             from { opacity: 0; transform: translateY(15px); }
//             to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-item-entry {
//             opacity: 0;
//             animation: elegant-fade-in-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
//         }
//         .premium-button {
//             background-color: var(--accent-primary);
//             color: var(--bg-main); 
//             font-weight: 600;
//             border-radius: 0.375rem;
//             padding: 0.65rem 1.25rem;
//             transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08);
//         }
//         .premium-button:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px) scale(1.02);
//             box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1);
//         }
//         .premium-button-secondary {
//              background-color: var(--accent-primary);
//             color: var(--bg-main);
//             font-weight: 500; /* Slightly less bold for secondary actions */
//             padding: 0.5rem 1rem; /* Smaller padding */
//             border-radius: 0.375rem;
//             transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//             box-shadow: 0 2px 8px rgba(var(--accent-primary-rgb), 0.1);
//         }
//          .premium-button-secondary:hover:not(:disabled) {
//             background-color: var(--accent-primary-hover);
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb), 0.15);
//         }

//          .premium-button-outline {
//             background-color: transparent;
//             color: var(--accent-primary);
//             font-weight: 500;
//             border: 1px solid var(--accent-primary);
//             border-radius: 0.375rem;
//             padding: 0.5rem 1rem;
//             transition: all 0.2s ease-in-out;
//         }
//         .premium-button-outline:hover:not(:disabled) {
//             background-color: rgba(var(--accent-primary-rgb), 0.1);
//             border-color: var(--accent-primary);
//         }
//         .themed-card {
//             background-color: var(--bg-surface);
//             border: 1px solid var(--border-color-subtle);
//             border-radius: 0.6rem;
//             box-shadow: 0 8px 20px -5px var(--shadow-color), 0 15px 30px -15px var(--shadow-color);
//             transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
//         }
//         .themed-card:hover {
//              transform: translateY(-4px);
//              box-shadow: 0 12px 28px -6px var(--shadow-color), 0 20px 40px -20px var(--shadow-color);
//         }
//         .themed-nested-card {
//             background-color: var(--bg-surface-lighter);
//             border: 1px solid var(--border-color);
//             border-radius: 0.5rem;
//             transition: background-color 0.2s ease, border-color 0.2s ease;
//         }
//         .themed-nested-card:hover {
//             background-color: var(--bg-main);
//             border-color: var(--accent-primary);
//         }
//         .themed-alert {
//             background-color: rgba(var(--info-rgb), 0.08);
//             border: 1px solid rgba(var(--info-rgb), 0.3);
//             border-left-width: 4px;
//             border-left-color: var(--info);
//             border-radius: 0.375rem;
//             padding: 1rem;
//         }
//         .themed-alert-title { color: var(--info); font-weight: 600; }
//         .themed-alert-description { color: var(--text-secondary); }
//         .themed-alert .lucide { color: var(--info); }
//         .themed-badge {
//             border-width: 1px;
//             border-style: solid;
//             padding: 0.2rem 0.6rem;
//             font-size: 0.75rem;
//             font-weight: 500;
//             border-radius: 9999px;
//             text-transform: capitalize;
//         }
//          .themed-badge-outline {
//             background-color: transparent !important;
//          }
//         @keyframes shimmer {
//             100% {transform: translateX(100%);}
//         }
//         .themed-skeleton {
//             background-color: var(--border-color); /* Darker base for skeleton */
//             position: relative;
//             overflow: hidden;
//             border-radius: 0.25rem;
//         }
//         .themed-skeleton::after {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: linear-gradient(90deg, transparent, rgba(var(--border-primary-rgb), 0.2), transparent); /* Use border-primary-rgb, ensure it's light enough */
//             transform: translateX(-100%);
//             animation: shimmer 1.5s infinite;
//         }
//         .themed-skeleton-card {
//              background-color: var(--bg-surface);
//              border: 1px solid var(--border-color-subtle);
//              border-radius: 0.5rem;
//         }
//       `}</style>
//       <AppLayout>
//         <div className="space-y-10 p-4 md:p-6 lg:p-8">
//             {/* Header Section */}
//             <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"> {/* Increased mb */}
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
//                             Welcome, {user?.name ? user.name.split(' ')[0] : 'Interviewer'}!
//                         </h1>
//                         <p style={{ color: 'var(--text-secondary)' }}>Manage your sessions and track your contributions.</p>
//                     </div>
//                     <Link href="/interviewer/availability" passHref> {/* Example link for interviewer availability */}
//                         <Button className="premium-button w-full sm:w-auto">
//                             <CalendarDays className="mr-2 h-5 w-5"/> Manage Availability
//                         </Button>
//                     </Link>
//                 </div>

//                 {/* Performance Stats Section */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                     <ThemedStatCard
//                         title="Interviews Conducted"
//                         value={performanceStats?.interviewsConducted ?? "0"}
//                         icon={Activity} // Changed for thematic consistency
//                         description="Total sessions you've led."
//                         isLoading={isLoadingStats}
//                         delay="0.2s"
//                     />
//                     <ThemedStatCard
//                         title="Average Rating Received"
//                         value={performanceStats?.averageRating !== null && performanceStats?.averageRating !== undefined ? `${performanceStats.averageRating.toFixed(1)} / 5` : 'N/A'}
//                         icon={Star}
//                         description="From interviewee feedback."
//                         isLoading={isLoadingStats}
//                         delay="0.3s"
//                     />
//                     <ThemedStatCard
//                         title="Feedback Pending"
//                         value={performanceStats?.feedbackPending ?? "0"}
//                         icon={MessageSquareWarning}
//                         description="Sessions needing your review."
//                         isLoading={isLoadingStats}
//                         delay="0.4s"
//                     />
//                 </div>
//             </div>

//           <div className="animate-item-entry" style={{animationDelay: '0.5s'}}>
//           <Card className="themed-card">
//             <CardHeader className="pb-4 border-b" style={{borderColor: 'var(--border-color)'}}>
//               <CardTitle className="flex items-center text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
//                 <Users className="mr-3 h-6 w-6" style={{color: 'var(--accent-primary)'}}/>Upcoming Sessions
//               </CardTitle>
//               <CardDescription style={{ color: 'var(--text-secondary)' }}>Interviews you are scheduled to conduct. Be prepared!</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-5">
//               {isLoadingInterviews ? renderInterviewListSkeleton(2)
//                 : scheduledInterviews.length > 0 ? (
//                   <ul className="space-y-4">
//                     {scheduledInterviews.map((interview, idx) => (
//                       <li key={interview.id} className="animate-item-entry" style={{animationDelay: `${idx * 0.1}s`}}>
//                       <Card className="themed-nested-card p-4">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                             <div className="flex-grow">
//                                 <p className="font-semibold text-lg" style={{color: 'var(--text-primary)'}}>{interview.topic}</p>
//                                 <p className="text-sm" style={{color: 'var(--text-secondary)'}}>Interviewee: {interview.interviewee?.name || 'N/A'}</p>
//                                 <div className="flex items-center text-xs mt-1" style={{color: 'var(--text-secondary)'}}>
//                                     <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
//                                     <span>{formatDate(interview.scheduled_time)}</span>
//                                 </div>
//                                 {interview.status === 'in_progress' && 
//                                     <Badge style={getStatusBadgeStyling('in_progress').style} className={`mt-2 inline-block ${getStatusBadgeStyling('in_progress').className}`}>
//                                         {getStatusBadgeStyling('in_progress').text}
//                                     </Badge>
//                                 }
//                             </div>
//                             <Link href={`/interview-room/${interview.id}`} passHref className="w-full sm:w-auto">
//                                 <Button size="sm" className="premium-button-secondary w-full" disabled={interview.status !== 'scheduled' && interview.status !== 'in_progress'}>
//                                     {interview.status === 'in_progress' ? 'Rejoin Room' : 'Start Interview'}
//                                     <ExternalLink className="ml-2 h-4 w-4"/>
//                                 </Button>
//                             </Link>
//                         </div>
//                       </Card>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                     <Alert className="themed-alert">
//                         <Info className="h-5 w-5" />
//                         <AlertTitle className="themed-alert-title">No Upcoming Interviews</AlertTitle>
//                         <AlertDescription className="themed-alert-description">
//                             You have no interviews scheduled to conduct. Ensure your availability is up to date!
//                         </AlertDescription>
//                     </Alert>
//                 )}
//             </CardContent>
//              {/* Optional Footer for quick links, e.g., to past conducted interviews */}
//             {/* <CardFooter className="pt-4 border-t" style={{borderColor: 'var(--border-color)'}}>
//                 <Link href="/interviewer/history" passHref className="w-full">
//                     <Button variant="outline" size="sm" className="premium-button-outline w-full">View All Conducted Interviews</Button>
//                 </Link>
//             </CardFooter> */}
//           </Card>
//           </div>
//         </div>
//       </AppLayout>
//     </>
//   );
// }
