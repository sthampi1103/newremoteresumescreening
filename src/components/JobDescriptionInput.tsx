'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {Icons} from "@/components/icons";

interface JobDescriptionInputProps {
  onJDChange: (jd: string, isValid: boolean) => void; // Pass validity state
  clear: boolean;
  onClear: () => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJDChange,
  clear,
  onClear,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const {toast} = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndNotify = useCallback((text: string) => {
    const isValid = text.trim() !== '';
    onJDChange(text, isValid);
  }, [onJDChange]);


  useEffect(() => {
    if (clear) {
      setJobDescription('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input
      }
      setErrorMessage('');
      validateAndNotify(''); // Notify parent component that it's now empty/invalid
      onClear(); // Signal clear completion
    }
  }, [clear, validateAndNotify, onClear]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJobDescription(newText);
    setFile(null); // Clear file if user starts typing
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setErrorMessage('');
    validateAndNotify(newText); // Notify parent component
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setErrorMessage(''); // Clear previous errors

    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'text/plain', // .txt
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        // Add other potential MIME types if necessary
      ];
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

      // Basic type check based on extension if MIME type is unreliable
      const isValidExtension = fileExtension && ['pdf', 'doc', 'docx', 'txt'].includes(fileExtension);
      const isValidMimeType = selectedFile.type && allowedTypes.includes(selectedFile.type);


      if (!isValidMimeType && !isValidExtension) {
         const errorMsg = `Invalid file type: "${selectedFile.name}". Please upload a PDF, DOCX, DOC, or TXT file.`;
         setErrorMessage(errorMsg);
         toast({ title: "Error", description: errorMsg, variant: "destructive" });
         setFile(null);
         setJobDescription(''); // Clear text area if invalid file is chosen
         validateAndNotify(''); // Notify parent
         if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
         return;
      }


      setFile(selectedFile);
      setJobDescription(''); // Clear text area when a file is selected

      // Read the file content
      try {
        const fileContent = await readFileContent(selectedFile);
        if (fileContent === null) {
            // Error handled within readFileContent
            setFile(null);
            validateAndNotify('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            setJobDescription(fileContent);
            validateAndNotify(fileContent); // Notify parent component
        }
      } catch (error) { // Catch errors from readFileContent promise rejection
        console.error('Error reading file:', error);
        const errorMsg = `Failed to read file "${selectedFile.name}". It might be corrupted or in an unreadable format.`;
        setErrorMessage(errorMsg);
        toast({
          title: 'Error Reading File',
          description: errorMsg,
          variant: 'destructive',
        });
        setFile(null);
        setJobDescription('');
        validateAndNotify('');
         if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
        // No file selected, might happen if user cancels file dialog
        setFile(null);
        // If text area was already cleared, ensure parent knows it's invalid
        if (!jobDescription) {
            validateAndNotify('');
        }
    }
  };

  const readFileContent = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        if (event.target && typeof event.target.result === 'string') {
          // Basic check for unreadable content (e.g., binary data read as text)
          // This is a very basic check and might need refinement
          const content = event.target.result;
          if (content.includes('�') && file.type !== 'text/plain') {
             console.warn(`File "${file.name}" might contain unreadable characters.`);
             // Optionally reject or show a warning toast here if it's likely unreadable
             // For now, resolve but maybe add a flag or different handling later
          }
          if (content.trim() === '') {
            const errorMsg = `File "${file.name}" appears to be empty or unreadable.`;
            setErrorMessage(errorMsg);
            toast({ title: 'File Error', description: errorMsg, variant: 'destructive' });
            resolve(null); // Resolve with null to indicate failure
          } else {
            resolve(content);
          }
        } else {
           // This case should ideally not happen for readAsText, but handle defensively
          reject(new Error('Failed to read file content as text.'));
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error(`Error reading file "${file.name}"`));
      };

       reader.onabort = () => {
         console.log(`File reading aborted for "${file.name}"`);
         reject(new Error(`File reading aborted for "${file.name}"`));
       };

      // Always read as text for now. More complex parsing (PDF, DOCX) would require libraries.
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
      validateAndNotify(''); // Notify parent component
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <Input
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf,application/msword,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          id="jobDescriptionFile"
          ref={fileInputRef}
          className="hidden" // Keep hidden, use label for interaction
          aria-label="Upload Job Description File"
        />
        <label
          htmlFor="jobDescriptionFile"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 cursor-pointer"
          role="button" // Add role for accessibility
          tabIndex={0} // Make label focusable
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }} // Allow activation with keyboard
        >
         <Icons.fileUpload className="mr-2 h-4 w-4" /> {/* Added Icon */}
          Upload File
        </label>
        {file && <span className="text-sm truncate" title={file.name}>Selected: {file.name}</span>}
      </div>
      <Textarea
        placeholder="Or paste job description here..."
        value={jobDescription}
        onChange={handleTextChange}
        className="mb-4 min-h-[150px]" // Increased min-height
         aria-label="Job Description Text Input"
      />
        <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={handleClear} disabled={!jobDescription && !file}>
                Clear JD
            </Button>
        </div>
      {errorMessage && <p className="text-destructive text-sm mt-2">{errorMessage}</p>}
    </div>
  );
};

export default JobDescriptionInput;
