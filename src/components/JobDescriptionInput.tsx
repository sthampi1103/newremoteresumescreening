'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const JobDescriptionInput = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic file type validation
      if (!['application/pdf', 'application/msword', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
        setErrorMessage('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleJDInputComplete = () => {
    // Implement any logic needed when the JD input is complete
    console.log('Job description input complete');
  };

  return (
    <div>
      <Textarea
        placeholder="Enter job description here..."
        value={jobDescription}
        onChange={handleTextChange}
        className="mb-4"
      />

      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          id="jobDescriptionFile"
          className="hidden"
        />
        <label
          htmlFor="jobDescriptionFile"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 cursor-pointer"
        >
          Upload File
        </label>
        {file && <span className="text-sm">Selected file: {file.name}</span>}
      </div>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      <Button onClick={handleJDInputComplete} className="bg-accent text-accent-foreground hover:bg-accent/90">
        JD Input Complete
      </Button>
    </div>
  );
};

export default JobDescriptionInput;
