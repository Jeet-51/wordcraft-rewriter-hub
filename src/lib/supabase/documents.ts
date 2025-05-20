
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
      // For PDF files, using an improved approach for text extraction
      const arrayBuffer = await response.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8');
      const content = textDecoder.decode(arrayBuffer);
      
      // More sophisticated PDF text extraction
      // Look for text between stream markers and content delimiters
      const textBlocks = [];
      
      // Try to find text blocks in the PDF content
      const matches = content.match(/BT\s+(.*?)\s+ET/gs);
      if (matches) {
        matches.forEach(match => {
          // Extract text tokens from each text block
          const textTokens = match.match(/\((.*?)\)/gs);
          if (textTokens) {
            textTokens.forEach(token => {
              // Clean up and decode PDF text tokens
              let text = token.substring(1, token.length - 1)
                .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
                .replace(/\\\\/g, '\\')
                .replace(/\\\(/g, '(')
                .replace(/\\\)/g, ')');
              
              textBlocks.push(text);
            });
          }
        });
      }
      
      if (textBlocks.length > 0) {
        extractedText = textBlocks.join(' ');
      } else {
        // Fallback to the basic extraction if the improved method doesn't work
        extractedText = content
          .replace(/^\s*\d+\s*$/gm, '') // Remove page numbers
          .replace(/[^\x20-\x7E\n]/g, '') // Keep only ASCII printable chars and newlines
          .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
          .trim();
      }
      
      // Additional processing to improve readability
      extractedText = extractedText
        .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n') // Add paragraph breaks after sentences
        .replace(/([\n\r]+\s*){3,}/g, '\n\n') // Normalize excessive line breaks
        .trim();
      
      // If we still couldn't extract meaningful content, provide a message
      if (extractedText.length < 100 || !extractedText.match(/[a-zA-Z]{2,}/g)) {
        extractedText = `This PDF document requires specialized parsing. Some text was extracted but may not be fully readable. For better results, consider uploading a text file.`;
      }
    }
    else if (fileType === 'docx') {
      // For DOCX files, try a basic extraction of text content
      // DOCX files are ZIP archives with XML files inside
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check if the file has the DOCX signature
      if (bytes[0] === 0x50 && bytes[1] === 0x4B) { // PK signature for ZIP files
        try {
          // Look for document.xml content inside the ZIP
          const textDecoder = new TextDecoder('utf-8');
          const content = textDecoder.decode(arrayBuffer);
          
          // Try to extract text from XML tags that might contain document content
          const textMatches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/gs);
          
          if (textMatches && textMatches.length > 0) {
            // Extract and clean up the text content
            const extractedParts = textMatches.map(match => {
              const textContent = match.replace(/<[^>]+>/g, ''); // Remove XML tags
              return textContent
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");
            });
            
            extractedText = extractedParts.join(' ').trim();
            
            // Add paragraph breaks for readability
            extractedText = extractedText
              .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n')
              .replace(/([\n\r]+\s*){3,}/g, '\n\n')
              .trim();
          }
        } catch (error) {
          console.error("Error parsing DOCX content:", error);
          extractedText = `Unable to extract text from this DOCX document. For better results, consider uploading a text file.`;
        }
      }
      
      // If extraction failed or produced minimal content
      if (!extractedText || extractedText.length < 50) {
        extractedText = `This appears to be a DOCX document, but text extraction was limited. For better results, consider converting to a TXT file before uploading.`;
      }
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
