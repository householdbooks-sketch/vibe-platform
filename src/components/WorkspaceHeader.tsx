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
      case 'generating': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
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
    <header className="h-14 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-100">Vibe Platform</h1>
        
        {/* Model Selector Badge */}
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="appearance-none bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-slate-800/70 transition-colors"
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          {selectedModelInfo.provider}
        </div>
      </div>

      {/* Status & Token Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'generating' ? 'animate-pulse bg-emerald-400' : status === 'error' ? 'bg-red-400' : 'bg-slate-500'}`} />
          <span className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="text-sm text-slate-400">
          <span className="text-slate-300">{tokensUsed.toLocaleString()}</span>
          <span className="mx-1">/</span>
          <span>{maxTokens.toLocaleString()}</span>
          <span className="ml-1">tokens</span>
        </div>
      </div>
    </header>
  );
}