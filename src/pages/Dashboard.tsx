
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CreditUsage } from "@/components/dashboard/CreditUsage";
import { HumanizerTab } from "@/components/dashboard/HumanizerTab";
import { DocumentsTab } from "@/components/dashboard/DocumentsTab";
import { HistoryTab } from "@/components/dashboard/HistoryTab";
import { DocumentDialog } from "@/components/dashboard/DocumentDialog";
import { 
  getProfile, 
  getHumanizations, 
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

  useEffect(() => {
    loadUserData();
  }, [user, toast]);

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

        <CreditUsage profile={profile} />

        <Tabs defaultValue="humanizer" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="humanizer">Humanizer</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="humanizer" className="space-y-4">
              <HumanizerTab 
                extractedText={extractedText}
                humanizedText={humanizedText}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <DocumentsTab 
                userId={user?.id}
                humanizations={humanizations}
                uploadedDocument={uploadedDocument}
                setUploadedDocument={setUploadedDocument}
                onExtractedText={handleExtractedText}
                onViewDocument={handleViewDocument}
                refreshHumanizations={loadUserData}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <HistoryTab
                humanizations={humanizations}
                displayedHumanizations={displayedHumanizations}
                isLoadingMore={isLoadingMore}
                handleLoadMore={handleLoadMore}
                setActiveTab={setActiveTab}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      <DocumentDialog 
        isOpen={isDocumentDialogOpen}
        setIsOpen={setIsDocumentDialogOpen}
        document={selectedDocument}
      />
    </div>
  );
};

export default Dashboard;
