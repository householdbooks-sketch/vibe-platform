'use client';

import { useState } from 'react';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { PromptPanel } from '../components/PromptPanel';
import { CodeViewer } from '../components/CodeViewer';
import { LivePreview } from '../components/LivePreview';
import { useVibeEngine } from '../components/useVibeEngine';

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('claude-3.5-sonnet');
  const [activeFile, setActiveFile] = useState<string>();
  
  const {
    messages,
    files,
    htmlContent,
    isGenerating,
    generationStatus,
    sendMessage,
    loadTemplate,
  } = useVibeEngine();

  const getStatus = () => {
    if (isGenerating) return 'generating';
    if (messages.length === 0) return 'idle';
    return 'idle';
  };

  // Auto-select first HTML file when files are generated
  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
  };

  // Auto-select the first file when files change
  useState(() => {
    if (files.length > 0 && !activeFile) {
      const htmlFile = files.find(f => f.name === 'index.html');
      setActiveFile(htmlFile ? htmlFile.name : files[0].name);
    }
  });

  return (
    <div className="h-screen bg-[#0F0A17] flex flex-col font-space-grotesk">
      {/* Header */}
      <WorkspaceHeader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        tokensUsed={1250}
        maxTokens={100000}
        status={getStatus()}
      />
      
      {/* Main Workspace - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Prompt Panel */}
        <div className="w-[380px] shrink-0 border-r border-brand flex flex-col">
          <PromptPanel
            messages={messages}
            isGenerating={isGenerating}
            onSendMessage={sendMessage}
            onSelectTemplate={loadTemplate}
            generationStatus={generationStatus}
          />
        </div>
        
        {/* Center Column - Code Viewer */}
        <div className="flex-1 min-w-[340px] border-r border-brand overflow-hidden">
          <CodeViewer
            files={files}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        </div>
        
        {/* Right Column - Live Preview */}
        <div className="flex-1 min-w-[420px] overflow-hidden">
          <LivePreview
            htmlContent={htmlContent}
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
