
import { Button } from "@/components/ui/button";
import { Copy, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OutputSectionProps {
  outputText: string;
  isHumanizing: boolean;
}

export function OutputSection({ outputText, isHumanizing }: OutputSectionProps) {
  const { toast } = useToast();
  
  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Humanized Result</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!outputText}
          className="rounded-full"
        >
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
      </div>
      <div className="border rounded-xl p-6 h-64 overflow-auto bg-white/50 shadow-sm">
        {outputText ? (
          <p className="whitespace-pre-wrap text-left">{outputText}</p>
        ) : isHumanizing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground text-center">
              Processing your text with OpenAI...
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              This may take a moment
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Your humanized text will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
