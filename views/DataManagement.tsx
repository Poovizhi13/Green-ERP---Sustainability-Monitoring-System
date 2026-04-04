import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Zap, 
  History, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Users, 
  DollarSign,
  PlusCircle,
  Leaf
} from 'lucide-react';
import { Material, Supplier, ProcurementRecord, EnergyRecord, UserRole } from '../types';

interface DataManagementProps {
  materials: Material[];
  suppliers: Supplier[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  currentRole: UserRole;
  onAddProcurement: (p: Omit<ProcurementRecord, 'id'>) => void;
  onAddEnergy: (e: Omit<EnergyRecord, 'id'>) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ materials, suppliers, procurement, energy, currentRole, onAddProcurement, onAddEnergy }) => {
  const initialTab = currentRole === UserRole.PROCUREMENT_MANAGER ? 'procurement' : 'energy';
  const [tab, setTab] = useState<'procurement' | 'energy'>(initialTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [pFormData, setPFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    materialId: '', supplierId: '', quantity: 0, totalCost: 0
  });

  const [eFormData, setEFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Electricity' as EnergyRecord['source'],
    amount: 0, unit: 'kWh', carbonEquivalent: 0
  });

  const handlePSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProcurement(pFormData);
    setPFormData({ ...pFormData, materialId: '', supplierId: '', quantity: 0, totalCost: 0 });
    setSuccessMsg("Procurement Logged!"); setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleESubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const factors = { 'Electricity': 0.41, 'Natural Gas': 0.2, 'Solar': 0, 'Diesel': 2.68 };
    const carbon = eFormData.amount * (factors[eFormData.source] || 0);
    onAddEnergy({ ...eFormData, carbonEquivalent: carbon });
    setEFormData({ ...eFormData, amount: 0 });
    setSuccessMsg("Energy Usage Logged!"); setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Data Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">Record operational transactions and utility logs.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2 animate-in slide-in-from-right shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden self-start">
          <div className="flex bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-1.5">
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.PROCUREMENT_MANAGER) && (
              <button 
                onClick={() => setTab('procurement')} 
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-3 ${tab === 'procurement' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <ShoppingBag className="w-5 h-5" /> Procurement
              </button>
            )}
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUSTAINABILITY_MANAGER) && (
              <button 
                onClick={() => setTab('energy')} 
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-3 ${tab === 'energy' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
              >
                <Zap className="w-5 h-5" /> Energy Usage
              </button>
            )}
          </div>
          <div className="p-8">
            {tab === 'procurement' ? (
              <form onSubmit={handlePSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Log Date
                    </label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.date} onChange={e => setPFormData({...pFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Quantity
                    </label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.quantity || ''} onChange={e => setPFormData({...pFormData, quantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Selected Material
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none cursor-pointer" value={pFormData.materialId} onChange={e => setPFormData({...pFormData, materialId: e.target.value})}>
                    <option value="">Choose item...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" /> Vendor Selection
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none cursor-pointer" value={pFormData.supplierId} onChange={e => setPFormData({...pFormData, supplierId: e.target.value})}>
                    <option value="">Choose supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Total Transaction Value ($)
                  </label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.totalCost || ''} onChange={e => setPFormData({...pFormData, totalCost: Number(e.target.value)})} />
                </div>

                {/* Live Carbon Preview */}
                {pFormData.materialId && pFormData.quantity > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                          <Leaf className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Live Impact Preview</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {(pFormData.quantity * (materials.find(m => m.id === pFormData.materialId)?.carbonFactor || 0)).toFixed(2)} kg CO2e
                        </div>
                        <div className="text-[10px] font-bold text-emerald-500/60 uppercase">Estimated Carbon Footprint</div>
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 mt-4 hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <PlusCircle className="w-5 h-5" /> Add to Procurement Ledger
                </button>
              </form>
            ) : (
              <form onSubmit={handleESubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Log Date
                    </label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={eFormData.date} onChange={e => setEFormData({...eFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Meter Reading
                    </label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={eFormData.amount || ''} onChange={e => setEFormData({...eFormData, amount: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Energy Source
                  </label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold appearance-none cursor-pointer" value={eFormData.source} onChange={e => setEFormData({...eFormData, source: e.target.value as any})}>
                    <option value="Electricity">Grid Electricity</option>
                    <option value="Solar">Solar Photovoltaic</option>
                    <option value="Natural Gas">Methane / Natural Gas</option>
                    <option value="Diesel">Backup Diesel</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20 mt-4 hover:bg-amber-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                  <PlusCircle className="w-5 h-5" /> Add to Environmental Log
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm h-fit">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <History className="w-6 h-6 text-emerald-500" /> Transaction History
          </h3>
          <div className="overflow-hidden">
            <table className="w-full text-left text-base">
              <thead className="text-xs uppercase text-slate-400 dark:text-slate-500 font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-5">Timestamp</th>
                  <th className="py-5 px-5">Subject</th>
                  <th className="py-5 text-right">Metrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {tab === 'procurement' ? procurement.slice(0, 10).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-5 text-slate-400 font-bold text-sm">{p.date}</td>
                    <td className="py-5 px-5 font-black text-slate-700 dark:text-slate-300">{materials.find(m => m.id === p.materialId)?.name}</td>
                    <td className="py-5 text-right text-emerald-600 dark:text-emerald-400 font-black tracking-tight text-lg">${p.totalCost.toLocaleString()}</td>
                  </tr>
                )) : energy.slice(0, 10).map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-5 text-slate-400 font-bold text-sm">{e.date}</td>
                    <td className="py-5 px-5 font-black text-slate-700 dark:text-slate-300">{e.source}</td>
                    <td className="py-5 text-right text-amber-600 dark:text-amber-400 font-black tracking-tight text-lg">{e.amount} {e.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
