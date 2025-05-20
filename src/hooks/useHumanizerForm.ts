
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTextHumanization } from "@/hooks/useTextHumanization";

interface UseHumanizerFormProps {
  initialText?: string;
  initialHumanizedText?: string;
}

export function useHumanizerForm({ initialText = "", initialHumanizedText = "" }: UseHumanizerFormProps) {
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState(initialHumanizedText);
  const [readability, setReadability] = useState<string>("University");
  const [purpose, setPurpose] = useState<string>("General Writing");
  const [strength, setStrength] = useState<number>(0.9);
  
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
    
    if (inputText.length < 50) {
      toast({
        title: "Text too short",
        description: "Text must be at least 50 characters long for effective humanization.",
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
      // Clear previous output when starting new humanization
      setOutputText("");
      
      const result = await humanizeContent(inputText, {
        readability,
        purpose,
        strength: strength.toString()
      });
      
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

  return {
    inputText,
    setInputText,
    outputText,
    readability,
    setReadability,
    purpose,
    setPurpose,
    strength,
    setStrength,
    isHumanizing,
    handleHumanize
  };
}
