import { GoogleGenAI } from "@google/genai";

export interface GeminiRequest {
  model?: string;
  contents: any[];
  config?: {
    systemInstruction?: string;
    tools?: any[];
    toolConfig?: any;
    responseMimeType?: string;
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContent(request: GeminiRequest): Promise<{ text: string }> {
  try {
    const response = await ai.models.generateContent({
      model: request.model || "gemini-2.5-flash",
      contents: request.contents,
      config: request.config
    });

    return { text: response.text || '' };
  } catch (error: any) {
    console.error("Gemini API Call Error:", error);
    throw error;
  }
}
