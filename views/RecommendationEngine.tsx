
import React, { useMemo, useState } from 'react';
import { Supplier, Material, ProcurementRecord, Recommendation } from '../types';

interface RecommendationEngineProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ suppliers, materials, procurement }) => {
  const [applying, setApplying] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];
    
    // 1. Material Switch Logic
    const highImpactMaterials = materials.filter(m => m.carbonFactor > 10);
    highImpactMaterials.forEach(m => {
      const alternative = materials.find(alt => alt.category === m.category && alt.carbonFactor < m.carbonFactor);
      if (alternative) {
        recs.push({
          id: `rec-m-${m.id}`,
          type: 'MATERIAL',
          title: `Switch Material: ${m.name}`,
          description: `Consider replacing '${m.name}' with '${alternative.name}' to reduce footprint by ${Math.round((1 - alternative.carbonFactor/m.carbonFactor) * 100)}%.`,
          impact: 'High'
        });
      }
    });

    // 2. Supplier Shift Logic (Better Alternative)
    const activeSupplierIds = new Set(procurement.map(p => p.supplierId));
    suppliers.filter(s => activeSupplierIds.has(s.id) && s.sustainabilityScore < 60).forEach(s => {
      const betterSupplier = suppliers.find(alt => alt.category === s.category && alt.sustainabilityScore > 80);
      if (betterSupplier) {
        recs.push({
          id: `rec-s-${s.id}`,
          type: 'SUPPLIER',
          title: `Supplier Shift: ${s.name}`,
          description: `Switching to '${betterSupplier.name}' (Score: ${betterSupplier.sustainabilityScore}) improves your rating.`,
          impact: 'Medium'
        });
      }
    });

    // 3. NEW: Flag suppliers with high carbon intensity (low efficiency) and low scores
    // Logic: Score < 50 AND carbonEfficiency > 30 (high emissions per $)
    suppliers.filter(s => s.sustainabilityScore < 50 && s.carbonEfficiency > 30).forEach(s => {
      recs.push({
        id: `rec-audit-${s.id}`,
        type: 'SUPPLIER',
        title: `Audit Required: ${s.name}`,
        description: `Flagged for high carbon intensity (${s.carbonEfficiency} kg/k$) and low score (${s.sustainabilityScore}/100). A mandatory practice review is recommended.`,
        impact: 'High'
      });
    });

    // 4. Optimization Logic
    if (procurement.length > 5) {
      recs.push({
        id: 'rec-opt-1',
        type: 'OPTIMIZATION',
        title: 'Route Consolidation',
        description: 'Optimize shipment frequency to lower Scope 3 transportation emissions.',
        impact: 'Low'
      });
    }
    
    return recs;
  }, [suppliers, materials, procurement]);

  const handleApply = (id: string) => {
    setApplying(id);
    setTimeout(() => {
      setApplying(null);
      alert("Simulation: This strategy has been added to the procurement policy for future orders.");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Insights</h2>
        <p className="text-slate-500 mt-1">Automated decision support based on procurement logic.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.length > 0 ? recommendations.map(rec => (
          <div key={rec.id} className="bg-white rounded-2xl border p-6 shadow-sm flex flex-col group relative">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity`}>
              <i className={`fa-solid ${rec.type === 'MATERIAL' ? 'fa-box' : 'fa-truck'} text-6xl`}></i>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rec.impact === 'High' ? 'bg-rose-100 text-rose-600' : rec.impact === 'Medium' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {rec.impact} Impact
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{rec.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">{rec.description}</p>
            <button 
              onClick={() => handleApply(rec.id)}
              disabled={!!applying}
              className="mt-auto w-full bg-slate-50 text-emerald-600 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {applying === rec.id ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Apply Strategy'}
            </button>
          </div>
        )) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <i className="fa-solid fa-wand-magic-sparkles text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-medium">No new insights available based on current data.</p>
            </div>
        )}
      </div>

      <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden mt-10">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-2xl font-bold mb-3">Rule-Based Efficiency</h3>
          <p className="text-emerald-100 opacity-80">This engine maps materials and suppliers to environmental benchmarks. High-emission sources and low-scoring vendors are flagged automatically to support your sustainability goals.</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationEngine;
