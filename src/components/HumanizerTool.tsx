
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTextHumanization } from "@/hooks/useTextHumanization";
import { Copy, Loader } from "lucide-react";

interface HumanizerToolProps {
  initialText?: string;
  initialHumanizedText?: string;
}

export function HumanizerTool({ initialText = "", initialHumanizedText = "" }: HumanizerToolProps) {
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState(initialHumanizedText);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    humanizedText,
    setHumanizedText,
    isHumanizing,
    humanizeContent
  } = useTextHumanization();
  
  // Update input text when props change
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
    
    if (initialHumanizedText) {
      setOutputText(initialHumanizedText);
      setHumanizedText(initialHumanizedText);
    }
  }, [initialText, initialHumanizedText, setHumanizedText]);
  
  // Update output text when humanizedText changes
  useEffect(() => {
    if (humanizedText) {
      setOutputText(humanizedText);
    }
  }, [humanizedText]);

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
      const result = await humanizeContent(inputText);
      if (result) {
        setOutputText(result);
      }
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to humanize text. Please try again.",
        variant: "destructive",
      });
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
            disabled={isHumanizing || !inputText.trim()}
            className="rounded-full shadow-button px-6"
          >
            {isHumanizing ? (
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
