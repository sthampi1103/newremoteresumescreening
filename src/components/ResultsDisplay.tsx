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

interface ResultsDisplayProps {
  jobDescription: string;
  resumesText: string;
  setResults: (results: any[]) => void; // Function to set results state in parent
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ jobDescription, resumesText, setResults }) => {
  const [loading, setLoading] = useState(true);
  const [internalResults, setInternalResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resumesArray = resumesText.split('\n').filter(text => text.trim() !== '');
        const apiResults = await rankResumes({ jobDescription: jobDescription, resumes: resumesArray });
        setResults(apiResults); // Update the results state in the parent
        setInternalResults(apiResults); // Update the internal state
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately
      } finally {
        setLoading(false);
      }
    };

    if (jobDescription && resumesText) {
      fetchData();
    }
  }, [jobDescription, resumesText, setResults]);

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
            <TableCell colSpan={6} className="text-center">Loading...</TableCell>
          </TableRow>
        ) : internalResults && internalResults.length > 0 ? ( // Conditionally render the table based on results
          internalResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.name}</TableCell>
              <TableCell>{result.summary}</TableCell>
              <TableCell>{result.score}</TableCell>
              <TableCell>{result.rationale}</TableCell>
              <TableCell>
                Essential Skills: {result.breakdown.essentialSkillsMatch}, Experience: {result.breakdown.relevantExperience}, Qualifications: {result.breakdown.requiredQualifications}, Keywords: {result.breakdown.keywordPresence}
              </TableCell>
              <TableCell>{result.recommendation}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center">No results to display.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ResultsDisplay;
