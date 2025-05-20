
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
      
      // Extract text from the document
      const text = await extractTextFromDocument(fileUrl, fileType);
      
      setExtractedText(text);
      
      toast({
        title: "Text extracted",
        description: "Document text has been extracted successfully."
      });
      
      return text;
    } catch (error: any) {
      console.error("Error extracting text:", error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract text from document.",
        variant: "destructive",
      });
      return null;
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
