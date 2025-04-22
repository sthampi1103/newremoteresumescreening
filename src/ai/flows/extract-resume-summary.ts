// extract-resume-summary.ts
'use server';
/**
 * @fileOverview A resume summarization AI agent.
 *
 * - summarizeResume - A function that handles the resume summarization process.
 * - SummarizeResumeInput - The input type for the summarizeResume function.
 * - SummarizeResumeOutput - The return type for the summarizeResume function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the resume.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

export async function summarizeResume(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  return summarizeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: {
    schema: z.object({
      resumeText: z.string().describe('The text content of the resume.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the resume.'),
    }),
  },
  prompt: `You are an expert resume summarizer. Please provide a concise summary of the following resume text:\n\n{{{resumeText}}}`,
});

const summarizeResumeFlow = ai.defineFlow<
  typeof SummarizeResumeInputSchema,
  typeof SummarizeResumeOutputSchema
>({
  name: 'summarizeResumeFlow',
  inputSchema: SummarizeResumeInputSchema,
  outputSchema: SummarizeResumeOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});