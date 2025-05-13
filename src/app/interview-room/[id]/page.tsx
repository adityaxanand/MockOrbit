"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from "@/components/shared/AppLayout"; // Assuming this component provides overall page structure
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming these are custom UI components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
// Textarea is removed as Monaco Editor will be used
import { Mic, MicOff, Video, VideoOff, MessagesSquare, Code, Hand, Send, Maximize, Minimize, User, WifiOff, Loader2, AlertCircle, CameraOff, Settings2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider'; // Assuming custom auth provider
import { Skeleton } from '@/components/ui/skeleton'; // Assuming custom skeleton component
import SimplePeer from 'simple-peer';
import { useToast } from '@/hooks/use-toast'; // Assuming custom toast hook
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming custom alert component

// Monaco Editor
import Editor, { Monaco } from '@monaco-editor/react';

// --- Interfaces ---
interface Participant {
    id: string;
    name: string;
}

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
    interviewId?: string;
}

interface CodeUpdateMessage {
    interviewId?: string;
    code: string;
    language: string; // Added language to code updates
    senderId: string;
}

interface WhiteboardUpdateMessage {
    interviewId?: string;
    type: string;
    data: any;
    senderId: string;
}

interface WebSocketMessage {
    type: string;
    payload?: any;
    message?: any;
    code?: string;
    language?: string; // Added language
    data?: any;
    signal?: SimplePeer.SignalData;
    callerId?: string;
    id?: string;
    userId?: string;
    users?: { id: string }[];
    senderId?: string;
}

// --- Constants ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const WEBSOCKET_PROTOCOL = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL || 'ws';
const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST || 'localhost:8080';
const WEBSOCKET_PATH = '/ws';

const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'json', label: 'JSON' },
];

export default function InterviewRoomPage() {
    const params = useParams();
    const { id: interviewIdParam } = params;
    const interviewId = typeof interviewIdParam === 'string' ? interviewIdParam : '';
    const { user, token, isLoading: isAuthLoading } = useAuth();
    const [interviewDetails, setInterviewDetails] = useState<InterviewDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    
    // Code Editor State
    const [code, setCode] = useState('// Welcome to the collaborative code editor!\n// Select your language and start coding.\nfunction greet() {\n  console.log("Hello, Interviewer!");\n}');
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const monacoEditorRef = useRef<any>(null); // For Monaco editor instance

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
    const [connectionErrorMsg, setConnectionErrorMsg] = useState<string | null>(null);
    const [isEndingInterview, setIsEndingInterview] = useState(false);
    const [otherParticipant, setOtherParticipant] = useState<Participant | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const peersRef = useRef<Record<string, SimplePeer.Instance>>({});
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingContext = useRef<{ ctx: CanvasRenderingContext2D | null; isDrawing: boolean; lastX: number; lastY: number; color: string; lineWidth: number; }>({
        ctx: null, isDrawing: false, lastX: 0, lastY: 0, color: '#0E2A47', lineWidth: 2,
    }).current;

    const { toast } = useToast();
    const router = useRouter();

    // Debounce function
    const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        return (...args: Parameters<F>): Promise<ReturnType<F>> =>
            new Promise(resolve => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => resolve(func(...args)), waitFor);
            });
    };


    const cleanupResources = useCallback(() => {
        console.log('Cleaning up interview room resources...');
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        Object.values(peersRef.current).forEach(peer => {
            try { peer.destroy(); } catch (e) { console.warn("Error destroying peer:", e); }
        });
        peersRef.current = {};
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log("Closing WebSocket connection.");
            wsRef.current.close();
        }
        wsRef.current = null;
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setOtherParticipant(null);
        setConnectionStatus('disconnected');
    }, []);

    const sendMessage = useCallback((message: object) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify(message));
            } catch (error) {
                console.error("Failed to send WebSocket message:", error);
                toast({ title: "Send Error", description: "Could not send message.", variant: "destructive" });
            }
        } else {
            console.warn("Cannot send message, WebSocket not connected or ready.");
            // toast({ title: "Not Connected", description: "Cannot send message, connection not established.", variant: "destructive" });
        }
    }, [toast]);

    // Fetch Interview Details
    useEffect(() => {
        const fetchDetails = async () => {
            if (!interviewId || !token) {
                setIsLoading(false);
                // toast({ title: "Error", description: "Missing interview ID or authentication.", variant: "destructive" });
                // router.push(`/dashboard/${user?.role || 'interviewee'}`);
                return;
            }
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/interviews/${interviewId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!response.ok) {
                    if (response.status === 404) throw new Error('Interview not found.');
                    if (response.status === 403) throw new Error('You do not have permission to access this interview.');
                    throw new Error(data.error || `Failed to load interview details (Status: ${response.status})`);
                }
                if (!data.id || !data.interviewer || !data.interviewee) {
                    throw new Error('Incomplete interview details received from server.');
                }
                setInterviewDetails(data);
                if (user) {
                    const other = user.id === data.interviewee.id ? data.interviewer : data.interviewee;
                    if (other && other.id !== user.id) {
                        setOtherParticipant(other);
                    } else if (other && other.id === user.id) {
                        console.warn("Interview data shows interviewer and interviewee as the same user.");
                        setOtherParticipant(null);
                    } else {
                        setOtherParticipant(null);
                    }
                }
            } catch (error: any) {
                console.error("Error fetching interview details:", error);
                toast({ title: "Error Loading Interview", description: error.message || "Could not load interview details.", variant: "destructive" });
                setInterviewDetails(null);
                router.push(`/dashboard/${user?.role || 'interviewee'}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isAuthLoading && interviewId && token) {
            fetchDetails();
        } else if (!isAuthLoading && (!interviewId || !token)) {
            setIsLoading(false);
            if (!interviewId) router.push(`/dashboard/${user?.role || 'interviewee'}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId, token, isAuthLoading, user?.id, user?.role, router, toast]); // Added router and toast

    // Initialize Media and WebSocket Connection
    useEffect(() => {
        if (isAuthLoading || isLoading || !interviewDetails || !user || !token || !interviewId || wsRef.current) {
            return;
        }
        let isMounted = true;

        const initializeMediaAndWebSocket = async () => {
            setConnectionStatus('connecting');
            setConnectionErrorMsg(null);
            setMediaError(null);

            try {
                console.log("Attempting to get user media (video & audio)...");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                console.log("User media stream acquired.");
                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                stream.getAudioTracks().forEach(t => t.enabled = !isMicMuted);
                stream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
            } catch (err: any) {
                console.error("Error accessing media devices:", err.name, err.message);
                let userMessage = "Could not access camera or microphone.";
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') userMessage = "Camera/Microphone permissions denied. Please allow access in browser settings and refresh.";
                else if (err.name === 'NotFoundError') userMessage = "No camera or microphone found. Please ensure they are connected and enabled.";
                else if (err.name === 'NotReadableError') userMessage = "Camera or microphone is already in use or cannot be accessed due to a hardware/OS issue.";
                else if (err.name === 'OverconstrainedError') userMessage = "No camera/mic supports the requested settings.";
                else userMessage = `An unexpected error occurred while accessing media devices: ${err.name}`;
                toast({ title: "Media Error", description: userMessage, variant: "destructive" });
                setMediaError(userMessage);
            }

            const wsUrl = `${WEBSOCKET_PROTOCOL}://${WEBSOCKET_HOST}${WEBSOCKET_PATH}?interviewId=${interviewId}&userId=${user.id}&token=${token}`;
            console.log(`Attempting to connect to WebSocket server at: ${wsUrl}`);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isMounted) return;
                console.log('WebSocket connection established.');
                setConnectionStatus('connected');
                setConnectionErrorMsg(null);
            };
            ws.onerror = (event) => {
                if (!isMounted) return;
                console.error('WebSocket error:', event);
                const errorMsg = `Failed to connect to real-time server. Check server status and connection details.`;
                setConnectionStatus('error');
                setConnectionErrorMsg(errorMsg);
                toast({ title: "Connection Error", description: errorMsg, variant: "destructive" });
            };
            ws.onclose = (event) => {
                if (!isMounted) return;
                console.log(`WebSocket disconnected: Code=${event.code}, Reason=${event.reason}`);
                setConnectionStatus('disconnected');
                const errorMsg = `Connection closed (${event.code}). ${event.reason || 'Attempting to reconnect may be needed.'}`;
                setConnectionErrorMsg(errorMsg);
                if (event.code !== 1000 && event.code !== 1001) {
                    toast({ title: "Disconnected", description: errorMsg, variant: "default" });
                }
                Object.values(peersRef.current).forEach(peer => {
                    try { peer.destroy(); } catch (e) { console.warn("Error destroying peer on disconnect:", e); }
                });
                peersRef.current = {};
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                setOtherParticipant(null);
                wsRef.current = null;
            };
            ws.onmessage = (event) => {
                if (!isMounted || !user) return;
                try {
                    const data: WebSocketMessage = JSON.parse(event.data as string);
                    console.log("WebSocket message received:", data);

                    switch (data.type) {
                        case 'all-users':
                            if (!localStreamRef.current) return;
                            data.users?.forEach(peerInfo => {
                                if (peerInfo.id === user.id) return;
                                if (!peersRef.current[peerInfo.id]) {
                                    const peer = createPeer(peerInfo.id, user.id, localStreamRef.current!);
                                    peersRef.current[peerInfo.id] = peer;
                                    updateOtherParticipantInfo(peerInfo.id);
                                }
                            });
                            break;
                        case 'user-joined':
                            if (!localStreamRef.current || data.callerId === user.id || !data.callerId || !data.signal) return;
                            if (peersRef.current[data.callerId]) {
                                peersRef.current[data.callerId].signal(data.signal);
                            } else {
                                const peer = addPeer(data.signal, data.callerId, localStreamRef.current!);
                                peersRef.current[data.callerId] = peer;
                                updateOtherParticipantInfo(data.callerId);
                            }
                            break;
                        case 'receiving-returned-signal':
                            if (!data.id || !data.signal || !peersRef.current[data.id]) return;
                            peersRef.current[data.id].signal(data.signal);
                            break;
                        case 'user-disconnected':
                            if (!data.userId) return;
                            const disconnectedUserId = data.userId;
                            if (peersRef.current[disconnectedUserId]) {
                                try { peersRef.current[disconnectedUserId].destroy(); } catch (e) { console.warn("Error destroying peer on user-disconnect:", e); }
                                delete peersRef.current[disconnectedUserId];
                                if (otherParticipant?.id === disconnectedUserId) {
                                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                                    setOtherParticipant(null);
                                    toast({ title: "Participant Left", description: "The other participant has left the interview.", variant: "default" });
                                }
                            }
                            break;
                        case 'chat-message':
                            if (data.message) {
                                setChatMessages((prev) => [...prev, data.message as ChatMessage]);
                            }
                            break;
                        case 'code-update':
                            if (data.senderId !== user?.id && data.code !== undefined) {
                                setCode(data.code);
                                if (data.language) { // Update language if received
                                    setSelectedLanguage(data.language);
                                }
                            }
                            break;
                        case 'whiteboard-update':
                            if (data.senderId !== user?.id && canvasRef.current && data.data) {
                                handleRemoteWhiteboardUpdate(data.type, data.data);
                            }
                            break;
                        case 'interview-ended':
                            toast({ title: "Interview Ended", description: "The interview has been concluded by the host.", variant: "destructive" });
                            cleanupResources();
                            setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 2000);
                            break;
                        case 'error':
                            const errorMsg = data.message || "An error occurred on the server.";
                            console.error("Received server error message:", errorMsg);
                            toast({ title: "Server Error", description: errorMsg, variant: "destructive" });
                            break;
                        default:
                            console.warn("Received unknown WebSocket message type:", data.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message or handling event:', error);
                }
            };
        };

        initializeMediaAndWebSocket();

        return () => {
            isMounted = false;
            console.log("Component unmounting, performing cleanup...");
            cleanupResources();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthLoading, isLoading, interviewDetails, user, token, interviewId, sendMessage, cleanupResources, toast, router]); // Added dependencies

    const updateOtherParticipantInfo = (peerId: string) => {
        if (!otherParticipant && interviewDetails) {
            const foundParticipant = peerId === interviewDetails.interviewer.id
                ? interviewDetails.interviewer
                : peerId === interviewDetails.interviewee.id
                    ? interviewDetails.interviewee
                    : null;
            if (foundParticipant && foundParticipant.id !== user?.id) {
                setOtherParticipant(foundParticipant);
            }
        }
    };

    const createPeer = (userToSignal: string, callerId: string, stream: MediaStream): SimplePeer.Instance => {
        const peer = new SimplePeer({ initiator: true, trickle: false, stream: stream });
        peer.on('signal', signal => {
            sendMessage({ type: 'sending-signal', userToSignal, callerId, signal });
        });
        setupPeerEvents(peer, userToSignal);
        return peer;
    };

    const addPeer = (incomingSignal: SimplePeer.SignalData, callerId: string, stream: MediaStream): SimplePeer.Instance => {
        const peer = new SimplePeer({ initiator: false, trickle: false, stream: stream });
        peer.on('signal', signal => {
            sendMessage({ type: 'returning-signal', signal, callerId });
        });
        setupPeerEvents(peer, callerId);
        try {
            peer.signal(incomingSignal);
        } catch (error) {
            console.error(`Error signaling peer ${callerId}:`, error);
            try { peer.destroy(); } catch(e) { /* ignore */ }
            delete peersRef.current[callerId];
        }
        return peer;
    };

    const setupPeerEvents = (peer: SimplePeer.Instance, peerId: string) => {
        peer.on('stream', remoteStream => {
            if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
                remoteVideoRef.current.srcObject = remoteStream;
                updateOtherParticipantInfo(peerId);
            } else if (remoteVideoRef.current?.srcObject) {
                console.warn("Remote video element already has a stream. Ignoring new stream from", peerId);
            }
        });
        peer.on('error', (err) => {
            console.error(`Peer error with ${peerId}:`, err);
            toast({ title: "Connection Error", description: `A WebRTC connection error occurred with ${otherParticipant?.name || peerId}.`, variant: "destructive" });
            if (peersRef.current[peerId]) {
                try { peersRef.current[peerId].destroy(); } catch(e) { /* ignore */ }
                delete peersRef.current[peerId];
            }
            if (otherParticipant?.id === peerId) {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                setOtherParticipant(null);
            }
        });
        peer.on('close', () => {
            console.log(`Peer connection closed with ${peerId}`);
            if (peersRef.current[peerId]) {
                delete peersRef.current[peerId];
            }
            if (otherParticipant?.id === peerId) {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                setOtherParticipant(null);
            }
        });
    };

    const toggleMic = () => {
        if (!localStreamRef.current) return;
        const enabled = isMicMuted;
        localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = enabled; });
        setIsMicMuted(!enabled);
    };

    const toggleVideo = () => {
        if (!localStreamRef.current || mediaError) return;
        const enabled = isVideoOff;
        localStreamRef.current.getVideoTracks().forEach(track => { track.enabled = enabled; });
        setIsVideoOff(!enabled);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && user && connectionStatus === 'connected') {
            const messageData: ChatMessage = {
                senderId: user.id,
                senderName: user.name || "User",
                text: newMessage.trim(),
                timestamp: Date.now(),
            };
            sendMessage({ type: 'chat-message', message: messageData });
            setChatMessages((prev) => [...prev, messageData]);
            setNewMessage('');
        } else if (connectionStatus !== 'connected') {
            toast({ title: "Cannot Send", description: "Not connected to chat server.", variant: "destructive" });
        }
    };

    // --- Code Editor ---
    const debouncedSendCodeUpdate = useCallback(
        debounce((newCode: string, lang: string) => {
            sendMessage({ type: 'code-update', code: newCode, language: lang, senderId: user?.id });
        }, 750), // Send update 750ms after user stops typing
        [sendMessage, user?.id] // Dependencies for useCallback
    );
    
    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
            if (connectionStatus === 'connected' && user?.id) {
                debouncedSendCodeUpdate(value, selectedLanguage);
            }
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setSelectedLanguage(newLang);
        // Optionally send an immediate language update if needed, or it will be sent with the next code update
        if (connectionStatus === 'connected' && user?.id) {
             sendMessage({ type: 'code-update', code: code, language: newLang, senderId: user?.id });
        }
    };
    
    function handleEditorDidMount(editor: any, monaco: Monaco) {
        monacoEditorRef.current = editor;
        // You can now access the editor instance (e.g., monacoEditorRef.current.focus()).
        // Example: Define a custom theme or register completion providers
        // monaco.editor.defineTheme('my-cool-theme', {
        //     base: 'vs-dark',
        //     inherit: true,
        //     rules: [{ background: 'EDF2F7' }],
        //     colors: {
        //         'editor.foreground': '#000000'
        //     }
        // });
        // monaco.editor.setTheme('my-cool-theme');
        console.log("Monaco editor mounted:", editor);
    }


    // --- Whiteboard ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawingContext.ctx = ctx;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Save current drawing
                canvas.width = container.clientWidth;
                canvas.height = Math.max(200, container.clientWidth * (9 / 16)); // Maintain aspect ratio or set fixed height

                // Restore drawing data (simple redraw, might need scaling for complex drawings)
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = imageData.width;
                tempCanvas.height = imageData.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) {
                    tempCtx.putImageData(imageData, 0, 0);
                    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
                }
                
                ctx.strokeStyle = drawingContext.color;
                ctx.lineWidth = drawingContext.lineWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
            const rect = canvas.getBoundingClientRect();
            let clientX = 0, clientY = 0;
            if (e instanceof MouseEvent) { clientX = e.clientX; clientY = e.clientY; }
            else if (e instanceof TouchEvent && e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
            else { return null; }
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            if (!drawingContext.ctx) return;
            const coords = getCoords(e);
            if (!coords) return;
            e.preventDefault();
            drawingContext.isDrawing = true;
            const { x, y } = coords;
            [drawingContext.lastX, drawingContext.lastY] = [x, y];
            drawingContext.ctx.beginPath();
            drawingContext.ctx.moveTo(x, y);
            drawingContext.ctx.strokeStyle = drawingContext.color;
            drawingContext.ctx.lineWidth = drawingContext.lineWidth;
        };

        const draw = (e: MouseEvent | TouchEvent) => {
            if (!drawingContext.isDrawing || !drawingContext.ctx) return;
            const coords = getCoords(e);
            if (!coords) return;
            e.preventDefault();
            const { x, y } = coords;
            drawingContext.ctx.lineTo(x, y);
            drawingContext.ctx.stroke();
            if (connectionStatus === 'connected') {
                sendMessage({
                    type: 'whiteboard-update',
                    data: { startX: drawingContext.lastX, startY: drawingContext.lastY, endX: x, endY: y, color: drawingContext.color, lineWidth: drawingContext.lineWidth, type: 'draw' }, // Added type: 'draw'
                    senderId: user?.id
                });
            }
            [drawingContext.lastX, drawingContext.lastY] = [x, y];
        };

        const stopDrawing = () => { if (drawingContext.isDrawing) drawingContext.isDrawing = false; };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchcancel', stopDrawing);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            // ... remove other listeners
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawingContext.color, drawingContext.lineWidth, user?.id, connectionStatus, sendMessage]);

    const handleRemoteWhiteboardUpdate = (type: string, data: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // Check if data.type is 'draw' or if the main type is 'draw'
        if ((data.type === 'draw' || type === 'draw') && data?.startX !== undefined) {
            ctx.beginPath();
            ctx.moveTo(data.startX, data.startY);
            ctx.lineTo(data.endX, data.endY);
            ctx.strokeStyle = data.color || '#0E2A47';
            ctx.lineWidth = data.lineWidth || 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        } else if (type === 'clear' || data.type === 'clear') { // Check both
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const clearWhiteboard = () => {
        if (drawingContext.ctx && canvasRef.current) {
            drawingContext.ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            if (connectionStatus === 'connected') {
                sendMessage({ type: 'whiteboard-update', data: { type: 'clear'}, senderId: user?.id }); // Ensure type: 'clear' is sent
            }
        }
    };

    const toggleFullScreen = () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                toast({ title: "Full Screen Error", description: "Could not enter full screen mode.", variant: "destructive" });
            });
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const handleEndInterview = () => {
        setIsEndingInterview(true);
        if (connectionStatus === 'connected') {
            sendMessage({ type: 'end-interview' });
        }
        cleanupResources();
        toast({ title: "Interview Ended", description: "You have left the interview room." });
        setTimeout(() => router.push(`/dashboard/${user?.role || 'interviewee'}`), 1500);
    };

    if (isAuthLoading || isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[calc(100vh-8rem)]"> {/* Adjusted height */}
                    <div className="text-center space-y-4 p-6 bg-card rounded-lg shadow-xl">
                        <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
                        <p className="text-lg font-medium text-muted-foreground">Loading Interview Room...</p>
                        <p className="text-sm text-muted-foreground/80">Please wait while we set things up.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!interviewDetails) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-6">
                    <AlertCircle className="w-16 h-16 text-destructive mb-6" />
                    <h2 className="text-2xl font-semibold text-destructive mb-3">Failed to Load Interview</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        We couldn't retrieve the details for this interview room, or you may not have permission to access it.
                    </p>
                    <Link href={`/dashboard/${user?.role || 'interviewee'}`}>
                        <Button variant="outline" size="lg">Back to Dashboard</Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 overflow-hidden">
            {connectionStatus !== 'connected' && (
                <Alert
                    variant={connectionStatus === 'error' || connectionStatus === 'disconnected' ? "destructive" : "default"}
                    className="rounded-none border-0 border-b bg-yellow-500/20 dark:bg-yellow-700/30 border-yellow-600 dark:border-yellow-500 text-yellow-800 dark:text-yellow-100 shadow-md"
                >
                    <div className="flex items-center">
                        {connectionStatus === 'connecting' && <Loader2 className="h-5 w-5 animate-spin mr-3 text-yellow-600 dark:text-yellow-300" />}
                        {(connectionStatus === 'error' || connectionStatus === 'disconnected') && <WifiOff className="h-5 w-5 mr-3 text-red-600 dark:text-red-400" />}
                        <div className="flex-grow">
                            <AlertTitle className="font-semibold">
                                {connectionStatus === 'connecting' && 'Connecting...'}
                                {connectionStatus === 'disconnected' && 'Disconnected'}
                                {connectionStatus === 'error' && 'Connection Error'}
                            </AlertTitle>
                            <AlertDescription className="text-sm">
                                {connectionStatus === 'connecting' && 'Attempting to connect to the real-time server.'}
                                {connectionStatus === 'disconnected' && (connectionErrorMsg || 'Connection closed.')}
                                {connectionStatus === 'error' && (connectionErrorMsg || 'Failed to establish connection.')}
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            )}

            {mediaError && connectionStatus !== 'error' && (
                <Alert variant="destructive" className="rounded-none border-0 border-b shadow-md">
                     <div className="flex items-center">
                        <CameraOff className="h-5 w-5 mr-3" />
                        <div className="flex-grow">
                            <AlertTitle className="font-semibold">Media Access Issue</AlertTitle>
                            <AlertDescription className="text-sm">{mediaError} Video/Audio features will be limited.</AlertDescription>
                        </div>
                    </div>
                </Alert>
            )}

            <header className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50 shadow-lg shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Code className="w-6 h-6 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate text-md sm:text-lg" title={interviewDetails.topic}>
                        {interviewDetails.topic}
                    </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs sm:text-sm text-slate-400 hidden md:inline truncate max-w-[120px] lg:max-w-[200px]" title={otherParticipant?.name || 'Participant'}>
                        {otherParticipant ? `With: ${otherParticipant.name}` : 'Waiting for participant...'}
                    </span>
                    <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="w-9 h-9 text-slate-300 hover:bg-slate-700 hover:text-cyan-400" title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                        {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={isEndingInterview} className="bg-red-600 hover:bg-red-700 text-white">
                        {isEndingInterview ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        End Interview
                    </Button>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 overflow-y-auto"> {/* Adjusted span for potentially wider code editor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-shrink-0">
                        <Card className="relative overflow-hidden aspect-video bg-slate-700/50 shadow-lg border border-slate-600 rounded-xl">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md shadow">
                                You ({user?.name || 'Me'})
                            </div>
                            {(isVideoOff || mediaError) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80 text-slate-300 p-2">
                                    {mediaError ? <CameraOff className="w-10 h-10 mb-2 text-red-400" /> : <VideoOff className="w-10 h-10 text-slate-400" />}
                                    {mediaError && <p className="text-xs mt-1 text-center">Camera unavailable</p>}
                                    {!mediaError && isVideoOff && <p className="text-xs mt-1 text-center">Camera Off</p>}
                                </div>
                            )}
                        </Card>
                        <Card className="relative overflow-hidden aspect-video bg-slate-700/50 shadow-lg border border-slate-600 rounded-xl">
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md shadow">
                                {otherParticipant?.name || 'Waiting...'}
                            </div>
                            {!otherParticipant && connectionStatus === 'connected' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700/80 text-slate-400">
                                    <User className="w-12 h-12 mb-2" />
                                    <p className="text-sm">{`Waiting for ${interviewDetails.interviewer.id === user?.id ? interviewDetails.interviewee.name : interviewDetails.interviewer.name}`}</p>
                                </div>
                            )}
                            {connectionStatus !== 'connected' && !otherParticipant && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-700/80 text-slate-400">
                                    {connectionStatus === 'connecting' ? <Loader2 className="w-12 h-12 mb-2 animate-spin" /> : <WifiOff className="w-12 h-12 mb-2" />}
                                    <p className="text-sm">{connectionStatus === 'error' ? 'Connection Failed' : 'Connecting...'}</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <Card className="flex-1 flex flex-col overflow-hidden shadow-2xl bg-slate-800 border border-slate-700 rounded-xl">
                        <CardHeader className="p-3 border-b border-slate-700 flex-row items-center justify-between bg-slate-800/70 rounded-t-xl">
                            <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><Code className="w-5 h-5 mr-2 text-cyan-400"/> Code Editor</CardTitle>
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
                                    disabled={connectionStatus !== 'connected'}
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='w-5 h-5 text-slate-400'%3E%3Cpath fill-rule='evenodd' d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', paddingRight: '2rem' }}

                                >
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <option key={lang.value} value={lang.value} className="bg-slate-700 text-slate-200">{lang.label}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden relative bg-[#1e1e1e]"> {/* Monaco default dark theme background */}
                            <Editor
                                height="100%"
                                language={selectedLanguage}
                                value={code}
                                theme="vs-dark" // Default dark theme for Monaco
                                onChange={handleEditorChange}
                                onMount={handleEditorDidMount}
                                options={{
                                    automaticLayout: true,
                                    selectOnLineNumbers: true,
                                    roundedSelection: false,
                                    readOnly: connectionStatus !== 'connected', // Make editor readonly if not connected
                                    cursorStyle: 'line',
                                    wordWrap: 'on',
                                    minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
                                    fontSize: 14,
                                    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                                    scrollbar: {
                                        verticalScrollbarSize: 10,
                                        horizontalScrollbarSize: 10,
                                        arrowSize: 12
                                    }
                                }}
                            />
                             {connectionStatus !== 'connected' && (
                                <div className="absolute inset-0 bg-slate-800/90 flex flex-col items-center justify-center z-10 text-slate-300">
                                    <WifiOff className="w-12 h-12 mb-3 text-red-400"/>
                                    <p className="text-lg font-medium">Editor Unavailable</p>
                                    <p className="text-sm">Please connect to the server to enable editing.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 overflow-y-auto">
                    <Card className="flex-1 flex flex-col overflow-hidden shadow-xl bg-slate-800 border border-slate-700 rounded-xl min-h-[250px] md:min-h-[300px] lg:min-h-0">
                        <CardHeader className="p-3 border-b border-slate-700 flex-row items-center justify-between bg-slate-800/70 rounded-t-xl">
                            <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><Hand className="w-5 h-5 mr-2 text-cyan-400"/> Whiteboard</CardTitle>
                            <Button variant="ghost" size="sm" onClick={clearWhiteboard} className="text-xs h-7 px-2 text-slate-300 hover:bg-slate-700 hover:text-cyan-400" disabled={connectionStatus !== 'connected'}>Clear</Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-b-xl relative">
                            <canvas
                                ref={canvasRef}
                                className="absolute top-0 left-0 w-full h-full border-none rounded-b-xl touch-none cursor-crosshair bg-white" // Explicit white background for canvas
                            ></canvas>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 flex flex-col overflow-hidden shadow-xl bg-slate-800 border border-slate-700 rounded-xl min-h-[300px] md:min-h-[350px] lg:min-h-0">
                        <CardHeader className="p-3 border-b border-slate-700 rounded-t-xl bg-slate-800/70">
                            <CardTitle className="text-md sm:text-lg flex items-center text-slate-200"><MessagesSquare className="w-5 h-5 mr-2 text-cyan-400"/> Chat</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                            <ScrollArea className="flex-1 p-3 space-y-3 bg-slate-800">
                                {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-2.5 rounded-lg max-w-[85%] text-sm shadow-md break-words ${msg.senderId === user?.id ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                            <p className="font-semibold mb-0.5 text-xs opacity-80">{msg.senderId === user?.id ? 'You' : msg.senderName || 'Peer'}</p>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {chatMessages.length === 0 && connectionStatus === 'connected' && <p className="text-sm text-slate-500 text-center py-4">No messages yet. Start the conversation!</p>}
                                {connectionStatus !== 'connected' && <p className="text-sm text-red-400 text-center py-4">Chat unavailable. Please connect.</p>}
                            </ScrollArea>
                            <div className="p-3 border-t border-slate-700 flex items-center gap-2 bg-slate-800/80 rounded-b-xl">
                                <Input
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                    className="flex-1 h-9 text-sm bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
                                    maxLength={500}
                                    disabled={connectionStatus !== 'connected'}
                                />
                                <Button size="icon" className="h-9 w-9 shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md" onClick={handleSendMessage} disabled={!newMessage.trim() || connectionStatus !== 'connected'}><Send className="w-4 h-4"/></Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer className="flex items-center justify-center p-3 border-t border-slate-700 bg-slate-800/50 gap-3 sm:gap-4 shrink-0 shadow-top-lg">
                <Button variant={isMicMuted ? "destructive" : "outline"} size="icon" onClick={toggleMic} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-slate-600 hover:border-cyan-500 data-[state=open]:bg-slate-700 text-slate-300 hover:text-cyan-400 disabled:opacity-50" title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"} disabled={connectionStatus === 'error' || !localStreamRef.current}>
                    {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                </Button>
                <Button variant={isVideoOff || mediaError ? "destructive" : "outline"} size="icon" onClick={toggleVideo} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-slate-600 hover:border-cyan-500 data-[state=open]:bg-slate-700 text-slate-300 hover:text-cyan-400 disabled:opacity-50" title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"} disabled={connectionStatus === 'error' || !localStreamRef.current || !!mediaError}>
                    {isVideoOff || mediaError ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                </Button>
            </footer>
        </div>
    );
}





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
