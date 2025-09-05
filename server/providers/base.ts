export interface StreamChunk {
  type: 'token' | 'error' | 'done';
  content?: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProviderResponse {
  content: string;
  tokensUsed?: number;
  model: string;
}

export abstract class BaseProvider {
  abstract name: string;
  abstract models: string[];

  abstract streamChat(
    messages: ChatMessage[],
    model: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ProviderResponse>;

  abstract isAvailable(): boolean;
}
