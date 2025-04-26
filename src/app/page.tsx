'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useState, useRef, useCallback} from 'react';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf'; // Import jsPDF
import {Button} from '@/components/ui/button';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import InterviewQuestionsDisplay from '@/components/InterviewQuestionsDisplay'; // Import new component
import FileConverter from '@/components/FileConverter'; // Import new component
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'; // Import Tabs
import {Icons} from '@/components/icons';
import {useToast} from '@/hooks/use-toast';
import { Toaster } from "@/components/ui/toaster";
import { appInitialized, app } from './firebaseConfig';
import { getAuth, signOut } from 'firebase/auth'; // Import signOut
import { rankResumes, RankResumesOutput } from '@/ai/flows/rank-resumes';
import { generateInterviewQuestions, GenerateQuestionsOutput } from '@/ai/flows/generate-interview-questions'; // Import new flow
import { Separator } from '@/components/ui/separator'; // Import Separator

// Note: If you encounter a runtime error like "Cannot read properties of null (reading 'type')"
// originating from a browser extension (e.g., chrome-extension://.../inpage.js),
// it's likely caused by the extension interfering with the page, not a bug in this application.
// Try disabling the problematic browser extension (like crypto wallets) and reloading the page.

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [results, setResults] = useState<RankResumesOutput>([]); // Use correct type
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]); // State for questions
  const [isStartActive, setIsStartActive] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isResultsDisplayed, setIsResultsDisplayed] = useState(false);
  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false); // State to control question tab visibility
  const [clearJDTrigger, setClearJDTrigger] = useState(false);
  const [clearResumesTrigger, setClearResumesTrigger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false); // Loading state for questions
  const [questionGenerationError, setQuestionGenerationError] = useState<string | null>(null); // Error state for questions
  const [isJDValid, setIsJDValid] = useState(false);
  const [areResumesValid, setAreResumesValid] = useState(false);
  const [activeTab, setActiveTab] = useState("results"); // State for active tab

  const router = useRouter();
  const {toast} = useToast();


  // Get Firebase Auth instance
  let auth;
  if (appInitialized) {
    auth = getAuth(app);
  }

  // Redirect to auth page if Firebase isn't initialized or user isn't logged in
  useEffect(() => {
    if (!appInitialized) {
       console.error("Firebase not initialized, cannot check auth state.");
       // Optionally redirect or show an error message
       // router.push('/auth'); // Consider uncommenting if non-auth access should be blocked
      return;
    }
     if (!auth) {
       console.error("Auth instance not available.");
       // router.push('/auth'); // Consider uncommenting
       return;
     }
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
         router.push('/auth');
      }
    });
    return () => unsubscribe();
  }, [router, appInitialized, auth]); // Add dependencies


  // Check if inputs are valid whenever jobDescription or resumesText changes
  useEffect(() => {
    const shouldStartBeActive = isJDValid && areResumesValid && !isResultsDisplayed;
    setIsStartActive(shouldStartBeActive);

    const shouldResetBeActive =
      jobDescription.trim() !== '' ||
      resumesText.trim() !== '' ||
      results.length > 0 ||
      interviewQuestions.length > 0 || // Consider questions for reset
      isResultsDisplayed || showInterviewQuestions; // Consider if questions are shown
    setIsResetActive(shouldResetBeActive);
  }, [jobDescription, resumesText, results, interviewQuestions, isJDValid, areResumesValid, isResultsDisplayed, showInterviewQuestions]);

  const handleJDChange = (jd: string, isValid: boolean) => {
    setJobDescription(jd);
    setIsJDValid(isValid);
  };

  const handleResumesChange = (resumes: string, isValid: boolean) => {
    setResumesText(resumes);
    setAreResumesValid(isValid);
  };

  const handleStart = async () => {
    if (!isJDValid || !areResumesValid) {
      toast({
        title: "Input Incomplete",
        description: "Please provide both a job description and at least one resume.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    setIsResultsDisplayed(true); // Indicate that results should be displayed/fetched
    setActiveTab("results"); // Ensure results tab is active
    setIsStartActive(false); // Deactivate Start button after clicking
    // ResultsDisplay component logic is now within this component's useEffect
  };

   const handleGenerateQuestions = async () => {
      if (!isJDValid) {
          toast({
              title: "Job Description Missing",
              description: "Please provide a job description to generate questions.",
              variant: "destructive",
          });
          return;
      }
      setIsGeneratingQuestions(true);
      setQuestionGenerationError(null);
      setInterviewQuestions([]); // Clear previous questions
      setShowInterviewQuestions(true); // Indicate questions tab should be visible
      setActiveTab("questions"); // Switch to questions tab

      try {
          const output: GenerateQuestionsOutput = await generateInterviewQuestions({ jobDescription });
          setInterviewQuestions(output.questions || []);
          if (!output.questions || output.questions.length === 0) {
            setQuestionGenerationError("No questions were generated. The job description might be too short or unclear.");
          }
      } catch (err: any) {
          console.error("Error generating interview questions:", err);
          setQuestionGenerationError(err.message || "An error occurred while generating questions.");
          setInterviewQuestions([]); // Clear questions on error
      } finally {
          setIsGeneratingQuestions(false);
      }
   };

  const handleReset = () => {
    setJobDescription('');
    setResumesText('');
    setResults([]);
    setInterviewQuestions([]); // Reset questions
    setIsStartActive(false);
    setIsResetActive(false);
    setIsResultsDisplayed(false);
    setShowInterviewQuestions(false); // Hide questions tab
    setLoading(false);
    setError(null);
    setIsGeneratingQuestions(false); // Reset question loading state
    setQuestionGenerationError(null); // Reset question error state
    setIsJDValid(false);
    setAreResumesValid(false);
    setClearJDTrigger(true); // Trigger clear in child components
    setClearResumesTrigger(true); // Trigger clear in child components
    setActiveTab("results"); // Reset to default tab
  };

  const handleSignOut = async () => {
     if (!auth) {
       console.error("Auth instance not available for sign out.");
       toast({ title: "Error", description: "Could not sign out.", variant: "destructive" });
       return;
     }
    try {
      await signOut(auth);
      // No need to clear logo as it's fixed now
      router.push('/auth');
    } catch (error) {
      console.error("Sign out error:", error);
       toast({ title: "Sign Out Error", description: "Failed to sign out.", variant: "destructive" });
    }
  };

  const handleClearComplete = useCallback((type: 'jd' | 'resumes') => {
    if (type === 'jd') {
      setClearJDTrigger(false);
    } else if (type === 'resumes') {
      setClearResumesTrigger(false);
    }
  }, []);


  const handleDownloadExcel = async () => {
    if (results.length === 0) {
        toast({
            title: "No Results",
            description: "There are no resume ranking results to download.",
            variant: "destructive",
        });
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resume Ranking');

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

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFDDDDDD'}
    };
     worksheet.getRow(1).border = {
        bottom: { style: 'thin' }
     };

    results.forEach((result, index) => {
      const row = worksheet.addRow({
        name: result.name || 'N/A',
        summary: result.summary,
        score: result.score,
        rationale: result.rationale,
        essentialSkillsMatch: result.breakdown?.essentialSkillsMatch ?? 'N/A',
        relevantExperience: result.breakdown?.relevantExperience ?? 'N/A',
        requiredQualifications: result.breakdown?.requiredQualifications ?? 'N/A',
        keywordPresence: result.breakdown?.keywordPresence ?? 'N/A',
        recommendation: result.recommendation,
      });
       if ((index + 1) % 2 === 0) {
         row.fill = {
           type: 'pattern',
           pattern:'solid',
           fgColor:{argb:'FFF5F5F5'}
         };
       }
    });

    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell!({ includeEmpty: true }, cell => {
            let cellLength = cell.value ? cell.value.toString().length : 0;
            if (cellLength > maxLength) {
                maxLength = cellLength;
            }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength + 2;
    });
     worksheet.getColumn('summary').width = 40;
     worksheet.getColumn('rationale').width = 40;

    const buffer = await workbook.xlsx.writeBuffer();
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
    URL.revokeObjectURL(url);
  };

  const handleDownloadQuestionsPDF = () => {
     if (interviewQuestions.length === 0) {
         toast({
             title: "No Questions",
             description: "There are no interview questions to download.",
             variant: "destructive",
         });
         return;
     }

     const doc = new jsPDF();
     doc.setFontSize(16);
     doc.text("Interview Questions", 10, 10);
     doc.setFontSize(12);

     let yPos = 25; // Start position for questions
     const pageHeight = doc.internal.pageSize.height;
     const margin = 10;

     interviewQuestions.forEach((question, index) => {
         const textLines = doc.splitTextToSize(`${index + 1}. ${question}`, doc.internal.pageSize.width - margin * 2);
         const textHeight = textLines.length * (doc.getLineHeight() / doc.internal.scaleFactor);

         if (yPos + textHeight > pageHeight - margin) {
             doc.addPage();
             yPos = margin; // Reset yPos for new page
         }

         doc.text(textLines, margin, yPos);
         yPos += textHeight + 5; // Add some space between questions
     });

     doc.save('interview_questions.pdf');
  };


  // Effect to fetch data when isResultsDisplayed becomes true
  useEffect(() => {
    const fetchData = async () => {
      if (!isResultsDisplayed || !jobDescription || !resumesText) {
        return;
      }

      setLoading(true);
      setError(null);
      setResults([]);

      try {
        const resumesArray = resumesText.split(/\n\s*\n\s*\n/).map(r => r.trim()).filter(text => text !== '');
        if (resumesArray.length === 0) {
             setError("No valid resumes found in the input. Please ensure resumes are separated correctly or uploaded.");
             setLoading(false);
             return;
         }

        const apiResults = await rankResumes({ jobDescription, resumes: resumesArray });
        setResults(apiResults);
        setError(null);
      } catch (err: any) {
        console.error("Error ranking resumes:", err);
        setError(err.message || "An error occurred while analyzing resumes.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResultsDisplayed]); // Only trigger when isResultsDisplayed changes


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner */}
       <div className="relative bg-primary text-primary-foreground p-4 flex flex-col items-center shadow-md">
         {/* Logout Button Top Right */}
         <div className="absolute top-4 right-4">
           <Button
             variant="secondary"
             onClick={handleSignOut}
             aria-label="Logout"
             suppressHydrationWarning={true}
             disabled={!auth} // Disable if auth isn't ready
           >
             <Icons.logout className="mr-2 h-4 w-4" /> Logout
           </Button>
         </div>

        {/* Fixed SVG Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="h-20 w-auto rounded-md shadow-md mb-2 object-contain" // Keep styling similar
          fill="hsl(25, 75%, 65%)" // Approximate color from image
        >
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(25, 85%, 75%)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(25, 65%, 55%)', stopOpacity: 1 }} />
            </linearGradient>
             <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" style={{ stopColor: 'hsl(25, 85%, 75%)', stopOpacity: 0.8 }} />
               <stop offset="100%" style={{ stopColor: 'hsl(25, 65%, 55%)', stopOpacity: 0.8 }} />
             </linearGradient>
          </defs>
          <path
            fill="url(#grad1)"
            d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0 0 114.6 0 256s114.6 256 256 256zM138.8 144.8C180.2 105.8 240.1 83 304.1 83c39.8 0 76.4 11.8 106.9 31.9-30.6 17.9-65.1 29.4-101.8 33.9-40.2 4.9-80.8 2.1-119.1-8.6-17.5-4.9-34.4-10.7-50.1-17.4zm234.4 222.4c-41.4 39-101.3 61.8-165.3 61.8-39.8 0-76.4-11.8-106.9-31.9 30.6-17.9 65.1-29.4 101.8-33.9 40.2-4.9 80.8-2.1 119.1 8.6 17.5 4.9 34.4 10.7 50.1 17.4z"
          />
          <path
              fill="url(#grad2)"
              d="M108.9 304.1C83 240.1 105.8 180.2 144.8 138.8c4.9-17.5 10.7-34.4 17.4-50.1 17.9-30.6 29.4-65.1 33.9-101.8 4.9-40.2 2.1-80.8-8.6-119.1C219.6 44.2 237.4 32 256 32s36.4 12.2 51.9 29.9c10.7 38.3 13.5 78.9 8.6 119.1-4.5 36.7-16 71.2-33.9 101.8-6.7 15.7-12.5 32.6-17.4 50.1-39 41.4-61.8 101.3-61.8 165.3 0 18.6-12.2 36.4-29.9 51.9-38.3-10.7-78.9-13.5-119.1-8.6-36.7 4.5-71.2 16-101.8 33.9-15.7 6.7-32.6 12.5-50.1 17.4 41.4-39 61.8-101.3 61.8-165.3z"
              opacity="0.8"
            />

        </svg>
        <h1 className="text-2xl font-bold mt-2">Resume Screening App</h1>
      </div>

      <div className="container mx-auto p-4 flex-grow">
         {/* File Converter Section */}
         <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">File Converter (PDF/DOCX to TXT)</h2>
            <FileConverter />
         </div>
         <Separator className="my-6" />


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Description Input Section */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Job Description Input</h2>
            <div className="flex-grow">
              <JobDescriptionInput
                onJDChange={handleJDChange}
                clear={clearJDTrigger}
                onClear={() => handleClearComplete('jd')}
              />
            </div>
             {/* Generate Questions Button */}
             <Button
                onClick={handleGenerateQuestions}
                disabled={!isJDValid || isGeneratingQuestions}
                aria-label="Generate interview questions"
                className="mt-4"
                suppressHydrationWarning={true}
              >
                 {isGeneratingQuestions ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                   <Icons.wand className="mr-2 h-4 w-4" /> {/* Consider an appropriate icon */}
                   Generate Questions
                 </>
                )}
              </Button>
          </div>

          {/* Resume Upload Section */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
            <ResumeUpload
              onResumesChange={handleResumesChange}
              clear={clearResumesTrigger}
              onClear={() => handleClearComplete('resumes')}
            />
          </div>
        </div>

        {/* Start and Reset Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            onClick={handleStart}
            disabled={!isStartActive || loading} // Also disable while loading results
            aria-label="Start analysis"
            suppressHydrationWarning={true}
          >
             {loading ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
               <>
                <Icons.play className="mr-2 h-4 w-4" /> {/* Added play icon */}
                Start
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isResetActive}
            aria-label="Reset inputs and results"
            suppressHydrationWarning={true}
          >
             <Icons.refresh className="mr-2 h-4 w-4" /> {/* Added refresh icon */}
            Reset
          </Button>
        </div>

        {/* Results and Questions Display Section */}
        {(isResultsDisplayed || showInterviewQuestions) && (
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 mt-6">
             <Tabs value={activeTab} onValueChange={setActiveTab}>
               <TabsList className="grid w-full grid-cols-2">
                 <TabsTrigger value="results" disabled={!isResultsDisplayed}>Resume Ranking</TabsTrigger>
                 <TabsTrigger value="questions" disabled={!showInterviewQuestions}>Interview Questions</TabsTrigger>
               </TabsList>
               {/* Results Tab */}
               <TabsContent value="results">
                 <h2 className="text-xl font-semibold mb-4 sr-only">Results</h2> {/* Title handled by TabTrigger */}
                  {loading ? (
                    <Alert>
                      <Icons.loader className="h-4 w-4 animate-spin" />
                      <AlertTitle>Analyzing Resumes</AlertTitle>
                      <AlertDescription>
                        Please wait while the resumes are being analyzed...
                      </AlertDescription>
                    </Alert>
                  ) : error ? (
                       <Alert variant="destructive">
                         <Icons.alertCircle className="h-4 w-4" />
                         <AlertTitle>Error Ranking Resumes</AlertTitle>
                         <AlertDescription>{error}</AlertDescription>
                       </Alert>
                  ) : results.length > 0 ? (
                    <>
                      <ResultsDisplay results={results} />
                       <div className="flex justify-end mt-4">
                          <Button
                            variant="secondary"
                            onClick={handleDownloadExcel}
                            aria-label="Download results as Excel file"
                            suppressHydrationWarning={true}
                          >
                            <Icons.file className="mr-2 h-4 w-4" />
                            Download XLS
                          </Button>
                        </div>
                    </>
                  ) : isResultsDisplayed ? (
                    // Show if triggered but no results (and not loading/error)
                    <p className="text-center text-muted-foreground mt-4">No ranking results to display.</p>
                  ): null /* Don't show anything if not triggered */}
               </TabsContent>

               {/* Interview Questions Tab */}
                <TabsContent value="questions">
                  <h2 className="text-xl font-semibold mb-4 sr-only">Interview Questions</h2> {/* Title handled by TabTrigger */}
                   {isGeneratingQuestions ? (
                     <Alert>
                       <Icons.loader className="h-4 w-4 animate-spin" />
                       <AlertTitle>Generating Questions</AlertTitle>
                       <AlertDescription>
                         Please wait while interview questions are being generated...
                       </AlertDescription>
                     </Alert>
                   ) : questionGenerationError ? (
                        <Alert variant="destructive">
                          <Icons.alertCircle className="h-4 w-4" />
                          <AlertTitle>Error Generating Questions</AlertTitle>
                          <AlertDescription>{questionGenerationError}</AlertDescription>
                        </Alert>
                   ) : interviewQuestions.length > 0 ? (
                     <>
                       <InterviewQuestionsDisplay questions={interviewQuestions} />
                       <div className="flex justify-end mt-4">
                         <Button
                           variant="secondary"
                           onClick={handleDownloadQuestionsPDF}
                           aria-label="Download questions as PDF file"
                           suppressHydrationWarning={true}
                         >
                           <Icons.fileText className="mr-2 h-4 w-4" /> {/* Use FileText icon */}
                           Download PDF
                         </Button>
                       </div>
                     </>
                   ) : showInterviewQuestions ? (
                     // Show if triggered but no questions (and not loading/error)
                    <p className="text-center text-muted-foreground mt-4">No interview questions to display.</p>
                   ) : null /* Don't show anything if not triggered */}
                </TabsContent>
             </Tabs>
          </div>
        )}
      </div>
      {/* Toaster for displaying notifications */}
       <Toaster />
    </div>
  );
}
