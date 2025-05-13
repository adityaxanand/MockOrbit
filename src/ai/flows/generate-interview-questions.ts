'use server';
/**
 * @fileOverview AI flow for generating interview questions.
 *
 * - generateInterviewQuestions - Function to generate interview questions based on topic and difficulty.
 * - GenerateQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import { ai } from '@/ai/ai-instance'; // Use the pre-configured ai instance
import { z } from 'genkit';

// Define the input schema for the question generation flow
export const GenerateQuestionsInputSchema = z.object({
  topic: z.string().min(3).max(100).describe('The main topic for the interview questions (e.g., "React Hooks", "System Design", "Python Data Structures").'),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).describe('The desired difficulty level for the questions.'),
  numQuestions: z.number().int().min(1).max(10).optional().default(5).describe('The number of questions to generate (default is 5).'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

// Define the output schema for the question generation flow
export const GenerateQuestionsOutputSchema = z.object({
    questions: z.array(z.object({
        questionText: z.string().describe("The text of the generated interview question."),
        // Optional: could add expectedAnswerHints, category, etc. later
    })).describe("A list of generated interview questions."),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;


// Define the prompt for generating interview questions
const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are an expert interviewer helping to generate practice questions.
Generate {{numQuestions}} interview questions for the topic: "{{topic}}" at a "{{difficulty}}" difficulty level.
Ensure the questions are clear, concise, and relevant to the specified topic and difficulty.
Format the output as a list of questions.
For example, if the topic is "JavaScript Closures" and difficulty is "Medium", questions could be:
- "Explain what a closure is in JavaScript and provide a practical code example."
- "Describe a common use case for closures in web development."
- "What are some potential pitfalls or memory implications when using closures?"

Provide the questions in the specified JSON output format.
`,
});

// Define the flow for generating interview questions
const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuestionsPrompt(input);
    if (!output) {
        // This case should ideally be handled by Genkit if output schema isn't met,
        // but good to have a fallback.
        console.error("AI prompt did not return the expected output format.");
        throw new Error("Failed to generate questions in the expected format.");
    }
    return output;
  }
);

// Exported wrapper function to be called by the frontend
export async function generateInterviewQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  try {
    return await generateQuestionsFlow(input);
  } catch (error) {
    console.error("Error in generateInterviewQuestions flow:", error);
    // Rethrow or return a structured error
    // For now, rethrowing to let the caller handle it.
    // Consider specific error types or structures for better client-side handling.
    if (error instanceof Error) {
        throw new Error(`AI question generation failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI question generation.");
  }
}
