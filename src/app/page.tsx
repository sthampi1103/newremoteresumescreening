'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState, useRef, useCallback} from 'react';
import * as ExcelJS from 'exceljs';
import {Button} from '@/components/ui/button';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Icons} from '@/components/icons';
import {useToast} from '@/hooks/use-toast';

// Note: If you encounter a runtime error like "Cannot read properties of null (reading 'type')"
// originating from a browser extension (e.g., chrome-extension://.../inpage.js),
// it's likely caused by the extension interfering with the page, not a bug in this application.
// Try disabling the problematic browser extension (like crypto wallets) and reloading the page.

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isValid, setValid] = useState(false);
  const [isStartActive, setIsStartActive] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isResultsDisplayed, setIsResultsDisplayed] = useState(false);
  const [logo, setLogo] = useState('/logo.png'); // Set initial logo path
  const [isLogoChangeActive, setIsLogoChangeActive] = useState(false);
  const [clearJDTrigger, setClearJDTrigger] = useState(false);
  const [clearResumesTrigger, setClearResumesTrigger] = useState(false);
  const router = useRouter();
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if inputs are valid whenever jobDescription or resumesText changes
  useEffect(() => {
    const areInputsValid =
      jobDescription.trim() !== '' && resumesText.trim() !== '';
    setIsStartActive(areInputsValid);
    // Enable reset button if any input has content or results are displayed
    const shouldResetBeActive =
      jobDescription.trim() !== '' ||
      resumesText.trim() !== '' ||
      results.length > 0;
    setIsResetActive(shouldResetBeActive);
  }, [jobDescription, resumesText, results]);

  const handleJDChange = (jd: string) => {
    setJobDescription(jd);
  };

  const handleResumesChange = (resumes: string) => {
    setResumesText(resumes);
  };

  const handleStart = async (jd: string, resumes: string) => {
    setIsResultsDisplayed(true);
    setIsStartActive(false); // Deactivate Start button after clicking
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
          setLogo(event.target.result);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setJobDescription('');
    setResumesText('');
    setResults([]);
    setValid(false);
    setIsStartActive(false); // Reset start button state
    setIsResetActive(false); // Reset button should become inactive after reset
    setIsResultsDisplayed(false);
    setLogo('/logo.png'); // Reset to the default logo path
    // Trigger clear in child components
    setClearJDTrigger(true);
    setClearResumesTrigger(true);
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resume Ranking');

    // Add headers
    worksheet.columns = [
      {header: 'Name', key: 'name', width: 20},
      {header: 'Summary', key: 'summary', width: 40},
      {header: 'Score', key: 'score', width: 10},
      {header: 'Rationale', key: 'rationale', width: 40},
      {
        header: 'Essential Skills Match',
        key: 'essentialSkillsMatch',
        width: 20,
      },
      {header: 'Relevant Experience', key: 'relevantExperience', width: 20},
      {
        header: 'Required Qualifications',
        key: 'requiredQualifications',
        width: 20,
      },
      {header: 'Keyword Presence', key: 'keywordPresence', width: 20},
      {header: 'Recommendation', key: 'recommendation', width: 20},
    ];

    // Add data rows
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
        recommendation: result.recommendation,
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a blob and download it
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume_ranking.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Redirect logic removed, assuming user is already authenticated
  // and lands on this page directly or via dashboard redirection.

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-primary text-primary-foreground p-4 flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{display: 'none'}}
          ref={fileInputRef}
        />
        <img
          src={logo}
          alt="Resume Screening App Logo"
          className="h-20 w-auto rounded-md shadow-md cursor-pointer mb-2"
          onClick={handleImageClick}
        />
        <h1 className="text-2xl font-bold mt-2">Resume Screening App</h1>
      </div>

      <div className="container mx-auto p-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Description Input Section */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Job Description Input</h2>
            <JobDescriptionInput
              onJDChange={handleJDChange}
              clear={clearJDTrigger}
              onClear={() => setClearJDTrigger(false)}
            />
          </div>

          {/* Resume Upload Section */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
            <ResumeUpload
              onResumesChange={handleResumesChange}
              clear={clearResumesTrigger}
              onClear={() => setClearResumesTrigger(false)}
            />
          </div>
        </div>

        {/* Start and Reset Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            onClick={() => handleStart(jobDescription, resumesText)}
            disabled={!isStartActive || isResultsDisplayed}
            aria-label="Start analysis"
          >
            Start
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isResetActive}
            aria-label="Reset inputs and results"
          >
            Reset
          </Button>
        </div>

        {/* Results Display Section */}
        {isResultsDisplayed && (
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {results.length === 0 && jobDescription && resumesText ? (
              <Alert>
                <Icons.loader className="h-4 w-4 animate-spin" />
                <AlertTitle>Analyzing Resumes</AlertTitle>
                <AlertDescription>
                  Please wait while the resumes are being analyzed.
                </AlertDescription>
              </Alert>
            ) : (
              <ResultsDisplay
                jobDescription={jobDescription}
                resumesText={resumesText}
                setResults={setResults}
                isTriggered={isResultsDisplayed} // Trigger fetch only when results should be displayed
              />
            )}
            {results.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  aria-label="Download results as Excel file"
                >
                  Download XLS
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Toaster for displaying notifications */}
      {/* <Toaster /> */}
    </div>
  );
}

    