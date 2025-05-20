
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DocumentHeader } from "./document/DocumentHeader";
import { TextPreview } from "./document/TextPreview";
import { useDocumentExtraction } from "@/hooks/useDocumentExtraction";
import { useTextHumanization } from "@/hooks/useTextHumanization";
import { useToast } from "@/hooks/use-toast";

interface DocumentExtractorProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  onExtracted: (text: string, humanizedText?: string) => void;
}

export function DocumentExtractor({
  fileUrl,
  fileName,
  fileType,
  onExtracted
}: DocumentExtractorProps) {
  const { toast } = useToast();
  const { 
    extractedText, 
    setExtractedText, 
    isExtracting, 
    extractText 
  } = useDocumentExtraction();
  
  const { 
    humanizedText, 
    setHumanizedText, 
    isHumanizing, 
    humanizeContent 
  } = useTextHumanization();

  const handleExtractText = async () => {
    const text = await extractText(fileUrl, fileType);
    if (text) {
      // Only pass the first argument here since we don't have humanized text yet
      onExtracted(text);
      
      // After extraction, check if text is long enough for humanization
      if (text.length >= 50) {
        // Automatically humanize the text
        await handleHumanizeText(text);
      } else {
        toast({
          title: "Text too short",
          description: "Extracted text is less than 50 characters and cannot be humanized. Please add more content.",
          variant: "destructive",
        });
      }
    }
  };

  const handleHumanizeText = async (text: string) => {
    const humanized = await humanizeContent(text);
    if (humanized) {
      // Send back both original and humanized text
      onExtracted(text, humanized);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <DocumentHeader 
          fileName={fileName}
          fileType={fileType}
          isExtracting={isExtracting}
          isHumanizing={isHumanizing}
          onExtract={handleExtractText}
        />
        
        {extractedText && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TextPreview 
              title="Extracted Content:" 
              text={extractedText} 
              onChange={setExtractedText} 
            />
            <TextPreview 
              title="Humanized Content:" 
              text={humanizedText} 
              onChange={setHumanizedText} 
            />
          </div>
        )}
      </div>
    </Card>
  );
}
