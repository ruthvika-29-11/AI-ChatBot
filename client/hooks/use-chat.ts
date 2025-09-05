import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useStreaming } from "@/hooks/use-streaming";
import { apiRequest } from "@/lib/queryClient";
import type { Session, SessionWithMessages, Message } from "@shared/schema";

export function useChat(sessionId?: string) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-5");

  // Fetch sessions
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Fetch current session with messages
  const { data: currentSession, isLoading } = useQuery<SessionWithMessages>({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const messages = currentSession?.messages || [];

  // Streaming hook
  const { streamMessage, isStreaming, stopStreaming } = useStreaming();

  // Update provider/model when session changes
  useEffect(() => {
    if (currentSession) {
      setProvider(currentSession.provider);
      setModel(currentSession.model);
    }
  }, [currentSession]);

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: { title: string; provider: string; model: string }) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: (newSession: Session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setLocation(`/session/${newSession.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      });
    },
  });

  // Send message function
  const sendMessage = async (content: string) => {
    let targetSessionId = sessionId;

    // Create new session if none exists
    if (!targetSessionId) {
      try {
        const newSession = await createSessionMutation.mutateAsync({
          title: content.length > 50 ? content.substring(0, 47) + "..." : content,
          provider,
          model,
        });
        targetSessionId = newSession.id;
      } catch (error) {
        return;
      }
    }

    if (!targetSessionId) return;

    // Stream the message
    streamMessage({
      sessionId: targetSessionId,
      content,
      provider,
      model,
      onMessage: (message: Message) => {
        // Update the session's messages in cache
        queryClient.setQueryData(
          ["/api/sessions", targetSessionId],
          (oldData: SessionWithMessages | undefined) => {
            if (!oldData) return oldData;
            
            const existingMessageIndex = oldData.messages.findIndex(m => m.id === message.id);
            if (existingMessageIndex >= 0) {
              // Update existing message
              const newMessages = [...oldData.messages];
              newMessages[existingMessageIndex] = message;
              return { ...oldData, messages: newMessages };
            } else {
              // Add new message
              return {
                ...oldData,
                messages: [...oldData.messages, message],
              };
            }
          }
        );

        // Invalidate sessions list to update last activity
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      },
      onError: (error: string) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  // Create new session
  const createNewSession = () => {
    setLocation("/");
  };

  // Switch to different session
  const switchSession = (newSessionId: string) => {
    setLocation(`/session/${newSessionId}`);
  };

  return {
    // State
    currentSession,
    sessions,
    messages,
    isLoading,
    provider,
    model,
    isStreaming,

    // Actions
    sendMessage,
    createNewSession,
    switchSession,
    setProvider,
    setModel,
    stopStreaming,
  };
}
