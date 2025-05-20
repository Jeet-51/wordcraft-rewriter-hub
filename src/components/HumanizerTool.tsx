
import { useEffect } from "react";
import { InputSection } from "@/components/humanizer/InputSection";
import { OutputSection } from "@/components/humanizer/OutputSection";
import { useHumanizerForm } from "@/hooks/useHumanizerForm";

interface HumanizerToolProps {
  initialText?: string;
  initialHumanizedText?: string;
}

export function HumanizerTool({ initialText = "", initialHumanizedText = "" }: HumanizerToolProps) {
  const {
    inputText,
    setInputText,
    outputText,
    readability,
    setReadability,
    purpose,
    setPurpose,
    strength,
    setStrength,
    isHumanizing,
    handleHumanize
  } = useHumanizerForm({ initialText, initialHumanizedText });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <InputSection
        inputText={inputText}
        setInputText={setInputText}
        handleHumanize={handleHumanize}
        readability={readability}
        setReadability={setReadability}
        purpose={purpose}
        setPurpose={setPurpose}
        strength={strength}
        setStrength={setStrength}
        isHumanizing={isHumanizing}
      />
      <OutputSection
        outputText={outputText}
        isHumanizing={isHumanizing}
      />
    </div>
  );
}
