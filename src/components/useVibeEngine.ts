'use client';

import { useState, useCallback, useRef } from 'react';
import { FileNode } from './CodeViewer';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface GenerationResult {
  files: FileNode[];
  htmlContent: string;
}

interface StreamEvent {
  type: 'thought' | 'tool_call' | 'tool_result' | 'file_update' | 'status' | 'error' | 'complete';
  data: any;
  timestamp: number;
}

interface FileSnapshot {
  path: string;
  content: string;
  language?: string;
}

type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'assembling' | 'complete' | 'error';

export function useVibeEngine() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [currentStatusMessage, setCurrentStatusMessage] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [useLocalMock, setUseLocalMock] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Convert files to FileSnapshot format for API
  const filesToSnapshots = useCallback((files: FileNode[]): FileSnapshot[] => {
    return files.map(file => ({
      path: file.name,
      content: file.content || '',
      language: file.language
    }));
  }, []);

  // Convert messages to API format
  const messagesToApiFormat = useCallback((messages: ChatMessage[]) => {
    return messages.map(msg => ({
      id: msg.id,
      role: msg.type === 'user' ? 'user' : (msg.type === 'assistant' ? 'assistant' : 'system'),
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }, []);

  // Stream processing function
  const processStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'thought':
        // Add assistant message with thinking
        const thoughtMessage: ChatMessage = {
          id: `thought_${Date.now()}`,
          type: 'assistant',
          content: `💭 ${event.data.content}`,
          timestamp: event.timestamp
        };
        setMessages(prev => [...prev, thoughtMessage]);
        break;

      case 'status':
        setCurrentStatusMessage(event.data.message);
        if (event.data.message.includes('Analyzing')) {
          setGenerationStatus('analyzing');
        } else if (event.data.message.includes('Generating') || event.data.message.includes('Creating')) {
          setGenerationStatus('generating');
        } else if (event.data.message.includes('Assembling') || event.data.message.includes('complete')) {
          setGenerationStatus('assembling');
        }
        break;

      case 'tool_call':
        // Show tool execution in progress
        const toolMessage: ChatMessage = {
          id: `tool_${event.data.id}`,
          type: 'assistant', 
          content: `🔧 Executing: ${event.data.function}(${JSON.stringify(event.data.arguments, null, 2)})`,
          timestamp: event.timestamp
        };
        setMessages(prev => [...prev, toolMessage]);
        break;

      case 'tool_result':
        // Show tool result
        const resultMessage: ChatMessage = {
          id: `result_${event.data.id}`,
          type: 'assistant',
          content: `✅ ${event.data.result}`,
          timestamp: event.timestamp
        };
        setMessages(prev => [...prev, resultMessage]);
        break;

      case 'file_update':
        const newFile: FileNode = {
          name: event.data.path,
          type: 'file',
          content: event.data.content,
          language: event.data.language || 'text'
        };
        
        setFiles(prev => {
          const existingIndex = prev.findIndex(f => f.name === event.data.path);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newFile;
            return updated;
          } else {
            return [...prev, newFile];
          }
        });
        
        // Update HTML content if it's an HTML file
        if (event.data.path === 'index.html') {
          setHtmlContent(event.data.content);
        }
        break;

      case 'error':
        setGenerationStatus('error');
        setCurrentStatusMessage(event.data.message);
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          type: 'assistant',
          content: `❌ Error: ${event.data.message}${event.data.suggestion ? `\n\n${event.data.suggestion}` : ''}`,
          timestamp: event.timestamp
        };
        setMessages(prev => [...prev, errorMessage]);
        break;

      case 'complete':
        setGenerationStatus('complete');
        setCurrentStatusMessage('');
        setIsGenerating(false);
        const completeMessage: ChatMessage = {
          id: `complete_${Date.now()}`,
          type: 'assistant',
          content: event.data.message,
          timestamp: event.timestamp
        };
        setMessages(prev => [...prev, completeMessage]);
        
        // Auto-clear status after a moment
        setTimeout(() => {
          setGenerationStatus('idle');
        }, 2000);
        break;
    }
  }, []);

  // API-based generation with SSE streaming
  const generateWithAPI = useCallback(async (prompt: string) => {
    try {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          currentFiles: filesToSnapshots(files),
          previousMessages: messagesToApiFormat(messages),
          apiKey: apiKey || undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body received from API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                processStreamEvent(eventData);
              } catch (e) {
                console.warn('Failed to parse SSE data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      console.error('API generation failed:', error);
      
      // Fallback to mock generation
      console.log('Falling back to local mock generation...');
      setUseLocalMock(true);
      
      // Call mock generation directly with inline logic to avoid circular deps
      setIsGenerating(true);
      setGenerationStatus('analyzing');
      setCurrentStatusMessage('Analyzing your request...');

      // Simulate analysis phase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGenerationStatus('generating');
      setCurrentStatusMessage('Generating project files...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenerationStatus('assembling');
      setCurrentStatusMessage('Assembling final bundle...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple inline mock generation
      const mockFiles: FileNode[] = [
        {
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>Generated Project</h1>
        <p>Prompt: "${prompt}"</p>
        <button onclick="handleClick()">Click Me</button>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          language: 'html'
        },
        {
          name: 'styles.css',
          type: 'file', 
          content: `body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
button { background: #007cba; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }`,
          language: 'css'
        },
        {
          name: 'script.js',
          type: 'file',
          content: `function handleClick() { alert('Hello from your generated project!'); }
document.addEventListener('DOMContentLoaded', function() { console.log('Project loaded successfully!'); });`,
          language: 'javascript'
        }
      ];

      setFiles(mockFiles);
      setHtmlContent(mockFiles[0].content || '');

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I've generated a ${mockFiles.length}-file project based on your request. The application includes HTML structure, CSS styling, and JavaScript functionality. You can view the files in the code explorer and see the live preview on the right.`,
        timestamp: Date.now() + 1,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setGenerationStatus('complete');
      setCurrentStatusMessage('');
      setIsGenerating(false);

      // Auto-clear status after a moment
      setTimeout(() => {
        setGenerationStatus('idle');
      }, 2000);
    }
  }, [files, messages, apiKey, filesToSnapshots, messagesToApiFormat, processStreamEvent]);

  // Mock generation templates (keeping existing implementation as fallback)
  const generateMockFiles = useCallback((prompt: string): GenerationResult => {
    const isLandingPage = prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('saas');
    const isHabitTracker = prompt.toLowerCase().includes('habit') || prompt.toLowerCase().includes('tracker');
    const isDashboard = prompt.toLowerCase().includes('dashboard') || prompt.toLowerCase().includes('admin');
    
    if (isLandingPage) {
      return generateLandingPage();
    } else if (isHabitTracker) {
      return generateHabitTracker();
    } else if (isDashboard) {
      return generateDashboard();
    } else {
      return generateGenericApp(prompt);
    }
  }, []);

  const generateLandingPage = (): GenerationResult => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Landing Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">SaaSify</div>
            <div class="nav-menu">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#contact">Contact</a>
                <button class="btn-primary">Get Started</button>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-content">
            <h1>Transform Your Business with Our SaaS Solution</h1>
            <p>Streamline operations, boost productivity, and scale effortlessly with our cutting-edge platform.</p>
            <div class="hero-actions">
                <button class="btn-primary">Start Free Trial</button>
                <button class="btn-secondary">Watch Demo</button>
            </div>
        </div>
        <div class="hero-image">
            <div class="mockup-browser">
                <div class="browser-bar">
                    <div class="browser-dots"></div>
                </div>
                <div class="browser-content">
                    <div class="dashboard-preview"></div>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Why Choose SaaSify?</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Lightning Fast</h3>
                    <p>Optimized performance ensures your team stays productive</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure & Reliable</h3>
                    <p>Enterprise-grade security with 99.9% uptime guarantee</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Advanced Analytics</h3>
                    <p>Gain insights with powerful reporting and analytics tools</p>
                </div>
            </div>
        </div>
    </section>

    <script src="app.js"></script>
</body>
</html>`;

    const files: FileNode[] = [
      {
        name: 'index.html',
        type: 'file',
        content: htmlContent,
        language: 'html'
      },
      {
        name: 'styles.css',
        type: 'file',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    padding: 1rem 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2563eb;
}

.nav-menu {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-menu a {
    text-decoration: none;
    color: #64748b;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #2563eb;
}

.btn-primary {
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-primary:hover {
    background: #1d4ed8;
}

.btn-secondary {
    background: transparent;
    color: #2563eb;
    padding: 0.75rem 1.5rem;
    border: 2px solid #2563eb;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #2563eb;
    color: white;
}

.hero {
    padding: 120px 20px 80px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center;
}

.hero-content h1 {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    color: #0f172a;
}

.hero-content p {
    font-size: 1.25rem;
    color: #64748b;
    margin-bottom: 2rem;
}

.hero-actions {
    display: flex;
    gap: 1rem;
}

.mockup-browser {
    background: #f8fafc;
    border-radius: 1rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.browser-bar {
    background: #e2e8f0;
    padding: 1rem;
    border-bottom: 1px solid #cbd5e1;
}

.browser-dots {
    display: flex;
    gap: 0.5rem;
}

.browser-dots::before,
.browser-dots::after {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #cbd5e1;
}

.browser-content {
    height: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.features {
    padding: 80px 20px;
    background: #f8fafc;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 3rem;
    color: #0f172a;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-4px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #0f172a;
}

.feature-card p {
    color: #64748b;
}

@media (max-width: 768px) {
    .hero {
        grid-template-columns: 1fr;
        text-align: center;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .nav-menu {
        display: none;
    }
}`,
        language: 'css'
      },
      {
        name: 'app.js',
        type: 'file',
        content: `// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    // Button interactions
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            console.log('Button clicked:', this.textContent);
            // Add your action logic here
        });
    });
});`,
        language: 'javascript'
      }
    ];

    return { files, htmlContent };
  };

  const generateHabitTracker = (): GenerationResult => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Habit Tracker</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app">
        <header class="header">
            <h1>🎯 Habit Tracker</h1>
            <button class="btn-add" onclick="showAddHabitModal()">+ Add Habit</button>
        </header>
        
        <main class="main">
            <div class="habits-grid" id="habitsGrid">
                <!-- Habits will be dynamically loaded here -->
            </div>
        </main>
        
        <!-- Add Habit Modal -->
        <div id="addHabitModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="hideAddHabitModal()">&times;</span>
                <h2>Add New Habit</h2>
                <form id="addHabitForm">
                    <input type="text" id="habitName" placeholder="Habit name" required>
                    <select id="habitColor">
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                    </select>
                    <button type="submit">Add Habit</button>
                </form>
            </div>
        </div>
    </div>
    
    <script src="app.js"></script>
</body>
</html>`;

    const files: FileNode[] = [
      {
        name: 'index.html',
        type: 'file',
        content: htmlContent,
        language: 'html'
      },
      {
        name: 'styles.css',
        type: 'file',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header h1 {
    color: white;
    font-size: 2rem;
    font-weight: 700;
}

.btn-add {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.btn-add:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.habit-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.habit-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.habit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.habit-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
}

.habit-streak {
    background: #10b981;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
}

.habit-progress {
    margin-bottom: 1rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s;
}

.habit-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.day-circle {
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid #e2e8f0;
    color: #64748b;
}

.day-circle.completed {
    background: #10b981;
    border-color: #10b981;
    color: white;
}

.day-circle.today {
    border-color: #3b82f6;
    color: #3b82f6;
}

.day-circle:hover {
    transform: scale(1.1);
}

.habit-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-complete {
    flex: 1;
    background: #10b981;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-complete:hover {
    background: #059669;
}

.btn-complete.completed {
    background: #64748b;
}

.btn-delete {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-delete:hover {
    background: #dc2626;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
}

.modal-content {
    background: white;
    margin: 15% auto;
    padding: 2rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
}

.close:hover {
    color: #333;
}

.modal-content h2 {
    margin-bottom: 1.5rem;
    color: #0f172a;
}

.modal-content form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.modal-content input,
.modal-content select {
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
}

.modal-content input:focus,
.modal-content select:focus {
    outline: none;
    border-color: #3b82f6;
}

.modal-content button {
    background: #3b82f6;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.modal-content button:hover {
    background: #2563eb;
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
    
    .habits-grid {
        grid-template-columns: 1fr;
    }
}`,
        language: 'css'
      },
      {
        name: 'app.js',
        type: 'file',
        content: `// Habit Tracker App Logic
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    renderHabits();
});

// Show/Hide Modal
function showAddHabitModal() {
    document.getElementById('addHabitModal').style.display = 'block';
}

function hideAddHabitModal() {
    document.getElementById('addHabitModal').style.display = 'none';
}

// Add new habit
document.getElementById('addHabitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('habitName').value;
    const color = document.getElementById('habitColor').value;
    
    const habit = {
        id: Date.now(),
        name: name,
        color: color,
        completedDates: [],
        streak: 0,
        createdAt: new Date().toISOString()
    };
    
    habits.push(habit);
    saveHabits();
    renderHabits();
    hideAddHabitModal();
    
    // Reset form
    document.getElementById('habitName').value = '';
    document.getElementById('habitColor').value = 'blue';
});

// Render all habits
function renderHabits() {
    const container = document.getElementById('habitsGrid');
    
    if (habits.length === 0) {
        container.innerHTML = \`
            <div style="grid-column: 1 / -1; text-align: center; color: rgba(255,255,255,0.8); padding: 3rem;">
                <h3>No habits yet!</h3>
                <p>Click "Add Habit" to start tracking your first habit.</p>
            </div>
        \`;
        return;
    }
    
    container.innerHTML = habits.map(habit => createHabitCard(habit)).join('');
}

// Create habit card HTML
function createHabitCard(habit) {
    const today = new Date().toDateString();
    const isCompletedToday = habit.completedDates.includes(today);
    const progress = calculateProgress(habit);
    const streak = calculateStreak(habit);
    
    return \`
        <div class="habit-card">
            <div class="habit-header">
                <h3 class="habit-name">\${habit.name}</h3>
                <div class="habit-streak">\${streak} day streak</div>
            </div>
            
            <div class="habit-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: \${progress}%"></div>
                </div>
                <small style="color: #64748b; margin-top: 0.5rem; display: block;">
                    \${progress}% this week
                </small>
            </div>
            
            <div class="habit-days">
                \${generateWeekDays(habit)}
            </div>
            
            <div class="habit-actions">
                <button 
                    class="btn-complete \${isCompletedToday ? 'completed' : ''}"
                    onclick="toggleHabitToday(\${habit.id})"
                >
                    \${isCompletedToday ? '✓ Completed' : 'Mark Complete'}
                </button>
                <button class="btn-delete" onclick="deleteHabit(\${habit.id})">🗑</button>
            </div>
        </div>
    \`;
}

// Generate week days display
function generateWeekDays(habit) {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    
    return days.map((day, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const dateString = date.toDateString();
        const isCompleted = habit.completedDates.includes(dateString);
        const isToday = dateString === new Date().toDateString();
        
        return \`
            <div class="day-circle \${isCompleted ? 'completed' : ''} \${isToday ? 'today' : ''}"
                 onclick="toggleHabitDate(\${habit.id}, '\${dateString}')">
                \${day}
            </div>
        \`;
    }).join('');
}

// Toggle habit completion for today
function toggleHabitToday(habitId) {
    const habit = habits.find(h => h.id === habitId);
    const today = new Date().toDateString();
    
    if (habit.completedDates.includes(today)) {
        habit.completedDates = habit.completedDates.filter(date => date !== today);
    } else {
        habit.completedDates.push(today);
    }
    
    saveHabits();
    renderHabits();
}

// Toggle habit completion for specific date
function toggleHabitDate(habitId, dateString) {
    const habit = habits.find(h => h.id === habitId);
    
    if (habit.completedDates.includes(dateString)) {
        habit.completedDates = habit.completedDates.filter(date => date !== dateString);
    } else {
        habit.completedDates.push(dateString);
    }
    
    saveHabits();
    renderHabits();
}

// Delete habit
function deleteHabit(habitId) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits = habits.filter(h => h.id !== habitId);
        saveHabits();
        renderHabits();
    }
}

// Calculate weekly progress
function calculateProgress(habit) {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        weekDates.push(date.toDateString());
    }
    
    const completedThisWeek = weekDates.filter(date => 
        habit.completedDates.includes(date)
    ).length;
    
    return Math.round((completedThisWeek / 7) * 100);
}

// Calculate streak
function calculateStreak(habit) {
    const sortedDates = habit.completedDates
        .map(dateStr => new Date(dateStr))
        .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        date.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
        } else if (daysDiff === streak + 1 && streak === 0) {
            // Allow for today not being completed yet
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addHabitModal');
    if (event.target === modal) {
        hideAddHabitModal();
    }
}`,
        language: 'javascript'
      }
    ];

    return { files, htmlContent };
  };

  const generateDashboard = (): GenerationResult => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="dashboard">
        <nav class="sidebar">
            <div class="logo">
                <h2>📊 Dashboard</h2>
            </div>
            <ul class="nav-menu">
                <li class="active"><a href="#overview">Overview</a></li>
                <li><a href="#analytics">Analytics</a></li>
                <li><a href="#users">Users</a></li>
                <li><a href="#settings">Settings</a></li>
            </ul>
        </nav>
        
        <main class="main-content">
            <header class="topbar">
                <h1>Welcome back, Admin</h1>
                <div class="user-profile">
                    <div class="notification-bell">🔔</div>
                    <div class="avatar">👤</div>
                </div>
            </header>
            
            <div class="content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h3>Total Users</h3>
                            <p class="stat-number">12,543</p>
                            <span class="stat-change positive">+12% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h3>Revenue</h3>
                            <p class="stat-number">$45,678</p>
                            <span class="stat-change positive">+8% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <h3>Orders</h3>
                            <p class="stat-number">1,234</p>
                            <span class="stat-change negative">-3% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <h3>Satisfaction</h3>
                            <p class="stat-number">94%</p>
                            <span class="stat-change positive">+2% from last month</span>
                        </div>
                    </div>
                </div>
                
                <div class="charts-section">
                    <div class="chart-container">
                        <h3>Revenue Overview</h3>
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div class="bar" style="height: 60%"></div>
                                <div class="bar" style="height: 80%"></div>
                                <div class="bar" style="height: 45%"></div>
                                <div class="bar" style="height: 90%"></div>
                                <div class="bar" style="height: 75%"></div>
                                <div class="bar" style="height: 65%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="recent-activity">
                        <h3>Recent Activity</h3>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">👤</div>
                                <div class="activity-content">
                                    <p>New user registered</p>
                                    <span>2 minutes ago</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">💰</div>
                                <div class="activity-content">
                                    <p>Payment received: $299</p>
                                    <span>5 minutes ago</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">📦</div>
                                <div class="activity-content">
                                    <p>Order #1234 shipped</p>
                                    <span>1 hour ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script src="app.js"></script>
</body>
</html>`;

    const files: FileNode[] = [
      {
        name: 'index.html',
        type: 'file',
        content: htmlContent,
        language: 'html'
      },
      {
        name: 'styles.css',
        type: 'file',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f8fafc;
    color: #334155;
}

.dashboard {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background: #1e293b;
    padding: 2rem 0;
}

.logo {
    padding: 0 2rem 2rem;
    border-bottom: 1px solid #334155;
    margin-bottom: 2rem;
}

.logo h2 {
    color: #f8fafc;
    font-size: 1.5rem;
}

.nav-menu {
    list-style: none;
}

.nav-menu li {
    margin-bottom: 0.5rem;
}

.nav-menu a {
    display: block;
    padding: 1rem 2rem;
    color: #94a3b8;
    text-decoration: none;
    transition: all 0.3s;
}

.nav-menu a:hover,
.nav-menu li.active a {
    background: #334155;
    color: #f8fafc;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.topbar {
    background: white;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.topbar h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #0f172a;
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.notification-bell {
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.3s;
}

.notification-bell:hover {
    background: #f1f5f9;
}

.avatar {
    width: 40px;
    height: 40px;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
}

.content {
    padding: 2rem;
    flex: 1;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    width: 50px;
    height: 50px;
    background: #f1f5f9;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-info h3 {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 0.25rem;
}

.stat-number {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
}

.stat-change {
    font-size: 0.75rem;
    font-weight: 500;
}

.stat-change.positive {
    color: #10b981;
}

.stat-change.negative {
    color: #ef4444;
}

.charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
}

.chart-container,
.recent-activity {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-container h3,
.recent-activity h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 1.5rem;
}

.chart-placeholder {
    height: 200px;
    background: #f8fafc;
    border-radius: 0.5rem;
    display: flex;
    align-items: end;
    justify-content: center;
    padding: 1rem;
}

.chart-bars {
    display: flex;
    align-items: end;
    gap: 1rem;
    height: 100%;
}

.bar {
    width: 40px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border-radius: 4px 4px 0 0;
    transition: all 0.3s;
}

.bar:hover {
    opacity: 0.8;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
}

.activity-icon {
    width: 40px;
    height: 40px;
    background: #e0e7ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.activity-content p {
    font-weight: 500;
    color: #0f172a;
    margin-bottom: 0.25rem;
}

.activity-content span {
    font-size: 0.75rem;
    color: #64748b;
}

@media (max-width: 768px) {
    .dashboard {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
    }
    
    .charts-section {
        grid-template-columns: 1fr;
    }
    
    .topbar {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
}`,
        language: 'css'
      },
      {
        name: 'app.js',
        type: 'file',
        content: `// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Simulate real-time updates
    updateStats();
    startRealTimeUpdates();
    
    // Navigation handling
    setupNavigation();
    
    // Chart interactions
    setupChartInteractions();
});

function updateStats() {
    // Simulate live data updates
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
        if (Math.random() > 0.7) { // 30% chance to update
            const change = Math.floor(Math.random() * 10) - 5;
            const newValue = Math.max(0, currentValue + change);
            
            if (stat.textContent.includes('$')) {
                stat.textContent = '$' + newValue.toLocaleString();
            } else if (stat.textContent.includes('%')) {
                stat.textContent = Math.min(100, newValue) + '%';
            } else {
                stat.textContent = newValue.toLocaleString();
            }
        }
    });
}

function startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Add new activity items periodically
    setInterval(addRandomActivity, 45000);
}

function addRandomActivity() {
    const activities = [
        { icon: '👤', text: 'New user registered', time: 'Just now' },
        { icon: '💰', text: 'Payment received: $' + Math.floor(Math.random() * 500 + 50), time: 'Just now' },
        { icon: '📦', text: 'Order #' + Math.floor(Math.random() * 9999 + 1000) + ' shipped', time: 'Just now' },
        { icon: '⭐', text: 'New review received', time: 'Just now' },
        { icon: '🔧', text: 'System maintenance completed', time: 'Just now' }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const activityList = document.querySelector('.activity-list');
    
    // Create new activity item
    const newItem = document.createElement('div');
    newItem.className = 'activity-item';
    newItem.innerHTML = \`
        <div class="activity-icon">\${randomActivity.icon}</div>
        <div class="activity-content">
            <p>\${randomActivity.text}</p>
            <span>\${randomActivity.time}</span>
        </div>
    \`;
    
    // Add to top of list
    activityList.insertBefore(newItem, activityList.firstChild);
    
    // Remove oldest item if more than 5
    if (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // Animate in
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        newItem.style.transition = 'all 0.3s ease';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
    }, 100);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            document.querySelectorAll('.nav-menu li').forEach(li => {
                li.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Here you would normally load the appropriate content
            console.log('Navigating to:', this.textContent);
        });
    });
}

function setupChartInteractions() {
    const bars = document.querySelectorAll('.bar');
    
    bars.forEach((bar, index) => {
        bar.addEventListener('mouseenter', function() {
            // Show tooltip or highlight effect
            this.style.transform = 'scale(1.05)';
        });
        
        bar.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        bar.addEventListener('click', function() {
            console.log('Bar clicked:', index + 1);
            // Here you would show detailed data for this bar
        });
    });
}

// Notification bell interaction
document.querySelector('.notification-bell').addEventListener('click', function() {
    alert('You have 3 new notifications!');
});

// Avatar interaction  
document.querySelector('.avatar').addEventListener('click', function() {
    alert('User profile menu would open here');
});

// Simulate data loading
console.log('Dashboard loaded successfully');
console.log('Real-time updates enabled');`,
        language: 'javascript'
      }
    ];

    return { files, htmlContent };
  };

  const generateGenericApp = (prompt: string): GenerationResult => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app">
        <header class="header">
            <h1>🚀 Your Generated App</h1>
            <p>Built from: "${prompt}"</p>
        </header>
        
        <main class="main">
            <div class="content-area">
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>✨ Feature One</h3>
                        <p>This is a sample feature based on your prompt. You can customize this content.</p>
                        <button class="btn">Learn More</button>
                    </div>
                    
                    <div class="feature-card">
                        <h3>🎯 Feature Two</h3>
                        <p>Another feature that demonstrates the capabilities of your generated application.</p>
                        <button class="btn">Get Started</button>
                    </div>
                    
                    <div class="feature-card">
                        <h3>🔧 Feature Three</h3>
                        <p>A third feature to showcase the modular design and functionality.</p>
                        <button class="btn">Try Now</button>
                    </div>
                </div>
            </div>
        </main>
        
        <footer class="footer">
            <p>Generated by Vibe Platform • Customize this app by editing the files</p>
        </footer>
    </div>
    
    <script src="app.js"></script>
</body>
</html>`;

    const files: FileNode[] = [
      {
        name: 'index.html',
        type: 'file',
        content: htmlContent,
        language: 'html'
      },
      {
        name: 'styles.css',
        type: 'file',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.app {
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    text-align: center;
    padding: 3rem 2rem;
    color: white;
}

.header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.main {
    flex: 1;
    padding: 2rem;
}

.content-area {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 2rem;
    padding: 3rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #0f172a;
}

.feature-card p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn:hover {
    background: #2563eb;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .header h1 {
        font-size: 2rem;
    }
    
    .content-area {
        padding: 2rem;
        margin: 1rem;
    }
    
    .feature-grid {
        grid-template-columns: 1fr;
    }
}`,
        language: 'css'
      },
      {
        name: 'app.js',
        type: 'file',
        content: `// Generic App Logic
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized successfully!');
    
    // Add interactivity to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            console.log(\`Button \${index + 1} clicked!\`);
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // You can add your custom functionality here
            alert(\`Feature \${index + 1} activated! You can customize this behavior in app.js\`);
        });
    });
    
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.background = '#f8fafc';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = 'white';
        });
    });
    
    // Log the original prompt for reference
    const promptElement = document.querySelector('.header p');
    if (promptElement) {
        console.log('Generated from prompt:', promptElement.textContent);
    }
});`,
        language: 'javascript'
      }
    ];

    return { files, htmlContent };
  };

  // Mock simulation for fallback
  const simulateGeneration = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setGenerationStatus('analyzing');
    setCurrentStatusMessage('Analyzing your request...');

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate analysis phase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setGenerationStatus('generating');
    setCurrentStatusMessage('Generating project files...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGenerationStatus('assembling');
    setCurrentStatusMessage('Assembling final bundle...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate the actual content
    const result = generateMockFiles(prompt);
    setFiles(result.files);
    setHtmlContent(result.htmlContent);

    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: `I've generated a ${result.files.length}-file project based on your request. The application includes HTML structure, CSS styling, and JavaScript functionality. You can view the files in the code explorer and see the live preview on the right.`,
      timestamp: Date.now() + 1,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setGenerationStatus('complete');
    setCurrentStatusMessage('');
    setIsGenerating(false);

    // Auto-clear status after a moment
    setTimeout(() => {
      setGenerationStatus('idle');
    }, 2000);
  }, [generateMockFiles]);

  // Main generation function that decides between API and mock
  const generateProject = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Try API first if we have an API key and not forced to use mock
    if (apiKey && !useLocalMock) {
      await generateWithAPI(prompt);
    } else {
      // Use mock generation as fallback or when explicitly set
      await simulateGeneration(prompt);
    }
  }, [apiKey, useLocalMock, generateWithAPI, simulateGeneration]);

  // Handle iframe errors for self-healing
  const handleIframeError = useCallback((error: string) => {
    console.log('Iframe error detected:', error);
    
    const errorMessage: ChatMessage = {
      id: `iframe_error_${Date.now()}`,
      type: 'system',
      content: `Error detected in preview: ${error}`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, errorMessage]);

    // Optionally trigger self-healing
    if (apiKey && !useLocalMock) {
      const healingPrompt = `Fix this error in the generated code: ${error}`;
      generateProject(healingPrompt);
    }
  }, [apiKey, useLocalMock, generateProject]);

  // Settings functions
  const setAPIKey = useCallback((key: string) => {
    setApiKey(key);
    if (key) {
      setUseLocalMock(false);
    }
  }, []);

  const toggleMockMode = useCallback(() => {
    setUseLocalMock(prev => !prev);
  }, []);

  return {
    messages,
    files,
    htmlContent,
    isGenerating,
    generationStatus: generationStatus === 'idle' ? undefined : currentStatusMessage,
    sendMessage: generateProject,
    // New API integration features
    apiKey,
    setAPIKey,
    useLocalMock,
    toggleMockMode,
    handleIframeError,
    // Stop/abort functionality
    stopGeneration: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsGenerating(false);
      setGenerationStatus('idle');
      setCurrentStatusMessage('');
    }
  };
}