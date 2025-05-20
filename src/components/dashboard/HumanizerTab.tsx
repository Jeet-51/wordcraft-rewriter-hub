
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HumanizerTool } from "@/components/HumanizerTool";

interface HumanizerTabProps {
  extractedText: string;
  humanizedText: string;
}

export const HumanizerTab = ({ extractedText, humanizedText }: HumanizerTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Text Humanizer (OpenAI)</CardTitle>
        <CardDescription>
          Transform your AI-generated content to sound human-written using OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <HumanizerTool 
          initialText={extractedText} 
          initialHumanizedText={humanizedText}
        />
      </CardContent>
    </Card>
  );
};
