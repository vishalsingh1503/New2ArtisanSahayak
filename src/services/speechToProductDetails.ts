import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedProductDetails {
  height?: string;
  width?: string;
  weight?: string;
  material?: string;
  craftTechnique?: string;
  additionalNotes?: string;
}

export const extractDetailsFromSpeech = async (speechText: string): Promise<ExtractedProductDetails> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an AI assistant for artisans.
Extract structured product details from the seller's spoken description.
Look for dimensions (height, width), weight, material, craft technique, and any additional notes.
If a detail is not mentioned, omit it or leave it empty.
Return the results as a structured JSON object.

Example input: "This pot is 30 centimeters tall, weighs 1.5 kilograms and is made of clay."
Example output:
{
  "height": "30 cm",
  "weight": "1.5 kg",
  "material": "Clay"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: speechText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            height: { type: Type.STRING, description: 'The height of the product (e.g., "30 cm").' },
            width: { type: Type.STRING, description: 'The width of the product (e.g., "15 cm").' },
            weight: { type: Type.STRING, description: 'The weight of the product (e.g., "1.5 kg").' },
            material: { type: Type.STRING, description: 'The material of the product (e.g., "Clay").' },
            craftTechnique: { type: Type.STRING, description: 'The craft technique used (e.g., "Hand-thrown").' },
            additionalNotes: { type: Type.STRING, description: 'Any other relevant details mentioned.' }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    return JSON.parse(responseText) as ExtractedProductDetails;
  } catch (error) {
    console.error('Error extracting details from speech with Gemini:', error);
    throw new Error('Failed to extract product details from speech.');
  }
};
