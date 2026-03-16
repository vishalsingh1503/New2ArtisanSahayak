import { GoogleGenAI, Type } from '@google/genai';

export interface VideoInsights {
  productType: string;
  craftsmanshipDetails: string;
  material: string;
  visualQuality: string;
  potentialMarketAppeal: string;
  suggestedDetails: {
    height?: string;
    width?: string;
    weight?: string;
    material?: string;
    craftTechnique?: string;
  };
}

export const analyzeProductVideo = async (videoBase64: string, mimeType: string): Promise<VideoInsights> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an expert artisan product analyzer.
Analyze the provided product video and extract insights about the product.
Detect the product type, craftsmanship details, material, visual quality, and potential market appeal.
Also, try to estimate or extract any physical details like height, width, weight, material, and craft technique if visible or implied.
Return the results as a structured JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: videoBase64.split(',')[1], // Remove the data URL prefix
            mimeType: mimeType,
          }
        },
        "Analyze this product video and provide insights."
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productType: { type: Type.STRING, description: 'The type of product shown in the video.' },
            craftsmanshipDetails: { type: Type.STRING, description: 'Details about the craftsmanship and quality.' },
            material: { type: Type.STRING, description: 'The primary material used.' },
            visualQuality: { type: Type.STRING, description: 'Assessment of the visual quality and aesthetics.' },
            potentialMarketAppeal: { type: Type.STRING, description: 'The potential market appeal and target audience.' },
            suggestedDetails: {
              type: Type.OBJECT,
              properties: {
                height: { type: Type.STRING, description: 'Estimated height (e.g., "30 cm").' },
                width: { type: Type.STRING, description: 'Estimated width (e.g., "15 cm").' },
                weight: { type: Type.STRING, description: 'Estimated weight (e.g., "1.5 kg").' },
                material: { type: Type.STRING, description: 'Material used.' },
                craftTechnique: { type: Type.STRING, description: 'Craft technique used.' },
              }
            }
          },
          required: ['productType', 'craftsmanshipDetails', 'material', 'visualQuality', 'potentialMarketAppeal', 'suggestedDetails']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    try {
      return JSON.parse(responseText) as VideoInsights;
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      throw new Error('Invalid response format from Gemini. The video might be too large or the API encountered an error.');
    }
  } catch (error) {
    console.error('Error analyzing video with Gemini:', error);
    throw new Error('Failed to analyze product video.');
  }
};
