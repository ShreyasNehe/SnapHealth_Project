import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

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

const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openaiAi = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null;

// Helper to convert Gemini contents array to OpenAI messages array
function convertToOpenAIMessages(systemInstruction: string | undefined, contents: any[]): any[] {
  const messages: any[] = [];
  
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  for (const content of contents) {
    const role = content.role === 'model' ? 'assistant' : 'user';
    const parts = content.parts || [];
    
    // If it's a simple text part
    if (parts.length === 1 && parts[0].text && !parts[0].inlineData) {
      messages.push({ role, content: parts[0].text });
      continue;
    }

    // If it's multimodal (has inlineData images)
    const openAiContent: any[] = [];
    for (const part of parts) {
      if (part.text) {
        openAiContent.push({ type: 'text', text: part.text });
      } else if (part.inlineData) {
        openAiContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
          }
        });
      }
    }
    messages.push({ role, content: openAiContent });
  }

  return messages;
}

export async function generateContent(request: GeminiRequest): Promise<{ text: string }> {
  // Attempt OpenAI First
  if (openaiAi) {
    try {
      const messages = convertToOpenAIMessages(request.config?.systemInstruction, request.contents);
      
      // Determine if it requires vision
      const hasImage = messages.some(m => Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url'));
      const model = hasImage ? 'gpt-4o' : 'gpt-4o-mini';

      const response = await openaiAi.chat.completions.create({
        model,
        messages,
        response_format: request.config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
      });

      return { text: response.choices[0].message.content || '' };
    } catch (error) {
      console.warn("OpenAI API Call Failed. Falling back to Gemini...", error);
    }
  }

  // Fallback to Gemini
  try {
    const response = await geminiAi.models.generateContent({
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
