import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  MapPin, 
  ShieldCheck,
  Leaf,
  DollarSign,
  Layers,
  Zap,
  RefreshCw
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (showModal) {
      if (editingItem) {
        setFormFields({
          name: editingItem.name || '',
          category: editingItem.category || '',
          score: editingItem.sustainabilityScore ?? '',
          location: editingItem.location || '',
          unit: editingItem.unit || 'kg',
          carbon: editingItem.carbonFactor ?? '',
          recyclability: editingItem.recyclabilityRate ?? '',
          price: editingItem.averagePrice ?? ''
        });
      } else {
        setFormFields({
          name: '', category: '', score: '', location: '', unit: 'kg', carbon: '', recyclability: '', price: ''
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
        location: formFields.location,
        carbonEfficiency: editingItem?.carbonEfficiency || 0,
        certifications: editingItem?.certifications || [],
        coordinates: editingItem?.coordinates
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

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Master Data</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">Core database of enterprise resources and vendors.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setShowModal(true); }} 
          className="bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 dark:shadow-emerald-500/20 flex items-center gap-2 text-[10px] uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Create Entry
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 gap-4">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <button 
              onClick={() => setActiveSubTab('suppliers')} 
              className={`flex-1 md:flex-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${activeSubTab === 'suppliers' ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Truck className="w-3.5 h-3.5" /> Suppliers
            </button>
            <button 
              onClick={() => setActiveSubTab('materials')} 
              className={`flex-1 md:flex-none px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 ${activeSubTab === 'materials' ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <Package className="w-3.5 h-3.5" /> Materials
            </button>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeSubTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeSubTab === 'suppliers' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-4">Company Name</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4 text-center">ESG Score</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSuppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <MapPin className="w-2.5 h-2.5" /> {s.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs ${s.sustainabilityScore > 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/10' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/10'}`}>
                        <ShieldCheck className={`w-3.5 h-3.5 ${s.sustainabilityScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
                        {s.sustainabilityScore}%
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(s); setShowModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onSupplierAction(s, 'delete')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-4">Material Name</th>
                  <th className="px-8 py-4">CO2 Factor</th>
                  <th className="px-8 py-4 text-center">Recyclable</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMaterials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <Leaf className="w-3.5 h-3.5" />
                        {m.carbonFactor} kg/unit
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className="text-slate-900 dark:text-white font-bold text-sm">{m.recyclabilityRate}%</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem(m); setShowModal(true); }} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onMaterialAction(m, 'delete')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {editingItem ? 'Update' : 'Register'} {activeSubTab === 'suppliers' ? 'Supplier' : 'Material'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Formal Name</label>
                  <input name="name" value={formFields.name} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" placeholder="e.g. Acme Eco-Materials" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Business Category
                  </label>
                  <input name="category" value={formFields.category} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" />
                </div>
                {activeSubTab === 'suppliers' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Global Location
                    </label>
                    <input name="location" value={formFields.location} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" placeholder="e.g. London, UK" />
                  </div>
                )}
                {activeSubTab === 'suppliers' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> Sustainability Score (%)
                    </label>
                    <input name="score" type="number" value={formFields.score} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Leaf className="w-3 h-3" /> CO2 per Unit
                      </label>
                      <input name="carbon" type="number" step="0.01" value={formFields.carbon} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3" /> Recyclable Content %
                      </label>
                      <input name="recyclability" type="number" value={formFields.recyclability} onChange={handleInputChange} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all">Commit to DB</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
