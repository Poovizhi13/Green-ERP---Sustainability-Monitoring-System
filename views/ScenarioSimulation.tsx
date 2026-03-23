
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Zap, 
  Truck, 
  Package, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Loader2, 
  Sparkles,
  ArrowRight,
  RefreshCcw,
  Info
} from 'lucide-react';
import { ProcurementRecord, EnergyRecord, Material, Supplier } from '../types';
import { runSustainabilitySimulation } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ScenarioSimulationProps {
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  materials: Material[];
  suppliers: Supplier[];
}

const ScenarioSimulation: React.FC<ScenarioSimulationProps> = ({ procurement, energy, materials, suppliers }) => {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    energyReductionPercent: 0,
    materialSwitchId: '',
    newMaterialId: '',
    supplierSwitchId: '',
    newSupplierId: ''
  });

  const [result, setResult] = useState<{
    currentCarbon: number;
    simulatedCarbon: number;
    carbonReduction: number;
    costImpact: number;
    esgImpact: number;
    strategicAnalysis: string;
  } | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const data = { procurement, energy, materials, suppliers };
      const simulationResult = await runSustainabilitySimulation(data, params);
      setResult(simulationResult);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <RefreshCcw className="text-emerald-500 w-8 h-8" />
            Sustainability Scenario Simulator
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Test "What-If" strategies to optimize your environmental and financial performance.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulation Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <Zap className="text-emerald-500 w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Energy Optimization</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Reduction Target</label>
              <span className="text-emerald-500 font-black">{params.energyReductionPercent}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={params.energyReductionPercent}
              onChange={(e) => setParams({...params, energyReductionPercent: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package className="text-blue-500 w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Material Switch</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Material</label>
                <select 
                  value={params.materialSwitchId}
                  onChange={(e) => setParams({...params, materialSwitchId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Material...</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="text-slate-300 w-4 h-4" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sustainable Alternative</label>
                <select 
                  value={params.newMaterialId}
                  onChange={(e) => setParams({...params, newMaterialId: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Alternative...</option>
                  {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            {loading ? 'Running Simulation...' : 'Run Analysis'}
          </button>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
                  <Sparkles className="text-emerald-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Ready for Strategy Modeling</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                  Adjust the parameters on the left to simulate how operational changes will impact your carbon footprint, ESG rating, and bottom line.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12"
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <RefreshCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">AI Strategy Engine Active</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
                  Gemini is recalculating your environmental impact based on the proposed scenario...
                </p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* KPI Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carbon Impact</p>
                      <TrendingDown className="text-emerald-500 w-4 h-4" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">-{result.carbonReduction}%</span>
                      <span className="text-[10px] text-slate-500 font-bold mb-1">CO2e</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cost Impact</p>
                      {result.costImpact > 0 ? <TrendingUp className="text-rose-500 w-4 h-4" /> : <TrendingDown className="text-emerald-500 w-4 h-4" />}
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-3xl font-black ${result.costImpact > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {result.costImpact > 0 ? '+' : ''}{result.costImpact}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold mb-1">USD</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ESG Score Delta</p>
                      <Award className="text-emerald-500 w-4 h-4" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">+{result.esgImpact}</span>
                      <span className="text-[10px] text-slate-500 font-bold mb-1">pts</span>
                    </div>
                  </div>
                </div>

                {/* Comparison Visual */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-8">Carbon Footprint Comparison</h3>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-slate-500">
                        <span>Current Baseline</span>
                        <span>{result.currentCarbon.toLocaleString()} kg CO2e</span>
                      </div>
                      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                        <div className="bg-slate-600 h-full w-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-emerald-400">
                        <span>Simulated Scenario</span>
                        <span>{result.simulatedCarbon.toLocaleString()} kg CO2e</span>
                      </div>
                      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.simulatedCarbon / result.currentCarbon) * 100}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="bg-emerald-500 h-full"
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategic Analysis */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-10 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <Info className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Strategic Trade-off Analysis</h3>
                  </div>
                  
                  <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-strong:text-emerald-600 dark:prose-strong:text-emerald-400">
                    <ReactMarkdown>{result.strategicAnalysis}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulation;
