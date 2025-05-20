
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Constant configurations
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_READABILITY_LEVELS = ["High School", "University", "Doctorate", "Journalist", "Marketing"];
const VALID_PURPOSES = ["General Writing", "Academic", "Business", "Creative", "Technical"];
const DEFAULT_READABILITY = "University";
const DEFAULT_PURPOSE = "General Writing";
const DEFAULT_STRENGTH = "0.9";

// Helper functions for request handling
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

function validateAndParseRequest(requestBody: any) {
  const { text, readability, purpose, strength } = requestBody;
  
  if (!text || typeof text !== "string") {
    throw new Error("Text parameter is required and must be a string");
  }

  if (text.length < 50) {
    throw new Error("Text must be at least 50 characters long");
  }

  // Validate and set parameters
  const validatedReadability = readability && VALID_READABILITY_LEVELS.includes(readability)
    ? readability
    : DEFAULT_READABILITY;
  
  const validatedPurpose = purpose && VALID_PURPOSES.includes(purpose)
    ? purpose
    : DEFAULT_PURPOSE;
  
  const validatedStrength = strength && !isNaN(parseFloat(strength)) && parseFloat(strength) >= 0.1 && parseFloat(strength) <= 0.9
    ? parseFloat(strength)
    : parseFloat(DEFAULT_STRENGTH);

  console.log(`Request parameters: readability=${validatedReadability}, purpose=${validatedPurpose}, strength=${validatedStrength}`);
  
  return { 
    text, 
    validatedReadability, 
    validatedPurpose, 
    validatedStrength 
  };
}

// Prompt builder functions
function buildReadabilityPrompt(readability: string): string {
  switch (readability) {
    case "High School":
      return "Write at a high school reading level with simpler vocabulary and shorter sentences. ";
    case "University":
      return "Write at a university reading level with academic but accessible language. ";
    case "Doctorate":
      return "Write at an advanced academic level with sophisticated vocabulary and complex sentence structures. ";
    case "Journalist":
      return "Write in a journalistic style with clear, engaging language that balances formality and accessibility. ";
    case "Marketing":
      return "Write in a persuasive, engaging style that would be effective for marketing content. ";
    default:
      return "Write at a university reading level with academic but accessible language. ";
  }
}

function buildPurposePrompt(purpose: string): string {
  switch (purpose) {
    case "Academic":
      return "Format text for academic purposes, maintaining a formal tone with proper citations and logical structure. ";
    case "Business":
      return "Format text for business contexts, with clear points, professional tone, and actionable insights. ";
    case "Creative":
      return "Rewrite with a creative flair, using vivid language, varied sentence structures, and engaging style. ";
    case "Technical":
      return "Optimize for technical writing, with precise terminology, clear explanations, and logical organization. ";
    default: // General Writing
      return "Create natural-sounding general content that reads as if written by a human. ";
  }
}

function buildStrengthPrompt(strength: number): string {
  if (strength < 0.3) {
    return "Make minimal changes to the text, focusing only on the most obvious machine patterns. Preserve most of the original text.";
  } else if (strength < 0.6) {
    return "Make moderate changes to sentence structure and word choice, while preserving the original meaning and key phrases.";
  } else {
    return "Significantly rewrite the text with substantial changes to sentence structure, word choice, and organization. Make it sound completely human-written.";
  }
}

function buildHumanizationPrompt(readability: string, purpose: string, strength: number): string {
  let basePrompt = "You are an expert at rewriting AI-generated content to sound natural and human-written. ";
  
  // Add readability level instructions
  basePrompt += buildReadabilityPrompt(readability);
  
  // Add purpose-specific instructions
  basePrompt += buildPurposePrompt(purpose);
  
  // Add strength-specific instructions
  basePrompt += buildStrengthPrompt(strength);
  
  // Instructions for humanization process
  basePrompt += `
  
Follow these specific requirements:
1. Maintain the original meaning completely
2. Fix awkward phrasing and robotic patterns
3. Vary sentence structure and length
4. Use natural transitions between ideas
5. Introduce human-like language patterns (idioms, contractions, etc.)
6. Never add "[" or "]" characters to your response
7. Return only the humanized text, nothing else`;
  
  return basePrompt;
}

// OpenAI API handling
async function callOpenAiHumanization(text: string, readability: string, purpose: string, strength: number) {
  // Get the OpenAI API key from environment variables
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAiApiKey) {
    console.error("OpenAI API key not found in environment variables");
    throw new Error("OpenAI API key not configured. Please contact support.");
  }

  console.log("Using OpenAI for text humanization");

  // Build a system prompt based on readability and purpose settings
  const systemPrompt = buildHumanizationPrompt(readability, purpose, strength);
  
  // Call the OpenAI API
  const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini", // Using a cost-effective model that's good at text generation
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Please humanize the following text:\n\n${text}`
        }
      ],
      temperature: strength * 1.1, // Higher strength = more creative variations
      max_tokens: 2048
    })
  });

  if (!openAiResponse.ok) {
    const errorBody = await openAiResponse.text();
    console.error(`OpenAI API error (${openAiResponse.status}): ${errorBody}`);
    throw new Error(`API Error: ${openAiResponse.status}`);
  }

  const openAiData = await openAiResponse.json();
  
  if (!openAiData.choices || openAiData.choices.length === 0) {
    console.error("Invalid response from OpenAI:", openAiData);
    throw new Error("Failed to get humanized text from OpenAI");
  }

  const humanizedText = openAiData.choices[0].message.content;
  
  // Ensure the returned text is actually different and meaningful
  if (!humanizedText || humanizedText.trim() === text.trim()) {
    console.log("Warning: OpenAI returned identical or empty text");
    throw new Error("The humanization service returned an invalid response. Please try again.");
  }

  console.log("Successfully humanized text using OpenAI");
  return humanizedText;
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsPreflightRequest();
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Invalid request body format. Expected JSON.");
    }

    // Validate and parse request parameters
    const { text, validatedReadability, validatedPurpose, validatedStrength } = validateAndParseRequest(requestBody);

    // Call OpenAI to humanize the text
    const humanizedText = await callOpenAiHumanization(
      text, 
      validatedReadability, 
      validatedPurpose, 
      validatedStrength
    );

    // Return the humanized text to the client
    return new Response(
      JSON.stringify({ 
        humanizedText, 
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
