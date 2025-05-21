
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentExtractor } from "@/components/DocumentExtractor";
import { useToast } from "@/hooks/use-toast";
import { Humanization, uploadDocument } from "@/lib/supabase";

interface DocumentsTabProps {
  userId: string | undefined;
  humanizations: Humanization[];
  uploadedDocument: { url: string; name: string; type: string; } | null;
  setUploadedDocument: (doc: { url: string; name: string; type: string; } | null) => void;
  onExtractedText: (originalText: string, humanizedText?: string) => void;
  onViewDocument: (item: Humanization) => void;
  refreshHumanizations: () => void;
  setActiveTab: (tab: string) => void;
}

export const DocumentsTab = ({ 
  userId, 
  humanizations, 
  uploadedDocument, 
  setUploadedDocument, 
  onExtractedText, 
  onViewDocument, 
  refreshHumanizations,
  setActiveTab
}: DocumentsTabProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please login to upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check file type
    const allowedTypes = ['.txt', '.docx', '.pdf'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Only .txt, .docx, and .pdf files are supported.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      console.log("Uploading document for user:", userId);
      
      // Upload the file
      const fileUrl = await uploadDocument(userId, file);
      
      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });
      
      // Set the uploaded document info
      setUploadedDocument({
        url: fileUrl,
        name: file.name,
        type: fileExt.substring(1) // Remove the dot from the extension
      });
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleHumanizeComplete = () => {
    refreshHumanizations();
    setActiveTab("history");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload .txt, .docx or .pdf files for humanization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              id="file-upload"
              type="file"
              accept=".txt,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label 
              htmlFor="file-upload" 
              className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${isUploading ? 'opacity-50' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <div className="text-sm">
                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-muted-foreground">
                TXT, DOCX, PDF (Max 10MB)
              </p>
              {isUploading && (
                <p className="text-xs text-primary animate-pulse mt-2">
                  Uploading...
                </p>
              )}
            </label>
          </div>

          {uploadedDocument && (
            <div className="space-y-4">
              <h3 className="font-medium">Document Processing</h3>
              <DocumentExtractor
                fileUrl={uploadedDocument.url}
                fileName={uploadedDocument.name}
                fileType={uploadedDocument.type}
                onExtracted={onExtractedText}
                onHumanizeComplete={handleHumanizeComplete}
              />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="font-medium">Your Documents</h3>
            {humanizations.length > 0 ? (
              <div className="rounded-md border divide-y">
                {humanizations.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium truncate max-w-sm">
                          {item.original_text.substring(0, 30)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewDocument(item)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You haven't uploaded any documents yet.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
