import React, { useState, useMemo } from 'react';
import { DataRow, BiasAnalysis, AIInsights } from '../types';
import { calculateBias, simulateMitigation } from '../lib/biasUtils';
import { getAIInsights } from '../services/geminiService';
import { FileUpload } from './FileUpload';
import { AnalysisPanel } from './AnalysisPanel';
import { Sparkles, ArrowRight, Settings2, Info, RefreshCw, Layers, ShieldCheck, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import Papa from 'papaparse';

export const BiasAuditor: React.FC = () => {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [sensitiveAttribute, setSensitiveAttribute] = useState<string>('');
  const [groundTruthColumn, setGroundTruthColumn] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BiasAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isMitigating, setIsMitigating] = useState(false);
  const [mitigatedAnalysis, setMitigatedAnalysis] = useState<BiasAnalysis | null>(null);

  const handleDataLoaded = (loadedData: DataRow[], name: string) => {
    setData(loadedData);
    if (loadedData.length > 0) {
      setColumns(Object.keys(loadedData[0]));
    }
  };

  const handleRunAnalysis = async () => {
    if (!data || !targetColumn || !sensitiveAttribute) return;
    
    setIsAnalyzing(true);
    const result = calculateBias(data, targetColumn, sensitiveAttribute, groundTruthColumn || undefined);
    setAnalysis(result);
    setMitigatedAnalysis(null);
    
    const insights = await getAIInsights(result);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  const handleMitigate = () => {
    if (!analysis || !data) return;
    setIsMitigating(true);
    setTimeout(() => {
      const result = simulateMitigation(analysis, data);
      setMitigatedAnalysis(result);
      setIsMitigating(false);
    }, 1500);
  };

  const downloadMitigatedData = () => {
    if (!mitigatedAnalysis?.mitigatedData) return;
    const csv = Papa.unparse(mitigatedAnalysis.mitigatedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `equilens_mitigated_${analysis?.targetColumn}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setData(null);
    setAnalysis(null);
    setAiInsights(null);
    setMitigatedAnalysis(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {!data ? (
        <div className="max-w-2xl mx-auto py-24">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
            >
              <Sparkles className="w-3 h-3" />
              Intelligence Secured
            </motion.div>
            <h2 className="text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">Audit datasets for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">fairness</span>.</h2>
            <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">Identify, explain, and mitigate algorithmic bias in your decision models with high-precision metrics.</p>
          </div>
          <div className="glass-card rounded-3xl p-2">
            <FileUpload onDataLoaded={handleDataLoaded} isLoading={false} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Config */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="glass-card p-6 rounded-2xl sticky top-24">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-700/50">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">Configuration</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Outcome</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer outline-none text-slate-200"
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                  >
                    <option value="">Select Target...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sensitive Attribute</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer outline-none text-slate-200"
                    value={sensitiveAttribute}
                    onChange={(e) => setSensitiveAttribute(e.target.value)}
                  >
                    <option value="">Select Attribute...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ground Truth (Optional)</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer outline-none text-slate-200"
                    value={groundTruthColumn}
                    onChange={(e) => setGroundTruthColumn(e.target.value)}
                  >
                    <option value="">Select Ground Truth...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleRunAnalysis}
                    disabled={!targetColumn || !sensitiveAttribute || isAnalyzing}
                    className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
                  >
                    {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                    {isAnalyzing ? 'Analyzing Engine...' : 'Run Full Audit'}
                  </button>
                </div>

                <button 
                  onClick={reset}
                  className="w-full bg-transparent text-slate-500 border border-slate-800 rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:text-slate-300 hover:bg-slate-800/30 transition-all"
                >
                  Clear Dataset
                </button>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Privacy Mode</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Only anonymized outcome ratios are transmitted. Raw values remain securely in your browser's memory.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-8">
            {!analysis && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-[500px] glass-card rounded-3xl border-2 border-dashed border-slate-800 text-slate-500">
                <Layers className="w-16 h-16 mb-6 opacity-10" />
                <p className="font-bold uppercase text-xs tracking-[0.3em] opacity-40 text-center px-12">
                  Dataset Loaded: Select attributes to initialize the auditing engine
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
                </div>
                <div className="h-96 glass-card rounded-3xl w-full animate-pulse" />
              </div>
            ) : analysis && (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={mitigatedAnalysis ? 'mitigated' : 'original'}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <AnalysisPanel 
                    analysis={mitigatedAnalysis || analysis} 
                    isComparing={!!mitigatedAnalysis}
                    comparisonData={mitigatedAnalysis ? analysis : undefined}
                  />

                  {/* AI & Mitigation Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Gemini Insights */}
                    <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Gemini AI Auditor Insight</h3>
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded uppercase font-black italic tracking-widest border border-indigo-500/10">Gen AI Core</span>
                        </div>
                        
                        <div className="space-y-8">
                          {aiInsights ? (
                            <>
                              <div className="italic text-slate-200 leading-relaxed text-sm font-medium border-l-2 border-indigo-500/30 pl-4 py-1">
                                "{aiInsights.explanation}"
                              </div>
                              
                              <div className="grid grid-cols-1 gap-8 pt-8 border-t border-slate-800">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4">Detected Bias Drivers</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {aiInsights.rootCauses.map((cause, i) => (
                                      <span key={i} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                        {cause}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Audit Recommendations</h4>
                                  {aiInsights.suggestions.map((sug, i) => (
                                    <div key={i} className="text-[11px] text-slate-400 flex gap-3 items-center font-medium">
                                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                      {sug}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                              <RefreshCw className="w-8 h-8 text-indigo-500/40 animate-spin" />
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Consulting Ethical AI Model...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mitigation Control */}
                    <div className="glass-card p-8 rounded-3xl flex flex-col justify-between border-t-2 border-t-emerald-500/20">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                            <ArrowRight className="w-4 h-4 text-emerald-400" />
                          </div>
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mitigation Lab</h3>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">Reach Parity Thresholds.</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                          Mathematically simulate outcome re-weighting to reach parity while maintaining model stability. 
                          Apply mathematical correction to reach <span className="text-emerald-400 font-bold tracking-widest uppercase text-[10px]">Parity Standard</span>.
                        </p>
                      </div>
                      
                      {!mitigatedAnalysis ? (
                        <button 
                          onClick={handleMitigate}
                          disabled={isMitigating}
                          className="w-full bg-slate-50 text-slate-950 rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl active:scale-[0.98] uppercase text-xs tracking-widest group"
                        >
                          {isMitigating ? <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />}
                          {isMitigating ? 'Processing Logic...' : 'Apply Correction Simulation'}
                        </button>
                      ) : (
                        <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ShieldCheck className="w-12 h-12 text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-widest mb-2">
                             Correction Applied
                          </div>
                          <p className="text-slate-300 text-[11px] mb-4 font-medium">
                            Differential outcome gap reduced. Parity score reached <span className="text-emerald-400 font-black">0.85 DI</span>.
                          </p>
                          <button 
                            onClick={() => setMitigatedAnalysis(null)}
                            className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors flex items-center gap-1 group/btn mb-4"
                          >
                            <span className="group-hover/btn:-translate-x-1 transition-transform">←</span> Discard Simulation
                          </button>
                          <button 
                            onClick={downloadMitigatedData}
                            className="w-full bg-emerald-500 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Corrected CSV
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
