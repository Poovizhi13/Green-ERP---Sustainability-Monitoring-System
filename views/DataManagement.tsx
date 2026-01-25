
import React, { useState, useEffect } from 'react';
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
  // Set default tab based on role
  const initialTab = currentRole === UserRole.PROCUREMENT_MANAGER ? 'procurement' : 'energy';
  const [tab, setTab] = useState<'procurement' | 'energy'>(initialTab);
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pFormData, setPFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    materialId: '',
    supplierId: '',
    quantity: 0,
    totalCost: 0
  });

  const [eFormData, setEFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Electricity' as EnergyRecord['source'],
    amount: 0,
    unit: 'kWh',
    carbonEquivalent: 0
  });

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handlePSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!pFormData.materialId) newErrors.materialId = "Material selection is required";
    if (!pFormData.supplierId) newErrors.supplierId = "Supplier selection is required";
    if (pFormData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (pFormData.totalCost <= 0) newErrors.totalCost = "Total cost is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddProcurement(pFormData);
    setPFormData({ ...pFormData, materialId: '', supplierId: '', quantity: 0, totalCost: 0 });
    setErrors({});
    showSuccess("Procurement transaction logged!");
  };

  const handleESubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (eFormData.amount <= 0) newErrors.amount = "Usage amount is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const factors = { 'Electricity': 0.41, 'Natural Gas': 0.2, 'Solar': 0, 'Diesel': 2.68 };
    const carbon = eFormData.amount * (factors[eFormData.source] || 0);
    onAddEnergy({ ...eFormData, carbonEquivalent: carbon });
    setEFormData({ ...eFormData, amount: 0 });
    setErrors({});
    showSuccess("Energy consumption recorded!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Data Entry & Management</h2>
          <p className="text-slate-500 mt-1">Record transactions and monitor historical data inputs.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2 animate-bounce">
            <i className="fa-solid fa-check-circle"></i>
            <span className="text-sm font-bold">{successMsg}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-2xl border shadow-xl overflow-hidden self-start">
          <div className="flex bg-slate-50 border-b">
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.PROCUREMENT_MANAGER) && (
              <button onClick={() => { setTab('procurement'); setErrors({}); }} className={`flex-1 py-5 text-sm font-bold border-r transition-all ${tab === 'procurement' ? 'bg-white text-emerald-600 border-b-2 border-b-emerald-600' : 'text-slate-400'}`}>
                <i className="fa-solid fa-cart-shopping mr-2"></i> Procurement Log
              </button>
            )}
            {(currentRole === UserRole.ADMIN || currentRole === UserRole.SUSTAINABILITY_MANAGER) && (
              <button onClick={() => { setTab('energy'); setErrors({}); }} className={`flex-1 py-5 text-sm font-bold transition-all ${tab === 'energy' ? 'bg-white text-amber-600 border-b-2 border-b-amber-600' : 'text-slate-400'}`}>
                <i className="fa-solid fa-bolt mr-2"></i> Energy Usage
              </button>
            )}
          </div>
          <div className="p-8">
            {tab === 'procurement' ? (
              <form onSubmit={handlePSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date *</label>
                    <input type="date" className="w-full border border-slate-200 p-3 rounded-xl outline-none" value={pFormData.date} onChange={e => setPFormData({...pFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quantity *</label>
                    <input type="number" placeholder="0" className={`w-full border p-3 rounded-xl outline-none ${errors.quantity ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} value={pFormData.quantity || ''} onChange={e => setPFormData({...pFormData, quantity: Number(e.target.value)})} />
                    {errors.quantity && <p className="text-rose-500 text-[10px] font-bold">{errors.quantity}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Material *</label>
                  <select className={`w-full border p-3 rounded-xl outline-none ${errors.materialId ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} value={pFormData.materialId} onChange={e => setPFormData({...pFormData, materialId: e.target.value})}>
                    <option value="">Select Material...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  {errors.materialId && <p className="text-rose-500 text-[10px] font-bold">{errors.materialId}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Supplier *</label>
                  <select className={`w-full border p-3 rounded-xl outline-none ${errors.supplierId ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} value={pFormData.supplierId} onChange={e => setPFormData({...pFormData, supplierId: e.target.value})}>
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {errors.supplierId && <p className="text-rose-500 text-[10px] font-bold">{errors.supplierId}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Cost ($) *</label>
                  <input type="number" placeholder="0.00" className={`w-full border p-3 rounded-xl outline-none ${errors.totalCost ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} value={pFormData.totalCost || ''} onChange={e => setPFormData({...pFormData, totalCost: Number(e.target.value)})} />
                  {errors.totalCost && <p className="text-rose-500 text-[10px] font-bold">{errors.totalCost}</p>}
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg mt-4 hover:bg-emerald-700 transition-colors">Record Transaction</button>
              </form>
            ) : (
              <form onSubmit={handleESubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date *</label>
                    <input type="date" className="w-full border border-slate-200 p-3 rounded-xl" value={eFormData.date} onChange={e => setEFormData({...eFormData, date: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Consumption (kWh/L) *</label>
                    <input type="number" placeholder="0" className={`w-full border p-3 rounded-xl ${errors.amount ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} value={eFormData.amount || ''} onChange={e => setEFormData({...eFormData, amount: Number(e.target.value)})} />
                    {errors.amount && <p className="text-rose-500 text-[10px] font-bold">{errors.amount}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Source *</label>
                  <select className="w-full border border-slate-200 p-3 rounded-xl" value={eFormData.source} onChange={e => setEFormData({...eFormData, source: e.target.value as any})}>
                    <option value="Electricity">Electricity</option><option value="Solar">Solar</option><option value="Natural Gas">Natural Gas</option><option value="Diesel">Diesel</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-600 text-white py-4 rounded-xl font-bold shadow-lg mt-4 hover:bg-amber-700 transition-colors">Record Usage</button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Recent Logs</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">History</span>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase text-slate-400 font-bold border-b">
                  <tr><th className="py-2">Date</th><th className="py-2">Item/Source</th><th className="py-2 text-right">Value</th></tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {tab === 'procurement' ? 
                    procurement.slice(0, 8).map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 text-slate-500">{p.date}</td>
                        <td className="py-3 font-bold text-slate-800">{materials.find(m => m.id === p.materialId)?.name}</td>
                        <td className="py-3 text-right text-emerald-600 font-bold">${p.totalCost}</td>
                      </tr>
                    )) : 
                    energy.slice(0, 8).map(e => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-3 text-slate-500">{e.date}</td>
                        <td className="py-3 font-bold text-slate-800">{e.source}</td>
                        <td className="py-3 text-right text-amber-600 font-bold">{e.amount} {e.unit}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            {((tab === 'procurement' ? procurement : energy).length === 0) && (
              <div className="text-center py-20 flex flex-col items-center">
                <i className="fa-solid fa-folder-open text-slate-200 text-4xl mb-2"></i>
                <p className="text-slate-400 font-medium">No records found yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
