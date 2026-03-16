import { GoogleGenAI, Type } from '@google/genai';

export type VoiceIntent = 
  | 'navigate_dashboard'
  | 'open_marketplace'
  | 'open_products'
  | 'add_product'
  | 'show_analytics'
  | 'ask_ai_question'
  | 'unknown';

export interface VoiceIntentResponse {
  intent: VoiceIntent;
  response: string;
}

export const processVoiceCommand = async (text: string): Promise<VoiceIntentResponse> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an AI assistant inside an artisan business platform.
Convert the user's spoken command into a structured JSON intent.

Possible intents:
- navigate_dashboard
- open_marketplace
- open_products
- add_product
- show_analytics
- ask_ai_question
- unknown

Return JSON only.

Example output:
{
  "intent": "open_marketplace",
  "response": "Opening the marketplace for you"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: 'The identified intent from the user command.',
              enum: [
                'navigate_dashboard',
                'open_marketplace',
                'open_products',
                'add_product',
                'show_analytics',
                'ask_ai_question',
                'unknown'
              ]
            },
            response: {
              type: Type.STRING,
              description: 'A friendly, brief response to speak back to the user.'
            }
          },
          required: ['intent', 'response']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText) as VoiceIntentResponse;
    return parsed;
  } catch (error) {
    console.error('Error processing voice command with Gemini:', error);
    throw new Error('Failed to process voice command.');
  }
};
