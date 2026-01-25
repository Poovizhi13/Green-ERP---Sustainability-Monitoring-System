
import React, { useState } from 'react';
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Data Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Record operational transactions and utility logs.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-5 py-3 rounded-2xl border border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-right shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl overflow-hidden self-start">
          <div className="flex bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-1">
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.PROCUREMENT_MANAGER) && (
              <button onClick={() => setTab('procurement')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-3 ${tab === 'procurement' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                <i className="fa-solid fa-shopping-bag text-lg"></i> Procurement
              </button>
            )}
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUSTAINABILITY_MANAGER) && (
              <button onClick={() => setTab('energy')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl flex items-center justify-center gap-3 ${tab === 'energy' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                <i className="fa-solid fa-bolt-lightning text-lg"></i> Energy Usage
              </button>
            )}
          </div>
          <div className="p-10">
            {tab === 'procurement' ? (
              <form onSubmit={handlePSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Log Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.date} onChange={e => setPFormData({...pFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Quantity</label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.quantity || ''} onChange={e => setPFormData({...pFormData, quantity: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Selected Material</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none cursor-pointer" value={pFormData.materialId} onChange={e => setPFormData({...pFormData, materialId: e.target.value})}>
                    <option value="">Choose item...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Vendor Selection</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none cursor-pointer" value={pFormData.supplierId} onChange={e => setPFormData({...pFormData, supplierId: e.target.value})}>
                    <option value="">Choose supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Total Transaction Value ($)</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={pFormData.totalCost || ''} onChange={e => setPFormData({...pFormData, totalCost: Number(e.target.value)})} />
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 mt-4 hover:bg-emerald-500 transition-all active:scale-[0.98]">Add to Procurement Ledger</button>
              </form>
            ) : (
              <form onSubmit={handleESubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Log Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={eFormData.date} onChange={e => setEFormData({...eFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Meter Reading</label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold" value={eFormData.amount || ''} onChange={e => setEFormData({...eFormData, amount: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Energy Source</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold appearance-none cursor-pointer" value={eFormData.source} onChange={e => setEFormData({...eFormData, source: e.target.value as any})}>
                    <option value="Electricity">Grid Electricity</option><option value="Solar">Solar Photovoltaic</option><option value="Natural Gas">Methane / Natural Gas</option><option value="Diesel">Backup Diesel</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20 mt-4 hover:bg-amber-500 transition-all active:scale-[0.98]">Add to Environmental Log</button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-xl h-fit">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
            <i className="fa-solid fa-clock-rotate-left text-emerald-500"></i> Transaction History
          </h3>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-black border-b border-slate-100 dark:border-slate-800">
                <tr><th className="py-4">Timestamp</th><th className="py-4 px-4">Subject</th><th className="py-4 text-right">Metrics</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {tab === 'procurement' ? procurement.slice(0, 10).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 text-slate-400 font-bold text-xs">{p.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">{materials.find(m => m.id === p.materialId)?.name}</td>
                    <td className="py-4 text-right text-emerald-600 dark:text-emerald-400 font-black tracking-tight">${p.totalCost}</td>
                  </tr>
                )) : energy.slice(0, 10).map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 text-slate-400 font-bold text-xs">{e.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">{e.source}</td>
                    <td className="py-4 text-right text-amber-600 dark:text-amber-400 font-black tracking-tight">{e.amount} {e.unit}</td>
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
