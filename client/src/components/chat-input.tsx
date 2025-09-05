import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Send, Square, Paperclip, AlertCircle } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isStreaming: boolean;
  onStopStreaming?: () => void;
}

const SUGGESTIONS = [
  "Explain this code",
  "Best practices",
  "Debug issue",
  "Optimize performance",
];

export function ChatInput({ onSendMessage, isStreaming, onStopStreaming }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if any providers are available
  const { data: providers = {} } = useQuery<Record<string, any>>({
    queryKey: ["/api/providers"],
  });
  
  const hasProviders = Object.keys(providers).length > 0;

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isStreaming) return;

    onSendMessage(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just show the file name in the message
      const fileInfo = `[File: ${file.name} (${(file.size / 1024).toFixed(1)}KB)]`;
      setMessage(prev => prev + (prev ? '\n' : '') + fileInfo);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 128);
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  // Focus on textarea when not streaming
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto">
        {!hasProviders && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No AI providers are available. Please configure API keys for OpenAI or Gemini to start chatting.
            </AlertDescription>
          </Alert>
        )}
        <div className="relative">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Shift+Enter for new line)"
                className="min-h-[52px] max-h-32 pr-12 resize-none"
                disabled={isStreaming || !hasProviders}
                data-testid="input-message"
              />
              
              {/* Character counter */}
              <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                <span data-testid="text-char-count">{message.length}</span>/4000
              </div>

              {/* Attachment button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-3 right-3 h-6 w-6 p-0"
                onClick={handleAttachmentClick}
                disabled={isStreaming || !hasProviders}
                data-testid="button-attach"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>

            {/* Send/Stop button */}
            {isStreaming ? (
              <Button
                onClick={onStopStreaming}
                variant="destructive"
                className="h-12 px-4"
                data-testid="button-stop"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isStreaming || !hasProviders}
                className="h-12 w-12 p-0"
                data-testid="button-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Suggestions and shortcuts */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Suggestions:</span>
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="secondary"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`button-suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">⌘ + Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
