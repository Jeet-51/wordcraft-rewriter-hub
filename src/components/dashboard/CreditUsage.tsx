
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Profile } from "@/lib/supabase";

interface CreditUsageProps {
  profile: Profile | null;
}

export const CreditUsage = ({ profile }: CreditUsageProps) => {
  if (!profile) return null;
  
  return (
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
  );
};
