// src/components/FileConverter.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth/mammoth.browser'; // For DOCX
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set worker source for pdf.js
// Use a known working version from the installed package.json.
// If pdfjs-dist version changes, this might need updating.
// The error log reported version 4.10.38, while package.json has 4.4.168. Using the package.json version explicitly.
const PDFJS_VERSION = '4.4.168'; // As per package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;


interface FileConverterProps {}

const FileConverter: React.FC<FileConverterProps> = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setConversionError(null); // Clear previous errors
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
       const fileExtension = file.name.split('.').pop()?.toLowerCase();

       if (!fileExtension || !['pdf', 'docx'].includes(fileExtension) || !allowedTypes.includes(file.type)) {
         const errorMsg = `Invalid file type: "${file.name}". Please upload a PDF or DOCX file for conversion.`;
         setConversionError(errorMsg);
         toast({ title: "Error", description: errorMsg, variant: "destructive" });
         setInputFile(null);
         if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
         return;
       }

      setInputFile(file);
    } else {
        setInputFile(null);
    }
  };

  const handleConvertAndDownload = async () => {
    if (!inputFile) {
      toast({ title: "No File", description: "Please select a PDF or DOCX file to convert.", variant: "destructive" });
      return;
    }

    setIsConverting(true);
    setConversionError(null);

    try {
      let textContent = '';
      const fileExtension = inputFile.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'docx') {
        const arrayBuffer = await inputFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        textContent = result.value;
      } else if (fileExtension === 'pdf') {
        const arrayBuffer = await inputFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        let fullText = '';
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContentPage = await page.getTextContent();
          const pageText = textContentPage.items.map(item => ('str' in item ? item.str : '')).join(' ');
          fullText += pageText + '\n'; // Add newline between pages
        }
        textContent = fullText;
      } else {
          throw new Error("Unsupported file type for conversion."); // Should not happen due to initial check
      }

      if (!textContent.trim()) {
          throw new Error("Could not extract text from the file. It might be empty or image-based.");
      }

      // Create a Blob and download link
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const baseName = inputFile.name.substring(0, inputFile.name.lastIndexOf('.'));
      link.download = `${baseName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Success", description: `Successfully converted ${inputFile.name} to TXT.` });
      setInputFile(null); // Clear selection after successful download
       if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: any) {
      console.error('Conversion error:', error);
      const errorMsg = `Failed to convert file: ${error.message || 'Unknown error'}`;
      setConversionError(errorMsg);
      toast({ title: "Conversion Failed", description: errorMsg, variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center space-x-4">
           <Input
               type="file"
               accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
               onChange={handleFileChange}
               id="fileConverterInput"
               ref={fileInputRef}
               className="hidden"
               aria-label="Upload PDF or DOCX File for Conversion"
               suppressHydrationWarning={true} // Added suppressHydrationWarning
           />
           <label
               htmlFor="fileConverterInput"
               className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 cursor-pointer"
               role="button"
               tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
               suppressHydrationWarning={true}
           >
               <Icons.fileUp className="mr-2 h-4 w-4" /> {/* Changed icon */}
               Select File (PDF/DOCX)
           </label>
           {inputFile && <span className="text-sm truncate" title={inputFile.name} suppressHydrationWarning={true}>Selected: {inputFile.name}</span>}
       </div>

      {conversionError && (
        <Alert variant="destructive" suppressHydrationWarning={true}>
          <Icons.alertCircle className="h-4 w-4" />
          <AlertTitle>Conversion Error</AlertTitle>
          <AlertDescription>{conversionError}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleConvertAndDownload}
        disabled={!inputFile || isConverting}
        aria-label="Convert to TXT and Download"
        suppressHydrationWarning={true}
      >
        {isConverting ? (
          <>
            <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Icons.download className="mr-2 h-4 w-4" /> {/* Changed icon */}
            Convert & Download TXT
          </>
        )}
      </Button>
    </div>
  );
};

export default FileConverter;
