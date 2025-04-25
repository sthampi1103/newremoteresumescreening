'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState, useRef, useCallback} from 'react';
import * as ExcelJS from 'exceljs';
import bannerImage from '../../public/logo.png'; // Import the image
import {Button} from '@/components/ui/button';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {FileUp, XCircle} from 'lucide-react';
import {Icons} from '@/components/icons';
import {useToast} from '@/hooks/use-toast';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isValid, setValid] = useState(false);
  const [isStartActive, setIsStartActive] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isResultsDisplayed, setIsResultsDisplayed] = useState(false);
  const [logo, setLogo] = useState(bannerImage);
  const [isLogoChangeActive, setIsLogoChangeActive] = useState(false);
  const router = useRouter();
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const areInputsValid = jobDescription.trim() !== '' && resumesText.trim() !== '';
    setIsStartActive(areInputsValid);
  }, [jobDescription, resumesText]);

  const handleJDChange = (jd: string) => {
    setJobDescription(jd);
    setIsResetActive(true);
  };

  const handleResumesChange = (resumes: string) => {
    setResumesText(resumes);
    setIsResetActive(true);
  };

  const handleStart = async (jd: string, resumes: string) => {
    setIsResultsDisplayed(true);
    setIsStartActive(false);

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
    setIsLogoChangeActive(true);
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setJobDescription('');
    setResumesText('');
    setResults([]);
    setValid(false);
    setIsStartActive(false);
    setIsResetActive(false);
    setIsResultsDisplayed(false);
    setLogo(bannerImage);
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
      {header: 'Essential Skills Match', key: 'essentialSkillsMatch', width: 20},
      {header: 'Relevant Experience', key: 'relevantExperience', width: 20},
      {header: 'Required Qualifications', key: 'requiredQualifications', width: 20},
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

  useEffect(() => {
    router.push('/auth');
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
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
          className="h-20 w-auto rounded-md shadow-md cursor-pointer"
          onClick={handleImageClick}
        />
        <h1 className="text-2xl font-bold mt-2">Resume Screening App</h1>
      </div>

      <div className="container mx-auto p-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Description Input Section */}
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2">Job Description Input</h2>
            <JobDescriptionInput onJDChange={handleJDChange} clear={false} onClear={() => {}} />
          </div>

          {/* Resume Upload Section */}
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2">Resume Upload</h2>
            <ResumeUpload
              onResumesChange={handleResumesChange}
              onStart={handleStart}
              jobDescription={jobDescription}
              setValid={setValid}
              onReset={() => {}}
              clear={false}
              onClear={() => {}}
            />
            <Button
              onClick={() => handleStart(jobDescription, resumesText)}
              disabled={!isStartActive || isResultsDisplayed}
            >
              Start
            </Button>
          </div>
        </div>

        {/* Start and Reset Buttons */}
        <div className="flex justify-between mt-4">
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isResetActive}
          >
            Reset
          </Button>
        </div>

        {/* Results Display Section */}
        {isResultsDisplayed && (
          <div className="bg-white shadow-md rounded-md p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            {results.length === 0 && jobDescription && resumesText ? (
              <Alert>
                <Icons.fileUpload className="h-4 w-4"/>
                <AlertTitle>Analyzing Resumes.</AlertTitle>
                <AlertDescription>Please wait while the resumes are being analyzed.</AlertDescription>
              </Alert>
            ) : (
              <ResultsDisplay jobDescription={jobDescription} resumesText={resumesText} setResults={setResults} />
            )}
            {results.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button variant="secondary" onClick={handleDownload}>
                  Download XLS
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

