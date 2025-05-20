
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
    // Get the original text from the request
    const { text } = await req.json();
    
    if (!text || typeof text !== "string") {
      throw new Error("Text parameter is required and must be a string");
    }

    // Use HuggingFace API for text humanization if API key exists
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    let humanizedText = "";

    if (hfToken) {
      console.log("Using HuggingFace API for humanization");
      try {
        const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `Rewrite the following text to sound more human and natural, without changing its meaning: "${text}"`,
            parameters: {
              max_new_tokens: 2048,
              temperature: 0.7,
              top_p: 0.9,
            }
          }),
        });

        const data = await response.json();
        
        if (data && data[0] && data[0].generated_text) {
          // Parse out just the response part, not the prompt
          humanizedText = data[0].generated_text.replace(
            new RegExp(`Rewrite the following text to sound more human and natural, without changing its meaning: "${text}"`),
            ""
          ).trim();
        }
      } catch (apiError) {
        console.error("HuggingFace API error:", apiError);
        // Fall back to local method
        humanizedText = localHumanize(text);
      }
    } else {
      console.log("Using local humanization method");
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
