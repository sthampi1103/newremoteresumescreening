'use client';

import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import { utils, writeFile } from 'xlsx';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [start, setStart] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [results, setResults] = useState([]); // State to store results from ResultsDisplay


  const handleStart = (jd: string, resumes: string) => {
    setJobDescription(jd);
    setResumesText(resumes);
    setStart(true);
  };

  const handleReset = () => {
    // Implement reset logic here, clear inputs, etc.
    setStart(false);
    setIsValid(false);
    setResumesText('');
    setJobDescription('');
    setResults([]); // Clear the results
  };

    const handleDownloadCSV = () => {
        // Check if there are results to download
        if (!results || results.length === 0) {
            alert('No results to download.');
            return;
        }

        // Convert results array to array of objects
        const data = results.map(result => ({
            Name: result.name,
            Summary: result.summary,
            Score: result.score,
            Rationale: result.rationale,
            EssentialSkills: result.breakdown.essentialSkillsMatch,
            Experience: result.breakdown.relevantExperience,
            Qualifications: result.breakdown.requiredQualifications,
            Keywords: result.breakdown.keywordPresence,
            Recommendation: result.recommendation
        }));

        // Create a new workbook
        const wb = utils.book_new();
        // Convert the data to a worksheet
        const ws = utils.json_to_sheet(data);
        // Append the worksheet to the workbook
        utils.book_append_sheet(wb, ws, 'Resume Rankings');
        // Generate the CSV file
        writeFile(wb, 'resume_rankings.csv');
    };

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput onJDChange={(jd) => setJobDescription(jd)} />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload onResumesChange={(resumes) => setResumesText(resumes)} onStart={handleStart} jobDescription={jobDescription} setValid={setIsValid}/>
        </CardContent>
      </Card>

      <Separator className="my-5" />

      {start && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsDisplay jobDescription={jobDescription} resumesText={resumesText} setResults={setResults} />
          </CardContent>
        </Card>
      )}
       <div className="flex justify-end space-x-4">
          <Button onClick={handleReset} variant="outline" disabled={!start && !jobDescription && !resumesText ? true : false}>
            Reset
          </Button>
          <Button onClick={handleStart} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!jobDescription || !resumesText || !isValid}>
            Start
          </Button>
              {start && (
                  <Button onClick={handleDownloadCSV} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Download CSV
                  </Button>
              )}
        </div>
    </div>
  );
}
