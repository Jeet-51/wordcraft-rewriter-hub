
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid readability levels for Undetectable AI API
const VALID_READABILITY_LEVELS = ["High School", "University", "Doctorate", "Journalist", "Marketing"];
// Valid purpose options for Undetectable AI API
const VALID_PURPOSES = ["General Writing", "Academic", "Business", "Creative", "Technical"];
// Default values
const DEFAULT_READABILITY = "University";
const DEFAULT_PURPOSE = "General Writing";
const DEFAULT_STRENGTH = "0.9";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Invalid request body format. Expected JSON.");
    }

    // Get parameters from the request
    const { text, readability, purpose, strength } = requestBody;
    
    if (!text || typeof text !== "string") {
      throw new Error("Text parameter is required and must be a string");
    }

    if (text.length < 50) {
      throw new Error("Text must be at least 50 characters long");
    }
    
    // Validate and set readability level
    const validatedReadability = readability && VALID_READABILITY_LEVELS.includes(readability)
      ? readability
      : DEFAULT_READABILITY;
    
    // Validate and set purpose
    const validatedPurpose = purpose && VALID_PURPOSES.includes(purpose)
      ? purpose
      : DEFAULT_PURPOSE;
    
    // Validate and set strength (between 0.1 and 0.9)
    const validatedStrength = strength && !isNaN(parseFloat(strength)) && parseFloat(strength) >= 0.1 && parseFloat(strength) <= 0.9
      ? strength.toString()
      : DEFAULT_STRENGTH;
    
    console.log(`Request parameters: readability=${validatedReadability}, purpose=${validatedPurpose}, strength=${validatedStrength}`);

    // Get the Undetectable AI Humanizer API key from environment variables
    const humanizerApiKey = Deno.env.get('HUMANIZER_API_KEY');
    let humanizedText = "";

    if (humanizerApiKey) {
      console.log("Using Undetectable AI Humanizer API v2 for text transformation");
      try {
        // Stage 1: Submit the content to the Humanizer API
        console.log("Submitting content to Undetectable AI Humanizer API");
        const submitResponse = await fetch("https://humanize.undetectable.ai/submit", {
          method: "POST",
          headers: {
            "apikey": humanizerApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: text,
            readability: validatedReadability,
            purpose: validatedPurpose,
            strength: validatedStrength
          })
        });

        // Check if the submission was successful
        if (!submitResponse.ok) {
          const errorBody = await submitResponse.text();
          console.error(`Humanizer API error (${submitResponse.status}): ${errorBody}`);
          
          let errorMessage = `API Error: ${submitResponse.status}`;
          try {
            const errorJson = JSON.parse(errorBody);
            
            // Check if it's an insufficient credits error
            if (errorJson.error && errorJson.error.includes("Insufficient credits")) {
              errorMessage = "Insufficient credits to humanize text. Please upgrade your plan.";
            } else if (errorJson.error) {
              errorMessage = errorJson.error;
            }
          } catch (e) {
            // If parsing fails, use the error body as message
            errorMessage = errorBody || `API Error: ${submitResponse.status}`;
          }
          
          throw new Error(errorMessage);
        }

        // Parse the response to get the document ID
        const submissionData = await submitResponse.json();
        
        if (!submissionData || !submissionData.id) {
          console.error("Invalid submission response:", submissionData);
          throw new Error("Failed to get document ID from Humanizer API");
        }

        const documentId = submissionData.id;
        console.log(`Document submitted successfully. ID: ${documentId}`);

        // Stage 2: Poll for the document result
        const maxAttempts = 20;  // Maximum number of polling attempts
        const pollInterval = 5000;  // 5 seconds between polls
        
        let attempts = 0;
        let documentData;
        
        while (attempts < maxAttempts) {
          attempts++;
          
          console.log(`Polling attempt ${attempts}/${maxAttempts} for document ${documentId}`);
          
          // Wait for pollInterval before next attempt (except first attempt)
          if (attempts > 1) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
          }
          
          const documentResponse = await fetch(`https://humanize.undetectable.ai/document/${documentId}`, {
            method: "GET",
            headers: {
              "apikey": humanizerApiKey,
              "Content-Type": "application/json"
            }
          });
          
          if (!documentResponse.ok) {
            console.error(`Error fetching document (${documentResponse.status}): ${await documentResponse.text()}`);
            
            // If we got a non-recoverable error (not 429), break the loop
            if (documentResponse.status !== 429) {
              throw new Error(`Failed to fetch document: ${documentResponse.status}`);
            }
            
            // For rate limiting, continue polling after delay
            continue;
          }
          
          documentData = await documentResponse.json();
          console.log("API response:", JSON.stringify(documentData).substring(0, 200) + "...");
          
          // Check if processing is complete (output field is populated)
          if (documentData && documentData.output) {
            console.log("Document processing complete");
            humanizedText = documentData.output;
            break;
          }
          
          // If still processing, continue polling
          console.log("Document still processing, will check again...");
        }
        
        // Check if we got a result after all attempts
        if (!humanizedText) {
          console.error("Document processing timed out after maximum attempts");
          throw new Error("Document processing timed out. Please try again later.");
        }
        
        // Ensure the humanized text is actually different from the input
        if (humanizedText === text) {
          console.log("Warning: API returned identical text. Using advanced fallback.");
          humanizedText = advancedHumanize(text);
        } else {
          console.log("Successfully humanized text using Undetectable AI");
        }
      } catch (apiError) {
        console.error("Humanizer API error:", apiError);
        
        // Fall back to local method if API call fails
        console.log("Falling back to advanced humanization method");
        humanizedText = advancedHumanize(text);
      }
    } else {
      console.log("Humanizer API key not found. Using advanced humanization method");
      humanizedText = advancedHumanize(text);
    }

    console.log("Successfully humanized text");

    // Return the humanized text to the client
    return new Response(
      JSON.stringify({ 
        humanizedText: humanizedText, 
        success: true
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in humanize-text function:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to humanize text",
        success: false,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

// Advanced text humanization function with better rewriting logic
function advancedHumanize(text: string): string {
  // Break text into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Process each paragraph
  const processedParagraphs = paragraphs.map(paragraph => {
    // Skip empty paragraphs
    if (!paragraph.trim()) return paragraph;
    
    // Split paragraph into sentences 
    const sentences = paragraph
      .replace(/([.!?])\s+/g, "$1|")
      .split("|")
      .filter(sentence => sentence.trim().length > 0);

    // Process each sentence with different humanization strategies
    const processedSentences = sentences.map((sentence, index) => {
      // Use different strategies based on sentence position and content
      const strategy = index % 5; // Cycle through 5 different strategies
      
      switch (strategy) {
        case 0:
          // Strategy 1: Add personal perspective
          return addPersonalPerspective(sentence);
        case 1:
          // Strategy 2: Restructure the sentence
          return restructureSentence(sentence);
        case 2:
          // Strategy 3: Simplify complex phrasing
          return simplifyComplexPhrasing(sentence);
        case 3:
          // Strategy 4: Add transition phrases
          return addTransitionPhrase(sentence, index, sentences.length);
        case 4:
          // Strategy 5: Vary vocabulary
          return varyVocabulary(sentence);
        default:
          return sentence;
      }
    });
    
    // Join sentences back into paragraph
    return processedSentences.join(" ");
  });
  
  // Join paragraphs back into text
  return processedParagraphs.join("\n\n");
}

// Strategy 1: Adding personal perspective
function addPersonalPerspective(sentence: string): string {
  const personalStarters = [
    { pattern: /^It is /i, replacement: "I think it's " },
    { pattern: /^There is /i, replacement: "I believe there's " },
    { pattern: /^This /i, replacement: "In my view, this " },
    { pattern: /^The data shows /i, replacement: "From what I've seen, the data indicates " },
    { pattern: /^Research indicates /i, replacement: "Based on research I've read, " }
  ];
  
  let result = sentence;
  
  // Apply a random transformation with 40% chance
  if (Math.random() < 0.4) {
    for (const { pattern, replacement } of personalStarters) {
      if (pattern.test(sentence)) {
        result = sentence.replace(pattern, replacement);
        break;
      }
    }
  }
  
  return result;
}

// Strategy 2: Restructuring sentences
function restructureSentence(sentence: string): string {
  // Only apply to longer sentences
  if (sentence.length < 40) return sentence;
  
  // Examples of restructuring patterns
  const restructurePatterns = [
    // If sentence contains "because", flip the cause and effect
    { 
      pattern: /^(.+) because (.+)\.$/i, 
      replacement: (_, effect, cause) => `Because ${cause}, ${effect.toLowerCase()}.` 
    },
    // If sentence uses "although", reverse the order
    { 
      pattern: /^Although (.+), (.+)\.$/i, 
      replacement: (_, concession, main) => `${main}. However, ${concession}.` 
    },
    // Convert "not only X but also Y" structure
    { 
      pattern: /^(.+) not only (.+) but also (.+)\.$/i,
      replacement: (_, subject, first, second) => `${subject} ${second}. Additionally, ${subject} ${first}.` 
    }
  ];
  
  // Try to apply a restructuring pattern
  for (const { pattern, replacement } of restructurePatterns) {
    if (pattern.test(sentence)) {
      return sentence.replace(pattern, replacement);
    }
  }
  
  return sentence;
}

// Strategy 3: Simplifying complex phrasing
function simplifyComplexPhrasing(sentence: string): string {
  return sentence
    // Replace complex words with simpler alternatives
    .replace(/utilize/gi, "use")
    .replace(/subsequently/gi, "then")
    .replace(/nevertheless/gi, "however")
    .replace(/additionally/gi, "also")
    .replace(/furthermore/gi, "plus")
    .replace(/commence/gi, "start")
    .replace(/terminate/gi, "end")
    .replace(/endeavor/gi, "try")
    .replace(/attempt to/gi, "try to")
    .replace(/sufficient/gi, "enough")
    .replace(/ascertain/gi, "find out")
    .replace(/in the event that/gi, "if")
    .replace(/in order to/gi, "to")
    .replace(/for the purpose of/gi, "for")
    .replace(/with regard to/gi, "about")
    .replace(/in reference to/gi, "about")
    .replace(/in relation to/gi, "about")
    
    // Replace overly formal phrases
    .replace(/it is imperative that/gi, "it's important that")
    .replace(/as a consequence of/gi, "because of")
    .replace(/in the absence of/gi, "without")
    .replace(/in the vicinity of/gi, "near")
    .replace(/in conjunction with/gi, "with")
    .replace(/in accordance with/gi, "following")
    
    // Add occasional contractions to sound more human
    .replace(/it is /gi, "it's ")
    .replace(/that is /gi, "that's ")
    .replace(/there is /gi, "there's ")
    .replace(/what is /gi, "what's ")
    .replace(/who is /gi, "who's ")
    .replace(/cannot /gi, "can't ")
    .replace(/do not /gi, "don't ");
}

// Strategy 4: Adding transition phrases
function addTransitionPhrase(sentence: string, index: number, totalSentences: number): string {
  // Skip for first sentence or short sentences
  if (index === 0 || sentence.length < 30) return sentence;
  
  const transitions = [
    "Actually, ",
    "Honestly, ",
    "Interestingly, ",
    "To be fair, ",
    "Surprisingly, ",
    "Of course, ",
    "Naturally, ",
    "As you might expect, ",
    "Looking at this differently, ",
    "In fact, "
  ];
  
  // Only add transition 30% of the time
  if (Math.random() < 0.3) {
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    return transition + sentence.charAt(0).toLowerCase() + sentence.slice(1);
  }
  
  return sentence;
}

// Strategy 5: Varying vocabulary
function varyVocabulary(sentence: string): string {
  const wordSubstitutions = [
    { pattern: /\bimportant\b/gi, replacements: ["crucial", "vital", "essential", "key"] },
    { pattern: /\bproblem\b/gi, replacements: ["issue", "challenge", "difficulty", "concern"] },
    { pattern: /\bgood\b/gi, replacements: ["great", "excellent", "beneficial", "positive"] },
    { pattern: /\bbad\b/gi, replacements: ["poor", "negative", "problematic", "unfavorable"] },
    { pattern: /\bquickly\b/gi, replacements: ["rapidly", "swiftly", "promptly", "speedily"] },
    { pattern: /\bclearly\b/gi, replacements: ["obviously", "evidently", "plainly", "distinctly"] },
    { pattern: /\bsignificant\b/gi, replacements: ["substantial", "considerable", "notable", "marked"] },
    { pattern: /\bshow\b/gi, replacements: ["demonstrate", "indicate", "reveal", "display"] },
    { pattern: /\bthink\b/gi, replacements: ["believe", "consider", "reckon", "feel"] }
  ];
  
  let result = sentence;
  
  // Apply up to 2 random substitutions
  const substitutionsToApply = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < substitutionsToApply; i++) {
    const substitution = wordSubstitutions[Math.floor(Math.random() * wordSubstitutions.length)];
    
    if (substitution.pattern.test(result)) {
      const replacement = substitution.replacements[Math.floor(Math.random() * substitution.replacements.length)];
      // Only replace the first occurrence to avoid over-substitution
      result = result.replace(substitution.pattern, replacement);
    }
  }
  
  return result;
}
