
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Get the original text from the request
    const { text } = requestBody;
    
    if (!text || typeof text !== "string") {
      throw new Error("Text parameter is required and must be a string");
    }

    if (text.length < 50) {
      throw new Error("Text must be at least 50 characters long");
    }

    // Get the Undetectable AI Humanizer API key from environment variables
    const humanizerApiKey = Deno.env.get('HUMANIZER_API_KEY');
    let humanizedText = "";

    if (humanizerApiKey) {
      console.log("Using Undetectable AI Humanizer API v2 for text transformation");
      try {
        // Stage 1: Submit the content to the Humanizer API
        const submitResponse = await fetch("https://humanize.undetectable.ai/submit", {
          method: "POST",
          headers: {
            "apikey": humanizerApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            content: text,
            readability: "standard", // Default to standard readability
            purpose: "general",      // Default to general purpose
            strength: 0.6           // Medium strength (0.4-0.8 is recommended)
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
        
        console.log("Successfully humanized text using Undetectable AI");
      } catch (apiError) {
        console.error("Humanizer API error:", apiError);
        
        // Fall back to local method if API call fails
        console.log("Falling back to local humanization method");
        humanizedText = localHumanize(text);
      }
    } else {
      console.log("Humanizer API key not found. Using local humanization method");
      humanizedText = localHumanize(text);
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

// Local text humanization function
function localHumanize(text: string): string {
  // Enhanced humanization rules
  return text
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
    .replace(/do not /gi, "don't ")
    
    // Add text variety by slightly modifying sentence structures
    .replace(/\. However, /gi, ". But ")
    .replace(/\. In addition, /gi, ". Also, ")
    .replace(/\. Therefore, /gi, ". So, ")
    
    // Add some filler words to simulate more natural speech
    .replace(/(\. )([A-Z])/g, (_, p1, p2) => {
      const fillers = ["", " Actually, ", " You know, ", " I mean, ", " So, "];
      return p1 + fillers[Math.floor(Math.random() * fillers.length)] + p2;
    })
    
    // Add some variety to the beginning of sentences
    .replace(/^I /gm, () => {
      const starters = ["I ", "Personally, I ", "To be honest, I "];
      return starters[Math.floor(Math.random() * starters.length)];
    })
    
    // Correct potential double spaces
    .replace(/\s{2,}/g, " ");
}
