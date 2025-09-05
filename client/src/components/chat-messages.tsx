import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
}

const getProviderColor = (provider: string) => {
  switch (provider) {
    case 'openai': return 'bg-blue-500';
    case 'anthropic': return 'bg-purple-500';
    case 'gemini': return 'bg-green-500';
    default: return 'bg-primary';
  }
};

const getProviderLabel = (provider: string, model: string) => {
  switch (provider) {
    case 'openai': 
      if (model.includes('gpt-5')) return 'GPT-5';
      if (model.includes('gpt-4')) return 'GPT-4';
      return 'GPT-3.5';
    case 'anthropic': 
      if (model.includes('claude-sonnet-4')) return 'Claude 4';
      if (model.includes('claude-3-7')) return 'Claude 3.7';
      return 'Claude';
    case 'gemini': 
      if (model.includes('2.5-pro')) return 'Gemini Pro';
      return 'Gemini';
    default: return provider;
  }
};

const TypingIndicator = () => (
  <div className="flex items-center space-x-2">
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
    <span className="text-xs text-muted-foreground">AI is thinking...</span>
  </div>
);

export function ChatMessages({ messages, isLoading, isStreaming }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ask me anything! I can help with coding, writing, analysis, and much more.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">Code review</Badge>
            <Badge variant="secondary" className="text-xs">Explain concepts</Badge>
            <Badge variant="secondary" className="text-xs">Debug issues</Badge>
            <Badge variant="secondary" className="text-xs">Best practices</Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
      <div className="p-6 space-y-6 min-h-full" data-testid="messages-container">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} message-fade-in`}
            data-testid={`message-${message.role}-${index}`}
          >
            <div className="max-w-3xl w-full">
              <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div
                    className={`${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                        : 'bg-card border border-border rounded-2xl rounded-bl-md'
                    } p-4 shadow-sm`}
                  >
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : 'text-foreground'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="message-content">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center ${
                    message.role === 'user' ? 'justify-end' : 'justify-between'
                  } mt-2`}>
                    <div className="flex items-center space-x-2">
                      {message.role === 'assistant' && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs text-white ${getProviderColor(message.provider)}`}
                          data-testid="message-provider"
                        >
                          {getProviderLabel(message.provider, message.model)}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground" data-testid="message-time">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                      {message.role === 'user' && (
                        <div className="text-xs text-primary">✓✓</div>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(message.content)}
                          data-testid="button-copy-message"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          data-testid="button-regenerate"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          data-testid="button-like"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex justify-start message-fade-in" data-testid="streaming-indicator">
            <div className="max-w-3xl w-full">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md p-4 shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
