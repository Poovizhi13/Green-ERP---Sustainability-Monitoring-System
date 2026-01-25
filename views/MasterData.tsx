
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
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Real-time validation states
  const [formFields, setFormFields] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form fields when opening modal or changing tab
  useEffect(() => {
    if (showModal) {
      if (editingItem) {
        setFormFields({
          name: editingItem.name || '',
          category: editingItem.category || '',
          score: editingItem.sustainabilityScore ?? '',
          certs: editingItem.certifications?.join(', ') || '',
          unit: editingItem.unit || 'kg',
          carbon: editingItem.carbonFactor ?? '',
          recyclability: editingItem.recyclabilityRate ?? '',
          price: editingItem.averagePrice ?? ''
        });
      } else {
        setFormFields({
          name: '',
          category: '',
          score: '',
          certs: '',
          unit: 'kg',
          carbon: '',
          recyclability: '',
          price: ''
        });
      }
      setErrors({});
    }
  }, [showModal, editingItem, activeSubTab]);

  const validateField = (name: string, value: any) => {
    let error = '';
    const stringVal = String(value).trim();

    if (name === 'name') {
      if (!stringVal) error = activeSubTab === 'suppliers' ? "Supplier name cannot be empty." : "Material name is required.";
      else if (stringVal.length < 3) error = "Name must be at least 3 characters long.";
    }

    if (name === 'category') {
      if (!stringVal) error = "Category is required for business classification.";
    }

    if (activeSubTab === 'suppliers') {
      if (name === 'score') {
        const num = Number(value);
        if (stringVal === '') error = "Sustainability score is required.";
        else if (isNaN(num) || num < 0 || num > 100) error = "Score must be a numeric value between 0 and 100.";
      }
    } else {
      if (name === 'carbon') {
        const num = Number(value);
        if (stringVal === '') error = "Carbon factor is required.";
        else if (isNaN(num) || num < 0) error = "Carbon factor must be a non-negative value (kg CO2/unit).";
      }
      if (name === 'recyclability') {
        const num = Number(value);
        if (stringVal === '') error = "Recyclability percentage is required.";
        else if (isNaN(num) || num < 0 || num > 100) error = "Recyclability must be a percentage between 0% and 100%.";
      }
      if (name === 'price') {
        const num = Number(value);
        if (stringVal === '') error = "Average price is required.";
        else if (isNaN(num) || num < 0) error = "Price must be a valid positive currency value.";
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      let csvContent = "";
      if (activeSubTab === 'suppliers') {
        const headers = ["ID", "Name", "Category", "Sustainability Score", "Certifications"];
        const rows = suppliers.map(s => [s.id, s.name, s.category, s.sustainabilityScore, s.certifications.join(" | ")]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      } else {
        const headers = ["ID", "Name", "Category", "CO2 Factor", "Recyclability Rate", "Price/Unit"];
        const rows = materials.map(m => [m.id, m.name, m.category, m.carbonFactor, m.recyclabilityRate, m.averagePrice]);
        csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      }
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `master_data_${activeSubTab}.csv`;
      link.click();
      setIsExporting(false);
    }, 600);
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation check for all visible fields
    const currentErrors: Record<string, string> = {};
    const fieldsToValidate = ['name', 'category'];
    if (activeSubTab === 'suppliers') {
      fieldsToValidate.push('score');
    } else {
      fieldsToValidate.push('carbon', 'recyclability', 'price');
    }

    let hasErrors = false;
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formFields[field]);
      if (error) {
        currentErrors[field] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(currentErrors);
      return;
    }

    const mode = editingItem ? 'edit' : 'add';
    
    if (activeSubTab === 'suppliers') {
      const supplier: Supplier = {
        id: editingItem?.id || `s-${Date.now()}`,
        name: formFields.name,
        category: formFields.category,
        sustainabilityScore: Number(formFields.score),
        carbonEfficiency: editingItem?.carbonEfficiency || 0,
        certifications: formFields.certs.split(',').map((c: string) => c.trim()).filter((c: string) => c)
      };
      onSupplierAction(supplier, mode);
    } else {
      const material: Material = {
        id: editingItem?.id || `m-${Date.now()}`,
        name: formFields.name,
        category: formFields.category,
        unit: formFields.unit,
        carbonFactor: Number(formFields.carbon),
        recyclabilityRate: Number(formFields.recyclability),
        averagePrice: Number(formFields.price)
      };
      onMaterialAction(material, mode);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Master Data</h2>
          <p className="text-slate-500 mt-1">Configure foundational business entities.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportData} disabled={isExporting} className="bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold border hover:bg-slate-50 transition-all flex items-center gap-2">
            <i className={`fa-solid ${isExporting ? 'fa-spinner animate-spin' : 'fa-file-export'}`}></i> Export
          </button>
          <button onClick={() => openModal()} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
            <i className="fa-solid fa-plus mr-2"></i> Create New
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button onClick={() => setActiveSubTab('suppliers')} className={`px-8 py-4 text-sm font-bold transition-all relative ${activeSubTab === 'suppliers' ? 'text-emerald-600' : 'text-slate-500'}`}>
            Suppliers List {activeSubTab === 'suppliers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600"></div>}
          </button>
          <button onClick={() => setActiveSubTab('materials')} className={`px-8 py-4 text-sm font-bold transition-all relative ${activeSubTab === 'materials' ? 'text-emerald-600' : 'text-slate-500'}`}>
            Materials Catalog {activeSubTab === 'materials' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600"></div>}
          </button>
        </div>

        <div className="p-0">
          {activeSubTab === 'suppliers' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Category</th><th className="px-6 py-4 text-center">Score</th><th className="px-6 py-4">Certs</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {suppliers.length > 0 ? suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600">{s.category}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${s.sustainabilityScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.sustainabilityScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {s.certifications.slice(0, 2).map((c, i) => <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">{c}</span>)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(s)} className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onSupplierAction(s, 'delete')} className="text-slate-400 hover:text-rose-600"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} className="p-10 text-center text-slate-400">No suppliers found.</td></tr>}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">CO2 Factor</th><th className="px-6 py-4 text-center">Recyclable</th><th className="px-6 py-4">Price</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y text-sm">
                {materials.length > 0 ? materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><div className="font-bold text-slate-900">{m.name}</div><div className="text-xs text-slate-400">{m.category}</div></td>
                    <td className="px-6 py-4 font-mono text-slate-600">{m.carbonFactor}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{m.recyclabilityRate}%</td>
                    <td className="px-6 py-4 font-medium">${m.averagePrice}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openModal(m)} className="text-slate-400 hover:text-blue-600 mr-3"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onMaterialAction(m, 'delete')} className="text-slate-400 hover:text-rose-600"><i className="fa-solid fa-trash"></i></button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={5} className="p-10 text-center text-slate-400">No materials found.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6">{editingItem ? 'Edit' : 'Create'} {activeSubTab === 'suppliers' ? 'Supplier' : 'Material'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Name *</label>
                  <input 
                    name="name" 
                    value={formFields.name} 
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                    placeholder={activeSubTab === 'suppliers' ? "e.g. Eco-Dynamics Ltd" : "e.g. Recycled Aluminum"}
                  />
                  {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Category *</label>
                  <input 
                    name="category" 
                    value={formFields.category} 
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.category ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                    placeholder="e.g. Raw Materials"
                  />
                  {errors.category && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.category}</p>}
                </div>
                {activeSubTab === 'suppliers' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Sustainability Score (0-100) *</label>
                      <input 
                        name="score" 
                        type="number" 
                        value={formFields.score} 
                        onChange={handleInputChange}
                        className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.score ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                      {errors.score && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.score}</p>}
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Certifications (comma separated)</label>
                      <input 
                        name="certs" 
                        value={formFields.certs} 
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                        placeholder="e.g. ISO 14001, B-Corp" 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                      <input 
                        name="unit" 
                        value={formFields.unit} 
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Carbon Factor (kg CO2) *</label>
                      <input 
                        name="carbon" 
                        type="number" 
                        step="0.01" 
                        value={formFields.carbon} 
                        onChange={handleInputChange}
                        className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.carbon ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                      {errors.carbon && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.carbon}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Recyclability % *</label>
                      <input 
                        name="recyclability" 
                        type="number" 
                        value={formFields.recyclability} 
                        onChange={handleInputChange}
                        className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.recyclability ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                      {errors.recyclability && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.recyclability}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Price / Unit ($) *</label>
                      <input 
                        name="price" 
                        type="number" 
                        step="0.01" 
                        value={formFields.price} 
                        onChange={handleInputChange}
                        className={`w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-colors ${errors.price ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                      {errors.price && <p className="text-rose-500 text-[10px] font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.price}</p>}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-4 py-3 rounded-xl border font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition-all"
                >
                  {editingItem ? 'Update' : 'Create'} Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
