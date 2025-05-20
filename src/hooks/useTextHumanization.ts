
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createHumanization, getProfile, updateProfile } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";

export function useTextHumanization() {
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const humanizeContent = async (text: string) => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return null;
    }
    
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

      toast({
        title: "Processing",
        description: "Humanizing your text...",
      });

      // Call the Supabase Edge Function to humanize the text
      const { data, error } = await supabase.functions.invoke('humanize-text', {
        body: { text: text },
      });

      if (error) {
        throw new Error(error.message || "Failed to humanize text");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to humanize text");
      }

      // Ensure the returned text is actually different from the input
      // If they're identical (which might indicate the API failed silently),
      // apply local humanization as a fallback
      let resultText = data.humanizedText;
      
      if (resultText === text) {
        console.log("Warning: Humanized text is identical to input, applying local fallback");
        // Apply some basic transformations to ensure text is different
        resultText = applyBasicHumanization(text);
      }

      // Set the humanized text
      setHumanizedText(resultText);

      // Save the humanization to the database
      await createHumanization(user.id, text, resultText);

      // Update user credits
      await updateProfile(user.id, {
        credits_used: profile.credits_used + 1,
      });

      toast({
        title: "Text humanized",
        description: "Your text has been successfully humanized.",
      });
      
      return resultText;
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
  
  // Fallback function if the API returns identical text
  const applyBasicHumanization = (text: string): string => {
    // Apply some basic transformations to make the text more human-like
    return text
      // Use contractions
      .replace(/it is /gi, "it's ")
      .replace(/that is /gi, "that's ")
      .replace(/there is /gi, "there's ")
      .replace(/what is /gi, "what's ")
      .replace(/who is /gi, "who's ")
      .replace(/cannot /gi, "can't ")
      .replace(/do not /gi, "don't ")
      .replace(/will not /gi, "won't ")
      .replace(/should not /gi, "shouldn't ")
      
      // Add some variety to the text
      .replace(/however/gi, () => {
        const options = ["however", "but", "yet", "nevertheless", "still"];
        return options[Math.floor(Math.random() * options.length)];
      })
      .replace(/additionally/gi, () => {
        const options = ["also", "in addition", "furthermore", "plus", "moreover"];
        return options[Math.floor(Math.random() * options.length)];
      })
      
      // Add some filler words
      .replace(/(\. )([A-Z])/g, (_, p1, p2) => {
        const fillers = ["", " Actually, ", " You know, ", " I mean, ", " So, "];
        return p1 + fillers[Math.floor(Math.random() * fillers.length)] + p2;
      });
  };

  return {
    humanizedText,
    setHumanizedText,
    isHumanizing,
    humanizeContent
  };
}
