'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumesChange: (resumes: string) => void;
  onStart: (jd: string, resumes: string) => void;
  jobDescription: string;
  setValid: (valid: boolean) => void;
  onReset: () => void;
  clear: boolean;
  onClear: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumesChange, onStart, jobDescription, setValid, onReset, clear, onClear }) => {
  const [resumes, setResumes] = useState<File[]>([]);
  const [resumeText, setResumeText] = useState('');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Validate if resumes are present (either uploaded or typed in)
    const isValid = resumes.length > 0 || (resumeText !== '' && resumeText.trim() !== '');
    setValid(isValid);
  }, [resumes, resumeText, setValid]);

  useEffect(() => {
    if (clear) {
      setResumes([]);
      setResumeText('');
      onResumesChange(''); // Notify parent component
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input
      }
      onClear();
    }
  }, [clear, onResumesChange, onClear]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResumes(files);

    let allResumeText = '';
    for (const file of files) {
      try {
        const fileContent = await readFileContent(file);
        allResumeText += fileContent + '\n';
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          title: "Error",
          description: `Failed to read the file ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    setResumeText(allResumeText);
    onResumesChange(allResumeText); // Notify parent component
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read the file"));
      };

      reader.readAsText(file);
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
    onResumesChange(e.target.value); // Notify parent component
  };

   const handleClear = () => {
        setResumes([]);
        setResumeText('');
        onResumesChange(''); // Notify parent component
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset the file input
        }
    };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          id="resumeFiles"
          className="hidden"
          ref={fileInputRef}
        />
        <label
          htmlFor="resumeFiles"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 cursor-pointer"
        >
          Upload Resumes
        </label>
        {resumes.length > 0 && (
          <span className="text-sm ml-4">
            Selected {resumes.length} file(s): {resumes.map((file) => file.name).join(', ')}
          </span>
        )}
      </div>

      <Textarea
        placeholder="Or enter resume text here..."
        value={resumeText}
        onChange={handleTextChange}
        className="mb-4"
      />
       <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleClear}>
              Clear
          </Button>
       </div>
    </div>
  );
};

export default ResumeUpload;
