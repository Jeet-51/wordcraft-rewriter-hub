
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Humanization } from "@/lib/supabase";

interface DocumentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  document: Humanization | null;
}

export const DocumentDialog = ({ isOpen, setIsOpen, document }: DocumentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Document Details</DialogTitle>
          <DialogDescription>
            Created on {document && new Date(document.created_at || '').toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Original Text</h3>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{document?.original_text}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Humanized Text</h3>
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{document?.humanized_text}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
