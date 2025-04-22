'use client';

import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {useState} from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [start, setStart] = useState(false);
  const [isValid, setIsValid] = useState(false);

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
            <ResultsDisplay jobDescription={jobDescription} resumesText={resumesText} />
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
        </div>
    </div>
  );
}
