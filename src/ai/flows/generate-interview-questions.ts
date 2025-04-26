'use server';
/**
 * @fileOverview Generates interview questions based on a job description.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to generate questions for.'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const GenerateQuestionsOutputSchema = z.object({
  questions: z
    .array(z.string())
    .max(10) // Ensure a maximum of 10 questions
    .describe(
      'An array of up to 10 relevant interview questions based on the job description.'
    ),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateInterviewQuestions(
  input: GenerateQuestionsInput
): Promise<GenerateQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {
    schema: GenerateQuestionsInputSchema,
  },
  output: {
    schema: GenerateQuestionsOutputSchema,
  },
  prompt: `You are an expert hiring manager. Based on the following job description, generate a list of insightful interview questions (maximum 10) to assess a candidate's suitability for the role. Focus on questions that evaluate skills, experience, and cultural fit mentioned in the description.

Job Description:
{{{jobDescription}}}

Provide the output as a JSON object with a single key "questions" containing an array of strings (the questions), with a maximum of 10 questions.`,
});

const generateInterviewQuestionsFlow = ai.defineFlow<
  typeof GenerateQuestionsInputSchema,
  typeof GenerateQuestionsOutputSchema
>(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    // Add basic validation or refinement if needed before calling the prompt
    if (!input.jobDescription || input.jobDescription.trim().length < 50) {
        // Consider throwing an error or returning a default empty state
        console.warn("Job description might be too short for effective question generation.");
        // Returning empty for now, could also throw for the UI to catch
        return { questions: [] };
    }

    const {output} = await prompt(input);
    // Ensure output conforms, though the prompt requests it
    if (output && output.questions && output.questions.length > 10) {
      output.questions = output.questions.slice(0, 10);
    }
    return output || { questions: [] }; // Return empty array if output is somehow null
  }
);
