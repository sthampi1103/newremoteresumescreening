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
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { appInitialized, app } from './firebaseConfig'; // Ensure app and appInitialized are imported if needed for auth checks later
import { getAuth } from 'firebase/auth';
import { rankResumes } from '@/ai/flows/rank-resumes'; // Ensure rankResumes is imported

// Note: If you encounter a runtime error like "Cannot read properties of null (reading 'type')"
// originating from a browser extension (e.g., chrome-extension://.../inpage.js),
// it's likely caused by the extension interfering with the page, not a bug in this application.
// Try disabling the problematic browser extension (like crypto wallets) and reloading the page.

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumesText, setResumesText] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isStartActive, setIsStartActive] = useState(false);
  const [isResetActive, setIsResetActive] = useState(false);
  const [isResultsDisplayed, setIsResultsDisplayed] = useState(false);
  const [logo, setLogo] = useState<string>('/logo.png'); // Set initial logo path, type string
  const [clearJDTrigger, setClearJDTrigger] = useState(false);
  const [clearResumesTrigger, setClearResumesTrigger] = useState(false);
  const [loading, setLoading] = useState(false); // Manage loading state locally
  const [error, setError] = useState<string | null>(null); // Manage error state locally
  const [isJDValid, setIsJDValid] = useState(false);
  const [areResumesValid, setAreResumesValid] = useState(false);

  const router = useRouter();
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect to auth page if Firebase isn't initialized or user isn't logged in
  useEffect(() => {
    if (!appInitialized) {
      // Optional: Show a toast or message before redirecting
      // toast({ title: "Error", description: "Firebase not initialized. Redirecting to login.", variant: "destructive" });
      // Redirect immediately might be jarring, consider a loading state or message first.
      // For now, redirecting directly as per previous implicit behavior.
      // router.push('/auth'); // Commented out as per user request to remove redirect logic from Home
      return; // Stop further execution in this effect
    }

    // Check auth state if Firebase is initialized
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
         router.push('/auth'); // Redirect if not logged in
      }
      // If user exists, stay on this page
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]); // Added router to dependency array


  // Load logo from local storage on initial render
  useEffect(() => {
      const savedLogo = localStorage.getItem('appLogo');
      if (savedLogo) {
          setLogo(savedLogo);
      }
  }, []);


  // Check if inputs are valid whenever jobDescription or resumesText changes
  useEffect(() => {
    // Start button active only if both JD and Resumes are valid and results are not currently displayed
    const shouldStartBeActive = isJDValid && areResumesValid && !isResultsDisplayed;
    setIsStartActive(shouldStartBeActive);

    // Enable reset button if any input has content or results are displayed
    const shouldResetBeActive =
      jobDescription.trim() !== '' ||
      resumesText.trim() !== '' ||
      results.length > 0 || isResultsDisplayed;
    setIsResetActive(shouldResetBeActive);
  }, [jobDescription, resumesText, results, isJDValid, areResumesValid, isResultsDisplayed]); // Added isJDValid, areResumesValid, isResultsDisplayed

  const handleJDChange = (jd: string, isValid: boolean) => {
    setJobDescription(jd);
    setIsJDValid(isValid); // Update JD validity state
  };

  const handleResumesChange = (resumes: string, isValid: boolean) => {
    setResumesText(resumes);
    setAreResumesValid(isValid); // Update Resumes validity state
  };

  const handleStart = async () => { // Removed jd and resumes params as they are now state variables
    if (!isJDValid || !areResumesValid) {
      toast({
        title: "Input Incomplete",
        description: "Please provide both a job description and at least one resume.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true); // Set loading state
    setError(null); // Clear previous errors
    setIsResultsDisplayed(true); // Indicate that results should be displayed/fetched
    setIsStartActive(false); // Deactivate Start button after clicking
    // ResultsDisplay component will fetch data based on isTriggered=true
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
           const newLogo = event.target.result;
           setLogo(newLogo);
           localStorage.setItem('appLogo', newLogo); // Save logo to local storage
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
    setIsStartActive(false); // Reset start button state
    setIsResetActive(false); // Reset button should become inactive after reset
    setIsResultsDisplayed(false);
    setLogo('/logo.png'); // Reset to the default logo path
    localStorage.removeItem('appLogo'); // Remove saved logo
    setLoading(false); // Reset loading state
    setError(null); // Reset error state
    setIsJDValid(false); // Reset JD validity
    setAreResumesValid(false); // Reset Resumes validity
    // Trigger clear in child components
    setClearJDTrigger(true);
    setClearResumesTrigger(true);
  };

  // Callback to reset the trigger state in child components
  const handleClearComplete = useCallback((type: 'jd' | 'resumes') => {
    if (type === 'jd') {
      setClearJDTrigger(false);
    } else if (type === 'resumes') {
      setClearResumesTrigger(false);
    }
  }, []);


  const handleDownload = async () => {
    if (results.length === 0) {
        toast({
            title: "No Results",
            description: "There are no results to download.",
            variant: "destructive",
        });
        return;
    }

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

     // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'FFDDDDDD'} // Light Gray fill
    };
     worksheet.getRow(1).border = {
        bottom: { style: 'thin' }
     };


    // Add data rows
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
       // Alternate row colors for better readability
       if ((index + 1) % 2 === 0) {
         row.fill = {
           type: 'pattern',
           pattern:'solid',
           fgColor:{argb:'FFF5F5F5'} // Very light gray
         };
       }
    });

    // Auto-fit columns based on content (optional, can sometimes be imperfect)
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell!({ includeEmpty: true }, cell => {
            let cellLength = cell.value ? cell.value.toString().length : 0;
            if (cellLength > maxLength) {
                maxLength = cellLength;
            }
        });
        column.width = maxLength < 10 ? 10 : maxLength > 50 ? 50 : maxLength + 2; // Min width 10, max 50
    });
    // Explicitly set widths again if auto-fit isn't desired or needs adjustment
     worksheet.getColumn('summary').width = 40;
     worksheet.getColumn('rationale').width = 40;


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
    URL.revokeObjectURL(url); // Clean up the object URL
  };

  // Effect to fetch data when isResultsDisplayed becomes true
  useEffect(() => {
    const fetchData = async () => {
      if (!isResultsDisplayed || !jobDescription || !resumesText) {
        // Don't fetch if not triggered or inputs are missing
        return;
      }

      // Reset states before fetching
      setLoading(true);
      setError(null);
      setResults([]); // Clear previous results

      try {
        // Use the rankResumes flow
        const resumesArray = resumesText.split(/\n\s*\n\s*\n/).map(r => r.trim()).filter(text => text !== '');
        if (resumesArray.length === 0) {
             setError("No valid resumes found in the input. Please ensure resumes are separated correctly or uploaded.");
             setLoading(false);
             return;
         }

        const apiResults = await rankResumes({ jobDescription, resumes: resumesArray });
        setResults(apiResults); // Update results state with fetched data
        setError(null); // Clear error on success
      } catch (err: any) {
        console.error("Error ranking resumes:", err);
        setError(err.message || "An error occurred while analyzing resumes.");
        setResults([]); // Clear results on error
      } finally {
        setLoading(false); // Set loading to false after fetch completes or fails
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResultsDisplayed, jobDescription, resumesText]); // Dependencies that trigger the fetch


  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner */}
      <div className="bg-primary text-primary-foreground p-4 flex flex-col items-center shadow-md">
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{display: 'none'}}
          ref={fileInputRef}
          suppressHydrationWarning={true}
        />
        <img
          src={logo}
          alt="Resume Screening App Logo"
          className="h-20 w-auto rounded-md shadow-md cursor-pointer mb-2 object-contain" // Added object-contain
          onClick={handleImageClick}
          suppressHydrationWarning={true} // Suppress hydration warning for the img src
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
              onClear={() => handleClearComplete('jd')} // Use callback
            />
          </div>

          {/* Resume Upload Section */}
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resume Upload</h2>
            <ResumeUpload
              onResumesChange={handleResumesChange}
              clear={clearResumesTrigger}
              onClear={() => handleClearComplete('resumes')} // Use callback
            />
          </div>
        </div>

        {/* Start and Reset Buttons */}
        <div className="flex justify-center mt-6 gap-4">
          <Button
            onClick={handleStart}
            disabled={!isStartActive} // isStartActive already considers !isResultsDisplayed
            aria-label="Start analysis"
            suppressHydrationWarning={true}
          >
             {loading ? (
              <>
                <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Start'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isResetActive}
            aria-label="Reset inputs and results"
            suppressHydrationWarning={true}
          >
            Reset
          </Button>
        </div>

        {/* Results Display Section */}
        {isResultsDisplayed && (
          <div className="bg-card text-card-foreground shadow-md rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {loading ? ( // Show loading indicator
              <Alert>
                <Icons.loader className="h-4 w-4 animate-spin" />
                <AlertTitle>Analyzing Resumes</AlertTitle>
                <AlertDescription>
                  Please wait while the resumes are being analyzed. This might take a moment...
                </AlertDescription>
              </Alert>
            ) : error ? ( // Show error if error exists
                 <Alert variant="destructive">
                   <Icons.alertCircle className="h-4 w-4" />
                   <AlertTitle>Error</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
            ) : ( // Show ResultsDisplay if not loading and no error
              <ResultsDisplay
                results={results} // Pass results state directly
              />
            )}
             {/* Fetching Logic Triggered by handleStart, not directly in ResultsDisplay */}
            {results.length > 0 && !loading && !error && ( // Show download button only when there are results and not loading/error
              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  aria-label="Download results as Excel file"
                  suppressHydrationWarning={true}
                >
                  <Icons.file className="mr-2 h-4 w-4" /> {/* Added Icon */}
                  Download XLS
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Toaster for displaying notifications */}
       <Toaster />
    </div>
  );
}
