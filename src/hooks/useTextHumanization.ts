
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createHumanization, getProfile, updateProfile } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";

interface HumanizationOptions {
  readability?: string;
  purpose?: string;
  strength?: string;
}

export function useTextHumanization() {
  const [humanizedText, setHumanizedText] = useState<string>('');
  const [isHumanizing, setIsHumanizing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const humanizeContent = async (text: string, options?: HumanizationOptions, onSuccess?: () => void) => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to humanize.",
        variant: "destructive",
      });
      return null;
    }
    
    if (text.length < 50) {
      toast({
        title: "Text too short",
        description: "Text must be at least 50 characters long for effective humanization.",
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
        description: "Humanizing your text... This may take a moment.",
      });

      // Call the OpenAI Edge Function to humanize the text with options
      const { data, error } = await supabase.functions.invoke('humanize-text', {
        body: { 
          text: text,
          readability: options?.readability || "University", 
          purpose: options?.purpose || "General Writing",
          strength: options?.strength || "0.9"
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to humanize text");
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || "Failed to humanize text";
        console.error("Humanization failed:", errorMessage);
        throw new Error(errorMessage);
      }

      // Get the humanized text from response
      let resultText = data.humanizedText;
      
      // Ensure the returned text is actually different and meaningful
      if (resultText === text || !resultText) {
        console.log("Warning: Humanized text is identical to input or empty");
        throw new Error("The humanization service returned an invalid response. Please try again.");
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
        description: "Your text has been successfully humanized with OpenAI.",
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return resultText;
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      
      // Check for specific error messages
      let errorMessage = error.message || "Failed to humanize text. Please try again.";
      
      if (errorMessage.includes("Insufficient credits")) {
        errorMessage = "You don't have enough credits. Please upgrade your plan.";
      } else if (errorMessage.includes("timed out")) {
        errorMessage = "The humanization process took too long. Please try again with a shorter text.";
      } else if (errorMessage.includes("API Error")) {
        errorMessage = "The OpenAI service is currently unavailable. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
