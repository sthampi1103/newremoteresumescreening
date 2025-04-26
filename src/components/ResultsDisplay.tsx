'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {rankResumes} from "@/ai/flows/rank-resumes";
import {useEffect, useState} from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Icons} from "@/components/icons";

interface ResultsDisplayProps {
  jobDescription: string;
  resumesText: string;
  setResults: (results: any[]) => void; // Function to set results state in parent
  isTriggered: boolean; // New prop to control effect execution
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ jobDescription, resumesText, setResults, isTriggered }) => {
  const [loading, setLoading] = useState(false);
  const [internalResults, setInternalResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isTriggered || !jobDescription || !resumesText) {
        // Don't fetch if not triggered or inputs are missing
        setInternalResults([]);
        setResults([]); // Clear parent results as well
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setInternalResults([]); // Clear previous results before fetching
      setResults([]);

      try {
        // Basic check for resume separation might be needed if format is inconsistent
        // Assuming resumesText contains multiple resumes separated by some delimiter (e.g., newline or specific marker)
        // A more robust parsing logic might be needed depending on actual input format
        const resumesArray = resumesText.split('\n\n').filter(text => text.trim() !== ''); // Example: split by double newline

        if (resumesArray.length === 0) {
          setError("No resumes found in the input text.");
          setLoading(false);
          return;
        }

        const apiResults = await rankResumes({ jobDescription: jobDescription, resumes: resumesArray });
        setResults(apiResults); // Update the results state in the parent
        setInternalResults(apiResults); // Update the internal state
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to analyze resumes. Please check the inputs and try again.");
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobDescription, resumesText, setResults, isTriggered]); // Add isTriggered to dependency array

  return (
    <Table>
      <TableCaption>A list of ranked resumes based on the job description.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Rationale</TableHead>
          <TableHead>Breakdown</TableHead>
          <TableHead>Recommendation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
             <TableCell colSpan={6} className="text-center">
               <div className="flex items-center justify-center space-x-2">
                 <Icons.loader className="h-4 w-4 animate-spin" />
                 <span>Loading...</span>
               </div>
             </TableCell>
          </TableRow>
        ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-destructive">{error}</TableCell>
            </TableRow>
         ) : internalResults && internalResults.length > 0 ? (
          internalResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.name || 'N/A'}</TableCell>
              <TableCell>{result.summary}</TableCell>
              <TableCell>{result.score}</TableCell>
              <TableCell>{result.rationale}</TableCell>
              <TableCell>
                {result.breakdown ? (
                    `Skills: ${result.breakdown.essentialSkillsMatch}, Exp: ${result.breakdown.relevantExperience}, Qual: ${result.breakdown.requiredQualifications}, Keywords: ${result.breakdown.keywordPresence}`
                ): 'N/A'}
              </TableCell>
              <TableCell>{result.recommendation}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">No results to display yet or analysis is pending.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ResultsDisplay;

    