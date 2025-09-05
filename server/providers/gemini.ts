import { GoogleGenAI } from "@google/genai";
import { BaseProvider, type StreamChunk, type ChatMessage, type ProviderResponse } from "./base";

// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
export class GeminiProvider extends BaseProvider {
  private client?: GoogleGenAI;
  
  name = "gemini";
  models = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"];

  constructor() {
    super();
    if (process.env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
    }
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async streamChat(
    messages: ChatMessage[],
    model: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ProviderResponse> {
    if (!this.isAvailable() || !this.client) {
      throw new Error("Gemini API key not configured");
    }

    try {
      // Convert messages to Gemini format
      const systemMessage = messages.find(m => m.role === 'system')?.content;
      const conversationMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      const response = await this.client.models.generateContentStream({
        model: model || "gemini-2.5-flash",
        contents: conversationMessages,
        config: systemMessage ? {
          systemInstruction: systemMessage,
        } : undefined,
      });

      let fullContent = "";
      let tokensUsed = 0;

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullContent += text;
          onChunk({
            type: 'token',
            content: text,
          });
        }

        // Gemini doesn't provide real-time token usage in stream
        if (chunk.usageMetadata) {
          tokensUsed = chunk.usageMetadata.totalTokenCount || 0;
        }
      }

      onChunk({ type: 'done' });

      return {
        content: fullContent,
        tokensUsed: tokensUsed || Math.ceil(fullContent.length / 4),
        model,
      };
    } catch (error: any) {
      onChunk({
        type: 'error',
        error: error.message || "Gemini API error",
      });
      throw error;
    }
  }
}
