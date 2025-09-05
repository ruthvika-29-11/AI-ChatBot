import OpenAI from "openai";
import { BaseProvider, type StreamChunk, type ChatMessage, type ProviderResponse } from "./base";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export class OpenAIProvider extends BaseProvider {
  private client?: OpenAI;
  
  name = "openai";
  models = ["gpt-5", "gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"];

  constructor() {
    super();
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async streamChat(
    messages: ChatMessage[],
    model: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ProviderResponse> {
    if (!this.isAvailable() || !this.client) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: model,
        messages: messages as any,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      let fullContent = "";
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullContent += delta.content;
          onChunk({
            type: 'token',
            content: delta.content,
          });
        }

        // Estimate tokens (rough approximation)
        if (chunk.usage?.total_tokens) {
          tokensUsed = chunk.usage.total_tokens;
        }
      }

      onChunk({ type: 'done' });

      return {
        content: fullContent,
        tokensUsed: tokensUsed || Math.ceil(fullContent.length / 4), // Rough token estimate
        model,
      };
    } catch (error: any) {
      onChunk({
        type: 'error',
        error: error.message || "OpenAI API error",
      });
      throw error;
    }
  }
}
