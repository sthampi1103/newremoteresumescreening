'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';

interface JobDescriptionInputProps {
  onJDChange: (jd: string) => void;
  onReset: () => void;
  clear: boolean;
  onClear: () => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJDChange,
  onReset,
  clear,
  onClear,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clear) {
      setJobDescription('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input
      }
      setErrorMessage('');
      onJDChange(''); // Notify parent component
      onClear();
    }
  }, [clear, onJDChange, onClear]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    onJDChange(e.target.value); // Notify parent component
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      const isValidFileType = selectedFile.type
        ? [
            'application/pdf',
            'application/msword',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(selectedFile.type)
        : false;

      if (!isValidFileType) {
        setErrorMessage(
          'Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.'
        );
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setErrorMessage('');

      // Read the file content
      try {
        const fileContent = await readFileContent(selectedFile);
        setJobDescription(fileContent);
        onJDChange(fileContent); // Notify parent component
      } catch (error) {
        console.error('Error reading file:', error);
        setErrorMessage('Failed to read the file. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to read the job description file.',
          variant: 'destructive',
        });
        setFile(null);
      }
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read the file'));
      };

      reader.readAsText(file);
    });
  };

  const handleClear = () => {
    setJobDescription('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input
    }
    setErrorMessage('');
    onJDChange(''); // Notify parent component
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          id="jobDescriptionFile"
          ref={fileInputRef}
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
      <Textarea
        placeholder="Enter job description here..."
        value={jobDescription}
        onChange={handleTextChange}
        className="mb-4"
      />

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default JobDescriptionInput;
