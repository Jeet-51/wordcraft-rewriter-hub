import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Maximum number of polling attempts
const MAX_POLLING_ATTEMPTS = 20;
// Polling interval in milliseconds
const POLLING_INTERVAL = 5000;

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

    // Get the Humanizer API key from environment variables
    const humanizationApiKey = Deno.env.get('HUMANIZER_API_KEY');
    let humanizedText = "";

    if (humanizationApiKey) {
      console.log("Using Undetectable AI Humanizer API v2 for content transformation");
      try {
        // Step 1: Submit the text to the Humanizer API
        const payload = {
          content: text,
          readability: "University",
          purpose: "General Writing",
          strength: "More Human",
          model: "v11"
        };

        console.log("Sending request to Humanizer API /submit endpoint");
        
        const submitResponse = await fetch("https://humanize.undetectable.ai/submit", {
          method: "POST",
          headers: {
            "apikey": humanizationApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Check HTTP status code first
        if (!submitResponse.ok) {
          const statusText = submitResponse.statusText;
          let errorDetail;
          
          try {
            const errorBody = await submitResponse.text();
            console.error(`Submit endpoint error response body: ${errorBody}`);
            
            try {
              // Try to parse as JSON if possible
              errorDetail = JSON.parse(errorBody);
            } catch {
              // Otherwise use as text
              errorDetail = errorBody;
            }
          } catch (e) {
            errorDetail = "Unable to read error response";
          }
          
          throw new Error(`Submit API failed with status ${submitResponse.status}: ${statusText}. Details: ${JSON.stringify(errorDetail)}`);
        }

        // Parse response as JSON
        let submitData;
        try {
          submitData = await submitResponse.json();
        } catch (jsonError) {
          console.error("Error parsing submit response:", jsonError);
          const responseText = await submitResponse.text();
          console.error(`Raw submit response: ${responseText}`);
          throw new Error("Invalid JSON response from submit endpoint");
        }
        
        if (!submitData || !submitData.id) {
          console.error("Submit response data:", submitData);
          throw new Error("Failed to get document ID from Humanizer API");
        }

        const documentId = submitData.id;
        console.log(`Document submitted successfully. ID: ${documentId}`);

        // Step 2: Poll for the humanized text
        let attempts = 0;
        let documentData = null;
        
        while (attempts < MAX_POLLING_ATTEMPTS) {
          console.log(`Polling attempt ${attempts + 1}/${MAX_POLLING_ATTEMPTS}`);
          
          const pollResponse = await fetch(`https://humanize.undetectable.ai/document?id=${documentId}`, {
            method: "GET",
            headers: {
              "apikey": humanizationApiKey,
              "Content-Type": "application/json",
            },
          });

          // Check HTTP status code first
          if (!pollResponse.ok) {
            const statusText = pollResponse.statusText;
            console.error(`Poll endpoint error: ${pollResponse.status} ${statusText}`);
            
            try {
              const errorBody = await pollResponse.text();
              console.error(`Poll endpoint error response body: ${errorBody}`);
            } catch (e) {
              console.error("Unable to read poll error response");
            }
            
            // Continue polling despite errors - don't throw yet
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            attempts++;
            continue;
          }

          // Parse response as JSON
          try {
            documentData = await pollResponse.json();
            console.log("Poll response data:", JSON.stringify(documentData));
          } catch (jsonError) {
            console.error("Error parsing poll response:", jsonError);
            const responseText = await pollResponse.text();
            console.error(`Raw poll response: ${responseText}`);
            
            // Continue polling despite parsing errors
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
            attempts++;
            continue;
          }
          
          // Check if processing is complete and output is available
          if (documentData && documentData.status === 'complete' && documentData.output) {
            console.log("Document processing complete");
            humanizedText = documentData.output;
            break;
          }
          
          // Wait before next polling attempt
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          attempts++;
        }

        if (!humanizedText) {
          console.error("Document processing timed out or returned null");
          throw new Error("Document processing timed out or returned null");
        }
      } catch (apiError) {
        console.error("Humanizer API error:", apiError);
        // Fall back to local method if API call fails
        console.log("Falling back to local humanization method");
        humanizedText = localHumanize(text);
      }
    } else {
      console.log("API key not found. Using local humanization method");
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
