import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [messageLimit, setMessageLimit] = useState([4000]);
  const [streamResponses, setStreamResponses] = useState(true);

  // Apply theme changes immediately
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const handleSave = () => {
    // Save theme preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-settings">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center space-x-2"
                data-testid="button-theme-dark"
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </Button>
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center space-x-2"
                data-testid="button-theme-light"
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </Button>
            </div>
          </div>

          {/* Default Provider */}
          <div className="space-y-2">
            <Label>Default Provider</Label>
            <Select value={defaultProvider} onValueChange={setDefaultProvider}>
              <SelectTrigger data-testid="select-default-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI GPT</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message Limit */}
          <div className="space-y-2">
            <Label>Message Character Limit</Label>
            <Slider
              value={messageLimit}
              onValueChange={setMessageLimit}
              max={4000}
              min={100}
              step={100}
              className="w-full"
              data-testid="slider-message-limit"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100</span>
              <span>{messageLimit[0]} chars</span>
              <span>4000</span>
            </div>
          </div>

          {/* Stream Responses */}
          <div className="flex items-center justify-between">
            <Label htmlFor="stream-responses">Stream Responses</Label>
            <Switch
              id="stream-responses"
              checked={streamResponses}
              onCheckedChange={setStreamResponses}
              data-testid="switch-stream-responses"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
