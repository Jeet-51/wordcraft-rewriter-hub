
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

      // Set the humanized text
      setHumanizedText(data.humanizedText);

      // Save the humanization to the database
      await createHumanization(user.id, text, data.humanizedText);

      // Update user credits
      await updateProfile(user.id, {
        credits_used: profile.credits_used + 1,
      });

      toast({
        title: "Text humanized",
        description: "Your text has been successfully humanized.",
      });
      
      return data.humanizedText;
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
