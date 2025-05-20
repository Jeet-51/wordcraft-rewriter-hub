
import { Textarea } from "@/components/ui/textarea";

interface TextPreviewProps {
  title: string;
  text: string;
  onChange: (text: string) => void;
}

export function TextPreview({ title, text, onChange }: TextPreviewProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <Textarea 
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className="h-32"
      />
    </div>
  );
}
