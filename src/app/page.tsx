'use client';

import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {useState} from 'react';

export default function Home() {
  const [start, setStart] = useState(false);

  const handleStart = () => {
    setStart(true);
  };

  const handleReset = () => {
    // Implement reset logic here, clear inputs, etc.
    setStart(false);
    window.location.reload(); // quick reset
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={handleStart} disabled={start} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Start
        </Button>
        <Button onClick={handleReset} variant="outline" disabled={start}>
          Reset
        </Button>
      </div>

      <Separator className="my-5" />

      {start && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultsDisplay />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

