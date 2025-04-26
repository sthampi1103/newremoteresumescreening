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
import type { RankResumesOutput } from "@/ai/flows/rank-resumes"; // Import the type

interface ResultsDisplayProps {
  results: RankResumesOutput; // Expect results to be passed as props
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {

  // No useEffect for fetching needed here anymore, data comes from parent

  if (!results || results.length === 0) {
      // Parent component (Home.tsx) will handle loading/error display.
      // Show a message if results array is explicitly empty after loading/no error.
      return <p className="text-center text-muted-foreground">No results to display.</p>;
  }


  return (
    <Table>
      <TableCaption>A list of ranked resumes based on the job description.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Name</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead className="text-right w-[80px]">Score</TableHead>
          <TableHead>Rationale</TableHead>
          <TableHead className="w-[250px]">Breakdown (Skills/Exp/Qual/Keywords)</TableHead>
          <TableHead className="w-[180px]">Recommendation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
         {results.map((result, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
              <TableCell className="font-medium">{result.name || 'N/A'}</TableCell>
              <TableCell>{result.summary || 'No summary available.'}</TableCell>
              <TableCell className="text-right">{result.score ?? 'N/A'}</TableCell>
              <TableCell>{result.rationale || 'No rationale provided.'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {result.breakdown ? (
                    `Skills: ${result.breakdown.essentialSkillsMatch ?? 'N/A'}, Exp: ${result.breakdown.relevantExperience ?? 'N/A'}, Qual: ${result.breakdown.requiredQualifications ?? 'N/A'}, Keywords: ${result.breakdown.keywordPresence ?? 'N/A'}`
                ): 'N/A'}
              </TableCell>
               <TableCell>{result.recommendation || 'No recommendation.'}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default ResultsDisplay;
