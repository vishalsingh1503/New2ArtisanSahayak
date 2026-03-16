import { GoogleGenAI, Type } from "@google/genai";
import { api } from "../api";

export type AIProvider = 'gemini';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const ai = {
  get models() { 
    const instance = getAI();
    if (!instance) throw new Error("GEMINI_API_KEY_MISSING");
    return instance.models; 
  }
};

async function callGeminiWithRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  if (!getAI()) throw new Error("GEMINI_API_KEY_MISSING");
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || 
                        error.status === 429 || 
                        error.code === 429 || 
                        error.message?.includes("RESOURCE_EXHAUSTED");
    
    if (retries > 0 && isRateLimit) {
      // If it's a hard quota exhaustion, retrying immediately might not help, 
      // but we'll try with exponential backoff anyway.
      console.warn(`Gemini rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function callAI(params: { 
  prompt: string, 
  systemInstruction?: string, 
  responseMimeType?: string,
  responseSchema?: any,
  image?: string // base64
}) {
  return callGeminiWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: params.image ? {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: params.image.split(",")[1] || params.image } },
        { text: params.prompt }
      ]
    } : params.prompt,
    config: {
      systemInstruction: params.systemInstruction,
      responseMimeType: params.responseMimeType as any,
      responseSchema: params.responseSchema,
    },
  }));
}

export async function detectIntent(text: string, language: string) {
  const lowerText = text.toLowerCase();
  
  // Local keyword-based fallback for high reliability during rate limits
  const getFallbackIntent = () => {
    if (lowerText.includes("add") || lowerText.includes("create") || lowerText.includes("new") || lowerText.includes("list")) return "ADD_PRODUCT";
    if (lowerText.includes("inventory") || lowerText.includes("product") || lowerText.includes("item") || lowerText.includes("stock")) return "SHOW_INVENTORY";
    if (lowerText.includes("trend") || lowerText.includes("popular") || lowerText.includes("market")) return "SHOW_TRENDING";
    if (lowerText.includes("earning") || lowerText.includes("money") || lowerText.includes("revenue") || lowerText.includes("finance")) return "SHOW_EARNINGS";
    if (lowerText.includes("bank") || lowerText.includes("payment") || lowerText.includes("account")) return "SHOW_BANK_DETAILS";
    if (lowerText.includes("community") || lowerText.includes("village") || lowerText.includes("wall") || lowerText.includes("network") || lowerText.includes("artisan")) return "SHOW_COMMUNITY";
    if (lowerText.includes("help") || lowerText.includes("confused")) return "HELP";
    return null;
  };

  try {
    const response = await callAI({
      prompt: `Analyze the user request in ${language} and categorize it into one of these intents:
      - ADD_PRODUCT: User wants to add, create, or list a new item.
      - SHOW_INVENTORY: User wants to see their products, stock, or items.
      - SHOW_TRENDING: User wants to see popular items or market trends.
      - SHOW_EARNINGS: User wants to see money, revenue, or finance.
      - SHOW_BANK_DETAILS: User wants to see or edit bank/payment info.
      - SHOW_COMMUNITY: User wants to see the village wall, network, or other artisans.
      - HELP: User is confused or asking for general help.
      - DOUBT: User has a specific question about how to use the app or a business question.
      
      User request: "${text}"
      
      Return ONLY the intent name.`,
      systemInstruction: "You are a system intent detector for a rural artisan app called Artisan-Sahayak.",
      responseMimeType: "text/plain",
    });
    return response.text.trim().toUpperCase();
  } catch (error: any) {
    if (error.message !== "GEMINI_API_KEY_MISSING") {
      console.error("Intent detection failed:", error);
    }
    return getFallbackIntent() || "HELP";
  }
}

export async function generateProductDescription(story: string, language: string) {
  try {
    const response = await callAI({
      prompt: `Convert this artisan's story into a professional, polished, and compelling product description for an online marketplace.
      The output must be in ${language}.
      Artisan's story: "${story}"`,
      systemInstruction: "You are an expert marketing assistant for rural Indian artisans.",
      responseMimeType: "text/plain",
    });
    return response.text.trim();
  } catch (error: any) {
    if (error.message !== "GEMINI_API_KEY_MISSING") {
      console.error("Description generation failed:", error);
    }
    return story; // Fallback to original story
  }
}

export async function processOCR(base64Image: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: `Extract the following details from this document:
            - Name
            - Aadhaar Number (if present)
            - Address
            Return the data in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            aadhaarNumber: { type: Type.STRING },
            address: { type: Type.STRING },
          },
          required: ["name", "aadhaarNumber", "address"],
        },
      },
    }));
    return JSON.parse(response.text);
  } catch (error) {
    console.error("OCR failed:", error);
    throw new Error("Could not read document. Please enter details manually.");
  }
}

export async function processBankPassbookOCR(base64Image: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: `Extract the following bank details from this passbook image:
            - Account Holder Name
            - Account Number
            - IFSC Code
            - Bank Name
            Return the data in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            account_holder: { type: Type.STRING },
            account_number: { type: Type.STRING },
            ifsc: { type: Type.STRING },
            bank_name: { type: Type.STRING },
          },
          required: ["account_holder", "account_number", "ifsc", "bank_name"],
        },
      },
    }));
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Bank OCR failed:", error);
    throw new Error("Could not read passbook. Please enter details manually.");
  }
}

export async function generateVoiceResponse(intent: string, language: string, userQuery?: string) {
  try {
    const response = await callAI({
      prompt: `Language: ${language}
      Intent: ${intent}
      User Query: "${userQuery || ''}"
      
      Instructions:
      1. If intent is DOUBT or HELP, answer the user's question directly and very concisely (max 2 sentences).
      2. If intent is a navigation command (ADD_PRODUCT, SHOW_INVENTORY, etc.), just confirm the action in 3-5 words (e.g., "Opening your inventory now").
      3. NO long introductions. NO "Hello, I am Artisan-Sahayak".
      4. NO closing phrases like "I am here to help" or "Let me know if you need anything else".
      5. Be extremely crisp and professional.
      6. Use simple words suitable for rural artisans.`,
      systemInstruction: "You are Artisan-Sahayak, a concise AI assistant for rural artisans.",
      responseMimeType: "text/plain",
    });
    return response.text.trim();
  } catch (error: any) {
    if (error.message !== "GEMINI_API_KEY_MISSING") {
      console.error("Voice response generation failed:", error);
    }
    return "Action confirmed.";
  }
}

export async function suggestPrice(productName: string, category: string, story: string) {
  try {
    const response = await callAI({
      prompt: `Suggest a fair price in INR for this product based on its name, category, and story.
      Product: ${productName}
      Category: ${category}
      Story: ${story}
      Return the data in JSON format with: suggestedPrice, reasoning, and marketRange (min, max).`,
      systemInstruction: "You are a market expert for Indian handicrafts.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedPrice: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          marketRange: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
            },
            required: ["min", "max"],
          },
        },
        required: ["suggestedPrice", "reasoning", "marketRange"],
      },
    });
    return typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
  } catch (error: any) {
    if (error.message !== "GEMINI_API_KEY_MISSING") {
      console.error("Price suggestion failed:", error);
    }
    return { suggestedPrice: 0, reasoning: "Could not suggest price.", marketRange: { min: 0, max: 0 } };
  }
}

export async function analyzeProductImage(base64Image: string, voiceTranscript: string, language: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
          {
            text: `You are an expert Indian handicraft specialist and e-commerce manager.
            Analyze this product image and the artisan's voice description: "${voiceTranscript}".
            
            Detect and generate:
            1. Craft Type (e.g., Blue Pottery, Madhubani, Channapatna)
            2. Region of Origin (e.g., Jaipur, Bihar, Karnataka)
            3. Materials Used (e.g., Quartz, Natural Dyes, Lacquered Wood)
            4. Product Category (e.g., Home Decor, Toys, Textiles)
            5. Professional Product Title
            6. Compelling Product Description
            7. Cultural Craft Story (the heritage behind this craft)
            8. SEO Keywords (comma separated)
            9. Hashtags (for social media)
            10. Suggested Price Range (min and max in INR)
            11. Reasoning for the price
            
            The output must be in ${language} for the text fields, but keep technical terms if necessary.
            Return the data in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            craftType: { type: Type.STRING },
            region: { type: Type.STRING },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            craftStory: { type: Type.STRING },
            seoKeywords: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedPrice: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
              },
              required: ["min", "max", "reasoning"],
            },
          },
          required: ["craftType", "region", "materials", "category", "title", "description", "craftStory", "seoKeywords", "hashtags", "suggestedPrice"],
        },
      },
    }));
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Multimodal analysis failed:", error);
    throw new Error("Could not analyze product. Please try again or enter details manually.");
  }
}

const TRENDS_CACHE_KEY = 'artisan_market_trends_cache';
const TRENDS_ERROR_CACHE_KEY = 'artisan_market_trends_error_timestamp';
const CACHE_EXPIRY = 1000 * 60 * 60 * 6; // 6 hours
const ERROR_RETRY_DELAY = 1000 * 60 * 15; // 15 minutes (don't retry API if it failed recently)

export async function getMarketTrends(language: string) {
  // 1. Try loading from primary cache first
  try {
    const cached = localStorage.getItem(`${TRENDS_CACHE_KEY}_${language}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (e) {
    console.warn("Failed to read trends cache", e);
  }

  // 2. Check if we recently hit a quota limit (Negative Cache)
  try {
    const lastError = localStorage.getItem(TRENDS_ERROR_CACHE_KEY);
    if (lastError) {
      const errorTime = parseInt(lastError, 10);
      if (Date.now() - errorTime < ERROR_RETRY_DELAY) {
        // Use fallback immediately without calling API
        return { 
          insights: ["Handmade items are in high demand.", "Eco-friendly packaging is preferred by buyers.", "Traditional motifs with modern utility are trending."], 
          seasonalDemand: "Festive season is approaching, expect high demand for home decor and gifting items.",
          trendingCategories: [
            { name: "Terracotta Pottery", popularity: 85 },
            { name: "Handwoven Textiles", popularity: 78 },
            { name: "Wooden Toys", popularity: 72 }
          ] 
        };
      }
    }
  } catch (e) {}

  try {
    const response = await callAI({
      prompt: `Analyze current market trends for Indian handicrafts in ${language}.
      Provide 3-4 specific insights about what's trending (styles, categories).
      Also provide a brief "seasonalDemand" description for upcoming months.
      Finally, provide a list of trending categories with a "popularity" score (1-100).
      Return the data in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          seasonalDemand: { type: Type.STRING },
          trendingCategories: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                popularity: { type: Type.NUMBER },
              },
              required: ["name", "popularity"],
            },
          },
        },
        required: ["insights", "seasonalDemand", "trendingCategories"],
      },
    });
    
    const data = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
    
    // Save to cache
    try {
      localStorage.setItem(`${TRENDS_CACHE_KEY}_${language}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      localStorage.removeItem(TRENDS_ERROR_CACHE_KEY); // Clear error state on success
    } catch (e) {
      console.warn("Failed to write trends cache", e);
    }

    return data;
  } catch (error: any) {
    const isQuotaError = error.message?.includes("429") || 
                         error.status === 429 || 
                         error.message?.includes("RESOURCE_EXHAUSTED");

    if (isQuotaError) {
      // Mark error time to avoid retrying for a while
      try {
        localStorage.setItem(TRENDS_ERROR_CACHE_KEY, Date.now().toString());
      } catch (e) {}
      console.warn("Market trends API quota reached. Using local fallback data.");
    } else if (error.message === "GEMINI_API_KEY_MISSING") {
      console.warn("Market trends using fallback data (AI Key missing)");
    } else {
      console.error("Market trends failed:", error);
    }
    
    // Return fallback data if API fails
    return { 
      insights: ["Handmade items are in high demand.", "Eco-friendly packaging is preferred by buyers.", "Traditional motifs with modern utility are trending."], 
      seasonalDemand: "Festive season is approaching, expect high demand for home decor and gifting items.",
      trendingCategories: [
        { name: "Terracotta Pottery", popularity: 85 },
        { name: "Handwoven Textiles", popularity: 78 },
        { name: "Wooden Toys", popularity: 72 }
      ] 
    };
  }
}

export async function generateSocialContent(product: any, language: string) {
  try {
    const response = await callAI({
      prompt: `Generate social media content for this artisan product in ${language}:
      Product: ${product.title}
      Craft: ${product.craftType}
      Story: ${product.craftStory}
      
      Generate:
      1. Instagram Caption (emojis, engaging)
      2. WhatsApp Selling Message (direct, clear)
      3. Etsy Listing Description (story-focused)
      
      Return the data in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagram: { type: Type.STRING },
          whatsapp: { type: Type.STRING },
          etsy: { type: Type.STRING },
        },
        required: ["instagram", "whatsapp", "etsy"],
      },
    });
    return typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
  } catch (error: any) {
    if (error.message !== "GEMINI_API_KEY_MISSING") {
      console.error("Social content generation failed:", error);
    }
    return { instagram: "", whatsapp: "", etsy: "" };
  }
}
