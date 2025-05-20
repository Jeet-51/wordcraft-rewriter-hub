
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HumanizerTool } from "@/components/HumanizerTool";
import { DocumentExtractor } from "@/components/DocumentExtractor"; 
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  getProfile, 
  getHumanizations, 
  uploadDocument, 
  type Profile, 
  type Humanization
} from "@/lib/supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("humanizer");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [humanizations, setHumanizations] = useState<Humanization[]>([]);
  const [displayedHumanizations, setDisplayedHumanizations] = useState<Humanization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [humanizedText, setHumanizedText] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Humanization | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Load user profile
        const profileData = await getProfile(user.id);
        setProfile(profileData);
        
        // Load user's humanization history
        const humanizationData = await getHumanizations(user.id);
        setHumanizations(humanizationData);
        
        // Set initial displayed items
        setDisplayedHumanizations(humanizationData.slice(0, itemsPerPage));
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
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
      console.log("Uploading document for user:", user.id);
      
      // Upload the file
      const fileUrl = await uploadDocument(user.id, file);
      
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
      
      // Automatically switch to the documents tab
      setActiveTab("documents");
      
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

  const handleExtractedText = (originalText: string, humanizedText?: string) => {
    setExtractedText(originalText);
    
    // If humanized text is provided, set it and switch to humanizer tab
    if (humanizedText) {
      setHumanizedText(humanizedText);
      setActiveTab("humanizer");
    } else {
      // If only original text is provided (backward compatibility)
      setActiveTab("humanizer");
    }
  };
  
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    
    // Calculate next page of items
    const nextPage = currentPage + 1;
    const startIndex = 0;
    const endIndex = nextPage * itemsPerPage;
    
    // Update displayed items with more content
    setDisplayedHumanizations(humanizations.slice(startIndex, endIndex));
    setCurrentPage(nextPage);
    
    setIsLoadingMore(false);
    
    // Scroll to the newly loaded content
    setTimeout(() => {
      const element = document.getElementById('history-items-end');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };
  
  const handleViewDocument = (item: Humanization) => {
    setSelectedDocument(item);
    setIsDocumentDialogOpen(true);
  };
  
  if (!user) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-8 text-muted-foreground">
          Please login to access your dashboard.
        </p>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your content humanization and account.
          </p>
        </div>

        {profile && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Credit Usage</CardTitle>
              <CardDescription>
                {profile.credits_used} of {profile.credits_total} credits used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress 
                  value={(profile.credits_used / profile.credits_total) * 100} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>
                    {profile.credits_total - profile.credits_used} credits remaining
                  </span>
                  <span className="capitalize">
                    {profile.plan} Plan
                  </span>
                </div>
              </div>
              {profile.plan === "free" && (
                <div className="mt-4">
                  <Link to="/pricing">
                    <Button variant="outline" size="sm">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="humanizer" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="humanizer">Humanizer</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="humanizer" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Text Humanizer</CardTitle>
                  <CardDescription>
                    Transform your AI-generated content to sound human-written
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HumanizerTool 
                    initialText={extractedText} 
                    initialHumanizedText={humanizedText}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
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
                          onExtracted={handleExtractedText}
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
                                  onClick={() => handleViewDocument(item)}
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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Humanization History</CardTitle>
                  <CardDescription>
                    View your recent text humanization history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {humanizations.length > 0 ? (
                    <div className="space-y-4">
                      {displayedHumanizations.map((item) => (
                        <div key={item.id} className="rounded-lg border p-4">
                          <div className="text-sm text-muted-foreground mb-1">
                            {new Date(item.created_at || '').toLocaleString()}
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold mb-1">Original:</p>
                              <p className="text-sm whitespace-pre-wrap">
                                {item.original_text.substring(0, 150)}
                                {item.original_text.length > 150 && "..."}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold mb-1">Humanized:</p>
                              <p className="text-sm whitespace-pre-wrap">
                                {item.humanized_text.substring(0, 150)}
                                {item.humanized_text.length > 150 && "..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div id="history-items-end"></div>
                      {displayedHumanizations.length < humanizations.length && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                        >
                          {isLoadingMore ? "Loading..." : "Load More"}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No humanization history found.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("humanizer")}
                      >
                        Start Humanizing
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Document Viewing Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Created on {selectedDocument && new Date(selectedDocument.created_at || '').toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Original Text</h3>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">{selectedDocument?.original_text}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Humanized Text</h3>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm whitespace-pre-wrap">{selectedDocument?.humanized_text}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDocumentDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
