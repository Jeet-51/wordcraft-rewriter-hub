
import { useState } from "react";
import { extractTextFromDocument } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useDocumentExtraction() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractText = async (fileUrl: string, fileType: string) => {
    try {
      setIsExtracting(true);
      
      // Log the extraction attempt
      console.log(`Starting text extraction for ${fileType} file from ${fileUrl}`);
      
      // Extract text from the document
      const text = await extractTextFromDocument(fileUrl, fileType);
      
      // Check if we got meaningful text
      if (text && text.length > 10) {
        console.log(`Successfully extracted ${text.length} characters`);
        setExtractedText(text);
        
        toast({
          title: "Text extracted",
          description: "Document text has been extracted successfully."
        });
        
        return text;
      } else {
        console.log("Extraction returned empty or very short text");
        const errorMsg = "Could not extract meaningful text from this document.";
        
        toast({
          title: "Limited extraction",
          description: "Only limited text could be extracted. Try a different file format.",
          variant: "destructive",
        });
        
        // Set a helpful message in the extracted text
        const helpText = `The ${fileType.toUpperCase()} document could not be properly parsed. ` +
                        `For best results, try uploading a plain text (.txt) file instead.`;
        
        setExtractedText(helpText);
        return helpText;
      }
    } catch (error: any) {
      console.error("Error extracting text:", error);
      
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract text from document.",
        variant: "destructive",
      });
      
      // Set an error message in the extracted text field
      const errorText = `Error processing ${fileType.toUpperCase()} file: ${error.message || "Unknown error"}. ` +
                       "Please try uploading a different document or use a plain text file.";
      
      setExtractedText(errorText);
      return errorText;
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    extractedText,
    setExtractedText,
    isExtracting,
    extractText
  };
}
