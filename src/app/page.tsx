import JobDescriptionInput from '@/components/JobDescriptionInput';
import ResumeUpload from '@/components/ResumeUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput />
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-4">
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload />
        </CardContent>
      </Card>

      <Separator className="my-5" />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsDisplay />
        </CardContent>
      </Card>
    </div>
  );
}
