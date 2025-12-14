"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Mic, MicOff, Video, VideoOff, MessagesSquare, Code as CodeIcon, Hand, Send, 
  Maximize, Minimize, User, Wifi, Loader2, AlertCircle, CameraOff, 
  Settings2, PhoneOff, Terminal, Activity, GripVertical, Monitor,
  Cpu, Zap, Globe, Layers, Eye, Play, X, Trash2,
  ChevronRight,
  Target
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Editor, { Monaco } from '@monaco-editor/react';
import SimplePeer from 'simple-peer';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITIES ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- CONSTANTS ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
const WEBSOCKET_PATH = '/ws';

const LANGUAGES = {
  javascript: { label: 'JavaScript', filename: 'main.js', snippet: '// Initialize Mission\nfunction start() {\n  console.log("Systems Online");\n}' },
  typescript: { label: 'TypeScript', filename: 'main.ts', snippet: '// Initialize Mission\nconst start = (): void => {\n  console.log("Systems Online");\n};' },
  python: { label: 'Python', filename: 'script.py', snippet: '# Initialize Mission\ndef start():\n    print("Systems Online")' },
  java: { label: 'Java', filename: 'Main.java', snippet: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Systems Online");\n    }\n}' },
  cpp: { label: 'C++', filename: 'main.cpp', snippet: '#include <iostream>\n\nint main() {\n    std::cout << "Systems Online";\n    return 0;\n}' },
  go: { label: 'Go', filename: 'main.go', snippet: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Systems Online")\n}' },
};

type LanguageKey = keyof typeof LANGUAGES;

// --- INTERFACES ---
interface Participant { id: string; name: string; }
interface InterviewDetails {
  id: string;
  topic: string;
  interviewer: Participant;
  interviewee: Participant;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
interface WebSocketMessage {
  type: string;
  payload?: any;
  message?: any;
  code?: string;
  language?: LanguageKey;
  data?: any;
  signal?: SimplePeer.SignalData;
  callerId?: string;
  id?: string;
  userId?: string;
  users?: { id: string }[];
  senderId?: string;
}

// --- VISUAL COMPONENTS ---

const Starfield = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#02040a] to-[#02040a]" />
    <div className="absolute inset-0 opacity-20" style={{ 
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', 
      backgroundSize: '60px 60px' 
    }} />
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 blur-sm" />
  </div>
);

const VideoFrame = ({ stream, label, muted, isLocal = false }: { stream: MediaStream | null, label: string, muted?: boolean, isLocal?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black/80 rounded-xl overflow-hidden border border-white/10 shadow-2xl group ring-1 ring-white/5">
      {/* Holographic overlay effects */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
      
      {stream ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={isLocal || muted} 
          className={cn("w-full h-full object-cover", isLocal && "scale-x-[-1]")} 
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
           <div className="flex flex-col items-center gap-3 opacity-50">
             <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
             <div className="w-12 h-12 rounded-full bg-cyan-500/10 absolute animate-pulse" />
             <span className="text-xs text-cyan-500/50 font-mono tracking-widest mt-20">NO SIGNAL</span>
           </div>
        </div>
      )}
      
      {/* HUD Labels */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        <div className={cn(
          "px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2",
          stream ? "border-emerald-500/30" : "border-red-500/30"
        )}>
          <div className={cn("w-1.5 h-1.5 rounded-full", stream ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
          <span className="text-[10px] font-bold text-white tracking-wider uppercase">{label}</span>
        </div>
      </div>
      
      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/20 z-20" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/20 z-20" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/20 z-20" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/20 z-20" />
    </div>
  );
};

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isLoading: isAuthLoading } = useAuth();
  
  const interviewId = typeof params.id === 'string' ? params.id : '';
  
  // Logic State
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  
  // Media State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  
  // Layout State
  const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat');
  const [sidebarWidth, setSidebarWidth] = useState(400); // Initial width in px
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Content State
  const [language, setLanguage] = useState<LanguageKey>('javascript');
  const [code, setCode] = useState(LANGUAGES['javascript'].snippet);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
     ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#FFFFFF', lineWidth: 2,
  }).current;
  
  // --- RESIZABLE LOGIC ---
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
      const startX = mouseDownEvent.clientX;
      const startWidth = sidebarWidth;

      const doDrag = (mouseMoveEvent: MouseEvent) => {
        const newWidth = startWidth - (mouseMoveEvent.clientX - startX);
        if (newWidth > 280 && newWidth < 800) { // Limits
          setSidebarWidth(newWidth);
        }
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
  }, [sidebarWidth]);

  // --- CLEANUP ---
  const cleanupResources = useCallback(() => {
    console.log('Terminating session resources...');
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    Object.values(peersRef.current).forEach(peer => {
        try { peer.destroy(); } catch (e) {}
    });
    peersRef.current = {};
    if (wsRef.current) wsRef.current.close();
    wsRef.current = null;
    localStreamRef.current = null;
    setRemoteStream(null);
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isAuthLoading) return;
    if (!token || !interviewId) {
        router.push('/dashboard');
        return;
    }

    const init = async () => {
        try {
            const res = await fetch(`${API_URL}/interviews/${interviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load mission data');
            setInterviewDetails(data);
            
            // Setup Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
            } catch (err) {
                console.error("Media access failed", err);
                setMediaError("Camera/Mic inaccessible");
            }

            // Setup WebSocket
            const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user?.id}&token=${token}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnectionStatus('connected');
                toast({ title: "Uplink Established", description: "Connected to secure channel.", variant: "default" });
            };
            ws.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
            ws.onerror = () => setConnectionStatus('error');
            ws.onclose = () => setConnectionStatus('disconnected');

        } catch (error) {
            console.error(error);
            toast({ title: "Init Failed", description: "Could not initialize session.", variant: "destructive" });
        }
    };
    init();
    return () => cleanupResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, token, isAuthLoading]);

  // --- WEBSOCKET HANDLER ---
  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
        case 'all-users':
            data.users?.forEach(u => {
                if (u.id !== user?.id && !peersRef.current[u.id] && localStreamRef.current) {
                    const peer = createPeer(u.id, user!.id, localStreamRef.current);
                    peersRef.current[u.id] = peer;
                    identifyParticipant(u.id);
                }
            });
            break;
        case 'user-joined':
            if (data.callerId && data.signal && localStreamRef.current) {
                const peer = addPeer(data.signal, data.callerId, localStreamRef.current);
                peersRef.current[data.callerId] = peer;
                identifyParticipant(data.callerId);
            }
            break;
        case 'receiving-returned-signal':
            if (data.id && data.signal && peersRef.current[data.id]) {
                peersRef.current[data.id].signal(data.signal);
            }
            break;
        case 'chat-message':
            if (data.message) setChatMessages(prev => [...prev, data.message]);
            break;
        case 'code-update':
            if (data.code !== undefined && data.senderId !== user?.id) setCode(data.code);
            if (data.language && data.senderId !== user?.id) setLanguage(data.language);
            break;
        case 'whiteboard-update':
             if (data.senderId !== user?.id) handleDraw(data.data);
             break;
    }
  };

  // --- WEBRTC HELPERS ---
  const createPeer = (target: string, caller: string, stream: MediaStream) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => sendWS({ type: 'sending-signal', userToSignal: target, callerId: caller, signal }));
    peer.on('stream', (stream) => { setRemoteStream(stream); }); 
    return peer;
  };

  const addPeer = (signal: any, caller: string, stream: MediaStream) => {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on('signal', sig => sendWS({ type: 'returning-signal', signal: sig, callerId: caller }));
    peer.on('stream', (stream) => { setRemoteStream(stream); }); 
    peer.signal(signal);
    return peer;
  };

  const identifyParticipant = (id: string) => {
      if (!interviewDetails) return;
      const part = id === interviewDetails.interviewer.id ? interviewDetails.interviewer : interviewDetails.interviewee;
      if (part.id !== user?.id) setOtherParticipant(part);
  };

  const sendWS = (msg: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
  };

  // --- ACTIONS ---
  const handleSendMessage = () => {
      if (!newMessage.trim() || !user) return;
      const msg = { senderId: user.id, senderName: user.name, text: newMessage, timestamp: Date.now() };
      sendWS({ type: 'chat-message', message: msg });
      setChatMessages(prev => [...prev, msg]);
      setNewMessage('');
  };

  const handleCodeChange = (value: string | undefined) => {
      if (value !== undefined) {
          setCode(value);
          sendWS({ type: 'code-update', code: value, language, senderId: user?.id });
      }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLang = e.target.value as LanguageKey;
      setLanguage(newLang);
      
      // Update template if the code is default
      const currentDefault = LANGUAGES[language].snippet;
      const newDefault = LANGUAGES[newLang].snippet;
      
      // If code looks like the default snippet for the old language, update it
      // OR if it's practically empty
      if (!code || code.trim() === currentDefault.trim() || code.length < 50) {
          setCode(newDefault);
          sendWS({ type: 'code-update', code: newDefault, language: newLang, senderId: user?.id });
      } else {
          sendWS({ type: 'code-update', code, language: newLang, senderId: user?.id }); 
      }
  };

  const handleRunCode = () => {
      setShowTerminal(true);
      setIsCompiling(true);
      setTerminalLogs(["> Initializing compiler environment...", "> Resolving dependencies..."]);
      
      // Simulation
      setTimeout(() => {
          setTerminalLogs(prev => [...prev, "> Compilation started..."]);
      }, 800);

      setTimeout(() => {
          setTerminalLogs(prev => [...prev, `> Executing ${LANGUAGES[language].filename}...`, "", "Systems Online", "", "> Process exited with code 0"]);
          setIsCompiling(false);
      }, 2000);
  };

  // --- WHITEBOARD ---
  const handleDraw = (data: any) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx || !canvasRef.current) return;
      if (data.type === 'clear') {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          return;
      }
      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = 2;
      ctx.stroke();
  };

  const startDraw = (e: any) => {
      if(!drawingContext.ctx) drawingContext.ctx = canvasRef.current?.getContext('2d') || null;
      drawingContext.isDrawing = true;
      const rect = canvasRef.current!.getBoundingClientRect();
      drawingContext.lastX = e.clientX - rect.left;
      drawingContext.lastY = e.clientY - rect.top;
  };

  const doDraw = (e: any) => {
      if (!drawingContext.isDrawing || !drawingContext.ctx) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      drawingContext.ctx.beginPath();
      drawingContext.ctx.moveTo(drawingContext.lastX, drawingContext.lastY);
      drawingContext.ctx.lineTo(x, y);
      drawingContext.ctx.strokeStyle = '#FFFFFF';
      drawingContext.ctx.lineWidth = 2;
      drawingContext.ctx.stroke();

      sendWS({ type: 'whiteboard-update', data: { x0: drawingContext.lastX, y0: drawingContext.lastY, x1: x, y1: y, color: '#FFFFFF', type: 'draw' }, senderId: user?.id });
      drawingContext.lastX = x;
      drawingContext.lastY = y;
  };

  // --- RENDER ---
  if (!interviewDetails) return (
      <div className="h-screen bg-[#02040a] flex items-center justify-center text-white font-mono">
          <div className="flex flex-col items-center gap-6">
              <div className="relative">
                  <div className="w-20 h-20 rounded-full border-t-2 border-l-2 border-cyan-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-full animate-pulse" />
                  </div>
              </div>
              <p className="tracking-[0.3em] text-sm text-cyan-500/80 animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
          </div>
      </div>
  );

  return (
    <div className="h-screen bg-[#02040a] text-white font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500/30">
        <Starfield />
        
        {/* --- TOP HUD --- */}
        <header className="h-16 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl flex items-center justify-between px-6 z-50 shadow-2xl relative">
            {/* Left Info */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-tight leading-none">MOCK<span className="text-cyan-400">ORBIT</span></h1>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                            <span>SESSION ID:</span>
                            <span className="text-gray-300">{interviewDetails.id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-white/10" />

                <div className="hidden md:flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Protocol</span>
                        <span className="text-sm font-bold text-white flex items-center gap-2">
                           <Target className="w-3 h-3 text-pink-400" /> {interviewDetails.topic}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status</span>
                        <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500')} />
                             <span className={cn("text-xs font-bold", connectionStatus === 'connected' ? 'text-emerald-400' : 'text-red-400')}>
                                {connectionStatus === 'connected' ? 'ONLINE' : 'DISCONNECTED'}
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-sm text-cyan-100">00:42:15</span>
                </div>
                
                <Button 
                    variant="destructive" 
                    onClick={() => router.push('/dashboard')} 
                    className="h-9 bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all font-bold text-xs tracking-wider"
                >
                    <PhoneOff className="w-3 h-3 mr-2" /> ABORT
                </Button>
            </div>
            
            {/* Decorative bottom line */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </header>

        {/* --- MAIN WORKSPACE --- */}
        <div className="flex-1 flex overflow-hidden relative z-40">
            
            {/* LEFT: HOLOGRAPHIC VIDEO FEED */}
            <div className="w-[320px] bg-[#030305]/95 border-r border-white/10 flex flex-col p-4 gap-4 z-40 hidden xl:flex shadow-2xl">
                <div className="flex-1 flex flex-col gap-4">
                    {/* Peer Video */}
                    <div className="flex-1 relative">
                        <VideoFrame stream={remoteStream} label={otherParticipant?.name || "Peer"} />
                    </div>
                    {/* Self Video */}
                    <div className="h-48 relative">
                         <VideoFrame stream={localStreamRef.current} label="You" isLocal />
                    </div>
                </div>
                
                {/* Media Controls */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-center gap-4 shadow-inner">
                    <Button 
                        size="icon" 
                        variant={isMicMuted ? "destructive" : "secondary"} 
                        onClick={() => {
                            if (localStreamRef.current) {
                                localStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMicMuted);
                                setIsMicMuted(!isMicMuted);
                            }
                        }}
                        className={cn("w-12 h-12 rounded-full border-2", isMicMuted ? "border-red-400" : "border-white/10 bg-white/5 hover:bg-white/10 text-white")}
                    >
                        {isMicMuted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
                    </Button>
                    <Button 
                        size="icon" 
                        variant={isVideoOff ? "destructive" : "secondary"} 
                        onClick={() => {
                            if (localStreamRef.current) {
                                localStreamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff);
                                setIsVideoOff(!isVideoOff);
                            }
                        }}
                        className={cn("w-12 h-12 rounded-full border-2", isVideoOff ? "border-red-400" : "border-white/10 bg-white/5 hover:bg-white/10 text-white")}
                    >
                        {isVideoOff ? <VideoOff className="w-5 h-5"/> : <Video className="w-5 h-5"/>}
                    </Button>
                    <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                        <Settings2 className="w-5 h-5"/>
                    </Button>
                </div>
            </div>

            {/* CENTER: CODE EDITOR & TERMINAL */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
                {/* Editor Toolbar */}
                <div className="h-12 bg-[#181818] border-b border-[#2a2a2a] flex items-center justify-between px-4">
                     <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 px-3 py-1.5 rounded border border-white/5">
                            <CodeIcon className="w-3 h-3" />
                            <span>{LANGUAGES[language as LanguageKey].filename}</span>
                         </div>
                         {/* Language Selector */}
                         <div className="relative group">
                            <select 
                                value={language}
                                onChange={handleLanguageChange}
                                className="appearance-none bg-transparent text-xs font-bold text-gray-300 hover:text-white cursor-pointer outline-none uppercase tracking-wide pr-4"
                            >
                                {Object.entries(LANGUAGES).map(([key, lang]) => (
                                    <option key={key} value={key} className="bg-[#1e1e1e]">{lang.label}</option>
                                ))}
                            </select>
                            <ChevronRight className="w-3 h-3 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-90 transition-transform" />
                         </div>
                     </div>

                     <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             CONNECTED
                         </div>
                         <Button 
                           size="sm" 
                           onClick={handleRunCode}
                           className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4 flex items-center gap-2"
                         >
                            <Play className="w-3 h-3 fill-current" /> Run Code
                         </Button>
                     </div>
                </div>

                <div className="flex-1 relative flex flex-col">
                    <div className="flex-1 relative">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            theme="vs-dark"
                            onChange={(val) => {
                                if (val) {
                                    setCode(val);
                                    sendWS({ type: 'code-update', code: val, language, senderId: user?.id });
                                }
                            }}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                lineNumbersMinChars: 4,
                                renderLineHighlight: 'all',
                            }}
                        />
                    </div>
                    
                    {/* TERMINAL PANEL */}
                    <AnimatePresence>
                      {showTerminal && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 200, opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-[#0c0c0c] border-t border-white/10 flex flex-col"
                        >
                           <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-[#151515]">
                              <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                <Terminal className="w-3 h-3" /> Console Output
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setTerminalLogs([])} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10"><Trash2 className="w-3 h-3"/></button>
                                <button onClick={() => setShowTerminal(false)} className="text-gray-500 hover:text-white p-1 rounded hover:bg-white/10"><X className="w-3 h-3"/></button>
                              </div>
                           </div>
                           <ScrollArea className="flex-1 p-4 font-mono text-xs">
                              {terminalLogs.map((log, i) => (
                                <div key={i} className={cn("mb-1", log.includes("Error") ? "text-red-400" : log.startsWith(">") ? "text-cyan-300" : "text-gray-300")}>
                                  {log}
                                </div>
                              ))}
                              {isCompiling && <span className="text-cyan-500 animate-pulse">_</span>}
                           </ScrollArea>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>

            {/* DRAGGABLE DIVIDER */}
            <div 
                className="w-1 bg-[#2a2a2a] hover:bg-cyan-500 cursor-col-resize z-50 transition-colors flex flex-col justify-center items-center group"
                onMouseDown={startResizing}
            >
                <div className="h-8 w-1 bg-gray-600 rounded-full group-hover:bg-white transition-colors" />
            </div>

            {/* RIGHT: COLLAPSIBLE SIDEBAR */}
            <motion.div 
                style={{ width: sidebarWidth }}
                className="bg-[#0A0A0A] border-l border-white/10 flex flex-col z-40 shadow-2xl"
            >
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => setActiveTab('chat')} 
                        className={cn(
                            "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative overflow-hidden", 
                            activeTab === 'chat' ? "text-cyan-400 bg-white/5" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        {activeTab === 'chat' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
                        Comm Link
                    </button>
                    <button 
                        onClick={() => setActiveTab('whiteboard')} 
                        className={cn(
                            "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative overflow-hidden", 
                            activeTab === 'whiteboard' ? "text-pink-400 bg-white/5" : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                         {activeTab === 'whiteboard' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500" />}
                        Whiteboard
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative bg-[#050505]">
                    {activeTab === 'chat' ? (
                        <div className="h-full flex flex-col">
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {chatMessages.map((msg, i) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={i} 
                                            className={cn("flex flex-col max-w-[85%]", msg.senderId === user?.id ? "ml-auto items-end" : "items-start")}
                                        >
                                            <div className={cn(
                                                "px-4 py-2.5 rounded-2xl text-sm shadow-md border",
                                                msg.senderId === user?.id 
                                                    ? "bg-cyan-900/30 border-cyan-500/30 text-cyan-100 rounded-tr-sm" 
                                                    : "bg-white/10 border-white/10 text-gray-200 rounded-tl-sm"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-gray-600 mt-1.5 font-mono uppercase">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t border-white/10 bg-[#080808]">
                                <div className="relative">
                                    <Input 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Enter transmission..." 
                                        className="bg-[#151515] border-white/10 h-12 pr-12 rounded-xl text-sm focus-visible:ring-cyan-500/50 shadow-inner"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors disabled:opacity-50 disabled:bg-transparent"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full relative bg-[#121212]">
                            <canvas 
                                ref={canvasRef}
                                onMouseDown={startDraw}
                                onMouseMove={doDraw}
                                onMouseUp={() => drawingContext.isDrawing = false}
                                onMouseLeave={() => drawingContext.isDrawing = false}
                                width={sidebarWidth}
                                height={800}
                                className="cursor-crosshair w-full h-full"
                            />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleDraw({type: 'clear'})} className="h-8 text-xs border-white/20 bg-black/50 text-white hover:bg-white/20">
                                    Clear Board
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

        </div>
    </div>
  );
}


//   // --- INTERNAL HELPERS ---
//   function sendWS(msg: any) {
//       if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
//   }
  
//   function handleDraw(data: any) {
//       const ctx = canvasRef.current?.getContext('2d');
//       if (!ctx || !canvasRef.current) return;
//       if (data.type === 'clear') {
//           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//           return;
//       }
//       ctx.beginPath();
//       ctx.moveTo(data.x0, data.y0);
//       ctx.lineTo(data.x1, data.y1);
//       ctx.strokeStyle = data.color || '#fff';
//       ctx.lineWidth = 2;
//       ctx.stroke();
//   }
// }


// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   Mic, MicOff, Video, VideoOff, MessagesSquare, Code as CodeIcon, Hand, Send, 
//   Maximize, Minimize, User, Wifi, Loader2, AlertCircle, CameraOff, 
//   Settings2, PhoneOff, Terminal, Activity, GripVertical, Monitor,
//   Cpu, Zap, Globe, Layers, Eye,
//   Target,
//   ChevronRight
// } from 'lucide-react';
// import { useAuth } from '@/providers/AuthProvider';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
// import Editor, { Monaco } from '@monaco-editor/react';
// import SimplePeer from 'simple-peer';
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- UTILITIES ---
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// // --- CONSTANTS ---
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
// const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
// const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
// const WEBSOCKET_PATH = '/ws';

// const LANGUAGES = {
//   javascript: { label: 'JavaScript', filename: 'main.js', snippet: '// Initialize Mission\nfunction start() {\n  console.log("Systems Online");\n}' },
//   typescript: { label: 'TypeScript', filename: 'main.ts', snippet: '// Initialize Mission\nconst start = (): void => {\n  console.log("Systems Online");\n};' },
//   python: { label: 'Python', filename: 'script.py', snippet: '# Initialize Mission\ndef start():\n    print("Systems Online")' },
//   java: { label: 'Java', filename: 'Main.java', snippet: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Systems Online");\n    }\n}' },
//   cpp: { label: 'C++', filename: 'main.cpp', snippet: '#include <iostream>\n\nint main() {\n    std::cout << "Systems Online";\n    return 0;\n}' },
//   go: { label: 'Go', filename: 'main.go', snippet: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Systems Online")\n}' },
// };

// type LanguageKey = keyof typeof LANGUAGES;

// // --- INTERFACES ---
// interface Participant { id: string; name: string; }
// interface InterviewDetails {
//   id: string;
//   topic: string;
//   interviewer: Participant;
//   interviewee: Participant;
//   status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }
// interface ChatMessage {
//   senderId: string;
//   senderName: string;
//   text: string;
//   timestamp: number;
// }
// interface WebSocketMessage {
//   type: string;
//   payload?: any;
//   message?: any;
//   code?: string;
//   language?: LanguageKey;
//   data?: any;
//   signal?: SimplePeer.SignalData;
//   callerId?: string;
//   id?: string;
//   userId?: string;
//   users?: { id: string }[];
//   senderId?: string;
// }

// // --- VISUAL COMPONENTS ---

// const Starfield = () => (
//   <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#02040a] to-[#02040a]" />
//     <div className="absolute inset-0 opacity-20" style={{ 
//       backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', 
//       backgroundSize: '60px 60px' 
//     }} />
//     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 blur-sm" />
//   </div>
// );

// const VideoFrame = ({ stream, label, muted, isLocal = false }: { stream: MediaStream | null, label: string, muted?: boolean, isLocal?: boolean }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (videoRef.current && stream) {
//       videoRef.current.srcObject = stream;
//     }
//   }, [stream]);

//   return (
//     <div className="relative w-full h-full bg-black/80 rounded-xl overflow-hidden border border-white/10 shadow-2xl group ring-1 ring-white/5">
//       {/* Holographic overlay effects */}
//       <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none z-10" />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
      
//       {stream ? (
//         <video 
//           ref={videoRef} 
//           autoPlay 
//           playsInline 
//           muted={isLocal || muted} 
//           className={cn("w-full h-full object-cover", isLocal && "scale-x-[-1]")} 
//         />
//       ) : (
//         <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
//            <div className="flex flex-col items-center gap-3 opacity-50">
//              <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]" />
//              <div className="w-12 h-12 rounded-full bg-cyan-500/10 absolute animate-pulse" />
//              <span className="text-xs text-cyan-500/50 font-mono tracking-widest mt-20">NO SIGNAL</span>
//            </div>
//         </div>
//       )}
      
//       {/* HUD Labels */}
//       <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
//         <div className={cn(
//           "px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2",
//           stream ? "border-emerald-500/30" : "border-red-500/30"
//         )}>
//           <div className={cn("w-1.5 h-1.5 rounded-full", stream ? "bg-emerald-400 animate-pulse" : "bg-red-500")} />
//           <span className="text-[10px] font-bold text-white tracking-wider uppercase">{label}</span>
//         </div>
//       </div>
      
//       {/* Corner Brackets */}
//       <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/20 z-20" />
//       <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/20 z-20" />
//       <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/20 z-20" />
//       <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/20 z-20" />
//     </div>
//   );
// };

// export default function InterviewRoomPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { toast } = useToast();
//   const { user, token, isLoading: isAuthLoading } = useAuth();
  
//   const interviewId = typeof params.id === 'string' ? params.id : '';
  
//   // Logic State
//   const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
//   const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  
//   // Media State
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [mediaError, setMediaError] = useState<string | null>(null);
  
//   // Layout State
//   const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat');
//   const [sidebarWidth, setSidebarWidth] = useState(400); // Initial width in px
//   const sidebarRef = useRef<HTMLDivElement>(null);
  
//   // Content State
//   const [language, setLanguage] = useState<LanguageKey>('javascript');
//   const [code, setCode] = useState(LANGUAGES['javascript'].snippet);
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [newMessage, setNewMessage] = useState('');

//   // Refs
//   const wsRef = useRef<WebSocket | null>(null);
//   const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
//      ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#FFFFFF', lineWidth: 2,
//   }).current;
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  
//   // --- RESIZABLE LOGIC ---
//   const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
//       const startX = mouseDownEvent.clientX;
//       const startWidth = sidebarWidth;

//       const doDrag = (mouseMoveEvent: MouseEvent) => {
//         const newWidth = startWidth - (mouseMoveEvent.clientX - startX);
//         if (newWidth > 280 && newWidth < 800) { // Limits
//           setSidebarWidth(newWidth);
//         }
//       };

//       const stopDrag = () => {
//         document.removeEventListener("mousemove", doDrag);
//         document.removeEventListener("mouseup", stopDrag);
//       };

//       document.addEventListener("mousemove", doDrag);
//       document.addEventListener("mouseup", stopDrag);
//   }, [sidebarWidth]);

//   // --- CLEANUP ---
//   const cleanupResources = useCallback(() => {
//     console.log('Terminating session resources...');
//     localStreamRef.current?.getTracks().forEach(track => track.stop());
//     Object.values(peersRef.current).forEach(peer => {
//         try { peer.destroy(); } catch (e) {}
//     });
//     peersRef.current = {};
//     if (wsRef.current) wsRef.current.close();
//     wsRef.current = null;
//     localStreamRef.current = null;
//     setRemoteStream(null);
//   }, []);

//   // --- INITIALIZATION ---
//   useEffect(() => {
//     if (isAuthLoading) return;
//     if (!token || !interviewId) {
//         router.push('/dashboard');
//         return;
//     }

//     const init = async () => {
//         try {
//             const res = await fetch(`${API_URL}/interviews/${interviewId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.error || 'Failed to load mission data');
//             setInterviewDetails(data);
            
//             // Setup Media
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 localStreamRef.current = stream;
//             } catch (err) {
//                 console.error("Media access failed", err);
//                 setMediaError("Camera/Mic inaccessible");
//             }

//             // Setup WebSocket
//             const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user?.id}&token=${token}`;
//             const ws = new WebSocket(wsUrl);
//             wsRef.current = ws;

//             ws.onopen = () => {
//                 setConnectionStatus('connected');
//                 toast({ title: "Uplink Established", description: "Connected to secure channel.", variant: "default" });
//             };
//             ws.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
//             ws.onerror = () => setConnectionStatus('error');
//             ws.onclose = () => setConnectionStatus('disconnected');

//         } catch (error) {
//             console.error(error);
//             toast({ title: "Init Failed", description: "Could not initialize session.", variant: "destructive" });
//         }
//     };
//     init();
//     return () => cleanupResources();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [interviewId, token, isAuthLoading]);

//   // --- WEBSOCKET HANDLER ---
//   const handleWebSocketMessage = (data: WebSocketMessage) => {
//     switch (data.type) {
//         case 'all-users':
//             data.users?.forEach(u => {
//                 if (u.id !== user?.id && !peersRef.current[u.id] && localStreamRef.current) {
//                     const peer = createPeer(u.id, user!.id, localStreamRef.current);
//                     peersRef.current[u.id] = peer;
//                     identifyParticipant(u.id);
//                 }
//             });
//             break;
//         case 'user-joined':
//             if (data.callerId && data.signal && localStreamRef.current) {
//                 const peer = addPeer(data.signal, data.callerId, localStreamRef.current);
//                 peersRef.current[data.callerId] = peer;
//                 identifyParticipant(data.callerId);
//             }
//             break;
//         case 'receiving-returned-signal':
//             if (data.id && data.signal && peersRef.current[data.id]) {
//                 peersRef.current[data.id].signal(data.signal);
//             }
//             break;
//         case 'chat-message':
//             if (data.message) setChatMessages(prev => [...prev, data.message]);
//             break;
//         case 'code-update':
//             if (data.code !== undefined && data.senderId !== user?.id) setCode(data.code);
//             if (data.language && data.senderId !== user?.id) setLanguage(data.language);
//             break;
//         case 'whiteboard-update':
//              if (data.senderId !== user?.id) handleDraw(data.data);
//              break;
//     }
//   };

//   // --- WEBRTC HELPERS ---
//   const createPeer = (target: string, caller: string, stream: MediaStream) => {
//     const peer = new SimplePeer({ initiator: true, trickle: false, stream });
//     peer.on('signal', signal => sendWS({ type: 'sending-signal', userToSignal: target, callerId: caller, signal }));
//     peer.on('stream', (stream) => { setRemoteStream(stream); }); 
//     return peer;
//   };

//   const addPeer = (signal: any, caller: string, stream: MediaStream) => {
//     const peer = new SimplePeer({ initiator: false, trickle: false, stream });
//     peer.on('signal', sig => sendWS({ type: 'returning-signal', signal: sig, callerId: caller }));
//     peer.on('stream', (stream) => { setRemoteStream(stream); }); 
//     peer.signal(signal);
//     return peer;
//   };

//   const identifyParticipant = (id: string) => {
//       if (!interviewDetails) return;
//       const part = id === interviewDetails.interviewer.id ? interviewDetails.interviewer : interviewDetails.interviewee;
//       if (part.id !== user?.id) setOtherParticipant(part);
//   };

//   const sendWS = (msg: any) => {
//       if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
//   };

//   // --- ACTIONS ---
//   const handleSendMessage = () => {
//       if (!newMessage.trim() || !user) return;
//       const msg = { senderId: user.id, senderName: user.name, text: newMessage, timestamp: Date.now() };
//       sendWS({ type: 'chat-message', message: msg });
//       setChatMessages(prev => [...prev, msg]);
//       setNewMessage('');
//   };

//   const handleCodeChange = (value: string | undefined) => {
//       if (value !== undefined) {
//           setCode(value);
//           sendWS({ type: 'code-update', code: value, language, senderId: user?.id });
//       }
//   };

//   const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//       const newLang = e.target.value as LanguageKey;
//       setLanguage(newLang);
//       sendWS({ type: 'code-update', code, language: newLang, senderId: user?.id }); 
//   };

//   // --- WHITEBOARD ---

//   // --- RENDER ---
//   if (!interviewDetails) return (
//       <div className="h-screen bg-[#02040a] flex items-center justify-center text-white font-mono">
//           <div className="flex flex-col items-center gap-6">
//               <div className="relative">
//                   <div className="w-20 h-20 rounded-full border-t-2 border-l-2 border-cyan-500 animate-spin" />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                       <div className="w-12 h-12 bg-cyan-500/20 rounded-full animate-pulse" />
//                   </div>
//               </div>
//               <p className="tracking-[0.3em] text-sm text-cyan-500/80 animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
//           </div>
//       </div>
//   );

//   return (
//     <div className="h-screen bg-[#02040a] text-white font-sans overflow-hidden flex flex-col relative selection:bg-cyan-500/30">
//         <Starfield />
        
//         {/* --- TOP HUD --- */}
//         <header className="h-16 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl flex items-center justify-between px-6 z-50 shadow-2xl relative">
//             {/* Left Info */}
//             <div className="flex items-center gap-6">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
//                         <Terminal className="w-5 h-5 text-white" />
//                     </div>
//                     <div>
//                         <h1 className="font-bold text-white tracking-tight leading-none">MOCK<span className="text-cyan-400">ORBIT</span></h1>
//                         <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
//                             <span>SESSION ID:</span>
//                             <span className="text-gray-300">{interviewDetails.id.slice(-6).toUpperCase()}</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className="h-8 w-px bg-white/10" />

//                 <div className="hidden md:flex items-center gap-4">
//                     <div className="flex flex-col">
//                         <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Protocol</span>
//                         <span className="text-sm font-bold text-white flex items-center gap-2">
//                            <Target className="w-3 h-3 text-pink-400" /> {interviewDetails.topic}
//                         </span>
//                     </div>
//                     <div className="flex flex-col">
//                         <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status</span>
//                         <div className="flex items-center gap-2">
//                              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500')} />
//                              <span className={cn("text-xs font-bold", connectionStatus === 'connected' ? 'text-emerald-400' : 'text-red-400')}>
//                                 {connectionStatus === 'connected' ? 'ONLINE' : 'DISCONNECTED'}
//                              </span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Right Controls */}
//             <div className="flex items-center gap-4">
//                 <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
//                     <Activity className="w-4 h-4 text-cyan-400" />
//                     <span className="font-mono text-sm text-cyan-100">00:42:15</span>
//                 </div>
                
//                 <Button 
//                     variant="destructive" 
//                     onClick={() => router.push('/dashboard')} 
//                     className="h-9 bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all font-bold text-xs tracking-wider"
//                 >
//                     <PhoneOff className="w-3 h-3 mr-2" /> ABORT
//                 </Button>
//             </div>
            
//             {/* Decorative bottom line */}
//             <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
//         </header>

//         {/* --- MAIN WORKSPACE --- */}
//         <div className="flex-1 flex overflow-hidden relative z-40">
            
//             {/* LEFT: HOLOGRAPHIC VIDEO FEED */}
//             <div className="w-[320px] bg-[#030305]/95 border-r border-white/10 flex flex-col p-4 gap-4 z-40 hidden xl:flex shadow-2xl">
//                 <div className="flex-1 flex flex-col gap-4">
//                     {/* Peer Video */}
//                     <div className="flex-1 relative">
//                         <VideoFrame stream={remoteStream} label={otherParticipant?.name || "Peer"} />
//                     </div>
//                     {/* Self Video */}
//                     <div className="h-48 relative">
//                          <VideoFrame stream={localStreamRef.current} label="You" isLocal />
//                     </div>
//                 </div>
                
//                 {/* Media Controls */}
//                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-center gap-4 shadow-inner">
//                     <Button 
//                         size="icon" 
//                         variant={isMicMuted ? "destructive" : "secondary"} 
//                         onClick={() => {
//                             if (localStreamRef.current) {
//                                 localStreamRef.current.getAudioTracks().forEach(t => t.enabled = isMicMuted);
//                                 setIsMicMuted(!isMicMuted);
//                             }
//                         }}
//                         className={cn("w-12 h-12 rounded-full border-2", isMicMuted ? "border-red-400" : "border-white/10 bg-white/5 hover:bg-white/10 text-white")}
//                     >
//                         {isMicMuted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
//                     </Button>
//                     <Button 
//                         size="icon" 
//                         variant={isVideoOff ? "destructive" : "secondary"} 
//                         onClick={() => {
//                             if (localStreamRef.current) {
//                                 localStreamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff);
//                                 setIsVideoOff(!isVideoOff);
//                             }
//                         }}
//                         className={cn("w-12 h-12 rounded-full border-2", isVideoOff ? "border-red-400" : "border-white/10 bg-white/5 hover:bg-white/10 text-white")}
//                     >
//                         {isVideoOff ? <VideoOff className="w-5 h-5"/> : <Video className="w-5 h-5"/>}
//                     </Button>
//                     <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
//                         <Settings2 className="w-5 h-5"/>
//                     </Button>
//                 </div>
//             </div>

//             {/* CENTER: CODE EDITOR */}
//             <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
//                 {/* Editor Toolbar */}
//                 <div className="h-12 bg-[#181818] border-b border-[#2a2a2a] flex items-center justify-between px-4">
//                      <div className="flex items-center gap-4">
//                          <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 px-3 py-1.5 rounded border border-white/5">
//                             <CodeIcon className="w-3 h-3" />
//                             <span>{LANGUAGES[language as LanguageKey].filename}</span>
//                          </div>
//                          {/* Language Selector */}
//                          <div className="relative group">
//                             <select 
//                                 value={language}
//                                 onChange={handleLanguageChange}
//                                 className="appearance-none bg-transparent text-xs font-bold text-gray-300 hover:text-white cursor-pointer outline-none uppercase tracking-wide pr-4"
//                             >
//                                 {Object.entries(LANGUAGES).map(([key, lang]) => (
//                                     <option key={key} value={key} className="bg-[#1e1e1e]">{lang.label}</option>
//                                 ))}
//                             </select>
//                             <ChevronRight className="w-3 h-3 text-gray-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-90 transition-transform" />
//                          </div>
//                      </div>

//                      <div className="flex items-center gap-3">
//                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-mono">
//                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
//                              CONNECTED
//                          </div>
//                          <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-4">
//                             Run Code
//                          </Button>
//                      </div>
//                 </div>

//                 <div className="flex-1 relative">
//                     <Editor
//                         height="100%"
//                         language={language}
//                         value={code}
//                         theme="vs-dark"
//                         onChange={(val) => {
//                             if (val) {
//                                 setCode(val);
//                                 sendWS({ type: 'code-update', code: val, language, senderId: user?.id });
//                             }
//                         }}
//                         options={{
//                             minimap: { enabled: false },
//                             fontSize: 14,
//                             fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
//                             scrollBeyondLastLine: false,
//                             automaticLayout: true,
//                             padding: { top: 16 },
//                             lineNumbersMinChars: 4,
//                             renderLineHighlight: 'all',
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* DRAGGABLE DIVIDER (Visual only for now, functionality via react-resizable-panels recommended for prod) */}
//             <div 
//                 className="w-1 bg-[#2a2a2a] hover:bg-cyan-500 cursor-col-resize z-50 transition-colors flex flex-col justify-center items-center group"
//                 onMouseDown={startResizing}
//             >
//                 <div className="h-8 w-1 bg-gray-600 rounded-full group-hover:bg-white" />
//             </div>

//             {/* RIGHT: COLLAPSIBLE SIDEBAR */}
//             <motion.div 
//                 style={{ width: sidebarWidth }}
//                 className="bg-[#0A0A0A] border-l border-white/10 flex flex-col z-40 shadow-2xl"
//             >
//                 {/* Tabs */}
//                 <div className="flex border-b border-white/10">
//                     <button 
//                         onClick={() => setActiveTab('chat')} 
//                         className={cn(
//                             "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative overflow-hidden", 
//                             activeTab === 'chat' ? "text-cyan-400 bg-white/5" : "text-gray-500 hover:text-gray-300"
//                         )}
//                     >
//                         {activeTab === 'chat' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500" />}
//                         Comm Link
//                     </button>
//                     <button 
//                         onClick={() => setActiveTab('whiteboard')} 
//                         className={cn(
//                             "flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all relative overflow-hidden", 
//                             activeTab === 'whiteboard' ? "text-pink-400 bg-white/5" : "text-gray-500 hover:text-gray-300"
//                         )}
//                     >
//                          {activeTab === 'whiteboard' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500" />}
//                         Whiteboard
//                     </button>
//                 </div>

//                 <div className="flex-1 overflow-hidden relative bg-[#050505]">
//                     {activeTab === 'chat' ? (
//                         <div className="h-full flex flex-col">
//                             <ScrollArea className="flex-1 p-4">
//                                 <div className="space-y-4">
//                                     {chatMessages.map((msg, i) => (
//                                         <motion.div 
//                                             initial={{ opacity: 0, y: 10 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             key={i} 
//                                             className={cn("flex flex-col max-w-[85%]", msg.senderId === user?.id ? "ml-auto items-end" : "items-start")}
//                                         >
//                                             <div className={cn(
//                                                 "px-4 py-2.5 rounded-2xl text-sm shadow-md border",
//                                                 msg.senderId === user?.id 
//                                                     ? "bg-cyan-900/30 border-cyan-500/30 text-cyan-100 rounded-tr-sm" 
//                                                     : "bg-white/10 border-white/10 text-gray-200 rounded-tl-sm"
//                                             )}>
//                                                 {msg.text}
//                                             </div>
//                                             <span className="text-[10px] text-gray-600 mt-1.5 font-mono uppercase">{msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//                                         </motion.div>
//                                     ))}
//                                 </div>
//                             </ScrollArea>
//                             <div className="p-4 border-t border-white/10 bg-[#080808]">
//                                 <div className="relative">
//                                     <Input 
//                                         value={newMessage}
//                                         onChange={(e) => setNewMessage(e.target.value)}
//                                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                                         placeholder="Enter transmission..." 
//                                         className="bg-[#151515] border-white/10 h-12 pr-12 rounded-xl text-sm focus-visible:ring-cyan-500/50 shadow-inner"
//                                     />
//                                     <button 
//                                         onClick={handleSendMessage}
//                                         disabled={!newMessage.trim()}
//                                         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors disabled:opacity-50 disabled:bg-transparent"
//                                     >
//                                         <Send className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="h-full relative bg-[#121212]">
//                             {/* Simple Canvas Placeholder - Replace with full canvas logic if needed */}
//                             <canvas 
//                                 ref={canvasRef}
//                                 onMouseDown={(e) => {
//                                     if(!drawingContext.ctx) drawingContext.ctx = canvasRef.current?.getContext('2d') || null;
//                                     drawingContext.isDrawing = true;
//                                     const rect = canvasRef.current!.getBoundingClientRect();
//                                     drawingContext.lastX = e.clientX - rect.left;
//                                     drawingContext.lastY = e.clientY - rect.top;
//                                 }}
//                                 onMouseMove={(e) => {
//                                     if (!drawingContext.isDrawing || !drawingContext.ctx) return;
//                                     const rect = canvasRef.current!.getBoundingClientRect();
//                                     const x = e.clientX - rect.left;
//                                     const y = e.clientY - rect.top;
//                                     drawingContext.ctx.beginPath();
//                                     drawingContext.ctx.moveTo(drawingContext.lastX, drawingContext.lastY);
//                                     drawingContext.ctx.lineTo(x, y);
//                                     drawingContext.ctx.strokeStyle = '#fff';
//                                     drawingContext.ctx.lineWidth = 2;
//                                     drawingContext.ctx.stroke();
                                    
//                                     // Send WS Update
//                                     if (wsRef.current?.readyState === WebSocket.OPEN) {
//                                         wsRef.current.send(JSON.stringify({
//                                             type: 'whiteboard-update',
//                                             data: { x0: drawingContext.lastX, y0: drawingContext.lastY, x1: x, y1: y, color: '#fff', type: 'draw' },
//                                             senderId: user?.id
//                                         }));
//                                     }
                                    
//                                     drawingContext.lastX = x;
//                                     drawingContext.lastY = y;
//                                 }}
//                                 onMouseUp={() => drawingContext.isDrawing = false}
//                                 onMouseLeave={() => drawingContext.isDrawing = false}
//                                 width={sidebarWidth}
//                                 height={800}
//                                 className="cursor-crosshair w-full h-full"
//                             />
//                             <div className="absolute top-4 right-4 flex gap-2">
//                                 <Button size="sm" variant="outline" onClick={() => handleDraw({type: 'clear'})} className="h-8 text-xs border-white/20 bg-black/50 text-white hover:bg-white/20">
//                                     Clear Board
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </motion.div>

//         </div>
//     </div>
//   );

//   // --- INTERNAL HELPERS ---
//   function handleDraw(data: any) {
//       const ctx = canvasRef.current?.getContext('2d');
//       if (!ctx || !canvasRef.current) return;
//       if (data.type === 'clear') {
//           ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//           return;
//       }
//       // Drawing logic for incoming data
//       ctx.beginPath();
//       ctx.moveTo(data.x0, data.y0);
//       ctx.lineTo(data.x1, data.y1);
//       ctx.strokeStyle = data.color || '#fff';
//       ctx.lineWidth = 2;
//       ctx.stroke();
//   }
// }



// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   Mic, MicOff, Video, VideoOff, MessagesSquare, Code as CodeIcon, Hand, Send, 
//   Maximize, Minimize, User, WifiOff, Loader2, AlertCircle, CameraOff, 
//   Settings2, PhoneOff, SidebarClose, SidebarOpen, Terminal, Sparkles, Activity,
//   X,
//   Clock
// } from 'lucide-react';
// import { useAuth } from '@/providers/AuthProvider';
// import { useToast } from '@/hooks/use-toast';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from '@/components/ui/skeleton';
// import { Badge } from "@/components/ui/badge";
// import { motion, AnimatePresence, useDragControls } from "framer-motion";
// import Editor, { Monaco } from '@monaco-editor/react';
// import SimplePeer from 'simple-peer';
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// // --- UTILITIES ---
// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// // --- CONSTANTS ---
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
// const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
// const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
// const WEBSOCKET_PATH = '/ws';

// const SUPPORTED_LANGUAGES = [
//   { value: 'javascript', label: 'JavaScript' },
//   { value: 'python', label: 'Python' },
//   { value: 'java', label: 'Java' },
//   { value: 'cpp', label: 'C++' },
//   { value: 'go', label: 'Go' },
//   { value: 'typescript', label: 'TypeScript' },
// ];

// // --- INTERFACES ---
// interface Participant { id: string; name: string; }
// interface InterviewDetails {
//   id: string;
//   topic: string;
//   interviewer: Participant;
//   interviewee: Participant;
//   status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }
// interface ChatMessage {
//   senderId: string;
//   senderName: string;
//   text: string;
//   timestamp: number;
// }
// interface WebSocketMessage {
//   type: string;
//   payload?: any;
//   message?: any;
//   code?: string;
//   language?: string;
//   data?: any;
//   signal?: SimplePeer.SignalData;
//   callerId?: string;
//   id?: string;
//   userId?: string;
//   users?: { id: string }[];
//   senderId?: string;
// }

// // --- VISUAL COMPONENTS ---

// const Starfield = () => {
//   return (
//     <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#02040a] to-[#02040a]" />
//       <div className="absolute inset-0 opacity-30" style={{ 
//         backgroundImage: 'radial-gradient(white 1px, transparent 1px)', 
//         backgroundSize: '40px 40px' 
//       }} />
//     </div>
//   );
// };

// const HolographicPanel = ({ children, className, glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) => (
//   <div className={cn(
//     "relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 overflow-hidden",
//     glow && "shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] border-violet-500/30",
//     className
//   )}>
//     {/* Scanline Effect */}
//     <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none" />
//     <div className="relative z-10 h-full">{children}</div>
//   </div>
// );

// const VideoFrame = ({ stream, label, muted, isLocal = false }: { stream: MediaStream | null, label: string, muted?: boolean, isLocal?: boolean }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);

//   useEffect(() => {
//     if (videoRef.current && stream) {
//       videoRef.current.srcObject = stream;
//     }
//   }, [stream]);

//   return (
//     <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg group">
//       {stream ? (
//         <video 
//           ref={videoRef} 
//           autoPlay 
//           playsInline 
//           muted={isLocal || muted} 
//           className={cn("w-full h-full object-cover", isLocal && "scale-x-[-1]")} 
//         />
//       ) : (
//         <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
//            <div className="flex flex-col items-center gap-2">
//              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
//              <span className="text-xs text-zinc-500 font-mono">SIGNAL LOST</span>
//            </div>
//         </div>
//       )}
      
//       {/* HUD Overlays */}
//       <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/5">
//         <div className={cn("w-1.5 h-1.5 rounded-full", stream ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
//         <span className="text-[10px] font-bold text-white tracking-wider uppercase">{label}</span>
//       </div>
      
//       {muted && (
//          <div className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full">
//             <MicOff className="w-3 h-3 text-white" />
//          </div>
//       )}
//     </div>
//   );
// };

// export default function InterviewRoomPage() {
//   // --- STATE ---
//   const params = useParams();
//   const router = useRouter();
//   const { toast } = useToast();
//   const { user, token, isLoading: isAuthLoading } = useAuth();
  
//   const interviewId = typeof params.id === 'string' ? params.id : '';
  
//   // Logic State
//   const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
//   const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
  
//   // Media State
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [mediaError, setMediaError] = useState<string | null>(null);
  
//   // Layout State
//   const [activeTab, setActiveTab] = useState<'chat' | 'whiteboard'>('chat');
//   const [showSidebar, setShowSidebar] = useState(true);
  
//   // Content State
//   const [code, setCode] = useState('// Initializing uplink...\n');
//   const [language, setLanguage] = useState('javascript');
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [newMessage, setNewMessage] = useState('');

//   // Refs
//   const wsRef = useRef<WebSocket | null>(null);
//   const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
//      ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#FFFFFF', lineWidth: 2,
//   }).current;
  
//   // --- RESOURCES & CLEANUP ---
  
//   const cleanupResources = useCallback(() => {
//     console.log('Terminating session resources...');
//     localStreamRef.current?.getTracks().forEach(track => track.stop());
//     Object.values(peersRef.current).forEach(peer => {
//         try { peer.destroy(); } catch (e) {}
//     });
//     peersRef.current = {};
//     if (wsRef.current) wsRef.current.close();
//     wsRef.current = null;
//     localStreamRef.current = null;
//   }, []);

//   // --- INITIALIZATION ---

//   useEffect(() => {
//     if (isAuthLoading) return;
//     if (!token || !interviewId) {
//         router.push('/dashboard');
//         return;
//     }

//     const init = async () => {
//         try {
//             // 1. Fetch Details
//             const res = await fetch(`${API_URL}/interviews/${interviewId}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.error || 'Failed to load mission data');
//             setInterviewDetails(data);
//             setCode(`// Topic: ${data.topic}\n// Start collaborating below\n\nfunction solution() {\n  return true;\n}`);

//             // 2. Setup Media
//             try {
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 localStreamRef.current = stream;
//             } catch (err) {
//                 console.error("Media access failed", err);
//                 setMediaError("Camera/Mic inaccessible");
//             }

//             // 3. Setup WebSocket
//             const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user?.id}&token=${token}`;
//             const ws = new WebSocket(wsUrl);
//             wsRef.current = ws;

//             ws.onopen = () => {
//                 setConnectionStatus('connected');
//                 toast({ title: "System Online", description: "Uplink established successfully.", variant: "default" });
//             };
            
//             ws.onmessage = (event) => handleWebSocketMessage(JSON.parse(event.data));
//             ws.onerror = () => setConnectionStatus('error');
//             ws.onclose = () => setConnectionStatus('disconnected');

//         } catch (error) {
//             console.error(error);
//             toast({ title: "Initialization Error", description: "Failed to initialize session.", variant: "destructive" });
//         }
//     };

//     init();

//     return () => cleanupResources();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [interviewId, token, isAuthLoading]);

//   // --- WEBSOCKET HANDLER ---

//   const handleWebSocketMessage = (data: WebSocketMessage) => {
//     switch (data.type) {
//         case 'all-users':
//             data.users?.forEach(u => {
//                 if (u.id !== user?.id && !peersRef.current[u.id] && localStreamRef.current) {
//                     const peer = createPeer(u.id, user!.id, localStreamRef.current);
//                     peersRef.current[u.id] = peer;
//                     identifyParticipant(u.id);
//                 }
//             });
//             break;
//         case 'user-joined':
//             if (data.callerId && data.signal && localStreamRef.current) {
//                 const peer = addPeer(data.signal, data.callerId, localStreamRef.current);
//                 peersRef.current[data.callerId] = peer;
//                 identifyParticipant(data.callerId);
//             }
//             break;
//         case 'receiving-returned-signal':
//             if (data.id && data.signal && peersRef.current[data.id]) {
//                 peersRef.current[data.id].signal(data.signal);
//             }
//             break;
//         case 'chat-message':
//             if (data.message) setChatMessages(prev => [...prev, data.message]);
//             break;
//         case 'code-update':
//             if (data.code !== undefined && data.senderId !== user?.id) setCode(data.code);
//             if (data.language) setLanguage(data.language);
//             break;
//         case 'whiteboard-update':
//              if (data.senderId !== user?.id) handleDraw(data.data);
//              break;
//     }
//   };

//   // --- WEBRTC HELPERS ---

//   const createPeer = (target: string, caller: string, stream: MediaStream) => {
//     const peer = new SimplePeer({ initiator: true, trickle: false, stream });
//     peer.on('signal', signal => sendWS({ type: 'sending-signal', userToSignal: target, callerId: caller, signal }));
//     return peer;
//   };

//   const addPeer = (signal: any, caller: string, stream: MediaStream) => {
//     const peer = new SimplePeer({ initiator: false, trickle: false, stream });
//     peer.on('signal', sig => sendWS({ type: 'returning-signal', signal: sig, callerId: caller }));
//     peer.signal(signal);
//     return peer;
//   };

//   const identifyParticipant = (id: string) => {
//       if (!interviewDetails) return;
//       const part = id === interviewDetails.interviewer.id ? interviewDetails.interviewer : interviewDetails.interviewee;
//       if (part.id !== user?.id) setOtherParticipant(part);
//   };

//   const sendWS = (msg: any) => {
//       if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
//   };

//   // --- INTERACTION HANDLERS ---

//   const handleSendMessage = () => {
//       if (!newMessage.trim() || !user) return;
//       const msg = { senderId: user.id, senderName: user.name, text: newMessage, timestamp: Date.now() };
//       sendWS({ type: 'chat-message', message: msg });
//       setChatMessages(prev => [...prev, msg]);
//       setNewMessage('');
//   };

//   const handleCodeChange = (value: string | undefined) => {
//       if (value !== undefined) {
//           setCode(value);
//           sendWS({ type: 'code-update', code: value, language, senderId: user?.id });
//       }
//   };

//   // --- WHITEBOARD LOGIC ---
//   const handleDraw = (data: any) => {
//       const ctx = canvasRef.current?.getContext('2d');
//       if (!ctx) return;
//       if (data.type === 'clear') {
//           ctx.clearRect(0, 0, 1000, 1000);
//           return;
//       }
//       ctx.beginPath();
//       ctx.moveTo(data.x0, data.y0);
//       ctx.lineTo(data.x1, data.y1);
//       ctx.strokeStyle = data.color;
//       ctx.lineWidth = 2;
//       ctx.stroke();
//   };

//   // Basic draw capture (can be enhanced)
//   const startDraw = (e: any) => {
//       if(!drawingContext.ctx) drawingContext.ctx = canvasRef.current?.getContext('2d') || null;
//       drawingContext.isDrawing = true;
//       const rect = canvasRef.current!.getBoundingClientRect();
//       drawingContext.lastX = e.clientX - rect.left;
//       drawingContext.lastY = e.clientY - rect.top;
//   };

//   const doDraw = (e: any) => {
//       if (!drawingContext.isDrawing || !drawingContext.ctx) return;
//       const rect = canvasRef.current!.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;
      
//       drawingContext.ctx.beginPath();
//       drawingContext.ctx.moveTo(drawingContext.lastX, drawingContext.lastY);
//       drawingContext.ctx.lineTo(x, y);
//       drawingContext.ctx.strokeStyle = '#FFFFFF';
//       drawingContext.ctx.lineWidth = 2;
//       drawingContext.ctx.stroke();

//       sendWS({ 
//           type: 'whiteboard-update', 
//           data: { x0: drawingContext.lastX, y0: drawingContext.lastY, x1: x, y1: y, color: '#FFFFFF' },
//           senderId: user?.id 
//       });

//       drawingContext.lastX = x;
//       drawingContext.lastY = y;
//   };

//   if (!interviewDetails) return (
//       <div className="h-screen bg-[#02040a] flex items-center justify-center text-white font-mono">
//           <div className="flex flex-col items-center gap-4">
//               <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
//               <p className="animate-pulse">INITIALIZING SECURE UPLINK...</p>
//           </div>
//       </div>
//   );

//   return (
//     <div className="h-screen bg-[#02040a] text-white font-sans overflow-hidden flex flex-col">
//         <Starfield />
        
//         {/* --- TOP BAR --- */}
//         <header className="h-14 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-between px-4 z-50">
//             <div className="flex items-center gap-4">
//                 <div className="flex items-center gap-2 text-violet-400 font-bold tracking-tight">
//                     <Terminal className="w-5 h-5" />
//                     <span>MOCKORBIT</span>
//                     <span className="text-white/20">/</span>
//                     <span className="text-white">{interviewDetails.topic}</span>
//                 </div>
//                 <Badge variant="outline" className={cn(
//                     "font-mono text-[10px] tracking-widest",
//                     connectionStatus === 'connected' ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" : "border-red-500/50 text-red-400"
//                 )}>
//                     {connectionStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
//                 </Badge>
//             </div>

//             <div className="flex items-center gap-3">
//                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
//                     <Clock className="w-4 h-4 text-gray-400" />
//                     <span className="text-xs font-mono text-gray-300">00:42:15</span>
//                 </div>
//                 <Button variant="destructive" size="sm" onClick={() => router.push('/dashboard')} className="h-8 text-xs font-bold bg-red-600 hover:bg-red-700">
//                     <PhoneOff className="w-3 h-3 mr-2" /> ABORT MISSION
//                 </Button>
//             </div>
//         </header>

//         {/* --- MAIN WORKSPACE --- */}
//         <div className="flex-1 flex overflow-hidden">
            
//             {/* LEFT: VIDEO FEED */}
//             <div className="w-64 border-r border-white/10 bg-[#050505] flex flex-col p-3 gap-3 z-40 hidden md:flex">
//                 <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative">
//                     <VideoFrame stream={null} label={otherParticipant?.name || "Peer"} /> {/* Remote Stream Here */}
//                 </div>
//                 <div className="h-40 rounded-xl overflow-hidden border border-white/10 relative">
//                     <VideoFrame stream={localStreamRef.current} label="You" isLocal />
//                 </div>
//                 <div className="flex justify-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
//                     <Button size="icon" variant={isMicMuted ? "destructive" : "ghost"} onClick={() => setIsMicMuted(!isMicMuted)} className="h-8 w-8 rounded-full">
//                         {isMicMuted ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
//                     </Button>
//                     <Button size="icon" variant={isVideoOff ? "destructive" : "ghost"} onClick={() => setIsVideoOff(!isVideoOff)} className="h-8 w-8 rounded-full">
//                         {isVideoOff ? <VideoOff className="w-4 h-4"/> : <Video className="w-4 h-4"/>}
//                     </Button>
//                     <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
//                         <Settings2 className="w-4 h-4"/>
//                     </Button>
//                 </div>
//             </div>

//             {/* CENTER: EDITOR */}
//             <div className="flex-1 flex flex-col relative bg-[#1e1e1e]">
//                 <div className="h-10 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between px-4">
//                     <div className="flex gap-2">
//                         <Badge variant="secondary" className="rounded-none bg-[#1e1e1e] text-violet-400 border-t-2 border-t-violet-500 h-10 px-4">main.js</Badge>
//                     </div>
//                     <select 
//                         value={language} 
//                         onChange={(e) => setLanguage(e.target.value)}
//                         className="bg-transparent text-xs text-gray-400 border-none outline-none cursor-pointer hover:text-white"
//                     >
//                         {SUPPORTED_LANGUAGES.map(l => <option key={l.value} value={l.value} className="bg-black">{l.label}</option>)}
//                     </select>
//                 </div>
//                 <div className="flex-1 relative">
//                     <Editor
//                         height="100%"
//                         language={language}
//                         value={code}
//                         theme="vs-dark"
//                         onChange={handleCodeChange}
//                         options={{
//                             minimap: { enabled: false },
//                             fontSize: 14,
//                             fontFamily: 'JetBrains Mono, monospace',
//                             scrollBeyondLastLine: false,
//                             automaticLayout: true,
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* RIGHT: TOOLS PANEL */}
//             {showSidebar && (
//                 <div className="w-80 border-l border-white/10 bg-[#0A0A0A] flex flex-col z-40">
//                     {/* Tabs */}
//                     <div className="flex border-b border-white/10">
//                         <button 
//                             onClick={() => setActiveTab('chat')} 
//                             className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === 'chat' ? "text-violet-400 border-b-2 border-violet-500 bg-white/5" : "text-gray-500 hover:text-gray-300")}
//                         >
//                             Comms
//                         </button>
//                         <button 
//                             onClick={() => setActiveTab('whiteboard')} 
//                             className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === 'whiteboard' ? "text-emerald-400 border-b-2 border-emerald-500 bg-white/5" : "text-gray-500 hover:text-gray-300")}
//                         >
//                             Board
//                         </button>
//                     </div>

//                     <div className="flex-1 overflow-hidden relative">
//                         {activeTab === 'chat' ? (
//                             <div className="h-full flex flex-col">
//                                 <ScrollArea className="flex-1 p-4">
//                                     <div className="space-y-4">
//                                         {chatMessages.map((msg, i) => (
//                                             <div key={i} className={cn("flex flex-col max-w-[85%]", msg.senderId === user?.id ? "ml-auto items-end" : "items-start")}>
//                                                 <div className={cn(
//                                                     "px-3 py-2 rounded-lg text-sm",
//                                                     msg.senderId === user?.id ? "bg-violet-600 text-white rounded-tr-none" : "bg-white/10 text-gray-200 rounded-tl-none"
//                                                 )}>
//                                                     {msg.text}
//                                                 </div>
//                                                 <span className="text-[10px] text-gray-600 mt-1">{msg.senderName}</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </ScrollArea>
//                                 <div className="p-3 border-t border-white/10 bg-[#050505]">
//                                     <div className="relative">
//                                         <Input 
//                                             value={newMessage}
//                                             onChange={(e) => setNewMessage(e.target.value)}
//                                             onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                                             placeholder="Transmit message..." 
//                                             className="bg-[#111] border-white/10 text-sm pr-10 focus-visible:ring-violet-500/50"
//                                         />
//                                         <button onClick={handleSendMessage} className="absolute right-2 top-1/2 -translate-y-1/2 text-violet-400 hover:text-white transition-colors">
//                                             <Send className="w-4 h-4" />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="h-full relative bg-[#111]">
//                                 <canvas 
//                                     ref={canvasRef}
//                                     onMouseDown={startDraw}
//                                     onMouseMove={doDraw}
//                                     onMouseUp={() => drawingContext.isDrawing = false}
//                                     onMouseLeave={() => drawingContext.isDrawing = false}
//                                     width={320}
//                                     height={800}
//                                     className="cursor-crosshair w-full h-full"
//                                 />
//                                 <div className="absolute top-2 right-2 flex gap-2">
//                                     <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-black/50" onClick={() => handleDraw({type: 'clear'})}>
//                                         <X className="w-4 h-4" />
//                                     </Button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     </div>
//   );
// }


// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import AppLayout from "@/components/shared/AppLayout"; // Assuming this component provides overall page structure
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming these are custom UI components
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Input } from "@/components/ui/input";
// // Textarea is removed as Monaco Editor will be used
// import { Mic, MicOff, Video, VideoOff, MessagesSquare, Code, Hand, Send, Maximize, Minimize, User, WifiOff, Loader2, AlertCircle, CameraOff, Settings2 } from 'lucide-react';
// import { useAuth } from '@/providers/AuthProvider'; // Assuming custom auth provider
// import { Skeleton } from '@/components/ui/skeleton'; // Assuming custom skeleton component
// import SimplePeer from 'simple-peer';
// import { useToast } from '@/hooks/use-toast'; // Assuming custom toast hook
// import Link from 'next/link';
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming custom alert component

// // Monaco Editor
// import Editor, { Monaco } from '@monaco-editor/react';

// // --- Interfaces ---
// interface Participant {
//     id: string;
//     name: string;
// }

// interface InterviewDetails {
//     id: string;
//     topic: string;
//     interviewer: Participant;
//     interviewee: Participant;
//     status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
// }

// interface ChatMessage {
//     senderId: string;
//     senderName: string;
//     text: string;
//     timestamp: number;
//     interviewId?: string;
// }

// interface CodeUpdateMessage {
//     interviewId?: string;
//     code: string;
//     language: string; // Added language to code updates
//     senderId: string;
// }

// interface WhiteboardUpdateMessage {
//     interviewId?: string;
//     type: string;
//     data: any;
//     senderId: string;
// }

// interface WebSocketMessage {
//     type: string;
//     payload?: any;
//     message?: any;
//     code?: string;
//     language?: string; // Added language
//     data?: any;
//     signal?: SimplePeer.SignalData;
//     callerId?: string;
//     id?: string;
//     userId?: string;
//     users?: { id: string }[];
//     senderId?: string;
// }

// // --- Constants ---
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
// const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
// const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
// const WEBSOCKET_PATH = '/ws';

// const SUPPORTED_LANGUAGES = [
//     { value: 'javascript', label: 'JavaScript' },
//     { value: 'python', label: 'Python' },
//     { value: 'java', label: 'Java' },
//     { value: 'csharp', label: 'C#' },
//     { value: 'cpp', label: 'C++' },
//     { value: 'html', label: 'HTML' },
//     { value: 'css', label: 'CSS' },
//     { value: 'typescript', label: 'TypeScript' },
//     { value: 'markdown', label: 'Markdown' },
//     { value: 'json', label: 'JSON' },
// ];

// export default function InterviewRoomPage() {
//     const params = useParams();
//     const { id: interviewIdParam } = params;
//     const interviewId = typeof interviewIdParam === 'string' ? interviewIdParam : '';
//     const { user, token, isLoading: isAuthLoading } = useAuth();
//     const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isMicMuted, setIsMicMuted] = useState(false);
//     const [isVideoOff, setIsVideoOff] = useState(false);
//     const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//     const [newMessage, setNewMessage] = useState('');
    
//     // Code Editor State
//     const [code, setCode] = useState('// Welcome to the collaborative code editor!\n// Select your language and start coding.\nfunction greet() {\n  console.log("Hello, Interviewer!");\n}');
//     const [selectedLanguage, setSelectedLanguage] = useState('javascript');
//     const monacoEditorRef = useRef<any>(null); // For Monaco editor instance

//     const [isFullScreen, setIsFullScreen] = useState(false);
//     const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
//     const [connectionErrorMsg, setConnectionErrorMsg] = useState<string | null>(null);
//     const [isEndingInterview, setIsEndingInterview] = useState(false);
//     const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
//     const [mediaError, setMediaError] = useState<string | null>(null);

//     const wsRef = useRef<WebSocket | null>(null);
//     const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
//     const localVideoRef = useRef<HTMLVideoElement>(null);
//     const remoteVideoRef = useRef<HTMLVideoElement>(null);
//     const localStreamRef = useRef<MediaStream | null>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
//         ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#0E2A47', lineWidth: 2,
//     }).current;

//     const { toast } = useToast();
//     const router = useRouter();

//     // Debounce function
//     const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
//         let timeout: ReturnType<typeof setTimeout> | null = null;
//         return (...args: Parameters<F>): Promise<ReturnType<F>> =>
//             new Promise(resolve => {
//                 if (timeout) {
//                     clearTimeout(timeout);
//                 }
//                 timeout = setTimeout(() => resolve(func(...args)), waitFor);
//             });
//     };


//     const cleanupResources = useCallback(() => {
//         console.log('Cleaning up interview room resources...');
//         localStreamRef.current?.getTracks().forEach(track => track.stop());
//         Object.values(peersRef.current).forEach(peer => {
//             try { peer.destroy(); } catch (e) { console.warn("Error destroying peer:", e); }
//         });
//         peersRef.current = {};
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             console.log("Closing WebSocket connection.");
//             wsRef.current.close();
//         }
//         wsRef.current = null;
//         localStreamRef.current = null;
//         if (localVideoRef.current) localVideoRef.current.srcObject = null;
//         if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//         setOtherParticipant(null);
//         setConnectionStatus('disconnected');
//     }, []);

//     const sendMessage = useCallback((message: object) => {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             try {
//                 wsRef.current.send(JSON.stringify(message));
//             } catch (error) {
//                 console.error("Failed to send WebSocket message:", error);
//                 toast({ title: "Send Error", description: "Could not send message.", variant: "destructive" });
//             }
//         } else {
//             console.warn("Cannot send message, WebSocket not connected or ready.");
//             // toast({ title: "Not Connected", description: "Cannot send message, connection not established.", variant: "destructive" });
//         }
//     }, [toast]);

//     // Fetch Interview Details
//     useEffect(() => {
//         const fetchDetails = async () => {
//             if (!interviewId || !token) {
//                 setIsLoading(false);
//                 // toast({ title: "Error", description: "Missing interview ID or authentication.", variant: "destructive" });
//                 // router.push(`/dashboard/${user?.role || 'interviewee'}`);
//                 return;
//             }
//             setIsLoading(true);
//             try {
//                 const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const data = await response.json();
//                 if (!response.ok) {
//                     if (response.status === 404) throw new Error('Interview not found.');
//                     if (response.status === 403) throw new Error('You do not have permission to access this interview.');
//                     throw new Error(data.error || `Failed to load interview details (Status: ${response.status})`);
//                 }
//                 if (!data.id || !data.interviewer || !data.interviewee) {
//                     throw new Error('Incomplete interview details received from server.');
//                 }
//                 setInterviewDetails(data);
//                 if (user) {
//                     const other = user.id === data.interviewee.id ? data.interviewer : data.interviewee;
//                     if (other && other.id !== user.id) {
//                         setOtherParticipant(other);
//                     } else if (other && other.id === user.id) {
//                         console.warn("Interview data shows interviewer and interviewee as the same user.");
//                         setOtherParticipant(null);
//                     } else {
//                         setOtherParticipant(null);
//                     }
//                 }
//             } catch (error: any) {
//                 console.error("Error fetching interview details:", error);
//                 toast({ title: "Error Loading Interview", description: error.message || "Could not load interview details.", variant: "destructive" });
//                 setInterviewDetails(null);
//                 router.push(`/dashboard/${user?.role || 'interviewee'}`);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         if (!isAuthLoading && interviewId && token) {
//             fetchDetails();
//         } else if (!isAuthLoading && (!interviewId || !token)) {
//             setIsLoading(false);
//             if (!interviewId) router.push(`/dashboard/${user?.role || 'interviewee'}`);
//         }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [interviewId, token, isAuthLoading, user?.id, user?.role, router, toast]); // Added router and toast

//     // Initialize Media and WebSocket Connection
//     useEffect(() => {
//         if (isAuthLoading || isLoading || !interviewDetails || !user || !token || !interviewId || wsRef.current) {
//             return;
//         }
//         let isMounted = true;

//         const initializeMediaAndWebSocket = async () => {
//             setConnectionStatus('connecting');
//             setConnectionErrorMsg(null);
//             setMediaError(null);

//             try {
//                 console.log("Attempting to get user media (video & audio)...");
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 console.log("User media stream acquired.");
//                 if (!isMounted) {
//                     stream.getTracks().forEach(track => track.stop());
//                     return;
//                 }
//                 localStreamRef.current = stream;
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }
//                 stream.getAudioTracks().forEach(t => t.enabled = !isMicMuted);
//                 stream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
//             } catch (err: any) {
//                 console.error("Error accessing media devices:", err.name, err.message);
//                 let userMessage = "Could not access camera or microphone.";
//                 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') userMessage = "Camera/Microphone permissions denied. Please allow access in browser settings and refresh.";
//                 else if (err.name === 'NotFoundError') userMessage = "No camera or microphone found. Please ensure they are connected and enabled.";
//                 else if (err.name === 'NotReadableError') userMessage = "Camera or microphone is already in use or cannot be accessed due to a hardware/OS issue.";
//                 else if (err.name === 'OverconstrainedError') userMessage = "No camera/mic supports the requested settings.";
//                 else userMessage = `An unexpected error occurred while accessing media devices: ${err.name}`;
//                 toast({ title: "Media Error", description: userMessage, variant: "destructive" });
//                 setMediaError(userMessage);
//             }

//             const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user.id}&token=${token}`;
//             console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);
//             const ws = new WebSocket(wsUrl);
//             wsRef.current = ws;

//             ws.onopen = () => {
//                 if (!isMounted) return;
//                 console.log('WebSocket connection established.');
//                 setConnectionStatus('connected');
//                 setConnectionErrorMsg(null);
//             };
//             ws.onerror = (event) => {
//                 if (!isMounted) return;
//                 console.error('WebSocket error:', event);
//                 const errorMsg = `Failed to connect to real-time server. Check server status and connection details.`;
//                 setConnectionStatus('error');
//                 setConnectionErrorMsg(errorMsg);
//                 toast({ title: "Connection Error", description: errorMsg, variant: "destructive" });
//             };
//             ws.onclose = (event) => {
//                 if (!isMounted) return;
//                 console.log(`WebSocket disconnected: Code=${event.code}, Reason=${event.reason}`);
//                 setConnectionStatus('disconnected');
//                 const errorMsg = `Connection closed (${event.code}). ${event.reason || 'Attempting to reconnect may be needed.'}`;
//                 setConnectionErrorMsg(errorMsg);
//                 if (event.code !== 1000 && event.code !== 1001) {
//                     toast({ title: "Disconnected", description: errorMsg, variant: "default" });
//                 }
//                 Object.values(peersRef.current).forEach(peer => {
//                     try { peer.destroy(); } catch (e) { console.warn("Error destroying peer on disconnect:", e); }
//                 });
//                 peersRef.current = {};
//                 if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                 setOtherParticipant(null);
//                 wsRef.current = null;
//             };
//             ws.onmessage = (event) => {
//                 if (!isMounted || !user) return;
//                 try {
//                     const data: WebSocketMessage = JSON.parse(event.data as string);
//                     console.log("WebSocket message received:", data);

//                     switch (data.type) {
//                         case 'all-users':
//                             if (!localStreamRef.current) return;
//                             data.users?.forEach(peerInfo => {
//                                 if (peerInfo.id === user.id) return;
//                                 if (!peersRef.current[peerInfo.id]) {
//                                     const peer = createPeer(peerInfo.id, user.id, localStreamRef.current!);
//                                     peersRef.current[peerInfo.id] = peer;
//                                     updateOtherParticipantInfo(peerInfo.id);
//                                 }
//                             });
//                             break;
//                         case 'user-joined':
//                             if (!localStreamRef.current || data.callerId === user.id || !data.callerId || !data.signal) return;
//                             if (peersRef.current[data.callerId]) {
//                                 peersRef.current[data.callerId].signal(data.signal);
//                             } else {
//                                 const peer = addPeer(data.signal, data.callerId, localStreamRef.current!);
//                                 peersRef.current[data.callerId] = peer;
//                                 updateOtherParticipantInfo(data.callerId);
//                             }
//                             break;
//                         case 'receiving-returned-signal':
//                             if (!data.id || !data.signal || !peersRef.current[data.id]) return;
//                             peersRef.current[data.id].signal(data.signal);
//                             break;
//                         case 'user-disconnected':
//                             if (!data.userId) return;
//                             const disconnectedUserId = data.userId;
//                             if (peersRef.current[disconnectedUserId]) {
//                                 try { peersRef.current[disconnectedUserId].destroy(); } catch (e) { console.warn("Error destroying peer on user-disconnect:", e); }
//                                 delete peersRef.current[disconnectedUserId];
//                                 if (otherParticipant?.id === disconnectedUserId) {
//                                     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                                     setOtherParticipant(null);
//                                     toast({ title: "Participant Left", description: "The other participant has left the interview.", variant: "default" });
//                                 }
//                             }
//                             break;
//                         case 'chat-message':
//                             if (data.message) {
//                                 setChatMessages((prev) => [...prev, data.message as ChatMessage]);
//                             }
//                             break;
//                         case 'code-update':
//                             if (data.senderId !== user?.id && data.code !== undefined) {
//                                 setCode(data.code);
//                                 if (data.language) { // Update language if received
//                                     setSelectedLanguage(data.language);
//                                 }
//                             }
//                             break;
//                         case 'whiteboard-update':
//                             if (data.senderId !== user?.id && canvasRef.current && data.data) {
//                                 handleRemoteWhiteboardUpdate(data.type, data.data);
//                             }
//                             break;
//                         case 'interview-ended':
//                             toast({ title: "Interview Ended", description: "The interview has been concluded by the host.", variant: "destructive" });
//                             cleanupResources();
//                             setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 2000);
//                             break;
//                         case 'error':
//                             const errorMsg = data.message || "An error occurred on the server.";
//                             console.error("Received server error message:", errorMsg);
//                             toast({ title: "Server Error", description: errorMsg, variant: "destructive" });
//                             break;
//                         default:
//                             console.warn("Received unknown WebSocket message type:", data.type);
//                     }
//                 } catch (error) {
//                     console.error('Error parsing WebSocket message or handling event:', error);
//                 }
//             };
//         };

//         initializeMediaAndWebSocket();

//         return () => {
//             isMounted = false;
//             console.log("Component unmounting, performing cleanup...");
//             cleanupResources();
//         };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isAuthLoading, isLoading, interviewDetails, user, token, interviewId, sendMessage, cleanupResources, toast, router]); // Added dependencies

//     const updateOtherParticipantInfo = (peerId: string) => {
//         if (!otherParticipant && interviewDetails) {
//             const foundParticipant = peerId === interviewDetails.interviewer.id
//                 ? interviewDetails.interviewer
//                 : peerId === interviewDetails.interviewee.id
//                     ? interviewDetails.interviewee
//                     : null;
//             if (foundParticipant && foundParticipant.id !== user?.id) {
//                 setOtherParticipant(foundParticipant);
//             }
//         }
//     };

//     const createPeer = (userToSignal: string, callerId: string, stream: MediaStream): SimplePeer.Instance => {
//         const peer = new SimplePeer({ initiator: true, trickle: false, stream: stream });
//         peer.on('signal', signal => {
//             sendMessage({ type: 'sending-signal', userToSignal, callerId, signal });
//         });
//         setupPeerEvents(peer, userToSignal);
//         return peer;
//     };

//     const addPeer = (incomingSignal: SimplePeer.SignalData, callerId: string, stream: MediaStream): SimplePeer.Instance => {
//         const peer = new SimplePeer({ initiator: false, trickle: false, stream: stream });
//         peer.on('signal', signal => {
//             sendMessage({ type: 'returning-signal', signal, callerId });
//         });
//         setupPeerEvents(peer, callerId);
//         try {
//             peer.signal(incomingSignal);
//         } catch (error) {
//             console.error(`Error signaling peer ${callerId}:`, error);
//             try { peer.destroy(); } catch(e) { /* ignore */ }
//             delete peersRef.current[callerId];
//         }
//         return peer;
//     };

//     const setupPeerEvents = (peer: SimplePeer.Instance, peerId: string) => {
//         peer.on('stream', remoteStream => {
//             if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
//                 remoteVideoRef.current.srcObject = remoteStream;
//                 updateOtherParticipantInfo(peerId);
//             } else if (remoteVideoRef.current?.srcObject) {
//                 console.warn("Remote video element already has a stream. Ignoring new stream from", peerId);
//             }
//         });
//         peer.on('error', (err) => {
//             console.error(`Peer error with ${peerId}:`, err);
//             toast({ title: "Connection Error", description: `A WebRTC connection error occurred with ${otherParticipant?.name || peerId}.`, variant: "destructive" });
//             if (peersRef.current[peerId]) {
//                 try { peersRef.current[peerId].destroy(); } catch(e) { /* ignore */ }
//                 delete peersRef.current[peerId];
//             }
//             if (otherParticipant?.id === peerId) {
//                 if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                 setOtherParticipant(null);
//             }
//         });
//         peer.on('close', () => {
//             console.log(`Peer connection closed with ${peerId}`);
//             if (peersRef.current[peerId]) {
//                 delete peersRef.current[peerId];
//             }
//             if (otherParticipant?.id === peerId) {
//                 if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                 setOtherParticipant(null);
//             }
//         });
//     };

//     const toggleMic = () => {
//         if (!localStreamRef.current) return;
//         const enabled = isMicMuted;
//         localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = enabled; });
//         setIsMicMuted(!enabled);
//     };

//     const toggleVideo = () => {
//         if (!localStreamRef.current || mediaError) return;
//         const enabled = isVideoOff;
//         localStreamRef.current.getVideoTracks().forEach(track => { track.enabled = enabled; });
//         setIsVideoOff(!enabled);
//     };

//     const handleSendMessage = () => {
//         if (newMessage.trim() && user && connectionStatus === 'connected') {
//             const messageData: ChatMessage = {
//                 senderId: user.id,
//                 senderName: user.name || "User",
//                 text: newMessage.trim(),
//                 timestamp: Date.now(),
//             };
//             sendMessage({ type: 'chat-message', message: messageData });
//             setChatMessages((prev) => [...prev, messageData]);
//             setNewMessage('');
//         } else if (connectionStatus !== 'connected') {
//             toast({ title: "Cannot Send", description: "Not connected to chat server.", variant: "destructive" });
//         }
//     };

//     // --- Code Editor ---
//     const debouncedSendCodeUpdate = useCallback(
//         debounce((newCode: string, lang: string) => {
//             sendMessage({ type: 'code-update', code: newCode, language: lang, senderId: user?.id });
//         }, 750), // Send update 750ms after user stops typing
//         [sendMessage, user?.id] // Dependencies for useCallback
//     );
    
//     const handleEditorChange = (value: string | undefined) => {
//         if (value !== undefined) {
//             setCode(value);
//             if (connectionStatus === 'connected' && user?.id) {
//                 debouncedSendCodeUpdate(value, selectedLanguage);
//             }
//         }
//     };

//     const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         const newLang = e.target.value;
//         setSelectedLanguage(newLang);
//         // Optionally send an immediate language update if needed, or it will be sent with the next code update
//         if (connectionStatus === 'connected' && user?.id) {
//              sendMessage({ type: 'code-update', code: code, language: newLang, senderId: user?.id });
//         }
//     };
    
//     function handleEditorDidMount(editor: any, monaco: Monaco) {
//         monacoEditorRef.current = editor;
//         // You can now access the editor instance (e.g., monacoEditorRef.current.focus()).
//         // Example: Define a custom theme or register completion providers
//         // monaco.editor.defineTheme('my-cool-theme', {
//         //     base: 'vs-dark',
//         //     inherit: true,
//         //     rules: [{ background: 'EDF2F7' }],
//         //     colors: {
//         //         'editor.foreground': '#000000'
//         //     }
//         // });
//         // monaco.editor.setTheme('my-cool-theme');
//         console.log("Monaco editor mounted:", editor);
//     }


//     // --- Whiteboard ---
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;
//         drawingContext.ctx = ctx;

//         const resizeCanvas = () => {
//             const container = canvas.parentElement;
//             if (container) {
//                 const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save current drawing
//                 canvas.width = container.clientWidth;
//                 canvas.height = Math.max(200, container.clientWidth * (9 / 16)); // Maintain aspect ratio or set fixed height

//                 // Restore drawing data (simple redraw, might need scaling for complex drawings)
//                 const tempCanvas = document.createElement('canvas');
//                 tempCanvas.width = imageData.width;
//                 tempCanvas.height = imageData.height;
//                 const tempCtx = tempCanvas.getContext('2d');
//                 if (tempCtx) {
//                     tempCtx.putImageData(imageData, 0, 0);
//                     ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
//                 }
                
//                 ctx.strokeStyle = drawingContext.color;
//                 ctx.lineWidth = drawingContext.lineWidth;
//                 ctx.lineCap = 'round';
//                 ctx.lineJoin = 'round';
//             }
//         };
//         resizeCanvas();
//         window.addEventListener('resize', resizeCanvas);

//         const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
//             const rect = canvas.getBoundingClientRect();
//             let clientX = 0, clientY = 0;
//             if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
//             else if (e instanceof TouchEvent && e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
//             else { return null; }
//             return { x: clientX - rect.left, y: clientY - rect.top };
//         };

//         const startDrawing = (e: MouseEvent | TouchEvent) => {
//             if (!drawingContext.ctx) return;
//             const coords = getCoords(e);
//             if (!coords) return;
//             e.preventDefault();
//             drawingContext.isDrawing = true;
//             const { x, y } = coords;
//             [drawingContext.lastX, drawingContext.lastY] = [x, y];
//             drawingContext.ctx.beginPath();
//             drawingContext.ctx.moveTo(x, y);
//             drawingContext.ctx.strokeStyle = drawingContext.color;
//             drawingContext.ctx.lineWidth = drawingContext.lineWidth;
//         };

//         const draw = (e: MouseEvent | TouchEvent) => {
//             if (!drawingContext.isDrawing || !drawingContext.ctx) return;
//             const coords = getCoords(e);
//             if (!coords) return;
//             e.preventDefault();
//             const { x, y } = coords;
//             drawingContext.ctx.lineTo(x, y);
//             drawingContext.ctx.stroke();
//             if (connectionStatus === 'connected') {
//                 sendMessage({
//                     type: 'whiteboard-update',
//                     data: { startX: drawingContext.lastX, startY: drawingContext.lastY, endX: x, endY: y, color: drawingContext.color, lineWidth: drawingContext.lineWidth, type: 'draw' }, // Added type: 'draw'
//                     senderId: user?.id
//                 });
//             }
//             [drawingContext.lastX, drawingContext.lastY] = [x, y];
//         };

//         const stopDrawing = () => { if (drawingContext.isDrawing) drawingContext.isDrawing = false; };

//         canvas.addEventListener('mousedown', startDrawing);
//         canvas.addEventListener('mousemove', draw);
//         canvas.addEventListener('mouseup', stopDrawing);
//         canvas.addEventListener('mouseleave', stopDrawing);
//         canvas.addEventListener('touchstart', startDrawing, { passive: false });
//         canvas.addEventListener('touchmove', draw, { passive: false });
//         canvas.addEventListener('touchend', stopDrawing);
//         canvas.addEventListener('touchcancel', stopDrawing);

//         return () => {
//             window.removeEventListener('resize', resizeCanvas);
//             canvas.removeEventListener('mousedown', startDrawing);
//             canvas.removeEventListener('mousemove', draw);
//             // ... remove other listeners
//         };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [drawingContext.color, drawingContext.lineWidth, user?.id, connectionStatus, sendMessage]);

//     const handleRemoteWhiteboardUpdate = (type: string, data: any) => {
//         const canvas = canvasRef.current;
//         const ctx = canvas?.getContext('2d');
//         if (!ctx || !canvas) return;

//         // Check if data.type is 'draw' or if the main type is 'draw'
//         if ((data.type === 'draw' || type === 'draw') && data?.startX !== undefined) {
//             ctx.beginPath();
//             ctx.moveTo(data.startX, data.startY);
//             ctx.lineTo(data.endX, data.endY);
//             ctx.strokeStyle = data.color || '#0E2A47';
//             ctx.lineWidth = data.lineWidth || 2;
//             ctx.lineCap = 'round';
//             ctx.lineJoin = 'round';
//             ctx.stroke();
//         } else if (type === 'clear' || data.type === 'clear') { // Check both
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//         }
//     };

//     const clearWhiteboard = () => {
//         if (drawingContext.ctx && canvasRef.current) {
//             drawingContext.ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//             if (connectionStatus === 'connected') {
//                 sendMessage({ type: 'whiteboard-update', data: { type: 'clear'}, senderId: user?.id }); // Ensure type: 'clear' is sent
//             }
//         }
//     };

//     const toggleFullScreen = () => {
//         const elem = document.documentElement;
//         if (!document.fullscreenElement) {
//             elem.requestFullscreen().catch(err => {
//                 toast({ title: "Full Screen Error", description: "Could not enter full screen mode.", variant: "destructive" });
//             });
//         } else {
//             if (document.exitFullscreen) document.exitFullscreen();
//         }
//     };

//     useEffect(() => {
//         const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
//         document.addEventListener('fullscreenchange', handleFullScreenChange);
//         return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
//     }, []);

//     const handleEndInterview = () => {
//         setIsEndingInterview(true);
//         if (connectionStatus === 'connected') {
//             sendMessage({ type: 'end-interview' });
//         }
//         cleanupResources();
//         toast({ title: "Interview Ended", description: "You have left the interview room." });
//         setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 1500);
//     };

//     if (isAuthLoading || isLoading) {
//         return (
//             <AppLayout>
//                 <div className="flex items-center justify-center h-[calc(100vh-8rem)]"> {/* Adjusted height */}
//                     <div className="text-center space-y-4 p-6 bg-card rounded-lg shadow-xl">
//                         <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
//                         <p className="text-lg font-medium text-muted-foreground">Loading Interview Room...</p>
//                         <p className="text-sm text-muted-foreground/80">Please wait while we set things up.</p>
//                     </div>
//                 </div>
//             </AppLayout>
//         );
//     }

//     if (!interviewDetails) {
//         return (
//             <AppLayout>
//                 <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-6">
//                     <AlertCircle className="w-16 h-16 text-destructive mb-6" />
//                     <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Interview</h2>
//                     <p className="text-muted-foreground mb-8 max-w-md">
//                         We couldn't retrieve the details for this interview room, or you may not have permission to access it.
//                     </p>
//                     <Link href={`/dashboard/${user?.role || 'interviewee'}`}>
//                         <Button variant="outline" size="lg">Back to Dashboard</Button>
//                     </Link>
//                 </div>
//             </AppLayout>
//         );
//     }

//     return (
//         <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 overflow-hidden">
//             {connectionStatus !== 'connected' && (
//                 <Alert
//                     variant={connectionStatus === 'error' || connectionStatus === 'disconnected' ? "destructive" : "default"}
//                     className="rounded-none border-0 border-b bg-yellow-500/20 dark:bg-yellow-700/30 border-yellow-600 dark:border-yellow-500 text-yellow-800 dark:text-yellow-100 shadow-md"
//                 >
//                     <div className="flex items-center">
//                         {connectionStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin mr-3 text-yellow-600 dark:text-yellow-300" />}
//                         {(connectionStatus === 'error' || connectionStatus === 'disconnected') && <WifiOff className="h-5 w-5 mr-3 text-red-600 dark:text-red-400" />}
//                         <div className="flex-grow">
//                             <AlertTitle className="font-semibold">
//                                 {connectionStatus === 'connecting' && 'Connecting...'}
//                                 {connectionStatus === 'disconnected' && 'Disconnected'}
//                                 {connectionStatus === 'error' && 'Connection Error'}
//                             </AlertTitle>
//                             <AlertDescription className="text-sm">
//                                 {connectionStatus === 'connecting' && 'Attempting to connect to the real-time server.'}
//                                 {connectionStatus === 'disconnected' && (connectionErrorMsg || 'Connection closed.')}
//                                 {connectionStatus === 'error' && (connectionErrorMsg || 'Failed to establish connection.')}
//                             </AlertDescription>
//                         </div>
//                     </div>
//                 </Alert>
//             )}

//             {mediaError && connectionStatus !== 'error' && (
//                 <Alert variant="destructive" className="rounded-none border-0 border-b shadow-md">
//                      <div className="flex items-center">
//                         <CameraOff className="h-5 w-5 mr-3" />
//                         <div className="flex-grow">
//                             <AlertTitle className="font-semibold">Media Access Issue</AlertTitle>
//                             <AlertDescription className="text-sm">{mediaError} Video/Audio features will be limited.</AlertDescription>
//                         </div>
//                     </div>
//                 </Alert>
//             )}

//             <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50 shadow-lg shrink-0">
//                 <div className="flex items-center gap-3 overflow-hidden">
//                     <Code className="w-6 h-6 text-cyan-400 shrink-0" />
//                     <span className="font-semibold text-slate-200 truncate text-md sm:text-lg" title={interviewDetails.topic}>
//                         {interviewDetails.topic}
//                     </span>
//                 </div>
//                 <div className="flex items-center gap-2 sm:gap-3 shrink-0">
//                     <span className="text-xs sm:text-sm text-slate-400 hidden md:inline truncate max-w-[120px] lg:max-w-[200px]" title={otherParticipant?.name || 'Participant'}>
//                         {otherParticipant ? `With: ${otherParticipant.name}` : 'Waiting for participant...'}
//                     </span>
//                     <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="w-9 h-9 text-slate-300 hover:bg-slate-700 hover:text-cyan-400" title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
//                         {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
//                     </Button>
//                     <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={isEndingInterview} className="bg-red-600 hover:bg-red-700 text-white">
//                         {isEndingInterview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
//                         End Interview
//                     </Button>
//                 </div>
//             </header>

//             <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
//                 <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 overflow-y-auto"> {/* Adjusted span for potentially wider code editor */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
//                         <Card className="relative overflow-hidden aspect-video bg-slate-700/50 shadow-lg border border-slate-600 rounded-xl">
//                             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
//                             <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md shadow">
//                                 You ({user?.name || 'Me'})
//                             </div>
//                             {(isVideoOff || mediaError) && (
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 text-slate-300 p-2">
//                                     {mediaError ? <CameraOff className="w-10 h-10 mb-2 text-red-400" /> : <VideoOff className="w-10 h-10 text-slate-400" />}
//                                     {mediaError && <p className="text-xs mt-1 text-center">Camera unavailable</p>}
//                                     {!mediaError && isVideoOff && <p className="text-xs mt-1 text-center">Camera Off</p>}
//                                 </div>
//                             )}
//                         </Card>
//                         <Card className="relative overflow-hidden aspect-video bg-slate-700/50 shadow-lg border border-slate-600 rounded-xl">
//                             <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
//                             <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md shadow">
//                                 {otherParticipant?.name || 'Waiting...'}
//                             </div>
//                             {!otherParticipant && connectionStatus === 'connected' && (
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700/80 text-slate-400">
//                                     <User className="w-12 h-12 mb-2" />
//                                     <p className="text-sm">{`Waiting for ${interviewDetails.interviewer.id === user?.id ? interviewDetails.interviewee.name : interviewDetails.interviewer.name}`}</p>
//                                 </div>
//                             )}
//                             {connectionStatus !== 'connected' && !otherParticipant && (
//                                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700/80 text-slate-400">
//                                     {connectionStatus === 'connecting' ? <Loader2 className="w-12 h-12 mb-2 animate-spin" /> : <WifiOff className="w-12 h-12 mb-2" />}
//                                     <p className="text-sm">{connectionStatus === 'error' ? 'Connection Failed' : 'Connecting...'}</p>
//                                 </div>
//                             )}
//                         </Card>
//                     </div>

//                     <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl bg-slate-800 border border-slate-700 rounded-xl">
//                         <CardHeader className="p-3 border-b border-slate-700 flex-row items-center justify-between bg-slate-800/70 rounded-t-xl">
//                             <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><Code className="w-5 h-5 mr-2 text-cyan-400"/> Code Editor</CardTitle>
//                             <div className="flex items-center gap-2">
//                                 <Settings2 className="w-4 h-4 text-slate-400" />
//                                 <select
//                                     value={selectedLanguage}
//                                     onChange={handleLanguageChange}
//                                     className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
//                                     disabled={connectionStatus !== 'connected'}
//                                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='w-5 h-5 text-slate-400'%3E%3Cpath fill-rule='evenodd' d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}

//                                 >
//                                     {SUPPORTED_LANGUAGES.map(lang => (
//                                         <option key={lang.value} value={lang.value} className="bg-slate-700 text-slate-200">{lang.label}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </CardHeader>
//                         <CardContent className="p-0 flex-1 overflow-hidden relative bg-[#1e1e1e]"> {/* Monaco default dark theme background */}
//                             <Editor
//                                 height="100%"
//                                 language={selectedLanguage}
//                                 value={code}
//                                 theme="vs-dark" // Default dark theme for Monaco
//                                 onChange={handleEditorChange}
//                                 onMount={handleEditorDidMount}
//                                 options={{
//                                     automaticLayout: true,
//                                     selectOnLineNumbers: true,
//                                     roundedSelection: false,
//                                     readOnly: connectionStatus !== 'connected', // Make editor readonly if not connected
//                                     cursorStyle: 'line',
//                                     wordWrap: 'on',
//                                     minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
//                                     fontSize: 14,
//                                     fontFamily: "Menlo, Monaco, 'Courier New', monospace",
//                                     scrollbar: {
//                                         verticalScrollbarSize: 10,
//                                         horizontalScrollbarSize: 10,
//                                         arrowSize: 12
//                                     }
//                                 }}
//                             />
//                              {connectionStatus !== 'connected' && (
//                                 <div className="absolute inset-0 bg-slate-800/90 flex flex-col items-center justify-center z-10 text-slate-300">
//                                     <WifiOff className="w-12 h-12 mb-3 text-red-400"/>
//                                     <p className="text-lg font-medium">Editor Unavailable</p>
//                                     <p className="text-sm">Please connect to the server to enable editing.</p>
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </div>

//                 <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 overflow-y-auto">
//                     <Card className="flex-1 flex flex-col overflow-hidden shadow-xl bg-slate-800 border border-slate-700 rounded-xl min-h-[250px] md:min-h-[300px] lg:min-h-0">
//                         <CardHeader className="p-3 border-b border-slate-700 flex-row items-center justify-between bg-slate-800/70 rounded-t-xl">
//                             <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><Hand className="w-5 h-5 mr-2 text-cyan-400"/> Whiteboard</CardTitle>
//                             <Button variant="ghost" size="sm" onClick={clearWhiteboard} className="text-xs h-7 px-2 text-slate-300 hover:bg-slate-700 hover:text-cyan-400" disabled={connectionStatus !== 'connected'}>Clear</Button>
//                         </CardHeader>
//                         <CardContent className="p-0 flex-1 overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-b-xl relative">
//                             <canvas
//                                 ref={canvasRef}
//                                 className="absolute top-0 left-0 w-full h-full border-none rounded-b-xl touch-none cursor-crosshair bg-white" // Explicit white background for canvas
//                             ></canvas>
//                         </CardContent>
//                     </Card>

//                     <Card className="flex-1 flex flex-col overflow-hidden shadow-xl bg-slate-800 border border-slate-700 rounded-xl min-h-[300px] md:min-h-[350px] lg:min-h-0">
//                         <CardHeader className="p-3 border-b border-slate-700 rounded-t-xl bg-slate-800/70">
//                             <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><MessagesSquare className="w-5 h-5 mr-2 text-cyan-400"/> Chat</CardTitle>
//                         </CardHeader>
//                         <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
//                             <ScrollArea className="flex-1 p-3 space-y-3 bg-slate-800">
//                                 {chatMessages.map((msg, index) => (
//                                     <div key={index} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
//                                         <div className={`p-2.5 rounded-lg max-w-[85%] text-sm shadow-md break-words ${msg.senderId === user?.id ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
//                                             <p className="font-semibold mb-0.5 text-xs opacity-80">{msg.senderId === user?.id ? 'You' : msg.senderName || 'Peer'}</p>
//                                             <p className="leading-relaxed">{msg.text}</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {chatMessages.length === 0 && connectionStatus === 'connected' && <p className="text-sm text-slate-500 text-center py-4">No messages yet. Start the conversation!</p>}
//                                 {connectionStatus !== 'connected' && <p className="text-sm text-red-400 text-center py-4">Chat unavailable. Please connect.</p>}
//                             </ScrollArea>
//                             <div className="p-3 border-t border-slate-700 flex items-center gap-2 bg-slate-800/80 rounded-b-xl">
//                                 <Input
//                                     placeholder="Type your message..."
//                                     value={newMessage}
//                                     onChange={(e) => setNewMessage(e.target.value)}
//                                     onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
//                                     className="flex-1 h-9 text-sm bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
//                                     maxLength={500}
//                                     disabled={connectionStatus !== 'connected'}
//                                 />
//                                 <Button size="icon" className="h-9 w-9 shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md" onClick={handleSendMessage} disabled={!newMessage.trim() || connectionStatus !== 'connected'}><Send className="w-4 h-4"/></Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>

//             <footer className="flex items-center justify-center p-3 border-t border-slate-700 bg-slate-800/50 gap-3 sm:gap-4 shrink-0 shadow-top-lg">
//                 <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={toggleMic} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-slate-600 hover:border-cyan-500 data-[state=open]:bg-slate-700 text-slate-300 hover:text-cyan-400 disabled:opacity-50" title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"} disabled={connectionStatus === 'error' || !localStreamRef.current}>
//                     {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
//                 </Button>
//                 <Button variant={isVideoOff || mediaError ? "destructive" : "outline"} size="icon" onClick={toggleVideo} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-slate-600 hover:border-cyan-500 data-[state=open]:bg-slate-700 text-slate-300 hover:text-cyan-400 disabled:opacity-50" title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"} disabled={connectionStatus === 'error' || !localStreamRef.current || !!mediaError}>
//                     {isVideoOff || mediaError ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
//                 </Button>
//             </footer>
//         </div>
//     );
// }





// "use client";

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import AppLayout from "@/components/shared/AppLayout";
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Mic, MicOff, Video, VideoOff, MessagesSquare, Code, Hand, Send, Maximize, Minimize, User, WifiOff, Loader2, AlertCircle, CameraOff } from 'lucide-react'; // Added CameraOff
// import { useAuth } from '@/providers/AuthProvider';
// import { Skeleton } from '@/components/ui/skeleton';
// import SimplePeer from 'simple-peer';
// // Removed: import { io, Socket } from "socket.io-client";
// import { useToast } from '@/hooks/use-toast';
// import Link from 'next/link';
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// // import { format } from 'date-fns';

// // --- Interfaces ---
// interface Participant {
//     id: string;
//     name: string;
// }

// interface InterviewDetails {
//     id: string;
//     topic: string;
//     interviewer: Participant;
//     interviewee: Participant;
//     status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
//     // Add other relevant details like scheduled_time if needed
// }

// interface ChatMessage {
//     senderId: string; // Use ID for consistency
//     senderName: string;
//     text: string;
//     timestamp: number;
//     interviewId?: string; // Added for context if needed
// }

// interface CodeUpdateMessage {
//     interviewId?: string;
//     code: string;
//     senderId: string; // Identify who sent the update
// }

// interface WhiteboardUpdateMessage {
//     interviewId?: string;
//     type: string; // "draw", "drawStart", "clear", etc.
//     data: any; // Flexible data structure for different actions
//     senderId: string;
// }

// // Type for generic WebSocket messages received
// interface WebSocketMessage {
//     type: string;
//     payload?: any; // Flexible payload based on type
//     message?: any; // Used for chat messages and errors
//     code?: string; // For code updates
//     data?: any; // For whiteboard updates
//     signal?: SimplePeer.SignalData; // For WebRTC
//     callerId?: string; // For WebRTC
//     id?: string; // For WebRTC return signal
//     userId?: string; // For join/disconnect notifications
//     users?: { id: string }[]; // For initial user list
//     senderId?: string; // Added for identifying the sender
// }


// // --- Constants ---
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
// // Use ws:// or wss:// for native WebSocket
// const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
// const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
// const WEBSOCKET_PATH = '/ws'; // Path matches Go backend router

// export default function InterviewRoomPage() {
//   const params = useParams();
//   const { id: interviewIdParam } = params;
//   const interviewId = typeof interviewIdParam === 'string' ? interviewIdParam : ''; // Ensure string
//   const { user, token, isLoading: isAuthLoading } = useAuth();
//   const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isMicMuted, setIsMicMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [code, setCode] = useState('// Start coding here...\n');
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
//   const [connectionErrorMsg, setConnectionErrorMsg] = useState<string | null>(null);
//   const [isEndingInterview, setIsEndingInterview] = useState(false);
//   const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
//   const [mediaError, setMediaError] = useState<string | null>(null); // State to hold media error message

//   // WebSocket & WebRTC Refs
//   // const socketRef = useRef<Socket | null>(null); // Replaced
//   const wsRef = useRef<WebSocket | null>(null);
//   const peersRef = useRef<Record<string, SimplePeer.Instance>>({}); // Store multiple peers { peerId: peerInstance }
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null); // Keep for 1-on-1, might need grid for >2
//   const localStreamRef = useRef<MediaStream | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
//      ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#0E2A47', lineWidth: 2,
//   }).current;

//   const { toast } = useToast();
//   const router = useRouter();

//   // --- Utility Functions ---
//   const cleanupResources = useCallback(() => {
//     console.log('Cleaning up interview room resources...');
//     localStreamRef.current?.getTracks().forEach(track => track.stop());
//     // Destroy all peer connections
//     Object.values(peersRef.current).forEach(peer => {
//         try { peer.destroy(); } catch (e) { console.warn("Error destroying peer:", e); }
//     });
//     peersRef.current = {}; // Clear peers map
//     // Close WebSocket connection
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         console.log("Closing WebSocket connection.");
//         wsRef.current.close();
//     }
//     wsRef.current = null;
//     localStreamRef.current = null;
//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; // Clear remote video as well
//     setOtherParticipant(null); // Reset participant state
//     setConnectionStatus('disconnected');
//   }, []);

//    // Helper to send messages via WebSocket
//    const sendMessage = useCallback((message: object) => {
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//             try {
//                 wsRef.current.send(JSON.stringify(message));
//             } catch (error) {
//                 console.error("Failed to send WebSocket message:", error);
//                 toast({ title: "Send Error", description: "Could not send message.", variant: "destructive" });
//             }
//         } else {
//             console.warn("Cannot send message, WebSocket not connected or ready.");
//             toast({ title: "Not Connected", description: "Cannot send message, connection not established.", variant: "destructive" });
//         }
//     }, [toast]);

//   // --- Fetch Interview Details ---
//   useEffect(() => {
//     const fetchDetails = async () => {
//       if (!interviewId || !token) { // isAuthLoading check moved to outer effect
//         setIsLoading(false);
//         toast({ title: "Error", description: "Missing interview ID or authentication.", variant: "destructive" });
//         router.push(`/dashboard/${user?.role || 'interviewee'}`); // Redirect if essential info is missing
//         return;
//       }
//       setIsLoading(true);
//       try {
//         const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           if (response.status === 404) throw new Error('Interview not found.');
//           if (response.status === 403) throw new Error('You do not have permission to access this interview.');
//           throw new Error(data.error || `Failed to load interview details (Status: ${response.status})`);
//         }

//         // Basic validation of fetched data
//         if (!data.id || !data.interviewer || !data.interviewee) {
//              throw new Error('Incomplete interview details received from server.');
//         }

//         setInterviewDetails(data);
//         // Determine the other participant based on the current user
//         if (user) {
//              const other = user.id === data.interviewee.id ? data.interviewer : data.interviewee;
//              // Ensure the 'other' participant is actually different from the current user
//              if (other && other.id !== user.id) {
//                 setOtherParticipant(other);
//              } else if (other && other.id === user.id) {
//                  // This case shouldn't ideally happen if API returns distinct users
//                  console.warn("Interview data shows interviewer and interviewee as the same user.");
//                  setOtherParticipant(null); // Or handle as single-user state
//              } else {
//                  setOtherParticipant(null); // No other participant found/identified
//              }
//         }

//       } catch (error: any) {
//         console.error("Error fetching interview details:", error);
//         toast({ title: "Error Loading Interview", description: error.message || "Could not load interview details.", variant: "destructive" });
//         setInterviewDetails(null); // Clear details on error
//         // Redirect if loading fails critically
//         router.push(`/dashboard/${user?.role || 'interviewee'}`);
//       } finally {
//         setIsLoading(false); // Loading finished (success or fail)
//       }
//     };

//     if (!isAuthLoading && interviewId && token) { // Fetch only when auth is resolved and IDs are present
//         fetchDetails();
//     } else if (!isAuthLoading && (!interviewId || !token)) {
//         // Handle the case where ID or token is missing after auth check
//         setIsLoading(false);
//         if (!interviewId) router.push(`/dashboard/${user?.role || 'interviewee'}`); // Redirect if ID invalid
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [interviewId, token, isAuthLoading, user?.id, user?.role]); // Add user?.role dependency


//     // --- Initialize Media and WebSocket Connection ---
//     useEffect(() => {
//         // Conditions to prevent initialization:
//         if (isAuthLoading || isLoading || !interviewDetails || !user || !token || !interviewId || wsRef.current) {
//              // Don't initialize until: auth resolved, details loaded, user/token/id exist, AND WebSocket not already set up.
//             return;
//         }

//         let isMounted = true; // Flag to prevent state updates on unmounted component

//         const initializeMediaAndWebSocket = async () => {
//             setConnectionStatus('connecting');
//             setConnectionErrorMsg(null);
//             setMediaError(null); // Reset media error

//             // 1. Get User Media
//             try {
//                 console.log("Attempting to get user media (video & audio)...");
//                 const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 console.log("User media stream acquired.");
//                 if (!isMounted) {
//                     console.log("Component unmounted during media acquisition, stopping tracks.");
//                     stream.getTracks().forEach(track => track.stop());
//                     return;
//                 }
//                 localStreamRef.current = stream;
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = stream;
//                 }
//                 // Apply initial mute/video off states
//                 stream.getAudioTracks().forEach(t => t.enabled = !isMicMuted);
//                 stream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);

//             } catch (err: any) {
//                 console.error("Error accessing media devices:", err.name, err.message);
//                 let userMessage = "Could not access camera or microphone.";
//                 if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//                     userMessage = "Camera/Microphone permissions denied. Please allow access in browser settings and refresh.";
//                 } else if (err.name === 'NotFoundError') {
//                     userMessage = "No camera or microphone found. Please ensure they are connected and enabled.";
//                 } else if (err.name === 'NotReadableError') {
//                      userMessage = "Camera or microphone is already in use or cannot be accessed due to a hardware/OS issue.";
//                 } else if (err.name === 'OverconstrainedError') {
//                      userMessage = "No camera/mic supports the requested settings.";
//                 } else {
//                     userMessage = `An unexpected error occurred while accessing media devices: ${err.name}`;
//                 }
//                 toast({ title: "Media Error", description: userMessage, variant: "destructive" });
//                 setMediaError(userMessage); // Set state for UI indication
//                 // Allow initialization to continue to attempt WebSocket connection
//             }

//             // 2. Connect to WebSocket Server
//             const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user.id}&token=${token}`;
//             console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);

//             const ws = new WebSocket(wsUrl);
//             wsRef.current = ws;

//             // --- WebSocket Event Handlers ---
//             ws.onopen = () => {
//                  if (!isMounted) return;
//                  console.log('WebSocket connection established.');
//                  setConnectionStatus('connected');
//                  setConnectionErrorMsg(null);
//             };

//             ws.onerror = (event) => {
//                 if (!isMounted) return;
//                 console.error('WebSocket error:', event);
//                 let errorMsg = `Failed to connect to real-time server. Check server status and connection details.`;
//                 // Specific error details are limited with native WebSocket 'onerror'
//                 setConnectionStatus('error');
//                 setConnectionErrorMsg(errorMsg);
//                 toast({ title: "Connection Error", description: errorMsg, variant: "destructive" });
//                 // Consider if cleanup is needed here - onclose will likely fire too
//             };

//             ws.onclose = (event) => {
//                 if (!isMounted) return;
//                 console.log(`WebSocket disconnected: Code=${event.code}, Reason=${event.reason}`);
//                 setConnectionStatus('disconnected');
//                 const errorMsg = `Connection closed (${event.code}). ${event.reason || 'Attempting to reconnect may be needed.'}`;
//                 setConnectionErrorMsg(errorMsg);
//                 // Only show toast if closure seems abnormal (codes other than 1000 Normal, 1001 Going Away)
//                 if (event.code !== 1000 && event.code !== 1001) {
//                    toast({ title: "Disconnected", description: errorMsg, variant: "default" });
//                 }
//                  // Clean up peer connections immediately on disconnect
//                 Object.values(peersRef.current).forEach(peer => {
//                     try { peer.destroy(); } catch (e) { console.warn("Error destroying peer on disconnect:", e); }
//                 });
//                 peersRef.current = {};
//                 if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                 setOtherParticipant(null); // Assume other user is gone
//                 wsRef.current = null; // Clear the ref on close
//             };

//              ws.onmessage = (event) => {
//                  if (!isMounted || !user) return;
//                  try {
//                      const data: WebSocketMessage = JSON.parse(event.data);
//                      console.log("WebSocket message received:", data);

//                      switch (data.type) {
//                          // --- WebRTC Signaling ---
//                          case 'all-users':
//                              if (!localStreamRef.current) return;
//                              console.log("'all-users' received:", data.users);
//                              data.users?.forEach(peerInfo => {
//                                  if (peerInfo.id === user.id) return; // Skip self

//                                  if (!peersRef.current[peerInfo.id]) { // If no peer connection exists yet
//                                      console.log(`Creating peer connection (initiator) to ${peerInfo.id}`);
//                                      const peer = createPeer(peerInfo.id, user.id, localStreamRef.current!);
//                                      peersRef.current[peerInfo.id] = peer;
//                                      updateOtherParticipantInfo(peerInfo.id); // Set participant info
//                                  }
//                              });
//                              break;

//                          case 'user-joined': // Signal from an initiator peer
//                              if (!localStreamRef.current || data.callerId === user.id || !data.callerId || !data.signal) return;
//                              console.log(`'user-joined' signal received from ${data.callerId}`);
//                              if (peersRef.current[data.callerId]) {
//                                  console.log(`Signal received from ${data.callerId}, accepting signal.`);
//                                  peersRef.current[data.callerId].signal(data.signal);
//                              } else {
//                                  console.log(`Creating peer connection (receiver) for ${data.callerId}`);
//                                  const peer = addPeer(data.signal, data.callerId, localStreamRef.current!);
//                                  peersRef.current[data.callerId] = peer;
//                                  updateOtherParticipantInfo(data.callerId); // Set participant info
//                              }
//                              break;

//                          case 'receiving-returned-signal': // Signal returned from a peer we initiated with
//                              if (!data.id || !data.signal || !peersRef.current[data.id]) {
//                                  console.warn(`Received returned signal for unknown or invalid peer ID: ${data.id}`);
//                                  return;
//                              }
//                              console.log(`'receiving-returned-signal' from ${data.id}`);
//                              peersRef.current[data.id].signal(data.signal);
//                              break;

//                          case 'user-disconnected':
//                              if (!data.userId) return;
//                              const disconnectedUserId = data.userId;
//                              console.log(`'user-disconnected' event received for: ${disconnectedUserId}`);
//                              if (peersRef.current[disconnectedUserId]) {
//                                  console.log(`Destroying peer connection for ${disconnectedUserId}.`);
//                                  try { peersRef.current[disconnectedUserId].destroy(); } catch (e) { console.warn("Error destroying peer on user-disconnect:", e); }
//                                  delete peersRef.current[disconnectedUserId];
//                                  if (otherParticipant?.id === disconnectedUserId) {
//                                      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                                      setOtherParticipant(null);
//                                      toast({ title: "Participant Left", description: "The other participant has left the interview.", variant: "destructive" });
//                                  }
//                              } else {
//                                  console.log(`Received disconnect for user ${disconnectedUserId}, but no active peer connection found.`);
//                              }
//                              break;

//                          // --- Collaboration Handlers ---
//                          case 'chat-message':
//                              if (data.message) {
//                                  setChatMessages((prev) => [...prev, data.message as ChatMessage]);
//                                  // TODO: Add scroll to bottom
//                              }
//                              break;

//                          case 'code-update':
//                              if (data.senderId !== user?.id && data.code !== undefined) { // Ignore own updates
//                                  setCode(data.code);
//                              }
//                              break;

//                          case 'whiteboard-update':
//                              if (data.senderId !== user?.id && canvasRef.current && data.data) { // Ignore own updates
//                                  handleRemoteWhiteboardUpdate(data.type, data.data);
//                              }
//                              break;

//                          // --- Interview State Changes ---
//                          case 'interview-ended':
//                              toast({ title: "Interview Ended", description: "The interview has been concluded.", variant: "destructive" });
//                              cleanupResources();
//                              setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 2000);
//                              break;

//                         // --- Error Handling ---
//                         case 'error':
//                             const errorMsg = data.message || "An error occurred on the server.";
//                             console.error("Received server error message:", errorMsg);
//                             toast({ title: "Server Error", description: errorMsg, variant: "destructive" });
//                             // Consider if specific errors require connection closure or other actions
//                             break;

//                          default:
//                              console.warn("Received unknown WebSocket message type:", data.type);
//                      }
//                  } catch (error) {
//                      console.error('Error parsing WebSocket message or handling event:', error);
//                  }
//              };
//         };

//         initializeMediaAndWebSocket();

//         // Cleanup function
//         return () => {
//              isMounted = false;
//              console.log("Component unmounting, performing cleanup...");
//              cleanupResources();
//         };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [isAuthLoading, isLoading, interviewDetails, user, token, interviewId, sendMessage]); // Added sendMessage to dependencies


//     // Helper to find and set participant info
//      const updateOtherParticipantInfo = (peerId: string) => {
//         if (!otherParticipant && interviewDetails) {
//             const foundParticipant = peerId === interviewDetails.interviewer.id
//                 ? interviewDetails.interviewer
//                 : peerId === interviewDetails.interviewee.id
//                     ? interviewDetails.interviewee
//                     : null;
//             if (foundParticipant && foundParticipant.id !== user?.id) {
//                 console.log(`Setting otherParticipant based on peer ID ${peerId}: ${foundParticipant.name}`);
//                 setOtherParticipant(foundParticipant);
//             }
//         }
//      };


//      // --- WebRTC Peer Creation Helpers ---

//      const createPeer = (userToSignal: string, callerId: string, stream: MediaStream): SimplePeer.Instance => {
//         console.log(`Creating NEW peer for ${userToSignal}, initiated by ${callerId}`);
//         const peer = new SimplePeer({
//             initiator: true,
//             trickle: false, // Simplifies signaling
//             stream: stream,
//         });

//         peer.on('signal', signal => {
//              console.log(`Sending signal from ${callerId} to ${userToSignal}`);
//              sendMessage({ type: 'sending-signal', userToSignal, callerId, signal });
//         });

//         setupPeerEvents(peer, userToSignal); // Attach common handlers
//         return peer;
//     };

//     const addPeer = (incomingSignal: SimplePeer.SignalData, callerId: string, stream: MediaStream): SimplePeer.Instance => {
//         console.log(`Adding NEW peer for ${callerId} (received signal)`);
//         const peer = new SimplePeer({
//             initiator: false,
//             trickle: false,
//             stream: stream,
//         });

//         peer.on('signal', signal => {
//              console.log(`Returning signal from ${user?.id} to ${callerId}`);
//              sendMessage({ type: 'returning-signal', signal, callerId });
//         });

//          setupPeerEvents(peer, callerId); // Attach common handlers
//          try {
//             peer.signal(incomingSignal); // Accept the incoming signal
//          } catch (error) {
//             console.error(`Error signaling peer ${callerId}:`, error);
//             // Optionally destroy the peer if signaling fails critically
//              try { peer.destroy(); } catch(e) { /* ignore destroy error */ }
//              delete peersRef.current[callerId];
//          }

//         return peer;
//     };


//     // Function to setup common peer event listeners
//     const setupPeerEvents = (peer: SimplePeer.Instance, peerId: string) => {
//         console.log(`Setting up events for peer: ${peerId}`);
//         peer.on('stream', remoteStream => {
//             console.log('Received remote stream from', peerId);
//              // Display the first peer's stream (assuming 1-on-1)
//              if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
//                 console.log(`Assigning remote stream from ${peerId} to video element.`);
//                 remoteVideoRef.current.srcObject = remoteStream;
//                 updateOtherParticipantInfo(peerId); // Ensure participant info is set
//              } else if (remoteVideoRef.current?.srcObject) {
//                  console.warn("Remote video element already has a stream. Ignoring new stream from", peerId);
//              }
//         });

//         peer.on('error', (err) => {
//             console.error(`Peer error with ${peerId}:`, err);
//             toast({ title: "Connection Error", description: `A WebRTC connection error occurred with ${otherParticipant?.name || peerId}.`, variant: "destructive" });
//              // Clean up this specific peer
//              if (peersRef.current[peerId]) {
//                  try { peersRef.current[peerId].destroy(); } catch(e) { /* ignore */ }
//                  delete peersRef.current[peerId];
//              }
//              // If it was the main displayed participant, clear video
//               if (otherParticipant?.id === peerId) {
//                  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                  setOtherParticipant(null);
//              }
//         });

//         peer.on('close', () => {
//             console.log(`Peer connection closed with ${peerId}`);
//              // Clean up this specific peer
//              if (peersRef.current[peerId]) {
//                  delete peersRef.current[peerId];
//              }
//              // If it was the main displayed participant, clear video
//              if (otherParticipant?.id === peerId) {
//                  if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//                  setOtherParticipant(null);
//                  console.log(`Cleared main remote video and participant state for closed peer ${peerId}`);
//              }
//         });
//     };


//   // --- Media Controls ---
//   const toggleMic = () => {
//      if (!localStreamRef.current) return;
//      const enabled = isMicMuted; // Target state is the opposite of current
//      localStreamRef.current.getAudioTracks().forEach(track => {
//        track.enabled = enabled;
//      });
//      setIsMicMuted(!enabled);
//    };

//   const toggleVideo = () => {
//     if (!localStreamRef.current || mediaError) return; // Don't toggle if stream missing or media error exists
//     const enabled = isVideoOff; // Target state is the opposite of current
//      localStreamRef.current.getVideoTracks().forEach(track => {
//        track.enabled = enabled;
//      });
//     setIsVideoOff(!enabled);
//   };

//    // --- Chat ---
//    const handleSendMessage = () => {
//      if (newMessage.trim() && user && connectionStatus === 'connected') {
//        const messageData: ChatMessage = {
//          senderId: user.id,
//          senderName: user.name || "User", // Use name or fallback
//          text: newMessage.trim(),
//          timestamp: Date.now(),
//        };
//        console.log("Sending chat message:", messageData);
//        // Send via WebSocket
//        sendMessage({ type: 'chat-message', message: messageData });
//        setChatMessages((prev) => [...prev, messageData]); // Optimistically add own message
//        setNewMessage('');
//      } else if (connectionStatus !== 'connected') {
//         toast({title: "Cannot Send", description: "Not connected to chat server.", variant: "destructive"})
//      }
//    };

//    // --- Code Editor ---
//    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//        const newCode = e.target.value;
//        setCode(newCode);
//        if (connectionStatus === 'connected') {
//            // Debounce or throttle this in a real app
//            sendMessage({ type: 'code-update', code: newCode, senderId: user?.id }); // Include senderId
//        }
//    };


//    // --- Whiteboard ---
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return; // Check if canvas exists
//         const ctx = canvas.getContext('2d');
//         if (!ctx) return;
//         drawingContext.ctx = ctx;

//         // Set initial canvas size based on container
//         const resizeCanvas = () => {
//              const container = canvas.parentElement;
//              if (container) {
//                 // Save drawing data before resize
//                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//                 canvas.width = container.clientWidth;
//                 // Maintain aspect ratio (e.g., 16:9) or set fixed height
//                 const aspectRatio = 9 / 16;
//                 canvas.height = Math.max(200, container.clientWidth * aspectRatio); // Min height 200px

//                 // Restore drawing data
//                  if (imageData) {
//                      const tempCanvas = document.createElement('canvas');
//                      tempCanvas.width = imageData.width;
//                      tempCanvas.height = imageData.height;
//                      const tempCtx = tempCanvas.getContext('2d');
//                      if (tempCtx) {
//                          tempCtx.putImageData(imageData, 0, 0);
//                          ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
//                      }
//                  }

//                  // Reset drawing properties after resize
//                  ctx.strokeStyle = drawingContext.color;
//                  ctx.lineWidth = drawingContext.lineWidth;
//                  ctx.lineCap = 'round';
//                  ctx.lineJoin = 'round';
//              }
//         };
//         resizeCanvas(); // Initial size
//         window.addEventListener('resize', resizeCanvas);


//         const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
//              const rect = canvas.getBoundingClientRect();
//              let clientX = 0, clientY = 0;
//              if (e instanceof MouseEvent) {
//                  clientX = e.clientX; clientY = e.clientY;
//              } else if (e instanceof TouchEvent && e.touches && e.touches.length > 0) {
//                  clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
//              } else {
//                  return null; // No coordinates found
//              }
//              return { x: clientX - rect.left, y: clientY - rect.top };
//         };

//         const startDrawing = (e: MouseEvent | TouchEvent) => {
//             if (!drawingContext.ctx) return;
//             const coords = getCoords(e);
//             if (!coords) return;
//             e.preventDefault(); // Prevent default touch actions like scrolling

//             drawingContext.isDrawing = true;
//             const { x, y } = coords;
//             [drawingContext.lastX, drawingContext.lastY] = [x, y];

//              // Start local path
//             drawingContext.ctx.beginPath();
//             drawingContext.ctx.moveTo(x, y);
//              drawingContext.ctx.strokeStyle = drawingContext.color;
//              drawingContext.ctx.lineWidth = drawingContext.lineWidth;
//              drawingContext.ctx.lineCap = 'round';
//              drawingContext.ctx.lineJoin = 'round';
//         };

//         const draw = (e: MouseEvent | TouchEvent) => {
//             if (!drawingContext.isDrawing || !drawingContext.ctx) return;
//              const coords = getCoords(e);
//              if (!coords) return;
//              e.preventDefault();

//             const { x, y } = coords;

//             // Perform local drawing
//             drawingContext.ctx.lineTo(x, y);
//             drawingContext.ctx.stroke();

//              // Send drawing data via WebSocket
//             if (connectionStatus === 'connected') {
//                 sendMessage({
//                     type: 'whiteboard-update',
//                     data: {
//                         startX: drawingContext.lastX, startY: drawingContext.lastY,
//                         endX: x, endY: y,
//                         color: drawingContext.color, lineWidth: drawingContext.lineWidth,
//                     },
//                     senderId: user?.id // Include senderId
//                 });
//             }
//             [drawingContext.lastX, drawingContext.lastY] = [x, y];
//         };

//         const stopDrawing = () => {
//              if (!drawingContext.isDrawing || !drawingContext.ctx) return;
//             drawingContext.isDrawing = false;
//         };

//         // Add event listeners
//         canvas.addEventListener('mousedown', startDrawing);
//         canvas.addEventListener('mousemove', draw);
//         canvas.addEventListener('mouseup', stopDrawing);
//         canvas.addEventListener('mouseleave', stopDrawing); // Stop drawing if mouse leaves canvas
//         canvas.addEventListener('touchstart', startDrawing, { passive: false }); // passive: false to allow preventDefault
//         canvas.addEventListener('touchmove', draw, { passive: false });
//         canvas.addEventListener('touchend', stopDrawing);
//         canvas.addEventListener('touchcancel', stopDrawing);

//         // Cleanup listeners
//         return () => {
//             window.removeEventListener('resize', resizeCanvas);
//             canvas.removeEventListener('mousedown', startDrawing);
//             canvas.removeEventListener('mousemove', draw);
//             canvas.removeEventListener('mouseup', stopDrawing);
//             canvas.removeEventListener('mouseleave', stopDrawing);
//             canvas.removeEventListener('touchstart', startDrawing);
//             canvas.removeEventListener('touchmove', draw);
//             canvas.removeEventListener('touchend', stopDrawing);
//             canvas.removeEventListener('touchcancel', stopDrawing);
//         };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [drawingContext.color, drawingContext.lineWidth, user?.id, connectionStatus, sendMessage]); // Added deps


//     // Handle receiving whiteboard updates
//     const handleRemoteWhiteboardUpdate = (type: string, data: any) => {
//          const canvas = canvasRef.current;
//          const ctx = canvas?.getContext('2d');
//          if (!ctx || !canvas) return;

//          if (type === 'draw' && data?.startX !== undefined) {
//              ctx.beginPath();
//              ctx.moveTo(data.startX, data.startY);
//              ctx.lineTo(data.endX, data.endY);
//              ctx.strokeStyle = data.color || '#000000';
//              ctx.lineWidth = data.lineWidth || 2;
//              ctx.lineCap = 'round';
//              ctx.lineJoin = 'round';
//              ctx.stroke();
//          } else if (type === 'clear') {
//              ctx.clearRect(0, 0, canvas.width, canvas.height);
//          }
//          // Handle other types if needed
//     };


//     const clearWhiteboard = () => {
//         if (drawingContext.ctx && canvasRef.current) {
//             drawingContext.ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//             if (connectionStatus === 'connected') {
//                 sendMessage({ type: 'whiteboard-update', data: {}, actionType: 'clear', senderId: user?.id }); // Use actionType or similar field if needed by backend
//             }
//         }
//     };

//    // --- Full Screen Toggle ---
//      const toggleFullScreen = () => {
//         const elem = document.documentElement;
//         if (!document.fullscreenElement) {
//             elem.requestFullscreen().catch(err => {
//                  console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
//                  toast({title: "Full Screen Error", description:"Could not enter full screen mode.", variant:"destructive"});
//              });
//         } else {
//              if (document.exitFullscreen) {
//                 document.exitFullscreen();
//             }
//         }
//      };

//      useEffect(() => {
//         const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
//         document.addEventListener('fullscreenchange', handleFullScreenChange);
//         return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
//     }, []);

//     // --- End Interview ---
//     const handleEndInterview = () => {
//         setIsEndingInterview(true);
//         if (connectionStatus === 'connected') {
//             console.log("Sending end-interview message");
//             sendMessage({ type: 'end-interview' }); // Send simple message
//         } else {
//             console.warn("Cannot send end-interview, WebSocket not connected.");
//         }
//         // Clean up local resources immediately
//         cleanupResources(); // This will attempt to close the WebSocket
//         toast({ title: "Interview Ended", description: "You have left the interview room." });
//         // Redirect after a short delay
//         setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 1500);
//     };

//   // --- Render Logic ---
//   if (isAuthLoading || isLoading) { // Check both auth loading and details loading
//       return (
//              <AppLayout> {/* Wrap skeleton in layout for consistency */}
//                  <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
//                      <div className="text-center space-y-3">
//                          <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
//                          <p className="text-muted-foreground">Loading Interview Room...</p>
//                      </div>
//                  </div>
//              </AppLayout>
//       )
//   }

//    if (!interviewDetails) { // Handle case where interview details failed to load or invalid ID
//       return (
//             <AppLayout>
//                  <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center p-4">
//                     <AlertCircle className="w-12 h-12 text-destructive mb-4" />
//                     <h2 className="text-xl font-semibold text-destructive mb-2">Failed to Load Interview</h2>
//                     <p className="text-muted-foreground mb-6">Could not retrieve details or permission for this interview room.</p>
//                      <Link href={`/dashboard/${user?.role || 'interviewee'}`}>
//                          <Button variant="outline">Back to Dashboard</Button>
//                      </Link>
//                  </div>
//             </AppLayout>
//       )
//    }

//   // Main component render
//   return (
//      <div className="flex flex-col h-screen bg-secondary overflow-hidden">
//         {/* Connection Status Banner */}
//         {connectionStatus !== 'connected' && (
//             <Alert
//                 variant={connectionStatus === 'error' || connectionStatus === 'disconnected' ? "destructive" : "default"}
//                 className="rounded-none border-0 border-b bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200"
//             >
//                 {connectionStatus === 'connecting' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
//                 {(connectionStatus === 'error' || connectionStatus === 'disconnected') && <WifiOff className="h-4 w-4 mr-2" />}
//                 <AlertTitle>
//                     {connectionStatus === 'connecting' && 'Connecting...'}
//                     {connectionStatus === 'disconnected' && 'Disconnected'}
//                     {connectionStatus === 'error' && 'Connection Error'}
//                 </AlertTitle>
//                 <AlertDescription>
//                     {connectionStatus === 'connecting' && 'Attempting to connect to the real-time server.'}
//                     {connectionStatus === 'disconnected' && (connectionErrorMsg || 'Connection closed.')}
//                     {connectionStatus === 'error' && (connectionErrorMsg || 'Failed to establish connection.')}
//                 </AlertDescription>
//             </Alert>
//         )}

//          {/* Media Error Banner */}
//          {mediaError && connectionStatus !== 'error' && ( // Show if media error but not connection error
//              <Alert
//                  variant="destructive"
//                  className="rounded-none border-0 border-b"
//              >
//                  <CameraOff className="h-4 w-4" />
//                  <AlertTitle>Media Access Issue</AlertTitle>
//                  <AlertDescription>
//                      {mediaError} Video/Audio features will be limited.
//                  </AlertDescription>
//              </Alert>
//          )}


//         {/* Top Bar */}
//         <header className="flex items-center justify-between p-3 border-b bg-background shadow-sm shrink-0">
//              <div className="flex items-center gap-2 overflow-hidden">
//                  <Code className="w-5 h-5 text-primary shrink-0" />
//                  <span className="font-semibold text-primary truncate text-sm sm:text-base" title={interviewDetails.topic}>
//                      {interviewDetails.topic}
//                  </span>
//              </div>
//              <div className="flex items-center gap-2 shrink-0">
//                  <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[150px] lg:max-w-[250px]" title={otherParticipant?.name || 'Participant'}>
//                      {otherParticipant ? `With: ${otherParticipant.name}` : 'Waiting for participant...'}
//                  </span>
//                  <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="w-8 h-8" title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
//                      {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
//                  </Button>
//                 <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={isEndingInterview}>
//                    {isEndingInterview ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
//                    End Interview
//                 </Button>
//              </div>
//         </header>

//          {/* Main Content Area */}
//          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">

//             {/* Left/Main Column: Video + Code Editor */}
//              <div className="lg:col-span-9 flex flex-col gap-3 overflow-hidden">
//                  {/* Video Feeds */}
//                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-shrink-0">
//                      {/* Local Video */}
//                      <Card className="relative overflow-hidden aspect-video bg-muted shadow-sm border border-input">
//                          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" /> {/* Mirrored local view */}
//                          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/60 text-white text-[10px] sm:text-xs px-1 py-0.5 rounded">
//                             You ({user?.name || 'Me'})
//                          </div>
//                          {(isVideoOff || mediaError) && ( // Show overlay if video is off OR there was a media error
//                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
//                                 {mediaError ? <CameraOff className="w-8 h-8 mb-1" /> : <VideoOff className="w-8 h-8" />}
//                                 {mediaError && <p className="text-xs mt-1 text-center px-2">Camera unavailable</p>}
//                             </div>
//                           )}
//                      </Card>
//                       {/* Remote Video */}
//                       <Card className="relative overflow-hidden aspect-video bg-muted shadow-sm border border-input">
//                          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
//                           <div className="absolute bottom-1 left-1 sm:bottom-2 bg-black/60 text-white text-[10px] sm:text-xs px-1 py-0.5 rounded">
//                               {otherParticipant?.name || 'Waiting...'}
//                           </div>
//                           {/* Placeholder/Indicator */}
//                            {!otherParticipant && connectionStatus === 'connected' && ( // Show if connected but no peer stream yet
//                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
//                                  <User className="w-10 h-10 mb-2" />
//                                  <p className="text-xs">{`Waiting for ${interviewDetails.interviewer.id === user?.id ? interviewDetails.interviewee.name : interviewDetails.interviewer.name}`}</p>
//                              </div>
//                           )}
//                            {connectionStatus !== 'connected' && !otherParticipant && ( // Show if not connected
//                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
//                                  {connectionStatus === 'connecting' ? <Loader2 className="w-10 h-10 mb-2 animate-spin" /> : <WifiOff className="w-10 h-10 mb-2" />}
//                                  <p className="text-xs">{connectionStatus === 'error' ? 'Connection Failed' : 'Connecting...'}</p>
//                              </div>
//                           )}
//                      </Card>
//                  </div>

//                  {/* Code Editor */}
//                  <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
//                      <CardHeader className="p-2 px-3 border-b flex-row items-center justify-between">
//                          <CardTitle className="text-sm sm:text-base flex items-center"><Code className="w-4 h-4 mr-2"/> Code Editor</CardTitle>
//                          {/* Add language selector or other controls if needed */}
//                      </CardHeader>
//                      <CardContent className="p-0 flex-1 overflow-hidden">
//                         <Textarea
//                              value={code}
//                              onChange={handleCodeChange}
//                              placeholder="// Start coding..."
//                              className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-3 font-mono text-xs sm:text-sm leading-relaxed bg-background dark:bg-card" // Ensure consistent background
//                              spellCheck="false"
//                              disabled={connectionStatus !== 'connected'} // Disable if not connected
//                          />
//                      </CardContent>
//                  </Card>
//              </div>

//              {/* Right Column: Whiteboard + Chat */}
//              <div className="lg:col-span-3 flex flex-col gap-3 overflow-hidden">
//                  {/* Whiteboard */}
//                  <Card className="flex-1 flex flex-col overflow-hidden shadow-sm min-h-[200px] md:min-h-[300px] lg:min-h-0">
//                      <CardHeader className="p-2 px-3 border-b flex-row items-center justify-between">
//                          <CardTitle className="text-sm sm:text-base flex items-center"><Hand className="w-4 h-4 mr-2"/> Whiteboard</CardTitle>
//                          <Button variant="ghost" size="sm" onClick={clearWhiteboard} className="text-xs h-7 px-2" disabled={connectionStatus !== 'connected'}>Clear</Button>
//                      </CardHeader>
//                      <CardContent className="p-0 flex-1 overflow-hidden bg-white dark:bg-card rounded-b-md relative">
//                          {/* Apply touch-none to prevent page scroll on touch devices */}
//                         <canvas
//                             ref={canvasRef}
//                             className="absolute top-0 left-0 w-full h-full border-none rounded-b-md touch-none cursor-crosshair"
//                             // style={{ width: '100%', height: '100%' }} // Ensure canvas fills container
//                         ></canvas>
//                      </CardContent>
//                  </Card>

//                  {/* Chat */}
//                  <Card className="flex-1 flex flex-col overflow-hidden shadow-sm min-h-[250px] md:min-h-[300px] lg:min-h-0">
//                      <CardHeader className="p-2 px-3 border-b">
//                          <CardTitle className="text-sm sm:text-base flex items-center"><MessagesSquare className="w-4 h-4 mr-2"/> Chat</CardTitle>
//                      </CardHeader>
//                      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
//                          <ScrollArea className="flex-1 p-3 space-y-3">
//                             {chatMessages.map((msg, index) => (
//                                 <div key={index} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
//                                     <div className={`p-2 rounded-lg max-w-[85%] text-xs sm:text-sm shadow-sm break-words ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
//                                         <p className="font-medium mb-0.5 text-[11px] sm:text-xs opacity-80">{msg.senderId === user?.id ? 'You' : msg.senderName || 'Peer'}</p>
//                                         <p>{msg.text}</p>
//                                         {/* Optional: Add timestamp display */}
//                                         {/* <p className="text-[10px] opacity-60 mt-1 text-right">{format(new Date(msg.timestamp), 'p')}</p> */}
//                                     </div>
//                                 </div>
//                             ))}
//                             {chatMessages.length === 0 && connectionStatus === 'connected' && <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">Chat history is empty.</p>}
//                              {connectionStatus !== 'connected' && <p className="text-xs sm:text-sm text-destructive text-center py-4">Chat unavailable.</p>}
//                          </ScrollArea>
//                          <div className="p-2 border-t flex items-center gap-2 bg-background rounded-b-md">
//                             <Input
//                                 placeholder="Type message..."
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
//                                 className="flex-1 h-8 text-xs sm:text-sm"
//                                 maxLength={500}
//                                 disabled={connectionStatus !== 'connected'} // Disable input if disconnected
//                              />
//                              <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSendMessage} disabled={!newMessage.trim() || connectionStatus !== 'connected'}><Send className="w-4 h-4"/></Button>
//                          </div>
//                      </CardContent>
//                  </Card>
//              </div>
//          </div>

//          {/* Bottom Controls */}
//           <footer className="flex items-center justify-center p-2 border-t bg-background gap-3 shrink-0">
//             <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={toggleMic} className="w-9 h-9 sm:w-10 sm:h-10" title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"} disabled={connectionStatus === 'error' || !localStreamRef.current}>
//                  {isMicMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
//              </Button>
//              <Button variant={isVideoOff ? "destructive" : "outline"} size="icon" onClick={toggleVideo} className="w-9 h-9 sm:w-10 sm:h-10" title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"} disabled={connectionStatus === 'error' || !localStreamRef.current || !!mediaError}> {/* Disable if media error */}
//                 {isVideoOff || mediaError ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
//             </Button>
//             {/* Add other controls like screen sharing if needed */}
//          </footer>
//     </div>
//   );
// }
