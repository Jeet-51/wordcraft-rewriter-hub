
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

    // Log the exact API endpoint and credentials being used (without revealing the actual key)
    console.log("Making request to Undetectable.AI API");
    console.log(`Using User ID: ${undetectableUserId.substring(0, 3)}...`);
    console.log("API endpoint: https://api.undetectable.ai/humanize");

    // Make the API call to Undetectable.AI with the CORRECT endpoint URL
    // Note: Based on error logs, removing the /api/v2/ part from the URL
    const response = await fetch("https://api.undetectable.ai/humanize", {
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

    // Check response status
    if (!response.ok) {
      // Log detailed information about non-successful responses
      console.error(`API responded with status ${response.status}: ${response.statusText}`);
      
      // Try to get more details about the error
      let errorDetails;
      const contentType = response.headers.get("content-type") || "";
      
      if (contentType.includes("application/json")) {
        errorDetails = await response.json();
        console.error("API error details:", errorDetails);
      } else {
        const textResponse = await response.text();
        console.error("API response (text):", textResponse.substring(0, 500)); // Log first 500 chars to help debug
        errorDetails = { message: "Non-JSON response received" };
      }
      
      throw new Error(`API error: ${errorDetails.message || response.statusText}`);
    }

    // Check content type to ensure we're handling JSON
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Unexpected content type:", contentType);
      console.error("Response preview:", textResponse.substring(0, 500));
      throw new Error("API returned non-JSON response");
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
