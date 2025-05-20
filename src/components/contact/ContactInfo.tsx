
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export const ContactInfo = () => {
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-background/80 border-primary/10 shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="text-muted-foreground">support@aihumanizer.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="backdrop-blur-sm bg-background/80 border-primary/10 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Our Address</h3>
              <p className="text-muted-foreground">
                123 AI Street, Tech Valley<br />
                San Francisco, CA 94103<br />
                United States
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
