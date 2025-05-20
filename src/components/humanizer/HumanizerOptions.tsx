
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface HumanizerOptionsProps {
  readability: string;
  setReadability: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  strength: number;
  setStrength: (value: number) => void;
}

export function HumanizerOptions({
  readability,
  setReadability,
  purpose,
  setPurpose,
  strength,
  setStrength,
}: HumanizerOptionsProps) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="readability">Readability Level</Label>
          <Select 
            value={readability} 
            onValueChange={setReadability}
          >
            <SelectTrigger id="readability">
              <SelectValue placeholder="Select readability level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="University">University</SelectItem>
              <SelectItem value="Doctorate">Doctorate</SelectItem>
              <SelectItem value="Journalist">Journalist</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purpose">Writing Purpose</Label>
          <Select 
            value={purpose} 
            onValueChange={setPurpose}
          >
            <SelectTrigger id="purpose">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Writing">General Writing</SelectItem>
              <SelectItem value="Academic">Academic</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Creative">Creative</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="strength">Humanization Strength: {strength}</Label>
        </div>
        <Slider
          id="strength"
          value={[strength]} 
          min={0.1}
          max={0.9}
          step={0.1}
          onValueChange={values => setStrength(values[0])}
        />
      </div>
    </div>
  );
}
