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

const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper to convert Gemini contents array to OpenAI messages array
function convertToOpenAIMessages(systemInstruction: string | undefined, contents: any[]): any[] {
  const messages: any[] = [];
  
  if (systemInstruction) {
    // If response format is json, openai requires the word json in the prompt
    messages.push({ role: 'system', content: systemInstruction + ' Return as JSON.' });
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
  // Attempt OpenAI First if key is present
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'undefined' && OPENAI_API_KEY.length > 5) {
    try {
      const messages = convertToOpenAIMessages(request.config?.systemInstruction, request.contents);
      
      // Determine if it requires vision
      const hasImage = messages.some(m => Array.isArray(m.content) && m.content.some((c: any) => c.type === 'image_url'));
      const model = hasImage ? 'gpt-4o' : 'gpt-4o-mini';

      const responseFormat = request.config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: responseFormat,
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(`OpenAI Error ${response.status}: ${JSON.stringify(errData)}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenAI");
      }

      return { text: data.choices[0].message.content || '' };
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
