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

const ResultsDisplay = () => {
  // Placeholder data for demonstration
  const results = [
    {
      name: 'John Doe',
      summary: 'Experienced software engineer with a focus on web development.',
      score: 85,
      rationale: 'Strong skills match and relevant experience.',
      breakdown: {
        essentialSkillsMatch: 90,
        relevantExperience: 80,
        requiredQualifications: 100,
        keywordPresence: 70,
      },
      recommendation: 'Strong Match - Shortlist for interview',
    },
    {
      name: 'Jane Smith',
      summary: 'Recent graduate with internship experience in data analysis.',
      score: 60,
      rationale: 'Lacks required experience but has a good skills match.',
      breakdown: {
        essentialSkillsMatch: 75,
        relevantExperience: 40,
        requiredQualifications: 80,
        keywordPresence: 45,
      },
      recommendation: 'Moderate Match - Further review needed',
    },
  ];

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
        {results.map((result) => (
          <TableRow key={result.name}>
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
