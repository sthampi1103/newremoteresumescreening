'use server';
/**
 * @fileOverview Ranks resumes based on their fit to a job description.
 *
 * - rankResumes - A function that ranks resumes against a job description.
 * - RankResumesInput - The input type for the rankResumes function.
 * - RankResumesOutput - The return type for the rankResumes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RankResumesInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to compare the resumes against.'),
  resumes: z
    .array(z.string())
    .describe('An array of resumes to rank against the job description.'),
});
export type RankResumesInput = z.infer<typeof RankResumesInputSchema>;

const RankResumesOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the candidate.'),
    summary: z.string().describe('A summary of the resume.'),
    score: z.number().describe('The overall score of the resume (out of 100).'),
    rationale: z
      .string()
      .describe(
        'Explanation of the score, highlighting strengths and weaknesses with specific examples from the resume.'
      ),
    breakdown:
      z.object({
        essentialSkillsMatch: z
          .number()
          .describe('Score for essential skills match.'),
        relevantExperience: z.number().describe('Score for relevant experience.'),
        requiredQualifications: z
          .number()
          .describe('Score for required qualifications.'),
        keywordPresence: z.number().describe('Score for keyword presence.'),
      })
      .describe('Breakdown of the score based on the scoring factors.'),
    recommendation: z
      .string()
      .describe(
        'Recommendation (Strong Match/Moderate Match/Weak Match) and suggested next steps.'
      ),
  })
);
export type RankResumesOutput = z.infer<typeof RankResumesOutputSchema>;

export async function rankResumes(input: RankResumesInput): Promise<RankResumesOutput> {
  return rankResumesFlow(input);
}

const rankResumesPrompt = ai.definePrompt({
  name: 'rankResumesPrompt',
  input: {
    schema: z.object({
      jobDescription: z
        .string()
        .describe('The job description to compare the resumes against.'),
      resumes: z
        .array(z.string())
        .describe('An array of resumes to rank against the job description.'),
    }),
  },
  output: {
    schema: RankResumesOutputSchema,
  },
  prompt: `You are an expert recruiter. You will carefully analyze the provided job description and resumes to assess the fit of each candidate.

Job Description: {{{jobDescription}}}

Resumes:
{{#each resumes}}
  Resume:
  {{{this}}}
{{/each}}

Based on your analysis, provide a score (out of 100) for each resume, along with a rationale, score breakdown, and recommendation.

Consider the following factors when assigning the score:
* Essential Skills Match (Weight: 40%): How well does the resume demonstrate the essential skills listed in the job description? Assign higher points for direct matches and quantifiable achievements related to these skills.
* Relevant Experience (Weight: 30%): How closely does the candidate's past experience align with the responsibilities and requirements outlined in the job description? Prioritize experience that demonstrates similar tasks and impact.
* Required Qualifications (Weight: 20%): Does the candidate possess the mandatory qualifications (e.g., education, certifications) specified in the job description? Deduct points for missing essential qualifications.
* Keyword Presence (Weight: 10%): How frequently and naturally are relevant keywords and phrases from the job description present within the resume content?

Provide the output in a JSON format with the following columns:
* name: The name of the candidate.
* summary: A summary of the resume.
* score: The overall score of the resume (out of 100).
* rationale: Explanation of the score, highlighting strengths and weaknesses with specific examples from the resume.
* breakdown: Breakdown of the score based on the scoring factors (essentialSkillsMatch, relevantExperience, requiredQualifications, keywordPresence). The scores should be proportional to their weight
* recommendation: Recommendation (Strong Match/Moderate Match/Weak Match) and suggested next steps.
`,
});

const rankResumesFlow = ai.defineFlow<typeof RankResumesInputSchema, typeof RankResumesOutputSchema>(
  {
    name: 'rankResumesFlow',
    inputSchema: RankResumesInputSchema,
    outputSchema: RankResumesOutputSchema,
  },
  async input => {
    const {output} = await rankResumesPrompt(input);
    return output!;
  }
);
