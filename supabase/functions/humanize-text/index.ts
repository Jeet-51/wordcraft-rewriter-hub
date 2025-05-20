
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get the original text from the request
    const { text } = await req.json();
    
    if (!text || typeof text !== "string") {
      throw new Error("Text parameter is required and must be a string");
    }

    console.log("Using local humanization method");
    
    // Local humanization function
    const humanizedText = humanizeText(text);
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
function humanizeText(text: string): string {
  // Basic humanization rules
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
    
    // Correct potential double spaces
    .replace(/\s{2,}/g, " ");
}
