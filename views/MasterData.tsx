
import React, { useState, useEffect } from 'react';
import { Supplier, Material } from '../types';

interface MasterDataProps {
  suppliers: Supplier[];
  materials: Material[];
  onSupplierAction: (s: Supplier, mode: 'add' | 'edit' | 'delete') => void;
  onMaterialAction: (m: Material, mode: 'add' | 'edit' | 'delete') => void;
}

const MasterData: React.FC<MasterDataProps> = ({ suppliers, materials, onSupplierAction, onMaterialAction }) => {
  const [activeSubTab, setActiveSubTab] = useState<'suppliers' | 'materials'>('suppliers');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formFields, setFormFields] = useState<any>({});

  useEffect(() => {
    if (showModal) {
      if (editingItem) {
        setFormFields({
          name: editingItem.name || '',
          category: editingItem.category || '',
          score: editingItem.sustainabilityScore ?? '',
          unit: editingItem.unit || 'kg',
          carbon: editingItem.carbonFactor ?? '',
          recyclability: editingItem.recyclabilityRate ?? '',
          price: editingItem.averagePrice ?? ''
        });
      } else {
        setFormFields({
          name: '', category: '', score: '', unit: 'kg', carbon: '', recyclability: '', price: ''
        });
      }
    }
  }, [showModal, editingItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const mode = editingItem ? 'edit' : 'add';
    if (activeSubTab === 'suppliers') {
      onSupplierAction({
        id: editingItem?.id || `s-${Date.now()}`,
        name: formFields.name,
        category: formFields.category,
        sustainabilityScore: Number(formFields.score),
        carbonEfficiency: editingItem?.carbonEfficiency || 0,
        certifications: []
      }, mode);
    } else {
      onMaterialAction({
        id: editingItem?.id || `m-${Date.now()}`,
        name: formFields.name,
        category: formFields.category,
        unit: formFields.unit,
        carbonFactor: Number(formFields.carbon),
        recyclabilityRate: Number(formFields.recyclability),
        averagePrice: Number(formFields.price)
      }, mode);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Master Data</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Core database of enterprise resources and vendors.</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <i className="fa-solid fa-plus-circle"></i> Create Entry
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-1">
          <button onClick={() => setActiveSubTab('suppliers')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${activeSubTab === 'suppliers' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
            <i className="fa-solid fa-truck-field mr-2"></i> Suppliers
          </button>
          <button onClick={() => setActiveSubTab('materials')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${activeSubTab === 'materials' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
            <i className="fa-solid fa-box-open mr-2"></i> Materials
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeSubTab === 'suppliers' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr><th className="px-8 py-5">Company Name</th><th className="px-8 py-5">Category</th><th className="px-8 py-5 text-center">ESG Score</th><th className="px-8 py-5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-sm">{s.category}</td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs ${s.sustainabilityScore > 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/10' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/10'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${s.sustainabilityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        {s.sustainabilityScore}%
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => { setEditingItem(s); setShowModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onSupplierAction(s, 'delete')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr><th className="px-8 py-5">Material Name</th><th className="px-8 py-5">CO2 Factor</th><th className="px-8 py-5 text-center">Recyclable</th><th className="px-8 py-5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5"><div className="font-bold text-slate-900 dark:text-white">{m.name}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{m.category}</div></td>
                    <td className="px-8 py-5 font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">{m.carbonFactor} kg/unit</td>
                    <td className="px-8 py-5 text-center text-slate-900 dark:text-white font-black text-sm">{m.recyclabilityRate}%</td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => { setEditingItem(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onMaterialAction(m, 'delete')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[32px] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
            <h3 className="text-3xl font-black mb-8 text-slate-900 dark:text-white tracking-tight">{editingItem ? 'Update' : 'Register'} {activeSubTab === 'suppliers' ? 'Supplier' : 'Material'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Formal Name</label>
                  <input name="name" value={formFields.name} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold placeholder-slate-400" placeholder="e.g. Acme Eco-Materials" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Business Category</label>
                  <input name="category" value={formFields.category} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                </div>
                {activeSubTab === 'suppliers' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sustainability Score (%)</label>
                    <input name="score" type="number" value={formFields.score} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">CO2 per Unit</label>
                      <input name="carbon" type="number" step="0.01" value={formFields.carbon} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recyclable Content %</label>
                      <input name="recyclability" type="number" value={formFields.recyclability} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-12">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all">Commit to DB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
