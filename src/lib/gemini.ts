/**
 * Client-side service to call the Gemini API via the server-side proxy.
 * This keeps the API key secure on the server and works well for production deployments like Vercel.
 */

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

export async function generateContent(request: GeminiRequest): Promise<{ text: string }> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini API Call Error:", error);
    throw error;
  }
}
