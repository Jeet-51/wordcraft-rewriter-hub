
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Humanization } from "@/lib/supabase";

interface HistoryTabProps {
  humanizations: Humanization[];
  displayedHumanizations: Humanization[];
  isLoadingMore: boolean;
  handleLoadMore: () => void;
  setActiveTab: (tab: string) => void;
}

export const HistoryTab = ({ 
  humanizations, 
  displayedHumanizations, 
  isLoadingMore, 
  handleLoadMore, 
  setActiveTab 
}: HistoryTabProps) => {
  return (
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
  );
};
