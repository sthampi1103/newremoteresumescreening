'use client';

import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import * as ExcelJS from 'exceljs';

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

    const handleDownloadExcel = async () => {
        if (!results || results.length === 0) {
            alert('No results to download.');
            return;
        }

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Resume Rankings');

        // Define columns
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Summary', key: 'summary', width: 30 },
            { header: 'Score', key: 'score', width: 10 },
            { header: 'Rationale', key: 'rationale', width: 40 },
            { header: 'Essential Skills', key: 'essentialSkillsMatch', width: 15 },
            { header: 'Experience', key: 'relevantExperience', width: 15 },
            { header: 'Qualifications', key: 'requiredQualifications', width: 15 },
            { header: 'Keywords', key: 'keywordPresence', width: 10 },
            { header: 'Recommendation', key: 'recommendation', width: 20 }
        ];

        // Add rows
        results.forEach(result => {
            worksheet.addRow({
                name: result.name,
                summary: result.summary,
                score: result.score,
                rationale: result.rationale,
                essentialSkillsMatch: result.breakdown.essentialSkillsMatch,
                relevantExperience: result.breakdown.relevantExperience,
                requiredQualifications: result.breakdown.requiredQualifications,
                keywordPresence: result.breakdown.keywordPresence,
                recommendation: result.recommendation
            });
        });

        // Generate Excel file as ArrayBuffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Create a Blob from the ArrayBuffer
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create a link and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume_rankings.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput onJDChange={(jd) => setJobDescription(jd)} onReset={handleReset}/>
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload onResumesChange={(resumes) => setResumesText(resumes)} onStart={handleStart} jobDescription={jobDescription} setValid={setIsValid} onReset={handleReset}/>
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
          <Button onClick={() => handleStart(jobDescription, resumesText)} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={!jobDescription || !resumesText || !isValid}>
            Start
          </Button>
              {start && (
                  <Button onClick={handleDownloadExcel} className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Download XLS
                  </Button>
              )}
        </div>
    </div>
  );
}
