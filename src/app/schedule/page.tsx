
"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Clock, Users, Book, Send, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// Define API URL (consider moving to environment variables)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// --- Interfaces for fetched data ---
interface AvailableSlot {
    date: string; // YYYY-MM-DD format
    time: string; // HH:mm format (24-hour) - Assume UTC from backend for consistency
    available: boolean;
}

interface Peer {
    id: string;
    name: string;
}

interface Topic {
    id: string; // Use ID if backend provides it
    name: string;
}


export default function SchedulePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null); // Store Peer ID
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null); // Store Topic Name/ID
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for fetched data
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Loading states
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isLoadingPeers, setIsLoadingPeers] = useState(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const { toast } = useToast();
  const { user, token, activeRole, isLoading: isAuthLoading } = useAuth();


   // --- Data Fetching Effects ---
   useEffect(() => {
    // Fetch Peers
    const fetchPeers = async () => {
        if (!token || !user?.id) return; // Wait for token and user ID
        setIsLoadingPeers(true);
        try {
            const response = await fetch(`${API_URL}/users/peers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch peers');

            setPeers(data || []); // Ensure data is array
        } catch (error: any) {
            toast({ title: "Error", description: `Could not load peers: ${error.message}`, variant: "destructive" });
            setPeers([]);
        } finally {
            setIsLoadingPeers(false);
        }
    };

     // Fetch Topics
     const fetchTopics = async () => {
        if (!token) return; // Wait for token
        setIsLoadingTopics(true);
        try {
            const response = await fetch(`${API_URL}/topics`, { // Use the /topics endpoint
                headers: { Authorization: `Bearer ${token}` },
            });
             const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch topics');

            setTopics(data || []); // Ensure data is array
        } catch (error: any) {
            toast({ title: "Error", description: `Could not load topics: ${error.message}`, variant: "destructive" });
            setTopics([]);
        } finally {
            setIsLoadingTopics(false);
        }
    };

    if (!isAuthLoading) { // Fetch only when auth has loaded
        fetchPeers();
        fetchTopics();
    }
   }, [token, toast, isAuthLoading, user?.id]);

    useEffect(() => {
        // Fetch Available Slots when date changes
        const fetchSlots = async () => {
            if (!date || !token) {
                 setIsLoadingSlots(false);
                 setAvailableSlots([]);
                 return;
            }
            setIsLoadingSlots(true);
            setSelectedTime(null); // Reset selected time when date changes
            const formattedDate = format(date, 'yyyy-MM-dd');
            try {
                const response = await fetch(`${API_URL}/availability?date=${formattedDate}`, { // Use /availability endpoint
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch slots');

                setAvailableSlots(data || []); // Ensure data is array
            } catch (error: any) {
                toast({ title: "Error", description: `Could not load time slots for ${formattedDate}: ${error.message}`, variant: "destructive" });
                setAvailableSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        if (!isAuthLoading) { // Fetch only when auth has loaded
            fetchSlots();
        }
    }, [date, token, toast, isAuthLoading]);
   // --- End Data Fetching ---

  const handleTimeSelect = (time: string, isAvailable: boolean) => {
      if (isAvailable) {
          setSelectedTime(time);
      } else {
          toast({ title: "Slot Unavailable", description: "This time slot is not available.", variant: "destructive"});
      }
  };

  const handleSubmit = async () => {
    if (!date || !selectedTime || !selectedPeer || !selectedTopic || !user || !activeRole || !token) {
      toast({ title: "Incomplete Information", description: "Please select a date, time, peer, and topic.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Combine date and time, ensuring it's treated as UTC for the backend
    const scheduledDateTimeUTC = new Date(`${format(date, 'yyyy-MM-dd')}T${selectedTime}:00.000Z`);

    const scheduleData = {
      interviewee_id: activeRole === 'interviewee' ? user.id : selectedPeer,
      interviewer_id: activeRole === 'interviewer' ? user.id : selectedPeer,
      scheduled_time: scheduledDateTimeUTC.toISOString(), // Send as ISO 8601 UTC string
      topic: selectedTopic, // Send the selected topic name/ID
    };

    console.log("Attempting to schedule interview with data:", JSON.stringify(scheduleData));

    try {
        const response = await fetch(`${API_URL}/interviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(scheduleData)
        });

        // Handle potential non-JSON responses, especially for errors
        let responseData = {};
        let responseText = "";
        try {
            responseText = await response.text();
             if (responseText) {
                 responseData = JSON.parse(responseText);
             }
        } catch (jsonError) {
            console.error("Failed to parse response as JSON. Raw text:", responseText);
            // If it failed to parse but the status was not OK, we use the text as the error
            if (!response.ok) {
                 throw new Error(`Scheduling failed with status ${response.status}. Server response: ${responseText || "Empty"}`);
            }
            // If it failed to parse but status was OK, it's weird, log warning
            console.warn("Received OK status but failed to parse JSON response.");
        }

        console.log(`Backend response status: ${response.status}`);
        console.log("Backend response data (parsed):", responseData);


        if (!response.ok) {
            // Use the parsed error message if available, otherwise use status/text
            const errorMsg = (responseData as any)?.error || `Scheduling failed with status: ${response.status}`;
            const errorDetails = (responseData as any)?.details;
            console.error(`Scheduling failed: ${errorMsg}`, errorDetails ? `Details: ${errorDetails}` : '');
            throw new Error(`${errorMsg}${errorDetails ? ` (${errorDetails})` : ''}`);
        }

        // If response is OK
        const newInterview = responseData as any; // Cast to any to access potential ID

        // Check if the response actually contained the expected data (e.g., an ID)
        if (!newInterview || !newInterview.id) {
            console.warn("Received successful response but missing expected data (e.g., interview ID). Response:", newInterview);
            toast({
                title: "Interview Scheduled (Confirmation Pending)",
                description: `Request sent successfully. Please check your dashboard for confirmation.`,
                variant: "default"
            });
        } else {
             const peerName = peers.find(p => p.id === selectedPeer)?.name || 'peer';
             const formattedDate = format(scheduledDateTimeUTC, 'PPP p'); // Format for display
            toast({
                title: "Interview Scheduled Successfully!",
                description: `Interview with ${peerName} on topic "${selectedTopic}" scheduled for ${formattedDate} (UTC).`,
            });
        }


        // Reset form state
        setDate(new Date());
        setSelectedTime(null);
        setSelectedPeer(null);
        setSelectedTopic(null);

        // Optionally, refetch slots for the current date to show the newly booked slot
        const fetchSlotsAgain = async () => {
             if (!date || !token) return;
             setIsLoadingSlots(true);
             const formattedDate = format(date, 'yyyy-MM-dd');
             try {
                 const res = await fetch(`${API_URL}/availability?date=${formattedDate}`, { headers: { Authorization: `Bearer ${token}` } });
                 const d = await res.json();
                 if (res.ok) setAvailableSlots(d || []); else setAvailableSlots([]);
             } catch { setAvailableSlots([]); }
             finally { setIsLoadingSlots(false); }
         };
         fetchSlotsAgain();

    } catch (error: any) {
        console.error("Scheduling Error caught in handleSubmit:", error);
        // Provide a user-friendly error message from the caught error
        toast({ title: "Scheduling Failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };


  // Determine if the schedule button should be enabled
  const canSubmit = !!date && !!selectedTime && !!selectedPeer && !!selectedTopic && !isSubmitting && !isAuthLoading;


  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Schedule an Interview</h1>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Calendar and Peers/Topics */}
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                         <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                         />
                    </CardContent>
                 </Card>

                 <Card>
                     <CardHeader>
                         <CardTitle>Select Peer & Topic</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Peer Selection */}
                         <div>
                            <Label htmlFor="peer-select" className="flex items-center mb-1"><Users className="w-4 h-4 mr-2"/>Select Peer</Label>
                            {isLoadingPeers || isAuthLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Select onValueChange={setSelectedPeer} value={selectedPeer ?? ""} disabled={peers.length === 0}>
                                    <SelectTrigger id="peer-select">
                                        <SelectValue placeholder={peers.length === 0 ? "No peers available" : "Choose a peer..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {peers.map(peer => (
                                            <SelectItem key={peer.id} value={peer.id}>{peer.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                         </div>
                         {/* Topic Selection */}
                         <div>
                             <Label htmlFor="topic-select" className="flex items-center mb-1"><Book className="w-4 h-4 mr-2"/>Select Topic</Label>
                            {isLoadingTopics || isAuthLoading ? (
                                 <Skeleton className="h-10 w-full" />
                            ) : (
                                 <Select onValueChange={setSelectedTopic} value={selectedTopic ?? ""} disabled={topics.length === 0}>
                                    <SelectTrigger id="topic-select">
                                        <SelectValue placeholder={topics.length === 0 ? "No topics available" : "Choose a topic..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics.map(topic => (
                                            // Use topic.name as value if it's unique enough, or topic.id if available/needed
                                            <SelectItem key={topic.id || topic.name} value={topic.name}>{topic.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                         </div>
                     </CardContent>
                 </Card>
            </div>

            {/* Column 2: Time Slots and Confirmation */}
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Clock className="w-5 h-5 mr-2"/>Available Time Slots</CardTitle>
                        <CardDescription>
                            Select an available time for {date ? format(date, 'PPP') : 'the selected date'}. Times shown are in UTC.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {isLoadingSlots ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                            </div>
                         ) : date ? (
                            availableSlots.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {availableSlots.map(slot => (
                                    <Button
                                        key={slot.time}
                                        variant={selectedTime === slot.time ? 'default' : slot.available ? 'outline' : 'secondary'}
                                        onClick={() => handleTimeSelect(slot.time, slot.available)}
                                        disabled={!slot.available}
                                        className={`w-full ${!slot.available ? 'cursor-not-allowed opacity-50 line-through' : ''}`} // Add line-through for booked
                                        title={!slot.available ? 'Time slot unavailable' : `Select ${slot.time} UTC`}
                                    >
                                        {slot.time}
                                        {/* {!slot.available && <span className="ml-1 text-xs">(Booked)</span>} */}
                                    </Button>
                                ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No available slots found for this date. Please select another date.</p>
                            )
                         ) : (
                             <p className="text-muted-foreground text-center py-4">Please select a date to see available times.</p>
                         )}
                    </CardContent>
                 </Card>

                 {/* Confirmation and Submit Section */}
                 <Card>
                    <CardHeader>
                       <CardTitle>Confirm & Schedule</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3 text-sm">
                         {date && selectedTime && selectedPeer && selectedTopic ? (
                             <>
                                 <p><strong>Date:</strong> {format(date, 'PPP')}</p>
                                 <p><strong>Time (UTC):</strong> {selectedTime}</p>
                                 <p><strong>Peer:</strong> {peers.find(p => p.id === selectedPeer)?.name || '...'}</p>
                                 <p><strong>Topic:</strong> {selectedTopic}</p>
                                 <p className="text-xs text-muted-foreground mt-2">
                                    You are scheduling as: <strong>{activeRole === 'interviewee' ? 'Interviewee' : 'Interviewer'}</strong>
                                 </p>
                             </>
                         ) : (
                            <p className="text-muted-foreground italic">Please complete all selections above.</p>
                         )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full sm:w-auto">
                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...</> : <><Send className="w-4 h-4 mr-2"/>Schedule Interview</>}
                        </Button>
                    </CardFooter>
                 </Card>
            </div>
         </div>
      </div>
    </AppLayout>
  );
}
