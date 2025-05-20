
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

    // Prepare request to Undetectable.AI API
    const undetectableUserId = Deno.env.get("UNDETECTABLE_USER_ID");
    const undetectableApiKey = Deno.env.get("UNDETECTABLE_API_KEY");

    if (!undetectableUserId || !undetectableApiKey) {
      throw new Error("Undetectable.AI credentials not configured");
    }

    console.log("Making request to Undetectable.AI API");

    // Make the API call to Undetectable.AI
    const response = await fetch("https://api.undetectable.ai/v2/humanize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": undetectableUserId,
        "X-API-Key": undetectableApiKey,
      },
      body: JSON.stringify({
        text: text,
        // Optional parameters - can be adjusted based on needs
        readability: "standard", // Options: simple, standard, advanced, expert
        creativity: "medium",    // Options: none, low, medium, high
        strength: "medium",      // Options: light, medium, heavy
        language: "en",         // Language code
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Undetectable.AI API error:", errorData);
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Successfully received humanized text from API");

    // Return the humanized text to the client
    return new Response(
      JSON.stringify({ 
        humanizedText: data.humanized_text || data.text, 
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
