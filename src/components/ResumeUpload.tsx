'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState<File[]>([]);
  const [resumeText, setResumeText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResumes((prevResumes) => [...prevResumes, ...files]);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
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
    </div>
  );
};

export default ResumeUpload;
