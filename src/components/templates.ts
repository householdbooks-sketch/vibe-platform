import { FileNode } from './CodeViewer';

export interface VibeTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Community' | 'SaaS' | 'Publishing' | 'Analytics';
  icon: string;
  badge: string;
  promptSpec: string;
  files: FileNode[];
}

export const VIBE_TEMPLATES: VibeTemplate[] = [
  {
    id: 'community-tutoring',
    title: 'Community & Tutoring Portal',
    description: 'Speak Life Learn empowerment hub with after-school tutoring, workforce tracks, and mentor signups.',
    category: 'Community',
    icon: '🎓',
    badge: 'Speak Life Learn',
    promptSpec: 'Build a community empowerment and after-school tutoring portal for Speak Life Learn with program cards, mentor intake modal, and student success metrics.',
    files: [
      {
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Speak Life Learn • Community Empowerment Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Space+Mono&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-[#0F0A17] text-slate-100 font-sans min-h-screen">
  <!-- Nav -->
  <nav class="border-b border-purple-900/40 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#0F0A17]/90">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/20">S</div>
      <span class="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-cyan-400">Speak Life Learn</span>
    </div>
    <div class="flex items-center gap-4 text-sm font-medium">
      <a href="#programs" class="text-slate-300 hover:text-cyan-400 transition-colors">Programs</a>
      <a href="#impact" class="text-slate-300 hover:text-cyan-400 transition-colors">Impact</a>
      <button onclick="openModal()" class="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 font-semibold text-white shadow-lg shadow-purple-600/30 transition-all">Get Involved</button>
    </div>
  </nav>

  <!-- Hero -->
  <header class="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
    <span class="inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase text-cyan-400 border border-cyan-500/30 rounded-full bg-cyan-950/40 mb-6">Building The Next Generation of Operators</span>
    <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
      Transforming Communities Through <br/>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">Education, Mastery & Purpose</span>
    </h1>
    <p class="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
      Empowering youth and tradespeople with rigorous after-school tutoring, workforce development, and spiritual leadership principles.
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <button onclick="filterProgram('all')" class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 font-semibold shadow-lg shadow-purple-900/50 hover:scale-105 transition-transform">Explore Programs</button>
      <button onclick="openModal()" class="px-6 py-3 rounded-xl border border-purple-800/80 bg-purple-950/30 text-cyan-300 font-semibold hover:bg-purple-900/50 transition-colors">Volunteer as Mentor</button>
    </div>
  </header>

  <!-- Programs Grid -->
  <section id="programs" class="max-w-6xl mx-auto px-6 py-12">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-100">Core Community Pillars</h2>
        <p class="text-sm text-slate-400 mt-1">Targeted initiatives built for long-term generational elevation.</p>
      </div>
      <div class="flex gap-2 text-xs font-mono">
        <button onclick="filterProgram('all')" class="px-3 py-1.5 rounded-md bg-purple-900/50 text-cyan-300 border border-purple-700">All</button>
        <button onclick="filterProgram('youth')" class="px-3 py-1.5 rounded-md bg-slate-900 text-slate-400 hover:text-white border border-slate-800">Youth</button>
        <button onclick="filterProgram('trades')" class="px-3 py-1.5 rounded-md bg-slate-900 text-slate-400 hover:text-white border border-slate-800">Trades</button>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6" id="cards-container">
      <div class="program-card youth p-6 rounded-2xl bg-[#160F24] border border-purple-800/40 hover:border-cyan-500/50 transition-all group">
        <div class="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-700 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📚</div>
        <span class="text-xs font-mono text-cyan-400 tracking-wider uppercase">Grades 6–12</span>
        <h3 class="text-xl font-bold mt-2 mb-2 text-slate-100">STEAM & Literacy Tutoring</h3>
        <p class="text-sm text-slate-400 leading-relaxed">High-impact math, reading, and digital literacy instruction with 1-on-1 accountability coaching.</p>
      </div>

      <div class="program-card trades p-6 rounded-2xl bg-[#160F24] border border-purple-800/40 hover:border-cyan-500/50 transition-all group">
        <div class="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔧</div>
        <span class="text-xs font-mono text-cyan-400 tracking-wider uppercase">Adult & Youth</span>
        <h3 class="text-xl font-bold mt-2 mb-2 text-slate-100">Trades Pre-Apprenticeship</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Piping, plumbing, wastewater compliance, and mechanical trades readiness guided by 20-year journeymen.</p>
      </div>

      <div class="program-card youth p-6 rounded-2xl bg-[#160F24] border border-purple-800/40 hover:border-cyan-500/50 transition-all group">
        <div class="w-12 h-12 rounded-xl bg-pink-950/50 border border-pink-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
        <span class="text-xs font-mono text-cyan-400 tracking-wider uppercase">Leadership</span>
        <h3 class="text-xl font-bold mt-2 mb-2 text-slate-100">Character & Leadership Guild</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Grounded spiritual discipline, conflict de-escalation, emotional mastery, and civic stewardship.</p>
      </div>
    </div>
  </section>

  <!-- Modal -->
  <div id="signup-modal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
    <div class="bg-[#1A122B] border border-purple-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">&times;</button>
      <h3 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">Join Speak Life Learn</h3>
      <p class="text-sm text-slate-300 mt-1 mb-4">Enroll a student or volunteer your trade experience.</p>
      <form onsubmit="handleFormSubmit(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
          <input type="text" required class="w-full bg-[#0F0A17] border border-purple-900 rounded-lg p-2.5 text-sm focus:border-cyan-400 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Email or Phone</label>
          <input type="text" required class="w-full bg-[#0F0A17] border border-purple-900 rounded-lg p-2.5 text-sm focus:border-cyan-400 focus:outline-none">
        </div>
        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Role Interest</label>
          <select class="w-full bg-[#0F0A17] border border-purple-900 rounded-lg p-2.5 text-sm focus:border-cyan-400 focus:outline-none">
            <option>Enroll a Student</option>
            <option>Volunteer as Trades Mentor</option>
            <option>After-School Academic Tutor</option>
            <option>Community Partner / Sponsor</option>
          </select>
        </div>
        <button type="submit" class="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 font-bold text-white shadow-lg">Submit Application</button>
      </form>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`
      },
      {
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `body {
  font-family: 'Space Grotesk', sans-serif;
}
.font-mono {
  font-family: 'Space Mono', monospace;
}
.program-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.program-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -10px rgba(0, 201, 255, 0.2);
}`
      },
      {
        name: 'app.js',
        type: 'file',
        language: 'javascript',
        content: `function openModal() {
  const modal = document.getElementById('signup-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  const modal = document.getElementById('signup-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function handleFormSubmit(e) {
  e.preventDefault();
  alert('Thank you for connecting with Speak Life Learn! Our community coordinator will reach out within 24 hours.');
  closeModal();
}

function filterProgram(type) {
  const cards = document.querySelectorAll('.program-card');
  cards.forEach(card => {
    if (type === 'all' || card.classList.contains(type)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}`
      }
    ]
  },
  {
    id: 'author-showcase',
    title: 'Author & Book Showcase',
    description: 'Field Manual for Victory direct-to-consumer store with audio sample player and deluxe hardcover checkout bundle.',
    category: 'Publishing',
    icon: '📖',
    badge: 'Direct Sales',
    promptSpec: 'Build a high-conversion author sales page for Field Manual for Victory with 3D book cover, Courts of Heaven legal warfare overview, audio companion player widget, and bundle order bump.',
    files: [
      {
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Field Manual for Victory • David Ohene</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-[#0B0609] text-slate-100 min-h-screen">
  <div class="max-w-5xl mx-auto px-6 py-12">
    <!-- Header -->
    <div class="flex justify-between items-center pb-8 border-b border-red-950/60">
      <div class="flex items-center gap-2">
        <span class="text-amber-500 font-bold tracking-widest text-xs uppercase font-mono">Speak Life Learn Publishing</span>
      </div>
      <div class="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1 rounded-full">
        ● Print-on-Demand Ready
      </div>
    </div>

    <!-- Product Hero -->
    <div class="grid md:grid-cols-2 gap-12 items-center py-12">
      <!-- 3D Book Graphic -->
      <div class="flex justify-center">
        <div class="book-card p-8 rounded-xl bg-gradient-to-br from-[#4A0E17] via-[#2A050A] to-[#140204] border-2 border-amber-500/40 shadow-2xl text-center max-w-xs relative">
          <div class="absolute inset-2 border border-amber-500/20 pointer-events-none"></div>
          <span class="text-[10px] font-mono tracking-widest text-amber-400 uppercase">Judicial Protocol Manual</span>
          <h2 class="text-2xl font-serif font-bold text-white mt-4 leading-tight tracking-wider">FIELD MANUAL FOR VICTORY</h2>
          <div class="w-12 h-0.5 bg-amber-500 mx-auto my-4"></div>
          <p class="text-xs font-serif italic text-amber-200/90 mb-6">Protocols of the Courts of Heaven</p>
          <div class="mt-8 pt-4 border-t border-amber-900/40 text-xs tracking-widest font-mono text-slate-300">DAVID OHENE</div>
        </div>
      </div>

      <!-- Offer Details -->
      <div>
        <span class="text-xs font-mono text-red-400 font-semibold tracking-wider uppercase">Spiritual Jurisprudence</span>
        <h1 class="text-4xl font-bold mt-2 mb-4 leading-tight">
          You're Not Losing a War. <br/>
          <span class="text-amber-400">You're Losing a Court Case.</span>
        </h1>
        <p class="text-slate-300 text-sm leading-relaxed mb-6">
          The enemy functions as a prosecuting attorney bringing legal accusations before the Righteous Judge. Stop fighting with fleshly emotion and learn judicial protocol to revoke demonic contracts and enforce Christ's binding verdict.
        </p>

        <!-- Audio Companion Widget -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-mono text-slate-400 uppercase">Audio Companion Preview</span>
            <span class="text-xs font-mono text-amber-400" id="audio-timer">0:00 / 1:18</span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="toggleAudio()" id="play-btn" class="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center transition-colors">▶</button>
            <div class="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div id="audio-progress" class="bg-gradient-to-r from-amber-500 to-cyan-400 h-full w-0 transition-all duration-300"></div>
            </div>
          </div>
        </div>

        <!-- Price Box -->
        <div class="bg-[#190C11] border border-amber-900/40 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-white">$49.95</div>
            <div class="text-xs text-slate-400">Casebound Hardcover + Audio Companion</div>
          </div>
          <button onclick="alert('Order payload ready for Lulu POD fulfillment!')" class="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-red-950 transition-all">Order Deluxe Bundle</button>
        </div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `.book-card {
  box-shadow: 10px 15px 40px rgba(0,0,0,0.8), -5px -5px 25px rgba(212, 175, 55, 0.1);
  transform: perspective(1000px) rotateY(-8deg);
  transition: transform 0.4s ease;
}
.book-card:hover {
  transform: perspective(1000px) rotateY(0deg) scale(1.02);
}`
      },
      {
        name: 'app.js',
        type: 'file',
        language: 'javascript',
        content: `let isPlaying = false;
let progress = 0;
let interval;

function toggleAudio() {
  const btn = document.getElementById('play-btn');
  const bar = document.getElementById('audio-progress');
  const timer = document.getElementById('audio-timer');

  isPlaying = !isPlaying;
  if (isPlaying) {
    btn.innerText = '❚❚';
    interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        isPlaying = false;
        btn.innerText = '▶';
        progress = 0;
      } else {
        progress += 2;
        bar.style.width = progress + '%';
        timer.innerText = '0:' + (Math.floor(progress * 0.78)).toString().padStart(2, '0') + ' / 1:18';
      }
    }, 200);
  } else {
    btn.innerText = '▶';
    clearInterval(interval);
  }
}`
      }
    ]
  },
  {
    id: 'saas-landing',
    title: 'High-Converting SaaS Landing Page',
    description: 'Clean modern software product page with live interactive pricing calculator, hero CTA, and feature cards.',
    category: 'SaaS',
    icon: '⚡',
    badge: 'Conversion',
    promptSpec: 'Build a high-converting dark-themed SaaS landing page with hero CTA, feature matrix, interactive monthly/annual pricing toggle, and client testimonial cards.',
    files: [
      {
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeStack • Cloud Edge Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0B0F19] text-slate-100 min-h-screen">
  <nav class="border-b border-slate-800 px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
    <div class="font-bold text-lg text-cyan-400">⚡ VibeStack</div>
    <div class="flex gap-4 items-center text-sm">
      <a href="#pricing" class="text-slate-400 hover:text-white">Pricing</a>
      <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white">Start Free</button>
    </div>
  </nav>

  <header class="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
    <div class="inline-block px-3 py-1 bg-cyan-950/60 border border-cyan-800 rounded-full text-xs font-mono text-cyan-400 mb-6">v2.4 Released with Cloudflare D1</div>
    <h1 class="text-5xl font-extrabold tracking-tight mb-6">Build at the Speed of Thought. <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Deployed at the Edge.</span></h1>
    <p class="text-lg text-slate-400 max-w-xl mx-auto mb-8">Stop writing boilerplate. Let agentic loops construct your full-stack apps directly into production-grade Cloudflare infrastructure.</p>
    <div class="flex justify-center gap-4">
      <button class="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold shadow-lg shadow-cyan-500/20">Launch Free Sandbox</button>
    </div>
  </header>

  <section id="pricing" class="max-w-4xl mx-auto px-6 py-12">
    <h2 class="text-2xl font-bold text-center mb-8">Transparent Edge Pricing</h2>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
        <h3 class="text-xl font-bold">Starter</h3>
        <p class="text-slate-400 text-sm mt-1 mb-4">For solo builders and prototypes</p>
        <div class="text-3xl font-bold mb-6">$0 <span class="text-sm text-slate-500 font-normal">/ mo</span></div>
        <ul class="space-y-3 text-sm text-slate-300 mb-8">
          <li>✓ 3 Active Sandbox Spaces</li>
          <li>✓ D1 Edge Database Binding</li>
          <li>✓ Community Support</li>
        </ul>
        <button class="w-full py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-semibold">Get Started</button>
      </div>

      <div class="p-8 rounded-2xl bg-slate-900/90 border-2 border-cyan-500/60 relative shadow-2xl">
        <span class="absolute -top-3 right-6 bg-cyan-500 text-black text-[10px] font-bold px-3 py-0.5 rounded-full uppercase">Most Popular</span>
        <h3 class="text-xl font-bold text-cyan-300">Operator Pro</h3>
        <p class="text-slate-400 text-sm mt-1 mb-4">For production teams and multi-agent flows</p>
        <div class="text-3xl font-bold mb-6">$29 <span class="text-sm text-slate-500 font-normal">/ mo</span></div>
        <ul class="space-y-3 text-sm text-slate-300 mb-8">
          <li>✓ Unlimited Edge Sandbox Spaces</li>
          <li>✓ Automated GitHub PR Sync</li>
          <li>✓ R2 Asset Storage + Custom Domains</li>
        </ul>
        <button class="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm">Upgrade to Pro</button>
      </div>
    </div>
  </section>
</body>
</html>`
      }
    ]
  },
  {
    id: 'analytics-dashboard',
    title: 'Executive Metrics & KPI Dashboard',
    description: 'Real-time metrics hub with financial summaries, operational status badges, and interactive search filters.',
    category: 'Analytics',
    icon: '📊',
    badge: 'Operations',
    promptSpec: 'Build a dark-mode operations dashboard for Speak Life Learn with KPI summary widgets (revenue, students, books shipped), live activity table, and filter controls.',
    files: [
      {
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Operations Command Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0B0F19] text-slate-100 min-h-screen p-8">
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold">Command Center • Speak Life Learn</h1>
        <p class="text-sm text-slate-400">Live operational telemetry & distribution tracking</p>
      </div>
      <span class="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full">Systems Optimal</span>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div class="text-xs text-slate-400 font-mono uppercase">Gross Revenue</div>
        <div class="text-2xl font-bold mt-2 text-white">$48,290.00</div>
        <div class="text-xs text-emerald-400 mt-1">↑ +14.2% this month</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div class="text-xs text-slate-400 font-mono uppercase">Active Students</div>
        <div class="text-2xl font-bold mt-2 text-cyan-300">342</div>
        <div class="text-xs text-slate-400 mt-1">Across 4 Toledo centers</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div class="text-xs text-slate-400 font-mono uppercase">Books Shipped (Lulu)</div>
        <div class="text-2xl font-bold mt-2 text-purple-300">1,180</div>
        <div class="text-xs text-slate-400 mt-1">Field Manual Volume 1</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div class="text-xs text-slate-400 font-mono uppercase">Avg Order Value</div>
        <div class="text-2xl font-bold mt-2 text-amber-300">$64.50</div>
        <div class="text-xs text-amber-400 mt-1">High bundle attachment</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 class="font-bold text-sm">Recent Dispatches & Registrations</h3>
        <input type="text" placeholder="Search orders..." class="bg-slate-950 border border-slate-700 px-3 py-1 text-xs rounded-lg focus:outline-none focus:border-cyan-400">
      </div>
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3">Reference</th>
            <th class="p-3">Item / Program</th>
            <th class="p-3">Channel</th>
            <th class="p-3">Status</th>
            <th class="p-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr>
            <td class="p-3 font-mono">#ORD-9042</td>
            <td class="p-3 font-medium text-white">Deluxe Hardcover + Audio Companion</td>
            <td class="p-3 text-slate-400">Direct Checkout</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Fulfilled (Lulu)</span></td>
            <td class="p-3 text-right font-bold">$49.95</td>
          </tr>
          <tr>
            <td class="p-3 font-mono">#REG-1033</td>
            <td class="p-3 font-medium text-white">Trades Pre-Apprenticeship Cohort</td>
            <td class="p-3 text-slate-400">Community Outreach</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-cyan-800">Enrolled</span></td>
            <td class="p-3 text-right font-bold">-</td>
          </tr>
          <tr>
            <td class="p-3 font-mono">#ORD-9041</td>
            <td class="p-3 font-medium text-white">Two-Book Covenant Bundle + Index</td>
            <td class="p-3 text-slate-400">X Authority Ad</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Fulfilled (Lulu)</span></td>
            <td class="p-3 text-right font-bold">$79.90</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`
      }
    ]
  }
];
