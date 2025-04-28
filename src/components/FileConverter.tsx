// src/components/FileConverter.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth/mammoth.browser'; // For DOCX
import * as pdfjsLib from 'pdfjs-dist';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea

// Dynamically import the worker entry point
// This tells the bundler (like Webpack used by Next.js) to handle the worker file.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}


interface FileConverterProps {}

const FileConverter: React.FC<FileConverterProps> = () => {
  const [inputFiles, setInputFiles] = useState<File[]>([]); // State for multiple files
  const [isConverting, setIsConverting] = useState(false);
  const [conversionErrors, setConversionErrors] = useState<string[]>([]); // Store multiple errors
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setConversionErrors([]); // Clear previous errors
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validFiles: File[] = [];
    const invalidFileMessages: string[] = [];

    files.forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
       if (!fileExtension || !['pdf', 'docx'].includes(fileExtension)) {
           invalidFileMessages.push(`Invalid file type: "${file.name}". Only PDF or DOCX allowed.`);
       } else {
            validFiles.push(file);
       }
    });

    if (invalidFileMessages.length > 0) {
        setConversionErrors(invalidFileMessages);
         toast({
           title: "Invalid Files Detected",
           description: invalidFileMessages.join(' '), // Show all errors
           variant: "destructive"
         });
    }

    setInputFiles(prevFiles => [...prevFiles, ...validFiles]); // Append valid files

    // Reset input field value to allow selecting the same file(s) again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

   const removeFile = (indexToRemove: number) => {
        setInputFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

  const handleConvertAndDownload = async () => {
    if (inputFiles.length === 0) {
      toast({ title: "No Files", description: "Please select one or more PDF or DOCX files to convert.", variant: "destructive" });
      return;
    }

    setIsConverting(true);
    setConversionErrors([]);
    let filesConvertedCount = 0;
    const currentErrors: string[] = [];

    for (const file of inputFiles) {
        try {
            let textContent = '';
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'docx') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                textContent = result.value;
            } else if (fileExtension === 'pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdf.numPages;
                let fullText = '';
                for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContentPage = await page.getTextContent();
                // Ensure item.str exists before joining
                const pageText = textContentPage.items.map(item => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n'; // Add newline between pages
                }
                textContent = fullText;
            } else {
                throw new Error("Unsupported file type."); // Should not happen
            }

            if (!textContent.trim()) {
                throw new Error(`Could not extract text from "${file.name}". It might be empty or image-based.`);
            }

            // Create a Blob and download link for each file
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
            link.download = `${baseName}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            filesConvertedCount++;

        } catch (error: any) {
            console.error(`Conversion error for ${file.name}:`, error);
            const errorMsg = `Failed to convert ${file.name}: ${error.message || 'Unknown error'}`;
            currentErrors.push(errorMsg);
        }
    } // End of loop

    setIsConverting(false);
    setConversionErrors(currentErrors); // Update state with errors encountered during the batch

    if (filesConvertedCount > 0) {
         toast({
           title: "Conversion Complete",
           description: `Successfully converted and downloaded ${filesConvertedCount} file(s). ${currentErrors.length > 0 ? `Encountered ${currentErrors.length} error(s).` : ''}`
         });
    } else if (currentErrors.length > 0) {
         toast({
            title: "Conversion Failed",
            description: `Could not convert any files. Errors: ${currentErrors.join(' ')}`,
            variant: "destructive"
         });
    }

    // Clear file list after attempting conversion
    setInputFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
       <div className="flex flex-col space-y-2">
           <Input
               type="file"
               accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
               onChange={handleFileChange}
               id="fileConverterInput"
               ref={fileInputRef}
               className="hidden"
               aria-label="Upload PDF or DOCX Files for Conversion"
               suppressHydrationWarning // Added suppressHydrationWarning
               multiple // Allow multiple file selection
           />
           <label
               htmlFor="fileConverterInput"
               className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 cursor-pointer w-fit" // Use w-fit
               role="button"
               tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
               suppressHydrationWarning
           >
               <Icons.fileUp className="mr-2 h-4 w-4" /> {/* Changed icon */}
               Select Files (PDF/DOCX) {/* Updated text */}
           </label>

            {/* Display list of selected files */}
           {inputFiles.length > 0 && (
               <div className="space-y-2">
                   <p className="text-sm font-medium">Selected files ({inputFiles.length}):</p>
                   <ScrollArea className="h-24 w-full rounded-md border p-2">
                       <ul className="space-y-1">
                       {inputFiles.map((file, index) => (
                           <li key={index} className="flex items-center justify-between group text-sm">
                           <span className="truncate mr-2 flex-1" title={file.name}>{file.name}</span>
                           <Button
                               variant="ghost"
                               size="icon"
                               className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                               onClick={() => removeFile(index)}
                               aria-label={`Remove ${file.name}`}
                               suppressHydrationWarning
                           >
                               <Icons.close className="h-3 w-3" />
                           </Button>
                           </li>
                       ))}
                       </ul>
                   </ScrollArea>
               </div>
           )}
       </div>

      {conversionErrors.length > 0 && (
        <Alert variant="destructive" suppressHydrationWarning>
          <Icons.alertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Error(s)</AlertTitle>
           {conversionErrors.map((error, index) => (
             <AlertDescription key={index}>{error}</AlertDescription>
           ))}
        </Alert>
      )}

      <Button
        onClick={handleConvertAndDownload}
        disabled={inputFiles.length === 0 || isConverting}
        aria-label="Convert to TXT and Download"
        suppressHydrationWarning
      >
        {isConverting ? (
          <>
            <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Icons.download className="mr-2 h-4 w-4" /> {/* Changed icon */}
            Convert & Download TXT ({inputFiles.length}) {/* Show count */}
          </>
        )}
      </Button>
    </div>
  );
};

export default FileConverter;
