
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HumanizerOptions } from "./HumanizerOptions";

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleHumanize: () => void;
  readability: string;
  setReadability: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  strength: number;
  setStrength: (value: number) => void;
  isHumanizing: boolean;
}

export function InputSection({
  inputText,
  setInputText,
  handleHumanize,
  readability,
  setReadability,
  purpose,
  setPurpose,
  strength,
  setStrength,
  isHumanizing
}: InputSectionProps) {
  return (
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
        placeholder="Paste your AI-generated text here (minimum 50 characters)..."
        className="h-64 resize-none rounded-xl border-muted shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      
      <HumanizerOptions
        readability={readability}
        setReadability={setReadability}
        purpose={purpose}
        setPurpose={setPurpose}
        strength={strength}
        setStrength={setStrength}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={handleHumanize} 
          disabled={isHumanizing || !inputText.trim() || inputText.length < 50}
          className="rounded-full shadow-button px-6"
        >
          {isHumanizing ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">⟳</span>
              Humanizing...
            </>
          ) : (
            "Humanize Text"
          )}
        </Button>
      </div>
      {inputText.length > 0 && inputText.length < 50 && (
        <p className="text-sm text-destructive">
          Text must be at least 50 characters long ({inputText.length}/50)
        </p>
      )}
    </div>
  );
}
