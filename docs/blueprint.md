# **App Name**: ResumeRanker

## Core Features:

- Job Description Input: Allow users to input job descriptions by typing or uploading files (PDF, DOCX, DOC, TXT). Display an error message if the uploaded file is unreadable.
- Resume Upload: Enable users to upload multiple resumes (PDF, DOCX, TXT) or input resumes via a text box.
- Context Understanding: Analyze the job description and resumes to extract relevant information for comparison. Use an AI tool to identify key skills, experience levels, and qualifications.
- Resume Scoring: Compare the analyzed resumes against the job description, assigning a score (out of 100) based on the weighted factors (Essential Skills, Relevant Experience, Required Qualifications, and Keyword Presence). Provide a rationale for the score.
- Results Display: Present the output in a table format, including Name, Resume Summary, Score, Rationale, Score Breakdown, and Recommendation (Strong/Moderate/Weak Match with suggested next steps).

## Style Guidelines:

- Primary color: A calm blue (#3498db) to convey professionalism and trust.
- Secondary color: Light gray (#ecf0f1) for backgrounds and subtle separation.
- Accent: Teal (#2ecc71) to highlight important elements and actions.
- Clean and structured layout with clear sections for input, processing, and results.
- Use simple and recognizable icons for file upload, scoring factors, and recommendations.

## Original User Request:
An app the compares resumes against a given Job description and shortlists the resumes on the basis of the fitment to Job description

Job Description Input — Input job description: Allow users to input the job description, either by typing or uploading a file. The input file can be either pdf, docx, doc or txt formats. If JD is inputted, provide a button to indicate that the JD input is over
If the input file is not readable, pls display error message when the input is complete. 

Resume Upload — Resume Upload: Enable users to upload multiple resumes (PDF, DOCX, TXT) or allow the users to input the resume in a text box

Understand the Job Description - Carefully analyze the provided Job Description to identify key skills, experience levels, required qualifications, and any specific keywords or phrases.

Analyze the Resume - Thoroughly review the provided resume to extract relevant information regarding skills, experience, education, and any other details that align with the JD.

Compare and Score - Based on the analysis of the JD and the resume, assign a score out of 100 to represent the overall fit of the resume to the job requirements. Consider the following factors when assigning the score:
    Essential Skills Match (Weight: 40%):How well does the resume demonstrate the essential skills listed in the JD? Assign higher points for direct matches and quantifiable achievements related to these skills.
    Relevant Experience (Weight: 30%):How closely does the candidate's past experience align with the responsibilities and requirements outlined in the JD? Prioritize experience that demonstrates similar tasks and impact.
    Required Qualifications (Weight: 20%):Does the candidate possess the mandatory qualifications (e.g., education, certifications) specified in the JD? Deduct points for missing essential qualifications.
    Keyword Presence (Weight: 10%):How frequently and naturally are relevant keywords and phrases from the JD present within the resume content?

Provide a Rationale:Briefly explain the reasoning behind the assigned score, highlighting the key strengths and weaknesses of the resume in relation to the JD. Point out specific examples from the resume that support your assessment.

Suggest Next Steps (Optional but Recommended for Selection):Based on the score and rationale, provide a brief recommendation regarding whether the resume is a strong, moderate, or weak match for the role and suggest potential next steps (e.g., shortlist for interview, further review needed, not a strong match).

Provide the output in a table format with the following columns - Name, Summary of the resume, Score, Rationale (Explanation of the score, highlighting strengths and weaknesses with specific examples from the resume), Breadown of the score based on the scoring factors, recommendation (Strong Match/Moderate Match/Weak Match - Suggested next steps)
  