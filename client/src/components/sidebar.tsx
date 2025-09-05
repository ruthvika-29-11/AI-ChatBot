import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bot, Plus, Settings, Download, LogOut, Moon, Sun, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import type { Session, User } from "@shared/schema";

interface SidebarProps {
  sessions: Session[];
  currentSessionId?: string;
  onNewSession: () => void;
  onSessionSelect: (sessionId: string) => void;
  onSettingsOpen: () => void;
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

export function Sidebar({ 
  sessions, 
  currentSessionId, 
  onNewSession, 
  onSessionSelect, 
  onSettingsOpen 
}: SidebarProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      if (newTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      localStorage.setItem('theme', newTheme);
    }
  };
  
  const handleExportChats = () => {
    // Export all sessions as JSON
    if (sessions.length > 0) {
      const exportData = {
        exportDate: new Date().toISOString(),
        chatSessions: sessions,
        user: user
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-conversations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  const handleLogout = () => {
    // Clear local storage and refresh the page
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  }, [theme]);

  return (
    <aside className="w-full bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">AI ChatBot Pro</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* User Profile */}
        {user ? (
          <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback>
                {user.firstName?.[0] || 'D'}{user.lastName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="text-user-name">
                {user.firstName || 'Demo'} {user.lastName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user.email || 'demo@example.com'}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="text-user-id">
                ID: {user.username || 'demo_user'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewSession} 
          className="w-full" 
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Recent Sessions
          </h3>
          
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-secondary ${
                  currentSessionId === session.id 
                    ? 'border-l-2 border-primary bg-secondary/50' 
                    : ''
                }`}
                data-testid={`session-item-${session.id}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate flex-1" data-testid="text-session-title">
                    {session.title}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                    data-testid="button-session-menu"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs text-white ${getProviderColor(session.provider)}`}
                    data-testid="badge-provider"
                  >
                    {getProviderLabel(session.provider, session.model)}
                  </Badge>
                  <span className="text-xs text-muted-foreground" data-testid="text-session-time">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onSettingsOpen} data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExportChats}
            disabled={sessions.length === 0}
            data-testid="button-export"
            title="Export chat history"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            data-testid="button-logout"
            title="Clear session and restart"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
