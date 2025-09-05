import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { ProviderSelector } from "@/components/provider-selector";
import { SettingsModal } from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Settings, Download, LogOut } from "lucide-react";

export default function ChatPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    currentSession,
    sessions,
    messages,
    isLoading,
    sendMessage,
    createNewSession,
    switchSession,
    provider,
    model,
    setProvider,
    setModel,
    isStreaming,
    stopStreaming,
  } = useChat(sessionId);

  // Close sidebar on mobile when session changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [sessionId, isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : 'relative w-80'
      }`}>
        <Sidebar
          sessions={sessions}
          currentSessionId={sessionId}
          onNewSession={createNewSession}
          onSessionSelect={switchSession}
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-sidebar-toggle"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold" data-testid="text-session-title">
                {currentSession?.title || "New Chat"}
              </h2>
              {messages.length > 0 && (
                <span className="text-sm text-muted-foreground" data-testid="text-message-count">
                  {messages.length} messages
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ProviderSelector
              provider={provider}
              model={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />
            
            <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-secondary px-3 py-2 rounded-lg">
              <span className="text-accent">$</span>
              <span data-testid="text-token-count">
                {messages.reduce((sum, msg) => sum + (msg.tokensUsed || 0), 0)} tokens
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          isStreaming={isStreaming}
          onStopStreaming={stopStreaming}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
