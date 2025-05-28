
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





// "use client";

// import { useState, useEffect } from 'react';
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import AppLayout from "@/components/shared/AppLayout";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useToast } from "@/hooks/use-toast";
// import { BrainCircuit, ListChecks, Loader2, AlertTriangle, Wand2, Info, FileText } from 'lucide-react'; // Added FileText for topic
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// interface GeneratedQuestion {
//   questionText: string;
// }
// type GenerateInterviewQuestionsOutput = GeneratedQuestion[];

// const questionGeneratorSchema = z.object({
//   topic: z.string().min(3, { message: "Topic must be at least 3 characters." }).max(100, {message: "Topic too long."}),
//   difficulty: z.enum(["Easy", "Medium", "Hard"], { required_error: "Please select a difficulty level." }),
// });

// type QuestionGeneratorFormValues = z.infer<typeof questionGeneratorSchema>;

// export default function QuestionGeneratorPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [generatedQuestions, setGeneratedQuestions] = useState<GenerateInterviewQuestionsOutput>([]);
//   const { toast } = useToast();
//   const [isBackendImplemented, setIsBackendImplemented] = useState(false); // Keep this for your dev toggle

//   const theme = { /* Consistent theme variables */
//     bgMain: "#16181A", bgSurface: "#1F2123", bgSurfaceLighter: "#292C2E",
//     textPrimary: "#F0F2F5", textSecondary: "#A8B2C0", textSecondaryRgb: "168, 178, 192",
//     accentPrimary: "#C9A461", accentPrimaryHover: "#B8914B", 
//     borderColor: "#303438", borderColorSubtle: "#2A2D30",
//     shadowColor: "rgba(0, 0, 0, 0.4)", destructive: "#E57373", destructiveRgb: "229, 115, 115",
//     success: "#81C784", 
//     warning: "#FFB74D", warningRgb: "255, 183, 77", // For Developer Note
//     accentPrimaryRgb: "201, 164, 97", borderPrimaryRgb: "48, 52, 56",
//   };

//   const form = useForm<QuestionGeneratorFormValues>({
//     resolver: zodResolver(questionGeneratorSchema),
//     defaultValues: { topic: "", difficulty: undefined },
//   });

//   async function onSubmit(values: QuestionGeneratorFormValues) {
//     if (!isBackendImplemented) {
//         toast({
//             title: "Feature In Development",
//             description: "AI question generation backend is under construction. Using mock data.",
//             // variant: "warning", // if you have a warning variant for toast
//         });
//         setIsLoading(true); setGeneratedQuestions([]);
//         await new Promise(res => setTimeout(res, 1200));
//         const mockQuestions: GenerateInterviewQuestionsOutput = [
//             { questionText: `Explain the core concepts of ${values.topic}. (Difficulty: ${values.difficulty})`},
//             { questionText: `Describe a challenging scenario involving ${values.topic} and how you would approach it.`},
//             { questionText: `Compare and contrast [Technique A] and [Technique B] within ${values.topic}.`},
//             { questionText: `What are some common pitfalls when working with ${values.topic}?`},
//             { questionText: `How would you optimize performance for an application using ${values.topic}?`},
//         ];
//         setGeneratedQuestions(mockQuestions); setIsLoading(false); return;
//       }
//     // ... (actual backend call logic remains the same)
//   }

//   return (
//     <>
//       <style jsx global>{`
//         /* PASTE FULL THEMED CSS from previous components (ProfilePage or SchedulePage had most) */
//         /* This includes .themed-card, .premium-button, .themed-input, .themed-skeleton, .themed-alert, .animate-item-entry etc. */
//         /* ADD Select Specific Styles */
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
        
//         .premium-button { /* ... (same as SchedulePage) ... */ 
//             background-color: var(--accent-primary); color: var(--bg-main); font-weight: 600; border-radius: 0.375rem; padding: 0.75rem 1.5rem; transition: all 0.25s ease; box-shadow: 0 4px 10px rgba(var(--accent-primary-rgb), 0.1), 0 1px 3px rgba(var(--accent-primary-rgb), 0.08); display: inline-flex; align-items: center; justify-content: center;
//         }
//         .premium-button:hover:not(:disabled) { background-color: var(--accent-primary-hover); transform: translateY(-2px) scale(1.01); box-shadow: 0 7px 14px rgba(var(--accent-primary-rgb), 0.15), 0 3px 6px rgba(var(--accent-primary-rgb), 0.1); }
//         .premium-button:disabled { opacity: 0.6; cursor: not-allowed; }
                
//         .themed-card { /* ... (same as SchedulePage) ... */ 
//             background-color: var(--bg-surface); border: 1px solid var(--border-color-subtle); border-radius: 0.75rem; box-shadow: 0 10px 25px -5px var(--shadow-color), 0 15px 35px -15px var(--shadow-color); transition: transform 0.3s ease, box-shadow 0.3s ease;
//         }
//         .themed-card:hover { transform: translateY(-5px); box-shadow: 0 15px 35px -8px var(--shadow-color), 0 25px 50px -20px var(--shadow-color); }
//         .themed-card .card-header { border-bottom: 1px solid var(--border-color); padding: 1rem 1.25rem; margin-bottom: 0; }
//         .themed-card .card-title { color: var(--text-primary); font-size: 1.15rem; font-weight: 600; display: flex; align-items: center; gap: 0.6rem; }
//         .themed-card .card-title .lucide { color: var(--accent-primary); }
//         .themed-card .card-description { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem; }
//         .themed-card .card-content { padding: 1.25rem; } 
//         .themed-card .card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); margin-top: 1rem; }


//         .themed-input { background-color: var(--bg-main) !important; border: 1px solid var(--border-color) !important; color: var(--text-primary) !important; border-radius: 0.375rem; padding: 0.65rem 0.75rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; font-size: 0.9rem; line-height: 1.5; }
//         .themed-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
//         .themed-input:focus { border-color: var(--accent-primary) !important; box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2) !important; outline: none !important; }
//         .form-message-destructive { color: var(--destructive) !important; font-size: 0.8rem; margin-top: 0.35rem; }
//         .themed-label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
//         .themed-label .lucide { color: var(--accent-primary); width: 1.1rem; height: 1.1rem; }
        
//         @keyframes shimmer { 100% {transform: translateX(100%);} }
//         .themed-skeleton { background-color: var(--border-color); position: relative; overflow: hidden; border-radius: 0.25rem; }
//         .themed-skeleton::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(var(--border-primary-rgb), 0.2), transparent); transform: translateX(-100%); animation: shimmer 1.5s infinite; }
        
//         .themed-alert { background-color: rgba(var(--text-secondary-rgb), 0.05); border: 1px solid var(--border-color); border-left-width: 3px; border-left-color: var(--text-secondary); border-radius: 0.375rem; padding: 0.75rem 1rem; margin-top: 0.5rem; }
//         .themed-alert .alert-title { color: var(--text-primary); font-weight:500; font-size:0.9rem; }
//         .themed-alert .alert-description { color: var(--text-secondary); font-size:0.8rem; }
//         .themed-alert .lucide { color: var(--text-secondary); }
//         .themed-alert.warning { border-left-color: var(--warning); background-color: rgba(var(--warning-rgb), 0.08); }
//         .themed-alert.warning .alert-title { color: var(--warning); }
//         .themed-alert.warning .lucide { color: var(--warning); }
//         .themed-alert.warning .alert-description { color: rgba(var(--warning-rgb), 0.9); }


//         /* Themed Select specific styles */
//         .themed-select-trigger { /* Apply to SelectTrigger */
//             background-color: var(--bg-main) !important;
//             border: 1px solid var(--border-color) !important;
//             color: var(--text-primary) !important;
//             border-radius: 0.375rem !important;
//             padding: 0 0.75rem !important; /* Keep shadcn padding for icon */
//             font-size: 0.9rem !important;
//             line-height: 1.5 !important;
//             transition: border-color 0.2s ease, box-shadow 0.2s ease;
//             height: 2.6rem !important; /* Matches themed-input effective height */
//             width: 100%;
//         }
//         .themed-select-trigger:focus {
//             border-color: var(--accent-primary) !important;
//             box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2) !important;
//             outline: none !important;
//         }
//         .themed-select-trigger span { /* Target the SelectValue placeholder/text */
//             color: var(--text-primary) !important;
//             opacity: 1 !important; 
//         }
//         .themed-select-trigger[data-placeholder] > span { /* Placeholder text color */
//              color: var(--text-secondary) !important;
//              opacity: 0.6 !important;
//         }
//         /* Style the dropdown arrow if shadcn uses a specific class or SVG */
//         .themed-select-trigger .lucide-chevron-down { color: var(--text-secondary) !important; }

//         .themed-select-content { /* Apply to SelectContent */
//             background-color: var(--bg-surface) !important;
//             border: 1px solid var(--border-color) !important;
//             box-shadow: 0 8px 20px var(--shadow-color) !important;
//             border-radius: 0.5rem !important;
//             z-index: 50 !important;
//         }
//         .themed-select-item { /* Apply to SelectItem */
//             color: var(--text-primary) !important;
//             padding: 0.6rem 0.8rem !important;
//             font-size: 0.9rem !important;
//             border-radius: 0.25rem !important;
//             cursor: pointer;
//             transition: background-color 0.15s ease, color 0.15s ease;
//         }
//         .themed-select-item:hover,
//         .themed-select-item[data-highlighted] { /* Hover and keyboard navigation highlight */
//             background-color: var(--accent-primary) !important;
//             color: var(--bg-main) !important;
//             outline: none;
//         }
//         .themed-select-item[data-state="checked"] {
//             background-color: rgba(var(--accent-primary-rgb), 0.2) !important;
//             color: var(--accent-primary) !important;
//             font-weight: 500;
//         }
//         /* Generated Question Item Styling */
//         .generated-question-item {
//             background-color: var(--bg-surface-lighter);
//             border: 1px solid var(--border-color-subtle);
//             padding: 0.8rem 1rem;
//             border-radius: 0.5rem;
//             transition: background-color 0.2s ease, transform 0.2s ease;
//         }
//         .generated-question-item:hover {
//             background-color: var(--bg-main);
//             transform: translateY(-2px);
//         }
//         .generated-question-item p { color: var(--text-primary); line-height: 1.6; font-size: 0.9rem;}
//       `}</style>

//       <AppLayout>
//         <div className="space-y-8 md:space-y-10 p-4 md:p-6 lg:p-8">
//           <div className="animate-item-entry" style={{animationDelay: '0.1s'}}>
//             <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 sm:gap-3" style={{ color: 'var(--text-primary)' }}>
//               <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8" style={{color: 'var(--accent-primary)'}}/> AI Question Generator
//             </h1>
//           </div>

//           {!isBackendImplemented && (
//              <div className="animate-item-entry" style={{animationDelay: '0.2s'}}>
//                 <Alert className="themed-alert warning">
//                     <AlertTriangle className="lucide h-5 w-5" />
//                     <AlertTitle>Developer Note</AlertTitle>
//                     <AlertDescription>
//                         The backend for AI question generation is under construction. This page currently uses mock data for demonstration.
//                     </AlertDescription>
//                 </Alert>
//              </div>
//           )}

//           <Card className="themed-card animate-item-entry" style={{animationDelay: '0.3s'}}>
//             <CardHeader className="card-header">
//               <CardTitle className="card-title"><Wand2 className="lucide mr-2 w-5 h-5"/>Generate Custom Questions</CardTitle>
//               <CardDescription className="card-description">Enter a topic and difficulty to get AI-generated practice questions.</CardDescription>
//             </CardHeader>
//             <CardContent className="pt-5"> {/* Consistent padding */}
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                   <FormField
//                     control={form.control} name="topic"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="themed-label"><FileText />Interview Topic</FormLabel>
//                         <FormControl>
//                           <Input 
//                             placeholder="e.g., System Design, React Hooks, Python Data Structures" 
//                             {...field} 
//                             className="themed-input"
//                           />
//                         </FormControl>
//                         <FormMessage className="form-message-destructive" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control} name="difficulty"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="themed-label"><ListChecks />Difficulty Level</FormLabel>
//                           <Select onValueChange={field.onChange} defaultValue={field.value}>
//                             <FormControl>
//                               <SelectTrigger className="themed-select-trigger">
//                                 <SelectValue placeholder="Select difficulty..." />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent className="themed-select-content">
//                               <SelectItem value="Easy" className="themed-select-item">Easy</SelectItem>
//                               <SelectItem value="Medium" className="themed-select-item">Medium</SelectItem>
//                               <SelectItem value="Hard" className="themed-select-item">Hard</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         <FormMessage className="form-message-destructive" />
//                       </FormItem>
//                     )}
//                   />
//                   <Button type="submit" className="premium-button w-full sm:w-auto text-sm py-2.5 px-5" disabled={isLoading}>
//                     {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Wand2 className="mr-2 h-4 w-4"/>Generate Questions</>}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>

//           {(isLoading || generatedQuestions.length > 0) && (
//             <Card className="themed-card animate-item-entry" style={{animationDelay: isLoading ? '0s' : '0.4s'}}> {/* Animate in results card */}
//               <CardHeader className="card-header">
//                 <CardTitle className="card-title"><ListChecks className="lucide mr-2 w-5 h-5"/>Generated Questions</CardTitle>
//                 <CardDescription className="card-description">AI-generated questions based on your input.</CardDescription>
//               </CardHeader>
//               <CardContent className="pt-5">
//                 {isLoading ? (
//                   <div className="space-y-4">
//                     {[...Array(3)].map((_, i) => (
//                       <div key={i} className="flex items-start space-x-3 p-1">
//                         <Skeleton className="themed-skeleton h-5 w-5 rounded-full mt-1" />
//                         <div className="space-y-2 flex-1">
//                           <Skeleton className="themed-skeleton h-4 w-full" />
//                           <Skeleton className="themed-skeleton h-4 w-4/5" />
//                         </div>
//                       </div>
//                     ))}
//                     <p className="text-sm text-center pt-2" style={{color: 'var(--text-secondary)'}}>AI is crafting your questions... please wait.</p>
//                   </div>
//                 ) : (
//                   generatedQuestions.length > 0 ? (
//                     <ul className="space-y-3">
//                       {generatedQuestions.map((q, index) => (
//                         <li key={index} className="generated-question-item animate-item-entry" style={{animationDelay: `${index * 0.05}s`}}>
//                           <p>{q.questionText}</p>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : ( 
//                     <Alert className="themed-alert">
//                         <Info className="lucide" />
//                         <AlertTitle>No Questions Yet</AlertTitle>
//                         <AlertDescription>
//                           The AI finished, but no questions were generated. Try adjusting the topic or difficulty.
//                         </AlertDescription>
//                     </Alert>
//                   )
//                 )}
//               </CardContent>
//               {generatedQuestions.length > 0 && !isLoading && (
//                 <CardFooter className="pt-4">
//                   <p className="text-xs" style={{color: 'var(--text-secondary)', opacity: 0.8}}>
//                     These questions are AI-generated. Use them as a starting point.
//                   </p>
//                 </CardFooter>
//               )}
//             </Card>
//           )}
//         </div>
//       </AppLayout>
//     </>
//   );
// }