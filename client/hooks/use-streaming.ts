import { useState } from "react";
import type { Message } from "@shared/schema";

interface StreamingOptions {
  sessionId: string;
  content: string;
  provider: string;
  model: string;
  onMessage: (message: Message) => void;
  onError: (error: string) => void;
}

export function useStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentEventSource, setCurrentEventSource] = useState<EventSource | null>(null);

  const streamMessage = async ({
    sessionId,
    content,
    provider,
    model,
    onMessage,
    onError,
  }: StreamingOptions) => {
    if (isStreaming) return;

    setIsStreaming(true);

    try {
      // Send the POST request first
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          provider,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // If response is not an event stream, handle as regular response
      if (!response.headers.get('content-type')?.includes('text/event-stream')) {
        const data = await response.json();
        onError(data.error || 'No streaming response received');
        setIsStreaming(false);
        return;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'message':
                  onMessage(data.message);
                  break;
                case 'token':
                  // Handle streaming tokens (could be used for real-time display)
                  break;
                case 'error':
                  onError(data.error || 'Unknown error occurred');
                  setIsStreaming(false);
                  return;
                case 'done':
                  setIsStreaming(false);
                  return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }

      setIsStreaming(false);

    } catch (error: any) {
      console.error('Error in streaming:', error);
      onError(error.message || 'Failed to send message');
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (currentEventSource) {
      currentEventSource.close();
      setCurrentEventSource(null);
    }
    setIsStreaming(false);
  };

  return {
    streamMessage,
    isStreaming,
    stopStreaming,
  };
}
