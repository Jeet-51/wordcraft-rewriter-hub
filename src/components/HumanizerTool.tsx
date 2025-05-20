
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createHumanization, getProfile, updateProfile } from "@/lib/supabase";

export function HumanizerTool() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // This is a simplified humanize function - in a real app, you'd call an AI service
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

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the humanizer tool.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user profile to check credits
      const profile = await getProfile(user.id);
      
      if (profile.credits_used >= profile.credits_total) {
        toast({
          title: "No credits remaining",
          description: "You've used all your available credits. Please upgrade your plan.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Process the text
      const humanizedText = humanizeText(inputText);
      setOutputText(humanizedText);

      // Save the humanization to the database
      await createHumanization(user.id, inputText, humanizedText);

      // Update user credits
      await updateProfile(user.id, {
        credits_used: profile.credits_used + 1,
      });

      toast({
        title: "Text humanized",
        description: "Your text has been successfully humanized.",
      });
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to humanize text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Original Text</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setInputText("")}
            disabled={!inputText}
          >
            Clear
          </Button>
        </div>
        <Textarea
          placeholder="Paste your AI-generated text here..."
          className="h-64 resize-none"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleHumanize} 
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? "Humanizing..." : "Humanize Text"}
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Humanized Result</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (outputText) {
                navigator.clipboard.writeText(outputText);
                toast({ title: "Copied to clipboard" });
              }
            }}
            disabled={!outputText}
          >
            Copy
          </Button>
        </div>
        <div className="border rounded-md p-4 h-64 overflow-auto bg-muted/30">
          {outputText ? (
            <p className="whitespace-pre-wrap">{outputText}</p>
          ) : (
            <p className="text-muted-foreground text-center mt-20">
              Your humanized text will appear here
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
