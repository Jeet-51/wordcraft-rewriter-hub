
import { supabase } from "@/integrations/supabase/client";
import { DocumentInfo } from "./types";

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
  console.log(`Extracting text from document: ${fileUrl}`);
  
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
      // For PDF files, we would ideally use a PDF parsing library
      // Since we can't install new packages, we'll use a simplified approach
      const arrayBuffer = await response.arrayBuffer();
      // This is a simple approach that can extract some text from PDFs
      // It won't be perfect but should extract some readable content
      const textDecoder = new TextDecoder('utf-8');
      const content = textDecoder.decode(arrayBuffer);
      
      // Extract text content between markers that might indicate text in a PDF
      // This is a very simplified approach and won't work for all PDFs
      extractedText = content
        .replace(/^\s*\d+\s*$/gm, '') // Remove page numbers
        .replace(/[^\x20-\x7E\n]/g, '') // Keep only ASCII printable chars and newlines
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      // If we couldn't extract meaningful content, provide a message
      if (extractedText.length < 100) {
        extractedText = `This appears to be a PDF document that requires specialized parsing. The content could not be fully extracted using the basic extraction method. For better results, consider uploading a text file or using a dedicated PDF extraction service.`;
      }
    }
    else if (fileType === 'docx') {
      // For DOCX files, we would need a specialized library
      extractedText = `This appears to be a DOCX document. The content could not be extracted using the basic extraction method. For better results, consider uploading a text file or using a dedicated DOCX extraction service.`;
    }
    else {
      extractedText = `File type '${fileType}' is not supported for text extraction. Please upload a TXT file for best results.`;
    }
    
    return extractedText || "No text content could be extracted from this document.";
  } catch (error) {
    console.error("Error extracting text from document:", error);
    return `Error extracting text: ${error.message}`;
  }
};
