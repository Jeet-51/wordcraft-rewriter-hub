
import { Loader2, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentHeaderProps {
  fileName: string;
  fileType: string;
  isExtracting: boolean;
  isHumanizing: boolean;
  onExtract: () => void;
  onHumanize?: () => void;
  showHumanizeButton: boolean;
}

export function DocumentHeader({
  fileName,
  fileType,
  isExtracting,
  isHumanizing,
  onExtract,
  onHumanize,
  showHumanizeButton
}: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <File className="mr-2 h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">{fileName}</h3>
          <p className="text-sm text-muted-foreground">{fileType.toUpperCase()} document</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={onExtract}
          disabled={isExtracting || isHumanizing}
        >
          {isExtracting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Extract Text"
          )}
        </Button>
        
        {showHumanizeButton && onHumanize && (
          <Button 
            onClick={onHumanize}
            disabled={isHumanizing}
            variant="secondary"
          >
            {isHumanizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Humanizing...
              </>
            ) : (
              "Humanize Text"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
