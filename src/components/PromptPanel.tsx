'use client';

import { useState, useRef, useEffect } from 'react';
import { VIBE_TEMPLATES, VibeTemplate } from './templates';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface PromptPanelProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (message: string) => void;
  onSelectTemplate?: (template: VibeTemplate) => void;
  generationStatus?: string;
}

export function PromptPanel({ 
  messages, 
  isGenerating, 
  onSendMessage, 
  onSelectTemplate,
  generationStatus 
}: PromptPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [showStartersModal, setShowStartersModal] = useState(false);
  const [enhancerInput, setEnhancerInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generationStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [inputValue]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const enhancePrompt = async () => {
    if (!enhancerInput.trim()) return;
    
    setIsEnhancing(true);
    
    // Simulate AI enhancement - in a real app, this would call an AI service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhanced = `**Goal:** ${enhancerInput.trim()}

**Key Features:**
- Modern, responsive web application
- Clean and intuitive user interface
- Mobile-friendly design
- Interactive elements and smooth animations

**UI Components Needed:**
- Navigation header with brand styling
- Main content area with card-based layout
- Action buttons with hover effects
- Footer with relevant links

**Styling & Brand Specifications:**
- Color scheme: Deep purple backgrounds (#0F0A17, #130D1E) with cyan accents (#00C9FF)
- Typography: Clean sans-serif fonts (Space Grotesk for UI, Space Mono for code)
- Gradient elements: Purple-to-cyan gradients for call-to-action elements
- Responsive breakpoints: Mobile (320px+), Tablet (768px+), Desktop (1024px+)

**Technical Requirements:**
- HTML5 semantic structure
- CSS3 with Flexbox/Grid layouts
- Vanilla JavaScript for interactivity
- Optimized for modern browsers
- Accessible design (ARIA labels, keyboard navigation)

**Edge Cases to Consider:**
- Empty states and loading indicators
- Form validation and error handling
- Cross-browser compatibility
- Performance optimization for mobile devices
- Graceful degradation for older browsers

Please build this with clean, production-ready code following modern web development best practices.`;
    
    setEnhancedPrompt(enhanced);
    setIsEnhancing(false);
  };

  const applyEnhancedPrompt = () => {
    setInputValue(enhancedPrompt);
    setShowEnhancer(false);
    setEnhancerInput('');
    setEnhancedPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0A17]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-brand">
        <h2 className="text-lg font-semibold font-space-grotesk text-primary">Prompt & Generation</h2>
        <p className="text-sm text-secondary mt-1">
          Describe what you want to build and watch it come to life
        </p>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full justify-between py-1">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-mono uppercase tracking-wider text-accent-cyan font-bold flex items-center gap-1.5">
                  <span>🚀</span> Vibe Starters
                </span>
                <span className="text-[11px] text-muted">1-Click Scaffold</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {VIBE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => onSelectTemplate?.(tmpl)}
                    className="p-3 rounded-xl bg-[#160F24]/90 border border-brand-secondary hover:border-accent-cyan/60 hover:bg-[#1E1430] transition-all text-left group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-lg group-hover:scale-110 transition-transform">{tmpl.icon}</span>
                        <span className="text-sm font-bold text-primary font-space-grotesk group-hover:text-accent-cyan transition-colors">
                          {tmpl.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#392A48] text-cyan-300 border border-purple-800/60">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-muted text-center mt-3 font-space-mono">
              Or type a custom prompt below ↵
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col gap-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.type === 'user' 
                    ? 'bg-brand text-white shadow-lg' 
                    : message.type === 'system'
                    ? 'bg-amber-600/20 text-amber-200 border border-amber-600/30'
                    : 'bg-[#392A48] text-primary border border-brand-secondary'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-space-grotesk">{message.content}</p>
                </div>
                <span className="text-xs text-muted font-space-mono">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ))}

            {/* Generation Status */}
            {generationStatus && (
              <div className="flex items-start gap-2">
                <div className="bg-[#392A48] border border-brand-secondary rounded-lg px-3 py-2 max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                    <p className="text-sm text-primary font-space-grotesk">{generationStatus}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-brand">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              disabled={isGenerating}
              className="w-full bg-[#392A48]/50 border border-brand-secondary rounded-lg px-4 py-3 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:border-transparent resize-none min-h-[44px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-space-grotesk"
              rows={1}
            />
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStartersModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-accent-cyan hover:text-cyan-300 bg-[#392A48]/50 hover:bg-[#392A48] border border-brand-secondary rounded-lg transition-colors font-space-grotesk"
                title="Browse Vibe Starters"
              >
                <span>🚀</span>
                Starters
              </button>
              <button
                type="button"
                onClick={() => setShowEnhancer(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-accent-purple hover:text-purple-300 bg-[#392A48]/50 hover:bg-[#392A48] border border-brand-secondary rounded-lg transition-colors font-space-grotesk"
                title="AI Prompt Wizard"
              >
                <span>✨</span>
                Prompt Wizard
              </button>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className="bg-brand hover:opacity-90 disabled:bg-[#54516A] disabled:cursor-not-allowed text-white font-medium font-space-grotesk px-5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Vibe Code
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Prompt Enhancer Modal */}
      {showEnhancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#0F0A17] border border-brand rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold font-space-grotesk text-primary">Prompt Wizard</h3>
                  <p className="text-sm text-secondary">Transform vague ideas into clear specifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowEnhancer(false)}
                className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-[#392A48]/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Input Section */}
                <div>
                  <label className="block text-sm font-medium font-space-grotesk text-primary mb-2">
                    What do you want to build? (Be as vague or specific as you like)
                  </label>
                  <textarea
                    value={enhancerInput}
                    onChange={(e) => setEnhancerInput(e.target.value)}
                    placeholder="e.g., 'make an app for tutors' or 'landing page for my startup' or 'dashboard for analytics'"
                    className="w-full h-24 bg-[#392A48]/50 border border-brand-secondary rounded-lg px-4 py-3 text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:border-transparent resize-none font-space-grotesk"
                  />
                </div>

                {/* Enhance Button */}
                <div className="flex justify-center">
                  <button
                    onClick={enhancePrompt}
                    disabled={!enhancerInput.trim() || isEnhancing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-400 hover:from-purple-700 hover:via-purple-600 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium font-space-grotesk rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEnhancing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Enhance Prompt
                      </>
                    )}
                  </button>
                </div>

                {/* Enhanced Output */}
                {enhancedPrompt && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <h4 className="text-lg font-medium font-space-grotesk text-primary">Enhanced Prompt Ready!</h4>
                    </div>
                    
                    <div className="bg-[#130D1E] border border-brand-secondary rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm text-primary font-space-grotesk whitespace-pre-wrap leading-relaxed">
                        {enhancedPrompt}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-brand">
                      <p className="text-sm text-secondary font-space-grotesk">
                        This enhanced prompt provides clear structure and specifications for better results.
                      </p>
                      <button
                        onClick={applyEnhancedPrompt}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-cyan hover:bg-cyan-500 text-black font-medium font-space-grotesk rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Apply to Input
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vibe Starters Modal */}
      {showStartersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-space-grotesk">
          <div className="bg-[#0F0A17] border border-brand rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-brand">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <h3 className="text-lg font-bold text-primary">Vibe Starters Gallery</h3>
                  <p className="text-xs text-secondary">Choose an archetype to instantly scaffold a working project</p>
                </div>
              </div>
              <button
                onClick={() => setShowStartersModal(false)}
                className="p-1.5 text-secondary hover:text-white rounded-lg hover:bg-[#392A48]"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {VIBE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate?.(tmpl);
                    setShowStartersModal(false);
                  }}
                  className="w-full p-4 rounded-xl bg-[#160F24] border border-brand-secondary hover:border-accent-cyan hover:bg-[#1E1430] transition-all text-left flex items-start justify-between group"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl group-hover:scale-110 transition-transform">{tmpl.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary group-hover:text-accent-cyan transition-colors">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#392A48] text-cyan-300 border border-purple-800/60">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-xs text-secondary mt-1 max-w-md leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-accent-cyan font-mono group-hover:translate-x-1 transition-transform">
                    Load →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}