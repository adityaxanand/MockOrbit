
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, List, Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { Skeleton } from '@/components/ui/skeleton';
// Removed import { generateInterviewQuestions, GenerateInterviewQuestionsOutput } from '@/ai/flows/generate-interview-questions';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Output type expected from backend (adjust if needed)
interface GeneratedQuestion {
    questionText: string;
}
type GenerateInterviewQuestionsOutput = GeneratedQuestion[];


const questionGeneratorSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], { required_error: "Please select a difficulty level." }),
});

type QuestionGeneratorFormValues = z.infer<typeof questionGeneratorSchema>;

export default function QuestionGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateInterviewQuestionsOutput>([]);
  const { toast } = useToast();
  const [isBackendImplemented, setIsBackendImplemented] = useState(false); // Track if backend is ready

  const form = useForm<QuestionGeneratorFormValues>({
    resolver: zodResolver(questionGeneratorSchema),
    defaultValues: {
      topic: "",
      difficulty: undefined,
    },
  });

  async function onSubmit(values: QuestionGeneratorFormValues) {
    if (!isBackendImplemented) {
         toast({
            title: "Feature Not Available",
            description: "The backend endpoint for AI question generation is not yet implemented.",
            variant: "destructive",
         });
         return;
     }

    setIsLoading(true);
    setGeneratedQuestions([]); // Clear previous questions
    try {
      // TODO: Replace with actual API call to the backend endpoint when implemented
      // Example structure:
      // const response = await fetch(`${API_URL}/generate-questions`, { // Assuming endpoint like /generate-questions
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // 'Authorization': `Bearer ${token}` // If protected
      //   },
      //   body: JSON.stringify(values),
      // });
      // const questions = await response.json();
      // if (!response.ok) {
      //   throw new Error(questions.error || "Failed to generate questions");
      // }

      // --- MOCK RESPONSE ---
      await new Promise(res => setTimeout(res, 1500)); // Simulate delay
      const questions: GenerateInterviewQuestionsOutput = [
         { questionText: `Explain ${values.topic} (Difficulty: ${values.difficulty}) - Mock Question 1`},
         { questionText: `How would you approach [Scenario related to ${values.topic}]? - Mock Question 2`},
         { questionText: `What are the pros and cons of [Technique related to ${values.topic}]? - Mock Question 3`},
      ];
       // --- END MOCK RESPONSE ---

      if (!questions || questions.length === 0) {
          toast({
            title: "No Questions Generated",
            description: "The AI couldn't generate questions for this topic/difficulty. Try adjusting your input.",
            variant: "destructive",
          });
      } else {
         setGeneratedQuestions(questions);
         toast({
            title: "Questions Generated (Mock)",
            description: `Successfully generated ${questions.length} questions.`,
         });
      }

    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred while generating questions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center"><BrainCircuit className="mr-3 w-8 h-8"/> AI Question Generator</h1>

        {!isBackendImplemented && (
             <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30">
                 <CardHeader className="flex-row items-center gap-3 space-y-0">
                     <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                     <CardTitle className="text-yellow-700 dark:text-yellow-300 text-lg">Backend Not Implemented</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-sm text-yellow-600 dark:text-yellow-400">
                         The backend functionality for generating AI questions needs to be implemented.
                         The "Generate Questions" button currently uses mock data for demonstration.
                     </p>
                 </CardContent>
             </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Generate Interview Questions</CardTitle>
                <CardDescription>Enter a topic and difficulty level to get AI-generated practice questions.</CardDescription>
            </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                   control={form.control}
                   name="topic"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Interview Topic</FormLabel>
                       <FormControl>
                         <Input placeholder="e.g., React State Management, REST API Design, Go Channels" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="difficulty"
                   render={({ field }) => (
                     <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={isLoading}>
                   {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Questions"}
                 </Button>
               </form>
             </Form>
           </CardContent>
        </Card>

        {/* Display Generated Questions */}
        {(isLoading || generatedQuestions.length > 0) && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><List className="mr-2 h-5 w-5"/> Generated Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/><span className="text-muted-foreground">Generating questions...</span></div>
                            {/* Skeletons for questions */}
                            {[...Array(3)].map((_, i) => (
                                 <div key={i} className="space-y-2 pl-7 pt-2">
                                     <Skeleton className="h-4 w-3/4" />
                                     <Skeleton className="h-4 w-1/2" />
                                 </div>
                            ))}
                        </div>
                    ) : (
                        generatedQuestions.length > 0 ? (
                            <ul className="space-y-3 list-decimal list-inside">
                                {generatedQuestions.map((q, index) => (
                                    <li key={index} className="text-sm">{q.questionText}</li>
                                ))}
                            </ul>
                        ) : null /* Should not happen if isLoading is false and length is 0 here */
                    )}
                </CardContent>
            </Card>
        )}

      </div>
    </AppLayout>
  );
}
