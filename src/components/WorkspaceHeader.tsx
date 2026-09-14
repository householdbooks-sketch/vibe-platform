'use client';

interface WorkspaceHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  tokensUsed: number;
  maxTokens: number;
  status: 'idle' | 'generating' | 'error';
}

const MODELS = [
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
];

export function WorkspaceHeader({ 
  selectedModel, 
  onModelChange, 
  tokensUsed, 
  maxTokens, 
  status 
}: WorkspaceHeaderProps) {
  const selectedModelInfo = MODELS.find(m => m.id === selectedModel) || MODELS[0];
  
  const getStatusColor = () => {
    switch (status) {
      case 'generating': return 'text-accent-cyan';
      case 'error': return 'text-red-400';
      default: return 'text-secondary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generating': return 'Generating...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <header className="h-14 bg-[#0F0A17] border-b border-brand flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold font-space-grotesk text-gradient-brand">
          Speak Life Learn
        </h1>
        
        {/* Model Selector Badge */}
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="appearance-none bg-[#392A48]/50 border border-brand-secondary rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:border-transparent cursor-pointer hover:bg-[#392A48]/70 transition-colors"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-secondary font-space-grotesk">
          {selectedModelInfo.provider}
        </div>
      </div>

      {/* Status & Token Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'generating' ? 'animate-pulse bg-accent-cyan' : status === 'error' ? 'bg-red-400' : 'bg-[#6B6285]'}`} />
          <span className={`text-sm font-space-grotesk ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {/* Token Bar with Brand Gradient */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="text-sm text-primary font-space-mono font-medium">
              {tokensUsed.toLocaleString()} / {maxTokens.toLocaleString()}
            </div>
            <div className="text-xs text-secondary">tokens</div>
          </div>
          <div className="w-24 h-2 bg-[#2D223C] rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${Math.min((tokensUsed / maxTokens) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}