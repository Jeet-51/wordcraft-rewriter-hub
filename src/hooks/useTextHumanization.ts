
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createHumanization, getProfile, updateProfile } from "@/lib/supabase";

export function useTextHumanization() {
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Simple humanize function (same as in DocumentExtractor)
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

  const humanizeContent = async (text: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the humanizer tool.",
        variant: "destructive",
      });
      return null;
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
        return null;
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
      
      return humanized;
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to humanize text. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsHumanizing(false);
    }
  };

  return {
    humanizedText,
    setHumanizedText,
    isHumanizing,
    humanizeContent
  };
}
