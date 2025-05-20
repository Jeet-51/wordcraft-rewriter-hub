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

    // Get the OpenAI API key from environment variables
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    let humanizedText = "";

    if (openAiApiKey) {
      console.log("Using OpenAI GPT-4 Turbo for content transformation");
      try {
        const payload = {
          model: "gpt-4o-mini", // Using gpt-4o-mini as a more modern alternative
          messages: [
            {
              role: "system",
              content: "You are an expert editor that rewrites AI-generated content to sound natural, human-like, and context-appropriate. Preserve the original intent while improving flow, tone, and clarity. Avoid sounding robotic or generic."
            },
            {
              role: "user",
              content: `Humanize the following text:\n\n"${text}"`
            }
          ],
          temperature: 0.7
        };

        console.log("Sending request to OpenAI API");
        
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        // Check HTTP status code first
        if (!openaiResponse.ok) {
          const statusText = openaiResponse.statusText;
          let errorDetail;
          
          try {
            const errorBody = await openaiResponse.text();
            console.error(`OpenAI API error response body: ${errorBody}`);
            
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
          
          throw new Error(`OpenAI API failed with status ${openaiResponse.status}: ${statusText}. Details: ${JSON.stringify(errorDetail)}`);
        }

        // Parse response as JSON
        let responseData;
        try {
          responseData = await openaiResponse.json();
        } catch (jsonError) {
          console.error("Error parsing OpenAI response:", jsonError);
          const responseText = await openaiResponse.text();
          console.error(`Raw OpenAI response: ${responseText}`);
          throw new Error("Invalid JSON response from OpenAI API");
        }
        
        if (!responseData || !responseData.choices || !responseData.choices[0]?.message?.content) {
          console.error("OpenAI response data:", responseData);
          throw new Error("Failed to get content from OpenAI API");
        }

        humanizedText = responseData.choices[0].message.content.trim();
        
        // Validate that we got a meaningful response back
        if (!humanizedText || humanizedText.length < 20) {
          console.error("OpenAI returned an empty or very short response");
          throw new Error("OpenAI returned an empty or very short response");
        }
        
        // Remove any quotation marks that might be wrapping the response
        humanizedText = humanizedText.replace(/^["']|["']$/g, '');
        
        console.log("Successfully retrieved humanized text from OpenAI");
      } catch (apiError) {
        console.error("OpenAI API error:", apiError);
        // Fall back to local method if API call fails
        console.log("Falling back to local humanization method");
        humanizedText = localHumanize(text);
      }
    } else {
      console.log("OpenAI API key not found. Using local humanization method");
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
