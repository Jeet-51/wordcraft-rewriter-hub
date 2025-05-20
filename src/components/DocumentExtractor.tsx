
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromDocument } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface DocumentExtractorProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  onExtracted: (text: string) => void;
}

export function DocumentExtractor({
  fileUrl,
  fileName,
  fileType,
  onExtracted
}: DocumentExtractorProps) {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleExtractText = async () => {
    try {
      setIsExtracting(true);
      
      // Extract text from the document
      const text = await extractTextFromDocument(fileUrl, fileType);
      
      setExtractedText(text);
      onExtracted(text);
      
      toast({
        title: "Text extracted",
        description: "Document text has been extracted successfully."
      });
    } catch (error: any) {
      console.error("Error extracting text:", error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract text from document.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{fileName}</h3>
            <p className="text-sm text-muted-foreground">{fileType} document</p>
          </div>
          <Button 
            onClick={handleExtractText}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract Text"
            )}
          </Button>
        </div>
        
        {extractedText && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Extracted Content:</h4>
            <Textarea 
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="h-32"
            />
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExtracted(extractedText)}
              >
                Send to Humanizer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
