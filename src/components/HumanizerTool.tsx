
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { createHumanization, getProfile, updateProfile } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Loader } from "lucide-react";

interface HumanizerToolProps {
  initialText?: string;
  initialHumanizedText?: string;
}

export function HumanizerTool({ initialText = "", initialHumanizedText = "" }: HumanizerToolProps) {
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState(initialHumanizedText);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Update input and output text when props change
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
    
    if (initialHumanizedText) {
      setOutputText(initialHumanizedText);
    }
  }, [initialText, initialHumanizedText]);

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

      // Call the Supabase Edge Function to humanize the text
      const { data, error } = await supabase.functions.invoke('humanize-text', {
        body: { text: inputText },
      });

      if (error) {
        throw new Error(error.message || "Failed to humanize text");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to humanize text");
      }

      // Set the humanized text
      setOutputText(data.humanizedText);

      // Save the humanization to the database
      await createHumanization(user.id, inputText, data.humanizedText);

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
      
      // Fallback to local humanization only if API fails
      if (isLoading) {
        toast({
          title: "Using fallback method",
          description: "API call failed. Using local humanization method instead.",
        });
        
        // Local fallback humanization function (simple version)
        const fallbackHumanizedText = inputText
          .replace(/utilize/gi, "use")
          .replace(/subsequently/gi, "then")
          .replace(/nevertheless/gi, "however")
          .replace(/additionally/gi, "also")
          .replace(/furthermore/gi, "plus");

        setOutputText(fallbackHumanizedText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Original Text</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setInputText("")}
            disabled={!inputText}
            className="rounded-full text-muted-foreground"
          >
            Clear
          </Button>
        </div>
        <Textarea
          placeholder="Paste your AI-generated text here..."
          className="h-64 resize-none rounded-xl border-muted shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleHumanize} 
            disabled={isLoading || !inputText.trim()}
            className="rounded-full shadow-button px-6"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Humanizing...
              </>
            ) : (
              "Humanize Text"
            )}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
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
            className="rounded-full"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </div>
        <div className="border rounded-xl p-6 h-64 overflow-auto bg-white/50 shadow-sm">
          {outputText ? (
            <p className="whitespace-pre-wrap text-left">{outputText}</p>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                Your humanized text will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
