'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { GenerateQnAOutput } from "@/ai/flows/generate-interview-questions"; // Import the updated type
import { MessageSquareQuestion, MessageSquareText } from "lucide-react"; // Use appropriate icons

interface InterviewQnADisplayProps {
  qna: GenerateQnAOutput['qna']; // Expect an array of Q&A pairs
}

const InterviewQnADisplay: React.FC<InterviewQnADisplayProps> = ({ qna }) => {
  if (!qna || qna.length === 0) {
    // Parent component handles loading/error, show message if qna array is empty
    return <p className="text-center text-muted-foreground">No interview Q&A generated.</p>;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {qna.map((item, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="text-left hover:no-underline">
             <div className="flex items-start space-x-2">
                 <MessageSquareQuestion className="h-5 w-5 mt-1 flex-shrink-0" />
                 <span className="flex-grow">{index + 1}. {item.question}</span>
             </div>

          </AccordionTrigger>
          <AccordionContent>
             <div className="flex items-start space-x-2 pl-7"> {/* Indent answer */}
                 <MessageSquareText className="h-5 w-5 mt-1 flex-shrink-0 text-muted-foreground" />
                 <p className="text-sm text-muted-foreground flex-grow">{item.answer}</p>
             </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default InterviewQnADisplay;
