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
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ jobDescription, resumesText }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resumesArray = resumesText.split('\n').filter(text => text.trim() !== '');
        const apiResults = await rankResumes({ jobDescription: jobDescription, resumes: resumesArray });
        setResults(apiResults);
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
  }, [jobDescription, resumesText]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
        {results.map((result, index) => (
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
        ))}
      </TableBody>
    </Table>
  );
};

export default ResultsDisplay;
