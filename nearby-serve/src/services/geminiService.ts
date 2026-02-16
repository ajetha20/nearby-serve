import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecipientBio = async (rawNotes: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a compassionate social worker. Rewrite these notes into a dignified 2-sentence bio: "${rawNotes}"`,
    });
    return response.text?.trim() || "Description unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate bio.";
  }
};

/**
 * FEATURE: THINKING MODE
 * Uses gemini-3-pro-preview with high thinking budget for complex safety reasoning.
 */
export const getFoodRescuePlan = async (ingredients: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `I have the following leftover food items: ${ingredients}. 
      1. Is this safe to donate? (Analyze potential food safety risks like spoilage or allergens).
      2. If safe, how should I package it for a dignity-first donation?
      3. If not safe/suitable for donation, give me a creative recipe to repurpose it at home so it doesn't go to waste.`,
      config: {
        thinkingConfig: {
          thinkingBudget: 32768, // Max thinking budget
        },
      },
    });
    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Thinking Mode Error:", error);
    return "Unable to process food rescue plan at this moment.";
  }
};

/**
 * FEATURE: MAPS GROUNDING
 * Uses gemini-2.5-flash with googleMaps tool.
 */
export const findNearbyShelters = async (location: { lat: number, lng: number }): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Find 3 top-rated homeless shelters or community kitchens near me. Provide their names and a brief 1-sentence summary of what they accept.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      }
    });
    
    // In a real app, we would parse `response.candidates[0].groundingMetadata.groundingChunks` for clean links.
    // For this demo, we return the text which includes the grounded info.
    return response.text || "No shelters found nearby.";
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return "Could not fetch location data.";
  }
};

/**
 * FEATURE: SEARCH GROUNDING
 * Uses gemini-3-flash-preview with googleSearch tool.
 */
export const getHungerNews = async (city: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `What are the latest verified news or updates regarding food security, hunger relief, or NGO initiatives in ${city} from the last month? Keep it brief and bulleted.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "No recent news found.";
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return "Could not search for news.";
  }
};

/**
 * FEATURE: IMAGE GENERATION
 * Uses gemini-3-pro-image-preview with size configuration.
 */
export const generateImpactImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "16:9" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};