'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { List } from "lucide-react";

interface InterviewQuestionsDisplayProps {
  questions: string[];
}

const InterviewQuestionsDisplay: React.FC<InterviewQuestionsDisplayProps> = ({ questions }) => {
  if (!questions || questions.length === 0) {
    // Parent component handles loading/error, show message if questions array is empty
    return <p className="text-center text-muted-foreground">No interview questions generated.</p>;
  }

  return (
    <ScrollArea className="h-72 w-full rounded-md border p-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <List className="mr-2 h-5 w-5" /> Generated Interview Questions
      </h3>
      <ol className="list-decimal list-inside space-y-2">
        {questions.map((question, index) => (
          <li key={index} className="text-sm">
            {question}
          </li>
        ))}
      </ol>
    </ScrollArea>
  );
};

export default InterviewQuestionsDisplay;
