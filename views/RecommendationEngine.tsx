import React, { useMemo, useState } from 'react';
import { 
  Lightbulb, 
  ArrowRight, 
  Zap, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { Supplier, Material, ProcurementRecord, Recommendation, EnergyRecord } from '../types';
import AISuggestionPanel from '../components/AISuggestionPanel';

interface RecommendationEngineProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ suppliers, materials, procurement, energy }) => {
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);

  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    const highImpactMaterials = materials.filter(m => m.carbonFactor > 10);
    highImpactMaterials.forEach(m => {
      const alternative = materials.find(alt => alt.category === m.category && alt.carbonFactor < m.carbonFactor);
      if (alternative) {
        recs.push({
          id: `rec-m-${m.id}`,
          type: 'MATERIAL',
          title: `Switch Material: ${m.name}`,
          description: `Optimize by replacing high-carbon '${m.name}' with '${alternative.name}'. Potentially reduces footprint by ${Math.round((1 - alternative.carbonFactor/m.carbonFactor) * 100)}%.`,
          impact: 'High'
        });
      }
    });

    const activeSupplierIds = new Set(procurement.map(p => p.supplierId));
    suppliers.filter(s => activeSupplierIds.has(s.id) && s.sustainabilityScore < 60).forEach(s => {
      const betterSupplier = suppliers.find(alt => alt.category === s.category && alt.sustainabilityScore > 80);
      if (betterSupplier) {
        recs.push({
          id: `rec-s-${s.id}`,
          type: 'SUPPLIER',
          title: `Supply Chain Shift: ${s.name}`,
          description: `Transition to vendor '${betterSupplier.name}' (ESG Score: ${betterSupplier.sustainabilityScore}) to significantly improve system sustainability rating.`,
          impact: 'Medium'
        });
      }
    });

    return recs;
  }, [suppliers, materials, procurement]);

  const handleApply = (id: string) => {
    setApplying(id);
    setTimeout(() => { 
      setApplying(null); 
      setApplied(prev => [...prev, id]);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Recommendation Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">Algorithmic suggestions for circular economy transition.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase rounded-md border border-emerald-500/20 flex items-center gap-1.5">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            AI Analysis Active
          </div>
        </div>
      </header>

      <AISuggestionPanel 
        suppliers={suppliers} 
        materials={materials} 
        procurement={procurement} 
        energy={energy} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.length > 0 ? recommendations.map(rec => {
          const isApplied = applied.includes(rec.id);
          return (
            <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col group relative overflow-hidden hover:border-emerald-500/30 transition-all">
              <div className="mb-6 flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${rec.impact === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500/10'}`}>
                  {rec.impact === 'High' ? <TrendingDown className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {rec.impact} Impact
                </span>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  {rec.type === 'MATERIAL' ? <Package className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{rec.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 font-medium">{rec.description}</p>
              
              <button 
                onClick={() => handleApply(rec.id)}
                disabled={!!applying || isApplied}
                className={`mt-auto w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2.5 border shadow-sm active:scale-[0.98] ${
                  isApplied 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 border-transparent dark:border-slate-700 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white'
                }`}
              >
                {applying === rec.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : isApplied ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                {applying === rec.id ? 'Processing' : isApplied ? 'Strategy Applied' : 'Execute Optimization'}
              </button>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle2 className="w-8 h-8 text-emerald-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Optimized</h3>
             <p className="text-slate-400 font-medium mt-2">All current procurement matches best-available sustainability standards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;
