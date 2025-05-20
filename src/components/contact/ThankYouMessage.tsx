
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface ThankYouMessageProps {
  onSendAnother: () => void;
}

export const ThankYouMessage = ({ onSendAnother }: ThankYouMessageProps) => {
  return (
    <Card className="border-primary/20 shadow-lg animate-fade-in backdrop-blur-sm bg-background/80">
      <CardContent className="p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Thank You!</h3>
        <p className="text-muted-foreground">
          Your message has been sent successfully. We'll get back to you as soon as possible.
        </p>
        <Button
          onClick={onSendAnother}
          variant="outline"
          className="mt-2"
        >
          Send Another Message
        </Button>
      </CardContent>
    </Card>
  );
};
