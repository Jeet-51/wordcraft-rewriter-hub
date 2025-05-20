
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromDocument, createHumanization, getProfile, updateProfile } from "@/lib/supabase";
import { Loader2, File } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const [extractedText, setExtractedText] = useState<string>('');
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // This is the same humanize function from HumanizerTool component
  const humanizeText = (text: string): string => {
    // Placeholder humanization logic - in a real app, this would call an API
    const words = text.split(" ");
    
    // Simple transformations to simulate AI humanization
    const humanizedWords = words.map(word => {
      // Randomly replace some common words
      if (word.toLowerCase() === "utilize") return "use";
      if (word.toLowerCase() === "subsequently") return "then";
      if (word.toLowerCase() === "nevertheless") return "however";
      if (word.toLowerCase() === "additionally") return "also";
      if (word.toLowerCase() === "furthermore") return "plus";
      
      // Randomly change word order or add small variations for longer text
      if (Math.random() > 0.9 && words.length > 20) {
        return word + " actually";
      }
      
      return word;
    });
    
    // Add some natural variations to sentence structure
    let result = humanizedWords.join(" ");
    
    // Sometimes add filler words at the start of sentences
    result = result.replace(/\. ([A-Z])/g, (match, p1) => {
      const fillers = ["Well, ", "So, ", "I think ", "Actually, "];
      return Math.random() > 0.7 
        ? ". " + fillers[Math.floor(Math.random() * fillers.length)] + p1 
        : ". " + p1;
    });
    
    return result;
  };

  const handleExtractText = async () => {
    try {
      setIsExtracting(true);
      
      // Extract text from the document
      const text = await extractTextFromDocument(fileUrl, fileType);
      
      setExtractedText(text);
      // Only pass the first argument here since we don't have humanized text yet
      onExtracted(text);
      
      toast({
        title: "Text extracted",
        description: "Document text has been extracted successfully."
      });

      // After extraction, automatically humanize the text
      await handleHumanizeText(text);
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

  const handleHumanizeText = async (text: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the humanizer tool.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsHumanizing(true);

      // Get user profile to check credits
      const profile = await getProfile(user.id);
      
      if (profile.credits_used >= profile.credits_total) {
        toast({
          title: "No credits remaining",
          description: "You've used all your available credits. Please upgrade your plan.",
          variant: "destructive",
        });
        setIsHumanizing(false);
        return;
      }

      // Process the text
      const humanized = humanizeText(text);
      setHumanizedText(humanized);

      // Save the humanization to the database
      await createHumanization(user.id, text, humanized);

      // Update user credits
      await updateProfile(user.id, {
        credits_used: profile.credits_used + 1,
      });

      toast({
        title: "Text humanized",
        description: "Your text has been successfully humanized.",
      });

      // Send back both original and humanized text
      onExtracted(text, humanized);
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to humanize text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsHumanizing(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <File className="mr-2 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">{fileName}</h3>
              <p className="text-sm text-muted-foreground">{fileType.toUpperCase()} document</p>
            </div>
          </div>
          <Button 
            onClick={handleExtractText}
            disabled={isExtracting || isHumanizing}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : isHumanizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Humanizing...
              </>
            ) : (
              "Extract & Humanize"
            )}
          </Button>
        </div>
        
        {extractedText && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Extracted Content:</h4>
              <Textarea 
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="h-32"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Humanized Content:</h4>
              <Textarea 
                value={humanizedText}
                onChange={(e) => setHumanizedText(e.target.value)}
                className="h-32"
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
