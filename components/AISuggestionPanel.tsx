
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, Loader2, ChevronRight, Leaf, Target, BarChart3 } from 'lucide-react';
import { Supplier, Material, ProcurementRecord, EnergyRecord } from '../types';
import { getSustainabilityAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AISuggestionPanelProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
}

const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({ suppliers, materials, procurement, energy }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const result = await getSustainabilityAdvice(suppliers, materials, procurement, energy);
      setAdvice(result);
    } catch (error) {
      console.error(error);
      setAdvice("Failed to generate AI advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-[32px] border border-emerald-200/50 dark:border-emerald-500/20 p-8 shadow-xl shadow-emerald-500/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BrainCircuit className="text-white w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              AI Strategic Advisor
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                Powered by Gemini
              </span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Get data-driven sustainability strategies for your enterprise.</p>
          </div>
        </div>
        
        <button
          onClick={generateAdvice}
          disabled={loading}
          className="bg-slate-900 dark:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {loading ? 'Analyzing Data...' : 'Generate AI Insights'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!advice && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Leaf, title: "Carbon Reduction", desc: "Identify high-emission procurement patterns." },
              { icon: Target, title: "ESG Optimization", desc: "Strategic shifts to higher-rated suppliers." },
              { icon: BarChart3, title: "Impact Analysis", desc: "Estimated savings and environmental gains." }
            ].map((item, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-white dark:border-slate-800">
                <item.icon className="w-6 h-6 text-emerald-500 mb-3" />
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Consulting with Gemini...</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
              We're analyzing your procurement history, energy consumption, and supplier ESG scores to build a custom strategy.
            </p>
          </motion.div>
        )}

        {advice && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 p-8 shadow-inner"
          >
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setAdvice(null)}
                className="text-slate-400 hover:text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                Clear and Re-analyze
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISuggestionPanel;
