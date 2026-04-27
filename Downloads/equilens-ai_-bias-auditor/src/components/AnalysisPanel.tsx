import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BiasAnalysis } from '../types';
import { ShieldAlert, ShieldCheck, TrendingDown, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalysisPanelProps {
  analysis: BiasAnalysis;
  isComparing?: boolean;
  comparisonData?: BiasAnalysis;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  analysis, 
  isComparing = false,
  comparisonData 
}) => {
  const chartData = analysis.metrics.map(m => ({
    name: m.groupValue,
    rate: Number((m.outcomeRate * 100).toFixed(1)),
    originalRate: comparisonData 
      ? Number((comparisonData.metrics.find(cm => cm.groupValue === m.groupValue)?.outcomeRate || 0) * 100).toFixed(1)
      : null
  }));

  const diScore = (analysis.disparateImpact * 100).toFixed(1);
  const isHealthy = analysis.disparateImpact >= 0.8;

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Fairness Score" 
          value={`${diScore}%`}
          subValue="Disparate Impact"
          status={isHealthy ? 'success' : 'danger'}
        />
        <StatCard 
          label="Sample Size" 
          value={analysis.totalRows.toLocaleString()}
          subValue="Total Records analyzed"
        />
        <StatCard 
          label="Demographic Parity" 
          value={analysis.demographicParityDiff.toFixed(2)}
          subValue="Outcome Difference"
          status={analysis.demographicParityDiff < 0.1 ? 'success' : 'danger'}
        />
        <StatCard 
          label="Status" 
          value={isHealthy ? 'Fair' : 'Biased'}
          subValue={isHealthy ? 'Threshold: > 0.80' : 'Risk detected'}
          status={isHealthy ? 'success' : 'danger'}
          icon={isHealthy ? ShieldCheck : ShieldAlert}
        />
      </div>

      {/* Advanced Metrics Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predictive Parity</h3>
            <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {analysis.predictiveParityDiff !== undefined ? (analysis.predictiveParityDiff * 100).toFixed(1) + '%' : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Measures if precision is identical across groups. Ideally, the gap should be close to zero.
          </p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equalized Odds</h3>
            <HelpCircle className="w-4 h-4 text-slate-600 cursor-help" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {analysis.equalizedOddsDiff !== undefined ? (analysis.equalizedOddsDiff * 100).toFixed(1) + '%' : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Checks if True Positive and False Positive rates are stratified. Requires Ground Truth comparison.
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Outcome Rate by {analysis.sensitiveAttribute}</h3>
            <p className="text-xs text-slate-500">Comparing positive decision rates across detected groups.</p>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
              <span>{isComparing ? 'Simulated' : 'Current Rate'}</span>
            </div>
            {isComparing && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                <span>Original</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(71, 85, 105, 0.2)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(71, 85, 105, 0.4)',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                labelStyle={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={isHealthy ? '#10b981' : '#f43f5e'} fillOpacity={0.9} />
                ))}
              </Bar>
              {isComparing && (
                <Bar dataKey="originalRate" fill="#475569" radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.5} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subValue, status = 'default', icon: Icon }: any) => (
  <div className="glass-card p-6 rounded-2xl group transition-all hover:bg-slate-800/60 cursor-default">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</span>
      {Icon && <Icon className={`w-4 h-4 ${status === 'success' ? 'text-emerald-500' : status === 'danger' ? 'text-rose-500' : 'text-slate-500'}`} />}
    </div>
    <div className={`text-3xl font-bold tracking-tight mb-2 ${status === 'success' ? 'text-emerald-400' : status === 'danger' ? 'text-rose-400' : 'text-white'}`}>
      {value}
    </div>
    <div className="text-[11px] text-slate-500 font-medium">{subValue}</div>
  </div>
);
