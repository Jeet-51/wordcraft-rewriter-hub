
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DocumentHeader } from "./document/DocumentHeader";
import { TextPreview } from "./document/TextPreview";
import { useDocumentExtraction } from "@/hooks/useDocumentExtraction";
import { useTextHumanization } from "@/hooks/useTextHumanization";
import { useToast } from "@/hooks/use-toast";
import { HumanizerOptions } from "./humanizer/HumanizerOptions";

interface DocumentExtractorProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  onExtracted: (text: string, humanizedText?: string) => void;
  onHumanizeComplete?: () => void;
}

export function DocumentExtractor({
  fileUrl,
  fileName,
  fileType,
  onExtracted,
  onHumanizeComplete
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

  // Humanizer options state
  const [readability, setReadability] = useState<string>("University");
  const [purpose, setPurpose] = useState<string>("General Writing");
  const [strength, setStrength] = useState<number>(0.9);

  const handleExtractText = async () => {
    const text = await extractText(fileUrl, fileType);
    if (text) {
      // Only pass the extracted text
      onExtracted(text);
      
      // Show toast about text length if it's too short for humanization
      if (text.length < 50) {
        toast({
          title: "Text too short",
          description: "Extracted text is less than 50 characters and cannot be humanized. Please add more content.",
          variant: "destructive",
        });
      }
    }
  };

  const handleHumanizeText = async () => {
    try {
      // Check if text is long enough for humanization
      if (extractedText.length < 50) {
        toast({
          title: "Text too short",
          description: "Extracted text is less than 50 characters and cannot be humanized. Please add more content.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Starting humanization",
        description: "Humanizing the extracted text with your selected options. This may take up to a minute.",
      });
      
      // Pass the humanization options to the API with success callback
      const humanized = await humanizeContent(extractedText, {
        readability,
        purpose,
        strength: strength.toString()
      }, onHumanizeComplete);
      
      if (humanized) {
        // Send back both original and humanized text
        onExtracted(extractedText, humanized);
      }
    } catch (error) {
      console.error("Error in handleHumanizeText:", error);
      toast({
        title: "Humanization failed",
        description: "Could not humanize the text. Please try again or check the logs for details.",
        variant: "destructive",
      });
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
          onHumanize={handleHumanizeText}
          showHumanizeButton={extractedText.length >= 50}
        />
        
        {extractedText && (
          <div className="space-y-4">
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
            
            {/* Show humanization options only if there is extracted text */}
            {extractedText.length >= 50 && !humanizedText && (
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-2">Humanization Options</h3>
                <HumanizerOptions
                  readability={readability}
                  setReadability={setReadability}
                  purpose={purpose}
                  setPurpose={setPurpose}
                  strength={strength}
                  setStrength={setStrength}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
