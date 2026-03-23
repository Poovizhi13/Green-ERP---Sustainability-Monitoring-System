
import React, { useMemo, useState } from 'react';
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
    setTimeout(() => { setApplying(null); alert("Strategy transformation initiated!"); }, 1200);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recommendation Engine</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Algorithmic suggestions for circular economy transition.</p>
      </header>

      <AISuggestionPanel 
        suppliers={suppliers} 
        materials={materials} 
        procurement={procurement} 
        energy={energy} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.length > 0 ? recommendations.map(rec => (
          <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-2xl flex flex-col group relative overflow-hidden hover:border-emerald-500/30 transition-all">
            <div className={`absolute -right-8 -top-8 opacity-[0.05] dark:opacity-[0.03] group-hover:opacity-10 dark:group-hover:opacity-10 transition-opacity`}>
              <i className={`fa-solid ${rec.type === 'MATERIAL' ? 'fa-box-open' : 'fa-truck-arrow-right'} text-[140px] text-slate-900 dark:text-white`}></i>
            </div>
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${rec.impact === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-500/10'}`}>
                {rec.impact} Environmental Impact
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{rec.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10 font-medium">{rec.description}</p>
            <button 
              onClick={() => handleApply(rec.id)}
              disabled={!!applying}
              className="mt-auto w-full bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-3 border border-transparent dark:border-slate-700 shadow-lg shadow-black/10 active:scale-[0.98]"
            >
              {applying === rec.id ? <i className="fa-solid fa-sync animate-spin"></i> : <i className="fa-solid fa-bolt-lightning text-emerald-500"></i>}
              {applying === rec.id ? 'Processing' : 'Execute Optimization'}
            </button>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
             <i className="fa-solid fa-check-double text-4xl text-emerald-500 mb-4 opacity-30"></i>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">System Optimized</h3>
             <p className="text-slate-400 font-medium">All current procurement matches best-available sustainability standards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;
