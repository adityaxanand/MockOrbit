
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppLayout from "@/components/shared/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // FormLabel is preferred
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
import { BrainCircuit, ListChecks, Loader2, AlertTriangle, Wand2, Info } from 'lucide-react'; // Changed icons
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

interface GeneratedQuestion {
    questionText: string;
}
type GenerateInterviewQuestionsOutput = GeneratedQuestion[];

const questionGeneratorSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(100, {message: "Topic too long."}),
  difficulty: z.enum(["Easy", "Medium", "Hard"], { required_error: "Please select a difficulty level." }),
});

type QuestionGeneratorFormValues = z.infer<typeof questionGeneratorSchema>;

export default function QuestionGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateInterviewQuestionsOutput>([]);
  const { toast } = useToast();
  const [isBackendImplemented, setIsBackendImplemented] = useState(false); // Set true to test backend call

  const form = useForm<QuestionGeneratorFormValues>({
    resolver: zodResolver(questionGeneratorSchema),
    defaultValues: { topic: "", difficulty: undefined },
  });

  async function onSubmit(values: QuestionGeneratorFormValues) {
    if (!isBackendImplemented) {
         toast({
            title: "Feature In Development",
            description: "The AI question generation backend is currently under construction. Using mock data for now.",
            variant: "default", // Use default or a warning variant
         });
        // Proceed with mock data for UI demonstration
        setIsLoading(true);
        setGeneratedQuestions([]);
        await new Promise(res => setTimeout(res, 1200)); // Simulate delay
        const mockQuestions: GenerateInterviewQuestionsOutput = [
            { questionText: `Explain the core concepts of ${values.topic}. (Difficulty: ${values.difficulty})`},
            { questionText: `Describe a challenging scenario involving ${values.topic} and how you would approach it.`},
            { questionText: `Compare and contrast [Technique A] and [Technique B] within ${values.topic}.`},
            { questionText: `What are some common pitfalls when working with ${values.topic}?`},
            { questionText: `How would you optimize performance for an application using ${values.topic}?`},
        ];
        setGeneratedQuestions(mockQuestions);
        setIsLoading(false);
        return;
     }

    // Actual backend call logic (when isBackendImplemented is true)
    setIsLoading(true);
    setGeneratedQuestions([]);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_URL}/ai/generate-questions`, { // Example endpoint
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', /* 'Authorization': `Bearer ${token}` */ },
      //   body: JSON.stringify(values),
      // });
      // const questions = await response.json();
      // if (!response.ok) throw new Error(questions.error || "Failed to generate questions from backend");
      
      // MOCK for now, replace above
      await new Promise(res => setTimeout(res, 1500));
      const questions: GenerateInterviewQuestionsOutput = [ { questionText: `Backend Question for ${values.topic}` } ];
      // END MOCK

      if (!questions || questions.length === 0) {
          toast({ title: "No Questions Generated", description: "The AI couldn't find questions for this. Try a different topic or difficulty.", variant: "destructive" });
      } else {
         setGeneratedQuestions(questions);
         toast({ title: "Questions Generated!", description: `Successfully generated ${questions.length} questions.`, variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary flex items-center">
            <BrainCircuit className="mr-3 w-9 h-9 text-accent"/> AI Question Generator
        </h1>

        {!isBackendImplemented && (
             <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700">
                 <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                 <AlertTitle className="font-semibold text-yellow-700 dark:text-yellow-300">Developer Note</AlertTitle>
                 <AlertDescription className="text-sm text-yellow-600 dark:text-yellow-500">
                     The backend for AI question generation is not yet implemented. This page currently uses mock data for UI demonstration purposes.
                 </AlertDescription>
             </Alert>
        )}

        <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
            <CardHeader>
                <CardTitle className="text-xl">Generate Custom Interview Questions</CardTitle>
                <CardDescription className="text-muted-foreground">Enter a topic and select a difficulty level to get AI-generated practice questions tailored to your needs.</CardDescription>
            </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                   control={form.control}
                   name="topic"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-foreground font-medium">Interview Topic</FormLabel>
                       <FormControl>
                         <Input 
                            placeholder="e.g., System Design, React Hooks, Python Data Structures" 
                            {...field} 
                            className="bg-background border-input focus:border-primary focus:ring-primary"
                          />
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
                        <FormLabel className="text-foreground font-medium">Difficulty Level</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-background border-input focus:border-primary focus:ring-primary">
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
                 <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all w-full sm:w-auto" 
                    disabled={isLoading}
                  >
                   {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Questions...</> : <><Wand2 className="mr-2 h-5 w-5"/>Generate Questions</>}
                 </Button>
               </form>
             </Form>
           </CardContent>
        </Card>

        {(isLoading || generatedQuestions.length > 0) && (
            <Card className="shadow-lg border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><ListChecks className="mr-3 h-6 w-6 text-accent"/> Generated Questions</CardTitle>
                    <CardDescription className="text-muted-foreground">Here are the questions generated by the AI based on your input.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                 <div key={i} className="flex items-start space-x-3 p-2">
                                     <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                                     <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-4 w-4/5" />
                                        <Skeleton className="h-4 w-3/5" />
                                     </div>
                                 </div>
                            ))}
                             <p className="text-sm text-muted-foreground text-center pt-2">AI is thinking... please wait.</p>
                        </div>
                    ) : (
                        generatedQuestions.length > 0 ? (
                            <ul className="space-y-4">
                                {generatedQuestions.map((q, index) => (
                                    <li key={index} className="p-3 border rounded-md bg-secondary/30 hover:bg-secondary/60 transition-colors">
                                        <p className="text-md text-foreground">{q.questionText}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-blue-700 dark:text-blue-300">No Questions Yet</AlertTitle>
                                <AlertDescription className="text-blue-600 dark:text-blue-400">
                                  The AI finished, but no questions were generated for your specific criteria. Try adjusting the topic or difficulty.
                                </AlertDescription>
                            </Alert>
                        )
                    )}
                </CardContent>
                 {generatedQuestions.length > 0 && !isLoading && (
                    <CardFooter className="pt-4">
                        <p className="text-xs text-muted-foreground">
                            These questions are AI-generated. Use them as a starting point for your practice.
                        </p>
                    </CardFooter>
                 )}
            </Card>
        )}
      </div>
    </AppLayout>
  );
}
