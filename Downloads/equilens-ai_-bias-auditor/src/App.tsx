import React from 'react';
import { BiasAuditor } from './components/BiasAuditor';
import { ShieldCheck, Info, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-50 selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                EquiLens <span className="text-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest">Privacy Secured</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Framework</a>
            <div className="h-4 w-[1px] bg-slate-800" />
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <BiasAuditor />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-16 mt-20 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-400">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-600 p-1 rounded">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-white">EquiLens AI</span>
            </div>
            <p className="max-w-sm leading-relaxed text-slate-500">
              A state-of-the-art fairness auditing platform using differential metrics and 
              Google's Gemini models to ensure algorithmic accountability.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Ethical AI</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Bias Metrics</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Privacy Protocol</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Documentation</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Security Audit</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Research</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors cursor-pointer">Open Source</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-slate-800/30 text-[10px] uppercase tracking-widest text-slate-600 font-bold text-center">
          © 2026 EquiLens Ethics AI. Locally Processed. Cloud Secured.
        </div>
      </footer>
    </div>
  );
}

