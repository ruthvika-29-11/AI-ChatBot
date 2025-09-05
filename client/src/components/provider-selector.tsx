import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface Provider {
  name: string;
  models: string[];
}

interface ProviderSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

const getProviderLabel = (providerName: string) => {
  switch (providerName) {
    case 'openai': return 'OpenAI';
    case 'anthropic': return 'Anthropic';
    case 'gemini': return 'Google';
    default: return providerName;
  }
};

const getModelLabel = (model: string) => {
  if (model.includes('gpt-5')) return 'GPT-5';
  if (model.includes('gpt-4')) return 'GPT-4 Turbo';
  if (model.includes('gpt-3.5')) return 'GPT-3.5 Turbo';
  if (model.includes('claude-sonnet-4')) return 'Claude 4 Sonnet';
  if (model.includes('claude-3-7')) return 'Claude 3.7 Sonnet';
  if (model.includes('claude-3-5')) return 'Claude 3.5 Sonnet';
  if (model.includes('claude-3-haiku')) return 'Claude 3 Haiku';
  if (model.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
  if (model.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash';
  if (model.includes('gemini-1.5-pro')) return 'Gemini 1.5 Pro';
  if (model.includes('gemini-1.5-flash')) return 'Gemini 1.5 Flash';
  return model;
};

export function ProviderSelector({ 
  provider, 
  model, 
  onProviderChange, 
  onModelChange 
}: ProviderSelectorProps) {
  const { data: providers = {} } = useQuery<Record<string, Provider>>({
    queryKey: ["/api/providers"],
  });

  const availableProviders = Object.keys(providers);
  const currentProvider = providers[provider];
  const availableModels = currentProvider?.models || [];

  const handleModelChange = (selectedValue: string) => {
    const [selectedProvider, selectedModel] = selectedValue.split(':');
    if (selectedProvider !== provider) {
      onProviderChange(selectedProvider);
    }
    onModelChange(selectedModel);
  };

  const currentValue = `${provider}:${model}`;

  return (
    <div className="relative">
      <Select value={currentValue} onValueChange={handleModelChange}>
        <SelectTrigger className="bg-secondary text-foreground border border-border px-3 py-2 text-sm font-medium pr-8 min-w-[160px]" data-testid="select-provider">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span>{getProviderLabel(provider)}</span>
              <Badge variant="outline" className="text-xs">
                {getModelLabel(model)}
              </Badge>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableProviders.map((providerName) => {
            const providerData = providers[providerName];
            return providerData.models.map((modelName) => (
              <SelectItem 
                key={`${providerName}:${modelName}`}
                value={`${providerName}:${modelName}`}
                data-testid={`option-${providerName}-${modelName}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{getProviderLabel(providerName)}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{getModelLabel(modelName)}</span>
                </div>
              </SelectItem>
            ));
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
