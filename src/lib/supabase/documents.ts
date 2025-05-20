
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
  console.log(`Extracting text from document: ${fileUrl}, type: ${fileType}`);
  
  try {
    // Download the file content from the URL
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    let extractedText = '';
    const arrayBuffer = await response.arrayBuffer();
    
    if (fileType === 'txt') {
      // For TXT files, simply get the text content
      const textDecoder = new TextDecoder('utf-8');
      extractedText = textDecoder.decode(arrayBuffer);
    } 
    else if (fileType === 'pdf') {
      console.log("Processing PDF file");
      // Get the binary data
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Look for text objects within the PDF
      const pdfString = new TextDecoder('utf-8').decode(uint8Array);
      
      // First approach: Extract content between stream markers using regex
      console.log("Attempting to extract text from PDF streams");
      extractedText = extractPdfText(pdfString);
      
      if (!extractedText || extractedText.trim().length < 50) {
        console.log("First extraction method yielded insufficient text, trying alternative approach");
        extractedText = extractPdfTextAlternative(pdfString);
      }
      
      // Clean up the extracted text
      extractedText = cleanExtractedText(extractedText);
      
      if (!extractedText || extractedText.trim().length < 50) {
        extractedText = "PDF extraction was limited. This document may use complex formatting or be scanned content. For better results, consider using a plain text file.";
      }
    }
    else if (fileType === 'docx') {
      console.log("Processing DOCX file");
      
      try {
        // For DOCX files, try to extract content from the ZIP structure
        const zipData = new Uint8Array(arrayBuffer);
        
        // Check DOCX signature
        if (zipData[0] === 0x50 && zipData[1] === 0x4B) {
          console.log("Valid DOCX (ZIP) signature detected");
          
          // Convert the ArrayBuffer to a string
          const textContent = new TextDecoder('utf-8').decode(zipData);
          
          // Extract text from XML content parts
          extractedText = extractDocxText(textContent);
          
          if (!extractedText || extractedText.trim().length < 50) {
            extractedText = "DOCX extraction was limited. This document may use complex formatting. For better results, consider using a plain text file.";
          }
        } else {
          extractedText = "The DOCX file appears to be corrupted or in an unsupported format.";
        }
      } catch (err) {
        console.error("Error parsing DOCX content:", err);
        extractedText = "Error extracting text from DOCX. For better results, try using a plain text file.";
      }
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

// Helper functions for PDF extraction
function extractPdfText(pdfString: string): string {
  // Look for text between BT (Begin Text) and ET (End Text) markers
  const textBlocks: string[] = [];
  const btEtRegex = /BT\s+(.*?)\s+ET/gs;
  const matches = pdfString.match(btEtRegex);
  
  if (matches && matches.length > 0) {
    matches.forEach(block => {
      // Extract text within parentheses (text tokens in PDF)
      const textTokenRegex = /\(([^\)\\]*(?:\\.[^\)\\]*)*)\)/g;
      let textTokenMatch;
      
      while ((textTokenMatch = textTokenRegex.exec(block)) !== null) {
        if (textTokenMatch[1]) {
          // Clean up PDF escape sequences
          let text = textTokenMatch[1]
            .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')');
            
          textBlocks.push(text);
        }
      }
    });
  }
  
  return textBlocks.join(' ').trim();
}

function extractPdfTextAlternative(pdfString: string): string {
  // Alternative approach looking for text objects without BT/ET markers
  const textMatches: string[] = [];
  
  // Look for TJ array operators which typically contain text strings
  const tjRegex = /\[((?:\([^\)]*\)|<[^>]*>)[^\]]*)\]\s*TJ/g;
  let tjMatch;
  
  while ((tjMatch = tjRegex.exec(pdfString)) !== null) {
    if (tjMatch[1]) {
      // Extract text within parentheses
      const textParts = tjMatch[1].match(/\(([^\)\\]*(?:\\.[^\)\\]*)*)\)/g);
      if (textParts) {
        textMatches.push(...textParts.map(part => 
          part.substring(1, part.length - 1)
            .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\\\/g, '\\')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
        ));
      }
      
      // Also check for hex-encoded strings
      const hexParts = tjMatch[1].match(/<([0-9A-Fa-f]+)>/g);
      if (hexParts) {
        textMatches.push(...hexParts.map(part => {
          const hex = part.substring(1, part.length - 1);
          let text = '';
          for (let i = 0; i < hex.length; i += 2) {
            text += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          return text;
        }));
      }
    }
  }
  
  // Also try to find Tj operators (single text objects)
  const tjSingleRegex = /\(([^\)\\]*(?:\\.[^\)\\]*)*)\)\s*Tj/g;
  let tjSingleMatch;
  
  while ((tjSingleMatch = tjSingleRegex.exec(pdfString)) !== null) {
    if (tjSingleMatch[1]) {
      let text = tjSingleMatch[1]
        .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')');
        
      textMatches.push(text);
    }
  }
  
  return textMatches.join(' ').trim();
}

// Helper function for DOCX extraction
function extractDocxText(zipContent: string): string {
  const texts: string[] = [];
  
  // Look for text content in word/document.xml
  const contentRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let contentMatch;
  
  while ((contentMatch = contentRegex.exec(zipContent)) !== null) {
    if (contentMatch[1]) {
      texts.push(contentMatch[1]);
    }
  }
  
  // Special case for paragraph breaks
  const paragraphBreaks = zipContent.match(/<w:p[^>]*>/g);
  if (paragraphBreaks && texts.length > 0) {
    // Add paragraph breaks where appropriate
    let result = '';
    let textIndex = 0;
    let paragraphCount = 0;
    
    for (let i = 0; i < texts.length; i++) {
      if (paragraphCount < paragraphBreaks.length && 
          zipContent.indexOf(paragraphBreaks[paragraphCount]) < 
          zipContent.indexOf(texts[i], textIndex)) {
        result += '\n';
        paragraphCount++;
      }
      result += texts[i] + ' ';
      textIndex = zipContent.indexOf(texts[i], textIndex) + texts[i].length;
    }
    
    return result.trim();
  }
  
  return texts.join(' ').trim();
}

// Clean up the extracted text to improve readability
function cleanExtractedText(text: string): string {
  if (!text) return text;
  
  return text
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n') // Add paragraph breaks after sentences
    .replace(/([\n\r]+\s*){3,}/g, '\n\n') // Normalize excessive line breaks
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim();
}
