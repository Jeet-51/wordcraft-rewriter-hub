
import { supabase } from "@/integrations/supabase/client";
import { DocumentInfo } from "./types";
import * as pdfjs from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set PDF.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const uploadDocument = async (userId: string, file: File) => {
  if (!userId) {
    throw new Error("User ID is required for document uploads");
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  try {
    console.log("Starting file upload to documents bucket");
    
    // Now upload the file
    const { error: storageError, data } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (storageError) {
      console.error("Storage error during upload:", storageError);
      throw storageError;
    }
    
    console.log("Upload successful, getting public URL");
    
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error with document storage:", error);
    throw error;
  }
};

// Function to extract text from document
export const extractTextFromDocument = async (fileUrl: string, fileType: string): Promise<string> => {
  console.log(`Extracting text from document: ${fileUrl}, type: ${fileType}`);
  
  try {
    // Download the file content from the URL
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    let extractedText = '';
    
    if (fileType === 'txt') {
      // For TXT files, simply get the text content
      extractedText = await response.text();
    } 
    else if (fileType === 'pdf') {
      console.log("Processing PDF file");
      // Process PDF using PDF.js
      const arrayBuffer = await response.arrayBuffer();
      extractedText = await extractTextFromPdf(arrayBuffer);
    }
    else if (fileType === 'docx') {
      console.log("Processing DOCX file");
      // Process DOCX using mammoth.js
      const arrayBuffer = await response.arrayBuffer();
      extractedText = await extractTextFromDocx(arrayBuffer);
    }
    else {
      extractedText = `File type '${fileType}' is not supported for text extraction. Please upload a TXT, PDF, or DOCX file.`;
    }
    
    console.log(`Extracted ${extractedText.length} characters from the document`);
    return extractedText || "No text content could be extracted from this document.";
  } catch (error) {
    console.error("Error extracting text from document:", error);
    return `Error extracting text: ${error.message}`;
  }
};

// Helper function to extract text from PDF using PDF.js
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log("Loading PDF document with PDF.js");
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Iterate through each page and extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract the text items and join them with spaces
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
        
      fullText += pageText + '\n\n';
    }
    
    // Clean up the extracted text
    const cleanedText = fullText
      .replace(/\s{2,}/g, ' ')              // Replace multiple spaces with single spaces
      .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n')  // Add paragraph breaks after sentences
      .trim();
    
    return cleanedText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "Error extracting PDF content. The file may be corrupted or password-protected.";
  }
}

// Helper function to extract text from DOCX using mammoth.js
async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log("Converting DOCX to HTML with mammoth.js");
    
    // Convert DOCX to HTML using mammoth.js
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    // Get plain text from the HTML
    const htmlContent = result.value;
    
    // Convert HTML content to plain text by creating a temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract text, preserving paragraph breaks
    let plainText = tempDiv.textContent || '';
    
    // Clean up the text
    plainText = plainText
      .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n')  // Replace excessive newlines
      .trim();
    
    return plainText;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "Error extracting DOCX content. The file may be corrupted or in an unsupported format.";
  }
}
