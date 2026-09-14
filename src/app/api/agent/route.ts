import { NextRequest, NextResponse } from 'next/server';

// Types for the API
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tool_calls?: ToolCall[];
}

interface FileSnapshot {
  path: string;
  content: string;
  language?: string;
}

interface AgentRequest {
  prompt: string;
  currentFiles: FileSnapshot[];
  previousMessages: Message[];
  apiKey?: string;
}

interface StreamEvent {
  type: 'thought' | 'tool_call' | 'tool_result' | 'file_update' | 'status' | 'error' | 'complete';
  data: any;
  timestamp: number;
}

// Tool definitions
const AVAILABLE_TOOLS = [
  {
    name: 'write_file',
    description: 'Write or update a file with the given content',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'The file path' },
        content: { type: 'string', description: 'The file content' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'read_file',
    description: 'Read the content of a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'The file path to read' }
      },
      required: ['path']
    }
  },
  {
    name: 'delete_file',
    description: 'Delete a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'The file path to delete' }
      },
      required: ['path']
    }
  },
  {
    name: 'report_status',
    description: 'Report current progress status',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Status message' },
        progress: { type: 'number', description: 'Progress percentage (0-100)' }
      },
      required: ['message', 'progress']
    }
  }
];

// Mock AI client for demonstration (replace with actual AI service)
class MockAIClient {
  private files: Map<string, string> = new Map();
  private encoder = new TextEncoder();

  constructor(currentFiles: FileSnapshot[]) {
    // Initialize with current files
    currentFiles.forEach(file => {
      this.files.set(file.path, file.content);
    });
  }

  async *generateStreamingResponse(prompt: string, messages: Message[]): AsyncGenerator<StreamEvent> {
    // Initial status
    yield {
      type: 'status',
      data: { message: 'Analyzing request...', progress: 10 },
      timestamp: Date.now()
    };

    await this.sleep(800);

    // Agent thought
    yield {
      type: 'thought',
      data: { content: `I need to analyze the user's request: "${prompt}". Let me break this down into actionable steps.` },
      timestamp: Date.now()
    };

    await this.sleep(1000);

    // Determine what to build based on prompt
    const isWebApp = prompt.toLowerCase().includes('website') || prompt.toLowerCase().includes('web') || prompt.toLowerCase().includes('app');
    const isLandingPage = prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('saas');
    const isHabitTracker = prompt.toLowerCase().includes('habit') || prompt.toLowerCase().includes('tracker');
    const isDashboard = prompt.toLowerCase().includes('dashboard') || prompt.toLowerCase().includes('admin');

    if (isLandingPage) {
      yield* this.generateLandingPage();
    } else if (isHabitTracker) {
      yield* this.generateHabitTracker();
    } else if (isDashboard) {
      yield* this.generateDashboard();
    } else if (isWebApp) {
      yield* this.generateGenericWebApp(prompt);
    } else {
      yield* this.generateSimpleProject(prompt);
    }

    // Final status
    yield {
      type: 'status',
      data: { message: 'Project generation complete!', progress: 100 },
      timestamp: Date.now()
    };

    yield {
      type: 'complete',
      data: { message: 'Successfully generated your project. All files are ready for preview.' },
      timestamp: Date.now()
    };
  }

  private async *generateLandingPage(): AsyncGenerator<StreamEvent> {
    yield {
      type: 'thought',
      data: { content: 'Creating a modern SaaS landing page with responsive design...' },
      timestamp: Date.now()
    };

    await this.sleep(500);

    // Create HTML file
    yield* this.writeFileWithProgress('index.html', `<!DOCTYPE html>
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
</html>`, 30);

    // Create CSS file
    yield* this.writeFileWithProgress('styles.css', `* {
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
}`, 60);

    // Create JavaScript file
    yield* this.writeFileWithProgress('app.js', `// Smooth scrolling for navigation links
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
});`, 90);
  }

  private async *generateHabitTracker(): AsyncGenerator<StreamEvent> {
    yield {
      type: 'thought',
      data: { content: 'Building a habit tracker with localStorage persistence and progress visualization...' },
      timestamp: Date.now()
    };

    // Implementation would be similar to generateLandingPage but with habit tracker specific content
    // For brevity, using a simplified version here
    yield* this.writeFileWithProgress('index.html', `<!DOCTYPE html>
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
    </div>
    
    <script src="app.js"></script>
</body>
</html>`, 50);
  }

  private async *generateDashboard(): AsyncGenerator<StreamEvent> {
    yield {
      type: 'thought',
      data: { content: 'Creating an admin dashboard with real-time metrics and responsive layout...' },
      timestamp: Date.now()
    };

    // Simplified dashboard implementation
    yield* this.writeFileWithProgress('index.html', `<!DOCTYPE html>
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
        </nav>
        
        <main class="main-content">
            <header class="topbar">
                <h1>Welcome back, Admin</h1>
            </header>
            
            <div class="content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h3>Total Users</h3>
                            <p class="stat-number">12,543</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script src="app.js"></script>
</body>
</html>`, 70);
  }

  private async *generateGenericWebApp(prompt: string): AsyncGenerator<StreamEvent> {
    yield {
      type: 'thought',
      data: { content: `Creating a web application based on the prompt: "${prompt}"` },
      timestamp: Date.now()
    };

    yield* this.writeFileWithProgress('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Web App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="app">
        <header class="header">
            <h1>🚀 Your Web App</h1>
            <p>Built from: "${prompt}"</p>
        </header>
        
        <main class="main">
            <div class="content-area">
                <div class="feature-grid">
                    <div class="feature-card">
                        <h3>✨ Feature One</h3>
                        <p>This is a feature based on your prompt.</p>
                        <button class="btn">Learn More</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <script src="app.js"></script>
</body>
</html>`, 50);

    yield* this.writeFileWithProgress('styles.css', `body {
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
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

.btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
}`, 80);

    yield* this.writeFileWithProgress('app.js', `document.addEventListener('DOMContentLoaded', function() {
    console.log('Web app initialized!');
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            alert('Feature activated!');
        });
    });
});`, 90);
  }

  private async *generateSimpleProject(prompt: string): AsyncGenerator<StreamEvent> {
    yield {
      type: 'thought',
      data: { content: `Creating a simple project structure for: "${prompt}"` },
      timestamp: Date.now()
    };

    yield* this.writeFileWithProgress('README.md', `# Generated Project

This project was generated based on your request: "${prompt}"

## Files Created
- README.md - This file
- index.html - Main HTML file  
- styles.css - Styling
- script.js - JavaScript functionality

## Getting Started
Open index.html in a web browser to view your project.
`, 40);

    yield* this.writeFileWithProgress('index.html', `<!DOCTYPE html>
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
</html>`, 70);

    yield* this.writeFileWithProgress('styles.css', `body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    line-height: 1.6;
}

button {
    background: #007cba;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background: #005a85;
}`, 85);

    yield* this.writeFileWithProgress('script.js', `function handleClick() {
    alert('Hello from your generated project!');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Project loaded successfully!');
});`, 100);
  }

  private async *writeFileWithProgress(path: string, content: string, progress: number): AsyncGenerator<StreamEvent> {
    yield {
      type: 'status',
      data: { message: `Creating ${path}...`, progress },
      timestamp: Date.now()
    };

    await this.sleep(300);

    // Tool call for writing file
    const toolCallId = `write_${Date.now()}`;
    yield {
      type: 'tool_call',
      data: {
        id: toolCallId,
        function: 'write_file',
        arguments: { path, content }
      },
      timestamp: Date.now()
    };

    await this.sleep(200);

    // Execute the tool
    this.files.set(path, content);

    // Tool result
    yield {
      type: 'tool_result',
      data: {
        id: toolCallId,
        result: `Successfully created ${path} (${content.length} characters)`
      },
      timestamp: Date.now()
    };

    // File update event
    yield {
      type: 'file_update',
      data: {
        path,
        content,
        language: this.getLanguageFromPath(path),
        action: 'created'
      },
      timestamp: Date.now()
    };
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'html': 'html',
      'css': 'css', 
      'js': 'javascript',
      'ts': 'typescript',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return languageMap[ext || ''] || 'text';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Error handling for uncaught errors from iframe
function handleIframeError(error: string): StreamEvent {
  return {
    type: 'error',
    data: {
      message: 'Error detected in preview',
      error: error,
      suggestion: 'Let me analyze and fix this issue...'
    },
    timestamp: Date.now()
  };
}

// Main API handler
export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json();
    const { prompt, currentFiles, previousMessages, apiKey } = body;

    // Validate request
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const sendEvent = (event: StreamEvent) => {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        };

        try {
          // Initialize mock AI client (replace with real AI service)
          const aiClient = new MockAIClient(currentFiles);
          
          // Generate streaming response
          for await (const event of aiClient.generateStreamingResponse(prompt, previousMessages)) {
            sendEvent(event);
          }

        } catch (error) {
          console.error('Error in agent stream:', error);
          sendEvent({
            type: 'error',
            data: { 
              message: 'An error occurred while processing your request',
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            timestamp: Date.now()
          });
        } finally {
          controller.close();
        }
      }
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ 
      error: 'Invalid request format' 
    }, { status: 400 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}