"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { format } from "date-fns";
import { Clock, Users, BookOpenIcon, SendHorizonal, Loader2, CalendarPlus, Info, Search, CheckCircle, X, Send } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PopoverAnchor } from '@radix-ui/react-popover';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface AvailableSlot {
    date: string;
    time: string;
    available: boolean;
}

interface Peer {
    id: string;
    name: string;
    email?: string;
}

interface Topic {
    id: string;
    name: string;
}

const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function SchedulePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [peerSearchQuery, setPeerSearchQuery] = useState<string>("");
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [selectedPeerInfo, setSelectedPeerInfo] = useState<Peer | null>(null);
  const [peerSearchResults, setPeerSearchResults] = useState<Peer[]>([]);
  const [isSearchingPeers, setIsSearchingPeers] = useState<boolean>(false);
  const [isPeerPopoverOpen, setIsPeerPopoverOpen] = useState<boolean>(false);
  const allPeersRef = useRef<Peer[]>([]);
  const peerInputRef = useRef<HTMLInputElement>(null);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>("");
  const [selectedTopicInfo, setSelectedTopicInfo] = useState<Topic | null>(null);
  const [topicSearchResults, setTopicSearchResults] = useState<Topic[]>([]);
  const [isSearchingTopics, setIsSearchingTopics] = useState<boolean>(false);
  const [isTopicPopoverOpen, setIsTopicPopoverOpen] = useState<boolean>(false);
  const allTopicsRef = useRef<Topic[]>([]);
  const topicInputRef = useRef<HTMLInputElement>(null);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isLoadingInitialPeers, setIsLoadingInitialPeers] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const { toast } = useToast();
  const { user, token, activeRole, isLoading: isAuthLoading } = useAuth();
  
   useEffect(() => {
    const fetchInitialPeers = async () => {
        if (!token || !user?.id) return;
        setIsLoadingInitialPeers(true);
        try {
            const response = await fetch(`${API_URL}/users/peers`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch peers');
            allPeersRef.current = data || [];
        } catch (error: any) {
            toast({ title: "Error Loading Peers", description: error.message, variant: "destructive" });
            allPeersRef.current = [];
        } finally {
            setIsLoadingInitialPeers(false);
        }
    };
     const fetchTopics = async () => {
        if (!token) return;
        setIsLoadingTopics(true);
        try {
            const response = await fetch(`${API_URL}/topics`, { headers: { Authorization: `Bearer ${token}` } });
             const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch topics');
            allTopicsRef.current = data || [];
        } catch (error: any) {
            toast({ title: "Error Loading Topics", description: error.message, variant: "destructive" });
            allTopicsRef.current = [];
        } finally {
            setIsLoadingTopics(false);
        }
    };
    if (!isAuthLoading) {
        fetchInitialPeers();
        fetchTopics();
    }
   }, [token, toast, isAuthLoading, user?.id]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!date || !token) {
                 setIsLoadingSlots(false);
                 setAvailableSlots([]);
                 return;
            }
            setIsLoadingSlots(true);
            setSelectedTime(null);
            const formattedDate = format(date, 'yyyy-MM-dd');
            try {
                const response = await fetch(`${API_URL}/availability?date=${formattedDate}`, { headers: { Authorization: `Bearer ${token}` } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch slots');
                setAvailableSlots(data || []);
            } catch (error: any) {
                toast({ title: "Error Loading Slots", description: `Could not load time slots for ${formattedDate}: ${error.message}`, variant: "destructive" });
                setAvailableSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };
        if (!isAuthLoading && token) fetchSlots();
    }, [date, token, toast, isAuthLoading]);

  const handlePeerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPeerSearchQuery(query);
    if (selectedPeerInfo) { 
        setSelectedPeer(null);
        setSelectedPeerInfo(null);
    }
    if (query.trim()) {
        setIsPeerPopoverOpen(true);
    } else {
        setPeerSearchResults([]); 
        setIsPeerPopoverOpen(false);
    }
  };

  const debouncedPeerSearch = useCallback(
    debounce((query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setPeerSearchResults([]);
        setIsSearchingPeers(false);
        setIsPeerPopoverOpen(false); 
        return;
      }
      setIsSearchingPeers(true);
      const filteredPeers = allPeersRef.current.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          (p.email && p.email.toLowerCase().includes(trimmedQuery.toLowerCase())) ||
          p.id.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setPeerSearchResults(filteredPeers);
      setIsSearchingPeers(false);
      setIsPeerPopoverOpen(true); 
    }, 300),
    [] 
  );

  useEffect(() => {
    if (!selectedPeerInfo) { 
        debouncedPeerSearch(peerSearchQuery);
    }
  }, [peerSearchQuery, selectedPeerInfo, debouncedPeerSearch]);

  const handleSelectPeer = (peer: Peer) => {
    setSelectedPeer(peer.id);
    setSelectedPeerInfo(peer);
    setPeerSearchQuery(peer.name); 
    setPeerSearchResults([]);      
    setIsPeerPopoverOpen(false);   
  };

  const handleTopicSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setTopicSearchQuery(query);
    if (selectedTopicInfo) {
        setSelectedTopic(null);
        setSelectedTopicInfo(null);
    }
    if (query.trim()) {
        setIsTopicPopoverOpen(true);
    } else {
        setTopicSearchResults([]);
        setIsTopicPopoverOpen(false);
    }
  };

  const debouncedTopicSearch = useCallback(
    debounce((query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setTopicSearchResults([]);
        setIsSearchingTopics(false);
        setIsTopicPopoverOpen(false);
        return;
      }
      setIsSearchingTopics(true);
      const filteredTopics = allTopicsRef.current.filter(
        (t) => t.name.toLowerCase().includes(trimmedQuery.toLowerCase())
      );
      setTopicSearchResults(filteredTopics);
      setIsSearchingTopics(false);
      setIsTopicPopoverOpen(true);
    }, 300),
    [] 
  );

  useEffect(() => {
    if (!selectedTopicInfo) {
        debouncedTopicSearch(topicSearchQuery);
    }
  }, [topicSearchQuery, selectedTopicInfo, debouncedTopicSearch]);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic.id); 
    setSelectedTopicInfo(topic);
    setTopicSearchQuery(topic.name);
    setTopicSearchResults([]);
    setIsTopicPopoverOpen(false);
  };

  const handleTimeSelect = (time: string, isAvailable: boolean) => {
      if (isAvailable) setSelectedTime(time);
      else toast({ title: "Slot Unavailable", description: "This time slot is already booked or past.", variant: "destructive"});
  };

  const handleSubmit = async () => {
    if (!date || !selectedTime || !selectedPeer || !selectedTopic || !user || !activeRole || !token) {
      toast({ title: "Incomplete Information", description: "Please select a date, time, peer, and topic to schedule.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const scheduledDateTimeUTC = new Date(`${format(date, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`);
    
    const scheduleData = {
      interviewee_id: activeRole === 'interviewee' ? user.id : selectedPeer,
      interviewer_id: activeRole === 'interviewer' ? user.id : selectedPeer,
      scheduled_time: scheduledDateTimeUTC.toISOString(),
      topic: selectedTopicInfo?.name || selectedTopic, 
    };

    console.log("Scheduling data:", scheduleData);

    try {
        const response = await fetch(`${API_URL}/interviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(scheduleData)
        });
        
        let responseData: any = {};
        const responseText = await response.text();
        console.log("Raw schedule response text:", responseText);

        try {
            if(responseText) responseData = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse schedule response JSON:", e);
            if (response.ok && responseText === "") {  } 
            else { throw new Error(`Could not parse server response. Status: ${response.status}. Body: ${responseText}`); }
        }
        
        if (!response.ok) {
             console.error("Scheduling API error:", responseData);
             throw new Error(responseData.error || responseData.details || `Scheduling failed with status: ${response.status}`);
        }
        
        const peerName = selectedPeerInfo?.name || 'your peer';
        const topicName = selectedTopicInfo?.name || selectedTopic;
        toast({
            title: "Interview Scheduled!",
            description: `Your interview with ${peerName} on "${topicName}" for ${format(scheduledDateTimeUTC, 'PPP p')} (UTC) is confirmed.`,
            variant: "default",
        });
        setDate(new Date());
        setSelectedTime(null); 
        setSelectedPeer(null); 
        setSelectedPeerInfo(null);
        setPeerSearchQuery("");
        setSelectedTopic(null);
        setSelectedTopicInfo(null);
        setTopicSearchQuery("");

        if(date && token) { 
            const fetchSlots = async () => {
                if (!date || !token) {
                     setAvailableSlots([]);
                     return;
                }
                const formattedDate = format(date, 'yyyy-MM-dd');
                try {
                    const res = await fetch(`${API_URL}/availability?date=${formattedDate}`, { headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Failed to fetch slots');
                    setAvailableSlots(data || []);
                } catch (error: any) {
                    setAvailableSlots([]);
                }
            };
            fetchSlots();
        }

    } catch (error: any) {
        console.error("Scheduling submission error:", error);
        toast({ title: "Scheduling Failed", description: error.message || "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const canSubmit = !!date && !!selectedTime && !!selectedPeer && !!selectedTopic && !isSubmitting && !isAuthLoading;

  if (isAuthLoading) {
    return (
        <AppLayout>
             <div className="space-y-8">
                 <Skeleton className="h-10 w-1/3 mb-6" />
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96 rounded-lg" />
                    <Skeleton className="h-96 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                 </div>
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold text-primary flex items-center mb-4 sm:mb-0">
                <CalendarPlus className="mr-3 w-8 h-8 text-accent"/>Schedule an Interview
            </h1>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="shadow-xl border-border hover:shadow-2xl transition-shadow lg:col-span-1">
                <CardHeader className="border-b">
                    <CardTitle className="text-xl font-semibold text-primary flex items-center">
                        <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">1</span>
                        Select Date
                    </CardTitle>
                    <CardDescription>Choose the day for your mock interview.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-3 sm:p-4">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => { setDate(newDate); setSelectedTime(null);}}
                        className="rounded-md border-none shadow-none bg-transparent"
                        disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                     />
                </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-xl border-border hover:shadow-2xl transition-shadow">
                     <CardHeader className="border-b">
                        <CardTitle className="text-xl font-semibold text-primary flex items-center">
                             <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">2</span>
                             Choose Details
                        </CardTitle>
                         <CardDescription>Select your interview peer, topic, and desired time slot.</CardDescription>
                     </CardHeader>
                     <CardContent className="pt-6 space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="peer-search" className="flex items-center text-md font-medium text-foreground"><Users className="w-5 h-5 mr-2 text-accent"/>Select Peer</Label>
                             <Popover open={isPeerPopoverOpen} onOpenChange={setIsPeerPopoverOpen}>
                                <PopoverAnchor asChild>
                                     <div className="relative">
                                         <Input
                                            id="peer-search"
                                            ref={peerInputRef}
                                            type="text"
                                            placeholder={isLoadingInitialPeers ? "Loading peers..." : "Search by name, email, or ID..."}
                                            value={peerSearchQuery}
                                            onChange={handlePeerSearchChange}
                                            onFocus={() => { if (peerSearchQuery.trim() && !selectedPeerInfo) setIsPeerPopoverOpen(true);}}
                                            // Removed onBlur to diagnose input freeze
                                            disabled={isLoadingInitialPeers}
                                            className="bg-background border-input focus:border-primary focus:ring-primary text-base pr-10"
                                            autoComplete="off"
                                        />
                                        {selectedPeerInfo && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    setSelectedPeer(null); setSelectedPeerInfo(null); setPeerSearchQuery(""); setIsPeerPopoverOpen(false); peerInputRef.current?.focus();
                                                }}
                                                title="Clear selection"
                                            ><X className="w-4 h-4" /></Button>
                                        )}
                                        {!selectedPeerInfo && peerSearchQuery && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => { setPeerSearchQuery(""); setPeerSearchResults([]); setIsPeerPopoverOpen(false); peerInputRef.current?.focus();}}
                                                title="Clear search"
                                            ><X className="w-4 h-4" /></Button>
                                        )}
                                     </div>
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    <ScrollArea className="max-h-60">
                                        {isSearchingPeers && <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Searching...</div>}
                                        {!isSearchingPeers && peerSearchQuery.trim() && peerSearchResults.length === 0 && !selectedPeerInfo && <div className="p-4 text-center text-sm text-muted-foreground">No peers found.</div>}
                                        {!isSearchingPeers && peerSearchResults.map(peer => (
                                            <div key={peer.id} className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-colors" onClick={() => handleSelectPeer(peer)}>
                                                <p className="font-medium">{peer.name} <span className="text-muted-foreground">({peer.id})</span></p>
                                                {peer.email && <p className="text-xs text-muted-foreground">{peer.email}</p>}
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </PopoverContent>
                             </Popover>
                             <p className="text-xs text-muted-foreground">{allPeersRef.current.length === 0 && !isLoadingInitialPeers ? "No peers available." : "Find a user to interview or be interviewed by."}</p>
                         </div>

                         <div className="space-y-2">
                             <Label htmlFor="topic-search" className="flex items-center text-md font-medium text-foreground"><BookOpenIcon className="w-5 h-5 mr-2 text-accent"/>Select Topic</Label>
                            {isLoadingTopics || isAuthLoading ? <Skeleton className="h-10 w-full rounded-md" /> : (
                                <Popover open={isTopicPopoverOpen} onOpenChange={setIsTopicPopoverOpen}>
                                    <PopoverAnchor asChild>
                                        <div className="relative">
                                            <Input
                                                id="topic-search"
                                                ref={topicInputRef}
                                                type="text"
                                                placeholder={allTopicsRef.current.length === 0 ? "No topics available" : "Search for a topic..."}
                                                value={topicSearchQuery}
                                                onChange={handleTopicSearchChange}
                                                onFocus={() => { if (topicSearchQuery.trim() && !selectedTopicInfo) setIsTopicPopoverOpen(true); }}
                                                // Removed onBlur to diagnose input freeze
                                                disabled={allTopicsRef.current.length === 0}
                                                className="bg-background border-input focus:border-primary focus:ring-primary text-base pr-10"
                                                autoComplete="off"
                                            />
                                            {selectedTopicInfo && (
                                                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { setSelectedTopic(null); setSelectedTopicInfo(null); setTopicSearchQuery(""); setIsTopicPopoverOpen(false); topicInputRef.current?.focus(); }} title="Clear selection"><X className="w-4 h-4" /></Button>
                                            )}
                                            {!selectedTopicInfo && topicSearchQuery && (
                                                 <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { setTopicSearchQuery(""); setTopicSearchResults([]); setIsTopicPopoverOpen(false); topicInputRef.current?.focus();}} title="Clear search"><X className="w-4 h-4" /></Button>
                                            )}
                                        </div>
                                    </PopoverAnchor>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <ScrollArea className="max-h-60">
                                            {isSearchingTopics && <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Searching...</div>}
                                            {!isSearchingTopics && topicSearchQuery.trim() && topicSearchResults.length === 0 && !selectedTopicInfo && <div className="p-4 text-center text-sm text-muted-foreground">No topics found.</div>}
                                            {!isSearchingTopics && topicSearchResults.map(topic => (
                                                <div key={topic.id} className="p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm transition-colors" onClick={() => handleSelectTopic(topic)}>
                                                    <p className="font-medium">{topic.name}</p>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            )}
                         </div>

                         <div className="space-y-2">
                            <Label className="flex items-center text-md font-medium text-foreground"><Clock className="w-5 h-5 mr-2 text-accent"/>Available Time Slots</Label>
                            <p className="text-xs text-muted-foreground">For {date ? format(date, 'PPP') : 'your chosen date'}. <span className="font-semibold">(Times shown in UTC)</span></p>
                            {isLoadingSlots ? ( <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}</div> ) 
                            : date ? ( availableSlots.length > 0 ? ( <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2"> {availableSlots.map(slot => ( <Button key={slot.time} variant={selectedTime === slot.time ? 'default' : slot.available ? 'outline' : 'secondary'} onClick={() => handleTimeSelect(slot.time, slot.available)} disabled={!slot.available} className={`w-full transition-all duration-150 ease-in-out shadow-sm hover:shadow-md text-sm font-medium ${!slot.available ? 'cursor-not-allowed opacity-60 line-through hover:bg-secondary' : selectedTime === slot.time ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1' : 'hover:bg-accent hover:text-accent-foreground'}`} title={!slot.available ? 'Booked or Past' : `Select ${slot.time} UTC`} > {slot.time} </Button> ))} </div> ) 
                            : ( <Alert variant="default" className="bg-muted/50 mt-2"> <Info className="h-5 w-5 " /> <AlertTitle className="font-semibold">No Slots Available</AlertTitle> <AlertDescription> No time slots found for this date. Please try selecting another day. </AlertDescription> </Alert> ) ) 
                            : ( <p className="text-muted-foreground text-center py-6">Please select a date to view available times.</p> )}
                         </div>
                     </CardContent>
                 </Card>
                 
                 <Card className="shadow-xl border-border hover:shadow-2xl transition-shadow">
                    <CardHeader className="border-b">
                       <CardTitle className="text-xl font-semibold text-primary flex items-center">
                           <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm mr-3">3</span>
                           Confirm & Schedule
                        </CardTitle>
                       <CardDescription>Review your selections before confirming.</CardDescription>
                    </CardHeader>
                     <CardContent className="pt-6 space-y-3 text-sm">
                         {date && selectedTime && selectedPeerInfo && selectedTopicInfo ? (
                             <>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Date:</span> <strong className="text-primary">{format(date, 'PPP')}</strong></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Time (UTC):</span> <strong className="text-primary">{selectedTime}</strong></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Peer:</span> <strong className="text-primary">{selectedPeerInfo.name}</strong></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Topic:</span> <strong className="text-primary">{selectedTopicInfo.name}</strong></div>
                                 <p className="text-xs text-muted-foreground pt-3 border-t mt-4">You are scheduling as: <strong className="text-accent">{activeRole === 'interviewee' ? 'Interviewee' : 'Interviewer'}</strong></p>
                             </>
                         ) : ( <Alert variant="default" className="bg-muted/50"> <Info className="h-4 w-4" /> <AlertTitle className="text-sm font-semibold">Awaiting Selections</AlertTitle> <AlertDescription className="text-xs"> Please complete all selections (Date, Peer, Topic, Time) to proceed. </AlertDescription> </Alert> )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scheduling...</> : <><Send className="w-5 h-5 mr-2"/>Confirm & Schedule</>}
                        </Button>
                    </CardFooter>
                 </Card>
            </div>
         </div>
      </div>
    </AppLayout>
  );
}





// "use client";

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import AppLayout from "@/components/shared/AppLayout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Input } from "@/components/ui/input";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Label } from "@/components/ui/label";
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/providers/AuthProvider';
// import { format } from "date-fns";
// import { Clock, Users, BookOpenIcon, Loader2, CalendarPlus, Info, Search, X, Send } from 'lucide-react'; // Removed CheckCircle as it wasn't used
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { ScrollArea } from '@/components/ui/scroll-area';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// interface AvailableSlot { date: string; time: string; available: boolean; }
// interface Peer { id: string; name: string; email?: string; }
// interface Topic { id: string; name: string; }

// const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
//   let timeoutId: ReturnType<typeof setTimeout>;
//   return (...args: Parameters<F>): void => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => { func(...args); }, delay);
//   };
// };

// export default function SchedulePage() {
//   const [date, setDate] = React.useState<Date | undefined>(new Date());
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
//   const [peerSearchQuery, setPeerSearchQuery] = useState<string>("");
//   const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
//   const [selectedPeerInfo, setSelectedPeerInfo] = useState<Peer | null>(null);
//   const [peerSearchResults, setPeerSearchResults] = useState<Peer[]>([]);
//   const [isSearchingPeers, setIsSearchingPeers] = useState<boolean>(false);
//   const [isPeerPopoverOpen, setIsPeerPopoverOpen] = useState<boolean>(false);
//   const allPeersRef = useRef<Peer[]>([]);
//   const peerInputRef = useRef<HTMLInputElement>(null);

//   const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
//   const [topicSearchQuery, setTopicSearchQuery] = useState<string>("");
//   const [selectedTopicInfo, setSelectedTopicInfo] = useState<Topic | null>(null);
//   const [topicSearchResults, setTopicSearchResults] = useState<Topic[]>([]);
//   const [isSearchingTopics, setIsSearchingTopics] = useState<boolean>(false);
//   const [isTopicPopoverOpen, setIsTopicPopoverOpen] = useState<boolean>(false);
//   const allTopicsRef = useRef<Topic[]>([]);
//   const topicInputRef = useRef<HTMLInputElement>(null);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
//   const [isLoadingSlots, setIsLoadingSlots] = useState(false);
//   const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

//   const { toast } = useToast();
//   const { user, token, activeRole, isLoading: isAuthLoading } = useAuth();
  
//   const theme = {
//     bgMain: "#16181A", bgSurface: "#1F2123", bgSurfaceLighter: "#292C2E",
//     textPrimary: "#F0F2F5", textSecondary: "#A8B2C0", textSecondaryRgb: "168, 178, 192",
//     accentPrimary: "#C9A461", accentPrimaryHover: "#B8914B", 
//     borderColor: "#303438", borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)", destructive: "#E57373", destructiveRgb: "229, 115, 115",
//     success: "#81C784", 
//     warning: "#FFB74D", warningRgb: "255, 183, 77",
//     accentPrimaryRgb: "201, 164, 97", borderPrimaryRgb: "48, 52, 56", // For skeleton
//   };

//  useEffect(() => {
//     const fetchInitialData = async () => {
//       if (!token || !user?.id) { setIsLoadingInitialData(false); return; }
//       setIsLoadingInitialData(true);
//       try {
//         const [peersResponse, topicsResponse] = await Promise.all([
//           fetch(`${API_URL}/users/peers`, { headers: { Authorization: `Bearer ${token}` } }),
//           fetch(`${API_URL}/topics`, { headers: { Authorization: `Bearer ${token}` } })
//         ]);

//         const peersData = await peersResponse.json();
//         if (!peersResponse.ok) throw new Error(peersData.error || 'Failed to fetch peers');
//         allPeersRef.current = Array.isArray(peersData) ? peersData.filter(p => p.id !== user?.id) : [];

//         const topicsData = await topicsResponse.json();
//         if (!topicsResponse.ok) throw new Error(topicsData.error || 'Failed to fetch topics');
//         allTopicsRef.current = Array.isArray(topicsData) ? topicsData : [];

//       } catch (error: any) {
//         toast({ title: "Error Loading Initial Data", description: error.message, variant: "destructive" });
//       } finally { setIsLoadingInitialData(false); }
//     };
//     if (!isAuthLoading) fetchInitialData();
//   }, [token, user?.id, toast, isAuthLoading]);

//   useEffect(() => { 
//     const fetchSlots = async () => { 
//         if (!date || !token) { setIsLoadingSlots(false); setAvailableSlots([]); return; }
//         setIsLoadingSlots(true); setSelectedTime(null);
//         const formattedDate = format(date, 'yyyy-MM-dd');
//         try {
//             const response = await fetch(`${API_URL}/availability?date=${formattedDate}`, { headers: { Authorization: `Bearer ${token}` } });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.error || 'Failed to fetch slots');
//             setAvailableSlots(Array.isArray(data) ? data : []);
//         } catch (error: any) {
//             toast({ title: "Error Loading Slots", description: `Slots for ${formattedDate}: ${error.message}`, variant: "destructive" });
//             setAvailableSlots([]);
//         } finally { setIsLoadingSlots(false); }
//     };
//     if (!isAuthLoading && token && !isLoadingInitialData) fetchSlots();
//   }, [date, token, toast, isAuthLoading, isLoadingInitialData]);

//   const handlePeerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
//       const query = e.target.value; setPeerSearchQuery(query);
//       if (selectedPeerInfo) { setSelectedPeer(null); setSelectedPeerInfo(null); }
//       if (query.trim()) { debouncedPeerSearch(query); setIsPeerPopoverOpen(true); } 
//       else { setPeerSearchResults([]); setIsPeerPopoverOpen(false); }
//   };
//   const debouncedPeerSearch = useCallback(debounce((query: string) => { 
//       const trimmedQuery = query.trim();
//       if (!trimmedQuery) { setPeerSearchResults([]); setIsSearchingPeers(false); setIsPeerPopoverOpen(false); return; }
//       setIsSearchingPeers(true);
//       const filtered = allPeersRef.current.filter(p => p.name.toLowerCase().includes(trimmedQuery.toLowerCase()) || (p.email && p.email.toLowerCase().includes(trimmedQuery.toLowerCase())) || p.id.toLowerCase().includes(trimmedQuery.toLowerCase()));
//       setPeerSearchResults(filtered); setIsSearchingPeers(false); setIsPeerPopoverOpen(true);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, 300), [allPeersRef.current]);

//   const handleSelectPeer = (peer: Peer) => { 
//       setSelectedPeer(peer.id); setSelectedPeerInfo(peer); setPeerSearchQuery(peer.name); 
//       setPeerSearchResults([]); setIsPeerPopoverOpen(false); 
//   };

//   const handleTopicSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
//       const query = e.target.value; setTopicSearchQuery(query);
//       if (selectedTopicInfo) { setSelectedTopic(null); setSelectedTopicInfo(null); }
//       if (query.trim()) { debouncedTopicSearch(query); setIsTopicPopoverOpen(true); }
//       else { setTopicSearchResults([]); setIsTopicPopoverOpen(false); }
//   };
//   const debouncedTopicSearch = useCallback(debounce((query: string) => {
//       const trimmedQuery = query.trim();
//       if (!trimmedQuery) { setTopicSearchResults([]); setIsSearchingTopics(false); setIsTopicPopoverOpen(false); return; }
//       setIsSearchingTopics(true);
//       const filtered = allTopicsRef.current.filter(t => t.name.toLowerCase().includes(trimmedQuery.toLowerCase()));
//       setTopicSearchResults(filtered); setIsSearchingTopics(false); setIsTopicPopoverOpen(true);
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, 300), [allTopicsRef.current]);
//   const handleSelectTopic = (topic: Topic) => {
//       setSelectedTopic(topic.id); setSelectedTopicInfo(topic); setTopicSearchQuery(topic.name);
//       setTopicSearchResults([]); setIsTopicPopoverOpen(false);
//   };

//   const handleTimeSelect = (time: string, isAvailable: boolean) => { 
//       if (isAvailable) setSelectedTime(time);
//       else toast({ title: "Slot Unavailable", description: "This time slot is booked or past.", variant: "destructive"});
//   };

//   const handleSubmit = async () => {
//     if (!date || !selectedTime || !selectedPeer || !selectedTopic || !user || !activeRole || !token) {
//       toast({ title: "Incomplete Information", description: "Please select date, time, peer, and topic.", variant: "destructive" }); return;
//     }
//     setIsSubmitting(true);
//     const [hours, minutes] = selectedTime.split(':').map(Number);
//     const scheduledDateTimeUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
    
//     const scheduleData = {
//       interviewee_id: activeRole === 'interviewee' ? user.id : selectedPeer,
//       interviewer_id: activeRole === 'interviewer' ? user.id : selectedPeer,
//       scheduled_time: scheduledDateTimeUTC.toISOString(),
//       topic: selectedTopicInfo?.name || selectedTopic, 
//     };
//     try {
//         const response = await fetch(`${API_URL}/interviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(scheduleData) });
//         let responseData: any = {}; const responseText = await response.text();
//         try { if(responseText) responseData = JSON.parse(responseText); } catch (e) { if (response.ok && !responseText) {} else { throw new Error(`Could not parse response. Status: ${response.status}. Body: ${responseText}`);} }
//         if (!response.ok) throw new Error(responseData.error || responseData.details || `Scheduling failed`);
        
//         toast({ title: "Interview Scheduled!", description: `With ${selectedPeerInfo?.name} on "${selectedTopicInfo?.name}" for ${format(scheduledDateTimeUTC, 'PPP p')} (UTC).`, variant: "default" });
//         setDate(new Date()); setSelectedTime(null); setSelectedPeer(null); setSelectedPeerInfo(null); setPeerSearchQuery(""); setSelectedTopic(null); setSelectedTopicInfo(null); setTopicSearchQuery("");
//     } catch (error: any) {
//       toast({ title: "Scheduling Failed", description: error.message, variant: "destructive" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const canSubmit = !!date && !!selectedTime && !!selectedPeer && !!selectedTopic && !isSubmitting && !isAuthLoading;

//   if (isAuthLoading || isLoadingInitialData) {
//     return ( 
//         <AppLayout>
//             <div className="space-y-10 p-4 md:p-6 lg:p-8">
//                 <Skeleton className="themed-skeleton h-10 w-2/5 mb-6" /> 
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
//                     <Card className="themed-skeleton-card lg:col-span-1"><Skeleton className="themed-skeleton h-80 w-full" /></Card>
//                     <div className="lg:col-span-2 space-y-8">
//                         <Card className="themed-skeleton-card"><Skeleton className="themed-skeleton h-64 w-full" /></Card>
//                         <Card className="themed-skeleton-card"><Skeleton className="themed-skeleton h-40 w-full" /></Card>
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
//   }

//   return (
//     <>
//       <style jsx global>{`
//         :root {
//           --bg-main: ${theme.bgMain}; --bg-surface: ${theme.bgSurface}; --bg-surface-lighter: ${theme.bgSurfaceLighter};
//           --text-primary: ${theme.textPrimary}; --text-secondary: ${theme.textSecondary}; --text-secondary-rgb: ${theme.textSecondaryRgb};
//           --accent-primary: ${theme.accentPrimary}; --accent-primary-hover: ${theme.accentPrimaryHover};
//           --border-color: ${theme.borderColor}; --border-color-subtle: ${theme.borderColorSubtle};
//           --border-primary-rgb: ${theme.borderPrimaryRgb}; --shadow-color: ${theme.shadowColor};
//           --destructive: ${theme.destructive}; --destructive-rgb: ${theme.destructiveRgb};
//           --success: ${theme.success}; 
//           --warning: ${theme.warning}; --warning-rgb: ${theme.warningRgb};
//           --accent-primary-rgb: ${theme.accentPrimaryRgb};
//         }
//         body { background-color: var(--bg-main); color: var(--text-primary); }
//         @keyframes elegant-fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-item-entry { opacity: 0; animation: elegant-fade-in-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        
//         .premium-button { background-color: var(--accent-primary); color: var(--bg-main); font-weight: 600; border-radius: 0.375rem; padding: 0.75rem 1.5rem; transition: all 0.25s ease; box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08); display: inline-flex; align-items: center; justify-content: center; }
//         .premium-button:hover:not(:disabled) { background-color: var(--accent-primary-hover); transform: translateY(-2px) scale(1.01); box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1); }
//         .premium-button:disabled { opacity: 0.6; cursor: not-allowed; }
                
//         .themed-card { background-color: var(--bg-surface); border: 1px solid var(--border-color-subtle); border-radius: 0.75rem; box-shadow: 0 10px 25px -5px var(--shadow-color), 0 15px 35px -15px var(--shadow-color); transition: transform 0.3s ease, box-shadow 0.3s ease; }
//         .themed-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px -8px var(--shadow-color), 0 25px 50px -20px var(--shadow-color); }
//         .themed-card .card-header { border-bottom: 1px solid var(--border-color); padding: 1rem 1.25rem; margin-bottom: 0; }
//         .themed-card .card-title { color: var(--text-primary); font-size: 1.1rem; /* Slightly smaller */ font-weight: 600; display: flex; align-items: center; gap: 0.6rem; /* Adjusted gap */ }
//         .themed-card .card-title .lucide { color: var(--accent-primary); }
//         .themed-card .card-title .step-indicator { background-color: var(--accent-primary); color: var(--bg-main); border-radius: 50%; height: 1.5rem; width: 1.5rem; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:bold; box-shadow: 0 2px 4px rgba(var(--accent-primary-rgb),0.2); flex-shrink: 0; }
//         .themed-card .card-description { color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.35rem; } /* Adjusted margin */
//         .themed-card .card-content { padding: 1.25rem; } 
//         .themed-card .card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); margin-top: 1rem; }


//         .themed-input { background-color: var(--bg-main) !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important; border-radius: 0.375rem; padding: 0.65rem 0.75rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-size: 0.9rem; line-height: 1.5; }
//         .themed-input.with-prefix-icon { padding-left: 2.5rem !important; /* Adjusted for icon */ }
//         .themed-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
//         .themed-input:focus { border-color: var(--accent-primary) !important; box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2) !important; outline: none !important; }
//         .themed-input:disabled { opacity:0.5; background-color: var(--bg-surface-lighter) !important; cursor:not-allowed;}
//         .form-message-destructive { color: var(--destructive) !important; font-size: 0.8rem; margin-top: 0.35rem; }
//         .themed-label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
//         .themed-label .lucide { color: var(--accent-primary); width: 1.1rem; height: 1.1rem; }
        
//         @keyframes shimmer { 100% {transform: translateX(100%);} }
//         .themed-skeleton { background-color: var(--border-color); position: relative; overflow: hidden; border-radius: 0.25rem; }
//         .themed-skeleton::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(var(--border-primary-rgb), 0.2), transparent); transform: translateX(-100%); animation: shimmer 1.5s infinite; }
//         .themed-skeleton-card { background-color: var(--bg-surface); border: 1px solid var(--border-color-subtle); border-radius: 0.75rem; padding:1.5rem; }

//         /* Themed Alert - Neutral Info/Warning */
//         .themed-alert { background-color: rgba(var(--text-secondary-rgb), 0.05); border: 1px solid var(--border-color); border-left-width: 3px; border-left-color: var(--text-secondary); border-radius: 0.375rem; padding: 0.75rem 1rem; margin-top: 0.5rem; }
//         .themed-alert .alert-title { color: var(--text-primary); font-weight:500; font-size:0.9rem; }
//         .themed-alert .alert-description { color: var(--text-secondary); font-size:0.8rem; }
//         .themed-alert .lucide { color: var(--text-secondary); }
//         .themed-alert.warning { border-left-color: var(--warning); background-color: rgba(var(--warning-rgb), 0.05); }
//         .themed-alert.warning .alert-title, .themed-alert.warning .lucide { color: var(--warning); }
//         .themed-alert.accent-info { /* For "Awaiting Selections" */
//             background-color: rgba(var(--accent-primary-rgb), 0.05); border-left-color: var(--accent-primary);
//         }
//         .themed-alert.accent-info .alert-title, .themed-alert.accent-info .lucide { color: var(--accent-primary); }


//         /* Calendar Theming */
//         .themed-calendar-wrapper { padding: 0.25rem; /* Reduced padding */ }
//         .themed-calendar { width: 100%; font-size: 0.875rem; /* Slightly smaller */ }
//         .themed-calendar .rdp-button_reset.rdp-button:enabled:hover,
//         .themed-calendar .rdp-day:not([disabled]):not(.rdp-day_selected):hover { background-color: var(--bg-surface-lighter) !important; border-radius: 0.375rem; color: var(--text-primary) !important; }
//         .themed-calendar .rdp-day_selected,
//         .themed-calendar .rdp-day_selected:hover,
//         .themed-calendar .rdp-day_selected:focus-visible { background-color: var(--accent-primary) !important; color: var(--bg-main) !important; font-weight: 600; border-radius: 0.375rem; outline: none !important; box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--accent-primary) !important; /* Themed focus ring */ }
//         .themed-calendar .rdp-day_today:not(.rdp-day_selected) { color: var(--accent-primary) !important; font-weight: 500; border: 1px solid var(--accent-primary); border-radius: 0.375rem; }
//         .themed-calendar .rdp-day_disabled { color: var(--text-secondary) !important; opacity: 0.35; text-decoration: none; cursor: not-allowed; }
//         .themed-calendar .rdp-caption_label, .themed-calendar .rdp-head_cell { color: var(--text-primary) !important; font-weight: 500; text-transform:capitalize; }
//         .themed-calendar .rdp-nav_button { color: var(--text-secondary) !important; border-radius: 0.375rem; }
//         .themed-calendar .rdp-nav_button:hover { background-color: var(--bg-surface-lighter) !important; color: var(--accent-primary) !important; }
//         .themed-calendar .rdp-nav_button:focus-visible { outline: 2px solid var(--accent-primary) !important; outline-offset: 1px; background-color: var(--bg-surface-lighter) !important; }
//         .themed-calendar { --rdp-cell-size: 2.2rem; --rdp-accent-color: var(--accent-primary); --rdp-accent-color-fg: var(--bg-main); --rdp-background-color: rgba(var(--accent-primary-rgb), 0.1); --rdp-focused-color: var(--accent-primary); background-color: transparent !important; color: var(--text-primary) !important; border: none !important; margin: 0 auto; }

//         /* Popover Content for Search */
//         .themed-popover-content { background-color: var(--bg-surface) !important; border: 1px solid var(--border-color) !important; box-shadow: 0 8px 20px var(--shadow-color) !important; border-radius: 0.5rem; z-index: 50; }
//         .themed-popover-content .search-result-item { padding: 0.6rem 0.8rem; cursor: pointer; transition: background-color 0.15s ease, color 0.15s ease; border-bottom: 1px solid var(--border-color-subtle); }
//         .themed-popover-content .search-result-item:last-child { border-bottom: none; }
//         .themed-popover-content .search-result-item:hover { background-color: var(--accent-primary) !important; }
//         .themed-popover-content .search-result-item:hover p,
//         .themed-popover-content .search-result-item:hover span { color: var(--bg-main) !important; }
//         .themed-popover-content .search-result-item p:first-child { color: var(--text-primary); font-weight: 500; }
//         .themed-popover-content .search-result-item p:last-child { color: var(--text-secondary); font-size: 0.75rem; }
//         .themed-popover-content .empty-search-text { color: var(--text-secondary); padding: 1rem; text-align: center; font-size: 0.875rem; }
//         .themed-popover-scrollarea > div[data-radix-scroll-area-viewport]::-webkit-scrollbar { width: 6px; }
//         .themed-popover-scrollarea > div[data-radix-scroll-area-viewport]::-webkit-scrollbar-track { background: transparent; }
//         .themed-popover-scrollarea > div[data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 3px; }

//         /* Time Slot Buttons */
//         .time-slot-button {
//             border: 1px solid var(--border-color); background-color: var(--bg-main); color: var(--text-secondary);
//             transition: all 0.15s ease-in-out; font-weight: 500; font-size: 0.8rem; padding: 0.5rem 0.2rem; text-align: center;
//             line-height: 1.2; height: 2.25rem; border-radius: 0.3rem;
//         }
//         .time-slot-button:hover:not(:disabled):not(.selected) { border-color: var(--accent-primary); color: var(--accent-primary); transform: translateY(-1px); box-shadow: 0 1px 3px rgba(var(--accent-primary-rgb), 0.1); }
//         .time-slot-button.selected { background-color: var(--accent-primary); color: var(--bg-main); border-color: var(--accent-primary); font-weight: 600; transform: scale(1.02); box-shadow: 0 3px 6px rgba(var(--accent-primary-rgb), 0.15); }
//         .time-slot-button:disabled { opacity: 0.4; background-color: var(--bg-surface-lighter) !important; border-color: var(--border-color-subtle) !important; text-decoration: none; cursor: not-allowed; }
        
//         .search-input-wrapper .clear-icon { color: var(--text-secondary); transition: color 0.2s ease; }
//         .search-input-wrapper .clear-icon:hover { color: var(--destructive); }

//       `}</style>

//       <AppLayout>
//         <div className="space-y-8 md:space-y-10 p-4 md:p-6 lg:p-8">
//           <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 sm:gap-3" style={{ color: 'var(--text-primary)' }}>
//                 <CalendarPlus className="w-7 h-7 sm:w-8 sm:h-8" style={{color: 'var(--accent-primary)'}}/>Schedule an Interview
//             </h1>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
//             <Card className="themed-card lg:col-span-1 animate-item-entry" style={{animationDelay: '0.2s'}}>
//               <CardHeader className="card-header">
//                 <CardTitle className="card-title">
//                     <span className="step-indicator">1</span>Select Date
//                 </CardTitle>
//                 <CardDescription className="card-description">Choose the day for your mock interview.</CardDescription>
//               </CardHeader>
//               <CardContent className="flex justify-center themed-calendar-wrapper">
//                 <Calendar
//                   mode="single" selected={date} onSelect={(newDate) => { setDate(newDate); setSelectedTime(null);}}
//                   className="themed-calendar"
//                   disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() -1))}
//                 />
//               </CardContent>
//             </Card>

//             <div className="lg:col-span-2 space-y-6 md:space-y-8">
//               <Card className="themed-card animate-item-entry" style={{animationDelay: '0.3s'}}>
//                 <CardHeader className="card-header">
//                   <CardTitle className="card-title">
//                     <span className="step-indicator">2</span>Choose Details
//                   </CardTitle>
//                   <CardDescription className="card-description">Select peer, topic, and desired time slot.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="pt-5 space-y-5">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="peer-search" className="themed-label"><Users />Select Peer</Label>
//                     <Popover open={isPeerPopoverOpen} onOpenChange={setIsPeerPopoverOpen}>
//                         <PopoverTrigger asChild>
//                              <div className="relative search-input-wrapper">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{color: 'var(--text-secondary)', opacity:0.7}}/>
//                                 <Input id="peer-search" ref={peerInputRef} type="text"
//                                     placeholder={isLoadingInitialData ? "Loading peers..." : (allPeersRef.current.length === 0 ? "No peers available" : "Search by name, email, or ID...")}
//                                     value={peerSearchQuery} onChange={handlePeerSearchChange}
//                                     onFocus={() => { if (peerSearchQuery.trim() || peerSearchResults.length > 0) setIsPeerPopoverOpen(true);}}
//                                     disabled={isLoadingInitialData || allPeersRef.current.length === 0}
//                                     className="themed-input with-prefix-icon pr-10" autoComplete="off"
//                                 />
//                                 {(selectedPeerInfo || (peerSearchQuery && !isSearchingPeers)) && (
//                                     <Button variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
//                                         onClick={() => { setSelectedPeer(null); setSelectedPeerInfo(null); setPeerSearchQuery(""); setPeerSearchResults([]); setIsPeerPopoverOpen(false); peerInputRef.current?.focus();}}
//                                         title={selectedPeerInfo ? "Clear selection" : "Clear search"}
//                                     ><X className="w-4 h-4 clear-icon" /></Button>
//                                 )}
//                                 {isSearchingPeers && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{color: 'var(--accent-primary)'}} />}
//                             </div>
//                         </PopoverTrigger>
//                         <PopoverContent className="themed-popover-content w-[--radix-popover-trigger-width] p-0" align="start" sideOffset={5} onOpenAutoFocus={(e) => e.preventDefault()}>
//                             <ScrollArea className="max-h-56 themed-popover-scrollarea">
//                                 {!isSearchingPeers && peerSearchResults.length === 0 && peerSearchQuery.trim() && <div className="themed-popover-content empty-search-text">No peers found for &quot;{peerSearchQuery}&quot;.</div>}
//                                 {peerSearchResults.map(peer => (
//                                     <div key={peer.id} className="search-result-item" onClick={() => handleSelectPeer(peer)}>
//                                         <p>{peer.name}</p>
//                                         <p>{peer.email || `ID: ${peer.id}`}</p>
//                                     </div>
//                                 ))}
//                                  {allPeersRef.current.length > 0 && !peerSearchQuery.trim() && peerSearchResults.length === 0 && <div className="themed-popover-content empty-search-text">Start typing to search for peers.</div>}
//                             </ScrollArea>
//                         </PopoverContent>
//                     </Popover>
//                     <p className="text-xs" style={{color: 'var(--text-secondary)', opacity:0.7, marginTop: '0.25rem'}}>{allPeersRef.current.length === 0 && !isLoadingInitialData ? "No peers available to schedule with." : "Find a user for the interview."}</p>
//                   </div>

//                   <div className="space-y-1.5">
//                     <Label htmlFor="topic-search" className="themed-label"><BookOpenIcon />Select Topic</Label>
//                      <Popover open={isTopicPopoverOpen} onOpenChange={setIsTopicPopoverOpen}>
//                         <PopoverTrigger asChild>
//                             <div className="relative search-input-wrapper">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{color: 'var(--text-secondary)', opacity:0.7}}/>
//                                 <Input id="topic-search" ref={topicInputRef} type="text"
//                                     placeholder={isLoadingInitialData ? "Loading topics..." : (allTopicsRef.current.length === 0 ? "No topics available" : "Search for a topic...")}
//                                     value={topicSearchQuery} onChange={handleTopicSearchChange}
//                                     onFocus={() => { if (topicSearchQuery.trim() || topicSearchResults.length > 0) setIsTopicPopoverOpen(true); }}
//                                     disabled={isLoadingInitialData || allTopicsRef.current.length === 0}
//                                     className="themed-input with-prefix-icon pr-10" autoComplete="off"
//                                 />
//                                 {(selectedTopicInfo || (topicSearchQuery && !isSearchingTopics)) && (
//                                     <Button variant="ghost" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
//                                         onClick={() => { setSelectedTopic(null); setSelectedTopicInfo(null); setTopicSearchQuery(""); setTopicSearchResults([]); setIsTopicPopoverOpen(false); topicInputRef.current?.focus();}}
//                                         title={selectedTopicInfo ? "Clear selection" : "Clear search"}
//                                     ><X className="w-4 h-4 clear-icon" /></Button>
//                                 )}
//                                 {isSearchingTopics && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{color: 'var(--accent-primary)'}} />}
//                             </div>
//                         </PopoverTrigger>
//                         <PopoverContent className="themed-popover-content w-[--radix-popover-trigger-width] p-0" align="start" sideOffset={5} onOpenAutoFocus={(e) => e.preventDefault()}>
//                             <ScrollArea className="max-h-56 themed-popover-scrollarea">
//                                 {!isSearchingTopics && topicSearchResults.length === 0 && topicSearchQuery.trim() && <div className="themed-popover-content empty-search-text">No topics found.</div>}
//                                 {topicSearchResults.map(topic => (
//                                     <div key={topic.id} className="search-result-item" onClick={() => handleSelectTopic(topic)}><p>{topic.name}</p></div>
//                                 ))}
//                                 {allTopicsRef.current.length > 0 && !topicSearchQuery.trim() && topicSearchResults.length === 0 &&<div className="themed-popover-content empty-search-text">Start typing to search for topics.</div>}
//                             </ScrollArea>
//                         </PopoverContent>
//                     </Popover>
//                   </div>
                  
//                   <div className="space-y-1.5">
//                     <Label className="themed-label"><Clock />Available Time Slots (UTC)</Label>
//                     <p className="text-xs" style={{color: 'var(--text-secondary)', opacity:0.7}}>For {date ? format(date, 'PPP') : 'selected date'}.</p>
//                     {isLoadingSlots ? ( <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 pt-1">{[...Array(8)].map((_, i) => <Skeleton key={i} className="themed-skeleton h-9 w-full rounded-md" />)}</div> ) 
//                     : date ? ( availableSlots.length > 0 ? ( <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 pt-1"> {availableSlots.map(slot => ( <Button key={slot.time} variant="outline" onClick={() => handleTimeSelect(slot.time, slot.available)} disabled={!slot.available} className={`time-slot-button ${selectedTime === slot.time ? 'selected' : ''}`} title={!slot.available ? 'Booked or Past' : `Select ${slot.time} UTC`} > {slot.time} </Button> ))} </div> ) 
//                     : ( <Alert className="themed-alert warning"> <Info className="lucide" /> <AlertTitle>No Slots Available</AlertTitle> <AlertDescription>No times found for this date. Try another day.</AlertDescription> </Alert> ) ) 
//                     : ( <p className="text-sm text-center py-4" style={{color: 'var(--text-secondary)'}}>Please select a date to view available times.</p> )}
//                   </div>
//                 </CardContent>
//               </Card>
              
//               <Card className="themed-card animate-item-entry" style={{animationDelay: '0.4s'}}>
//                 <CardHeader className="card-header">
//                   <CardTitle className="card-title">
//                     <span className="step-indicator">3</span>Confirm & Schedule
//                   </CardTitle>
//                   <CardDescription className="card-description">Review selections before confirming.</CardDescription>
//                 </CardHeader>
//                 <CardContent className="pt-5 space-y-2.5 text-sm">
//                   {date && selectedTime && selectedPeerInfo && selectedTopicInfo ? (
//                     <>
//                       <div className="flex justify-between items-center py-1"><span style={{color:'var(--text-secondary)'}}>Date:</span> <strong style={{color:'var(--text-primary)'}}>{format(date, 'PPP')}</strong></div>
//                       <div className="flex justify-between items-center py-1"><span style={{color:'var(--text-secondary)'}}>Time (UTC):</span> <strong style={{color:'var(--text-primary)'}}>{selectedTime}</strong></div>
//                       <div className="flex justify-between items-center py-1"><span style={{color:'var(--text-secondary)'}}>Peer:</span> <strong style={{color:'var(--text-primary)'}}>{selectedPeerInfo.name}</strong></div>
//                       <div className="flex justify-between items-center py-1"><span style={{color:'var(--text-secondary)'}}>Topic:</span> <strong style={{color:'var(--text-primary)'}}>{selectedTopicInfo.name}</strong></div>
//                       <p className="text-xs pt-2.5 border-t mt-2.5" style={{color:'var(--text-secondary)', borderColor: 'var(--border-color)'}}>Scheduling as: <strong style={{color:'var(--accent-primary)'}}>{activeRole === 'interviewee' ? 'Interviewee' : 'Interviewer'}</strong></p>
//                     </>
//                   ) : ( <Alert className="themed-alert accent-info"> <Info className="lucide" /> <AlertTitle className="font-semibold text-sm">Awaiting Selections</AlertTitle> <AlertDescription className="text-xs">Please complete all selections to proceed.</AlertDescription> </Alert> )}
//                 </CardContent>
//                 <CardFooter className="pt-5">
//                   <Button onClick={handleSubmit} disabled={!canSubmit} className="premium-button w-full text-base py-2.5">
//                     {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scheduling...</> : <><Send className="w-4 h-4 mr-2"/>Confirm & Schedule</>}
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </AppLayout>
//     </>
//   );
// }