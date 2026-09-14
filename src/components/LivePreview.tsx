'use client';

import { useState, useRef, useEffect } from 'react';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewProps {
  htmlContent: string;
  isLoading?: boolean;
}

const VIEWPORT_SIZES = {
  desktop: { width: '100%', height: '100%', label: 'Desktop', icon: '🖥️' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet', icon: '📱' },
  mobile: { width: '375px', height: '667px', label: 'Mobile', icon: '📱' },
} as const;

export function LivePreview({ htmlContent, isLoading = false }: LivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const viewportConfig = VIEWPORT_SIZES[viewport];

  // Create complete HTML document
  const createDocument = (content: string) => {
    // If content is already a complete HTML document, use it as is
    if (content.toLowerCase().includes('<!doctype') || content.toLowerCase().includes('<html')) {
      return content;
    }

    // Otherwise, wrap the content in a complete HTML structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  };

  const documentContent = htmlContent ? createDocument(htmlContent) : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Preview</title>
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
            background: #f8fafc; 
            color: #64748b;
        }
        .placeholder {
            text-align: center;
            max-width: 300px;
        }
        .placeholder h2 {
            color: #334155;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="placeholder">
        <h2>No Preview Available</h2>
        <p>Generate some code to see a live preview here</p>
    </div>
</body>
</html>`;

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      {/* Header with Viewport Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-100">Live Preview</h3>
          
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            {(Object.keys(VIEWPORT_SIZES) as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                  viewport === size
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <span className="text-xs">{VIEWPORT_SIZES[size].icon}</span>
                {VIEWPORT_SIZES[size].label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {viewport !== 'desktop' && (
            <div className="text-sm text-slate-400">
              {viewportConfig.width} × {viewportConfig.height}
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="h-full flex items-center justify-center p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-slate-600">Loading preview...</p>
            </div>
          ) : (
            <div 
              className="relative bg-white shadow-2xl border border-slate-200 overflow-hidden"
              style={{
                width: viewportConfig.width,
                height: viewportConfig.height,
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: viewport !== 'desktop' ? '12px' : '8px',
              }}
            >
              {/* Device Frame for Mobile/Tablet */}
              {viewport !== 'desktop' && (
                <>
                  {/* Top bezel */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 rounded-t-xl flex items-center justify-center">
                    <div className="w-12 h-1 bg-slate-600 rounded-full" />
                  </div>
                  {/* Bottom bezel */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-800 rounded-b-xl" />
                </>
              )}
              
              {/* Iframe */}
              <iframe
                key={key}
                ref={iframeRef}
                srcDoc={documentContent}
                className="w-full h-full border-0"
                style={{
                  marginTop: viewport !== 'desktop' ? '24px' : '0',
                  marginBottom: viewport !== 'desktop' ? '24px' : '0',
                  height: viewport !== 'desktop' ? 'calc(100% - 48px)' : '100%',
                }}
                title="Live Preview"
                sandbox="allow-scripts allow-same-origin"
              />
              
              {/* Loading Overlay */}
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {htmlContent ? 'Live preview updating in real-time' : 'Waiting for generated content...'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}