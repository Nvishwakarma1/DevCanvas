import { useState } from 'react';
import { 
  Sparkles, 
  Code, 
  Layers, 
  Download, 
  ArrowRight, 
  Monitor, 
  Sliders, 
  Layout, 
  Zap 
} from 'lucide-react';
import logoImg from '../assets/DClogo.png';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // Local state for the interactive mini-demo card
  const [demoPadding, setDemoPadding] = useState<'p-4' | 'p-6' | 'p-8'>('p-6');
  const [demoTheme, setDemoTheme] = useState<'indigo' | 'emerald' | 'rose'>('indigo');
  const [demoRounded, setDemoRounded] = useState<'rounded-xl' | 'rounded-none' | 'rounded-full'>('rounded-xl');

  // Spacing selector helper
  const paddingOptions = [
    { label: 'Compact', value: 'p-4' as const },
    { label: 'Default', value: 'p-6' as const },
    { label: 'Relaxed', value: 'p-8' as const },
  ];

  // Theme selector helper
  const themeOptions = [
    { label: 'Indigo Accent', value: 'indigo' as const, color: 'bg-indigo-600' },
    { label: 'Emerald Accent', value: 'emerald' as const, color: 'bg-emerald-600' },
    { label: 'Rose Accent', value: 'rose' as const, color: 'bg-rose-600' },
  ];

  // Rounding options
  const roundedOptions = [
    { label: 'None', value: 'rounded-none' as const },
    { label: 'Medium', value: 'rounded-xl' as const },
    { label: 'Pill', value: 'rounded-full' as const },
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full glow-blob animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full glow-blob animate-pulse-slow" />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full glow-blob" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 grid-bg-dark pointer-events-none opacity-60" />

      {/* Landing Navigation Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImg} className="w-8 h-8 rounded-lg object-contain shadow-lg shadow-indigo-650/20" alt="DevCanvas Logo" />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              DevCanvas
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer hidden md:inline-block">Features</span>
            <span className="text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer hidden md:inline-block">Documentation</span>
            <button 
              onClick={onGetStarted}
              className="relative group overflow-hidden px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-8 animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Modern Visual IDE for Frontend Engineers</span>
        </div>

        {/* Hero Headlines */}
        <h1 className="text-4xl md:text-7xl font-extrabold text-center tracking-tight leading-[1.1] mb-6 max-w-4xl">
          Visual Canvas. <br className="md:hidden" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
            Production-Ready Code.
          </span>
        </h1>

        <p className="text-zinc-400 text-center text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Design beautiful responsive layouts visually. Drag elements, tweak styles with CSS inspectors, and watch clean HTML/Tailwind synchronize in real-time.
        </p>

        {/* Primary Call-to-Action */}
        <button
          onClick={onGetStarted}
          className="relative group px-8 py-4 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer mb-20"
        >
          <span>Get Started - It's Free</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Interactive Demo Section - The "WOW" Factor */}
        <section className="w-full max-w-5xl mb-24">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Try the Real-Time Sandbox Below
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              Adjust properties on the left and see the responsive visual design update immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-panel p-6 md:p-8 rounded-2xl">
            {/* Interactive Properties Controller (4 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-zinc-800 pb-6 lg:pb-0 lg:pr-8">
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Visual CSS Inspector
                </h3>
                <p className="text-xs text-zinc-500">Modify design variables below</p>
              </div>

              {/* Spacing Controller */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Component Padding
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paddingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDemoPadding(opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-all cursor-pointer ${
                        demoPadding === opt.value
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Controller */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Accent Color Theme
                </label>
                <div className="flex flex-col gap-2">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDemoTheme(opt.value)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md border font-medium transition-all cursor-pointer ${
                        demoTheme === opt.value
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${opt.color}`} />
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounding Corners Controller */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Border Radius
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {roundedOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDemoRounded(opt.value)}
                      className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-all cursor-pointer ${
                        demoRounded === opt.value
                          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Visual Render Screen (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-[300px]">
              {/* Header Toggles */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Interactive Live Canvas</span>
                </div>
              </div>

              {/* Dynamic Interactive Card Render */}
              <div className="flex-1 flex items-center justify-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                <div className={`w-full max-w-sm bg-zinc-900 border border-zinc-800 ${demoRounded} overflow-hidden shadow-2xl transition-all duration-300`}>
                  <div className="relative">
                    {/* Mock Image Area */}
                    <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                      <Layout className="w-12 h-12 text-zinc-700" />
                    </div>
                    {/* Badge */}
                    <span className={`absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 text-white rounded-full shadow-lg ${
                      demoTheme === 'indigo' ? 'bg-indigo-600 shadow-indigo-500/20' : 
                      demoTheme === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-500/20'
                    }`}>
                      Interactive Component
                    </span>
                  </div>

                  <div className={`${demoPadding} transition-all duration-300 flex flex-col gap-3`}>
                    <div>
                      <h4 className="font-bold text-lg text-white">Dynamic Header Title</h4>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Notice how the CSS padding, border-radius corners, and theme highlights update instantly without reloading.
                      </p>
                    </div>

                    <button className={`w-full py-2 text-xs font-semibold text-white transition-all shadow-md cursor-pointer ${demoRounded} ${
                      demoTheme === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' : 
                      demoTheme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                    }`}>
                      Action Button
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Synchronizer Output */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mb-2">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-zinc-400" /> Generated CSS & HTML Class List
                  </span>
                  <span className="text-[10px] text-zinc-600">Tailwind CSS v4</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 font-mono text-[11px] text-indigo-300 overflow-x-auto whitespace-pre-wrap select-all cursor-text">
                  {`<div class="bg-zinc-900 border border-zinc-800 ${demoRounded} overflow-hidden shadow-2xl">\n  <div class="h-32 bg-zinc-800 flex items-center justify-center">...</div>\n  <div class="${demoPadding} flex flex-col gap-3">\n    <button class="w-full py-2 text-white ${
                    demoTheme === 'indigo' ? 'bg-indigo-600' : demoTheme === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600'
                  } ${demoRounded}">...</button>\n  </div>\n</div>`}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase Grid */}
        <section className="w-full max-w-5xl mb-24">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Engineered for Fast Layout Design
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 group hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Component Blocks</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pre-built layouts like headers, forms, grids, and cards. Assemble structures in seconds without repeating styling setups.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 group hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Live CSS Inspector</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tune paddings, margins, shadows, typography, and borders visually. Modifications apply instantly to canvas, editor, and sandbox.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Clean Code Export</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Export generated semantic HTML with responsive Tailwind utility classes. Load it locally or deploy as a standalone static site.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Area */}
        <section className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-zinc-900 bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-12 flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" />
          <div className="absolute top-[-50%] w-[60%] h-[100%] bg-indigo-600/5 rounded-full glow-blob animate-pulse-slow" />
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Accelerate Your Frontend Workflow?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-lg mb-8">
            Experience DevCanvas. Build prototypes, structure mockups, export code, and skip writing Tailwind configs from scratch.
          </p>
          <button
            onClick={onGetStarted}
            className="group px-6 py-3 rounded-lg text-base font-bold bg-white text-zinc-950 hover:bg-zinc-100 shadow-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Coding Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 relative z-10 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} DevCanvas IDE. Designed for modern frontend engineers.</span>
          <div className="flex gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-zinc-400 cursor-pointer">GitHub Repository</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
