'use server';
/**
 * @fileOverview Generates interview questions and model answers based on a job description.
 *
 * - generateInterviewQnA - A function that generates interview Q&A.
 * - GenerateQnAInput - The input type for the generateInterviewQnA function.
 * - GenerateQnAOutput - The return type for the generateInterviewQnA function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateQnAInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to generate Q&A for.'),
});
export type GenerateQnAInput = z.infer<typeof GenerateQnAInputSchema>;

const QnAPairSchema = z.object({
   question: z.string().describe('The interview question.'),
   answer: z.string().describe('A model answer to the interview question, explaining what to look for in a candidate\'s response.'),
});

const GenerateQnAOutputSchema = z.object({
   qna: z.array(QnAPairSchema)
    .max(10) // Ensure a maximum of 10 Q&A pairs
    .describe(
      'An array of up to 10 relevant interview questions and their model answers based on the job description.'
    ),
});
export type GenerateQnAOutput = z.infer<typeof GenerateQnAOutputSchema>;

export async function generateInterviewQnA(
  input: GenerateQnAInput
): Promise<GenerateQnAOutput> {
  return generateQnAFlow(input);
}

const generateQnAPrompt = ai.definePrompt({
  name: 'generateQnAPrompt',
  input: {
    schema: GenerateQnAInputSchema,
  },
  output: {
    schema: GenerateQnAOutputSchema,
  },
  prompt: `You are an expert hiring manager designing interview assessments. Based on the following job description, generate a list of insightful interview questions (maximum 10) to assess a candidate's suitability for the role. For each question, provide a model answer outlining the key points or qualities you would look for in an ideal candidate's response. Focus on questions that evaluate skills, experience, and cultural fit mentioned in the description.

Job Description:
{{{jobDescription}}}

Provide the output as a JSON object with a single key "qna" containing an array of objects. Each object in the array should have two keys: "question" (the interview question as a string) and "answer" (the model answer as a string). Ensure a maximum of 10 question-answer pairs. Example format: { "qna": [ { "question": "...", "answer": "..." }, { "question": "...", "answer": "..." } ] }`,
});

const generateQnAFlow = ai.defineFlow<
  typeof GenerateQnAInputSchema,
  typeof GenerateQnAOutputSchema
>(
  {
    name: 'generateQnAFlow',
    inputSchema: GenerateQnAInputSchema,
    outputSchema: GenerateQnAOutputSchema,
  },
  async input => {
    // Add basic validation or refinement if needed before calling the prompt
    if (!input.jobDescription || input.jobDescription.trim().length < 50) {
        // Consider throwing an error or returning a default empty state
        console.warn("Job description might be too short for effective Q&A generation.");
        // Returning empty for now, could also throw for the UI to catch
        return { qna: [] };
    }

    const {output} = await generateQnAPrompt(input);
    // Ensure output conforms, though the prompt requests it
    if (output && output.qna && output.qna.length > 10) {
      output.qna = output.qna.slice(0, 10);
    }
    return output || { qna: [] }; // Return empty array if output is somehow null
  }
);
