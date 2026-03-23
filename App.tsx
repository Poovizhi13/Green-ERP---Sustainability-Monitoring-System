
import React, { useState, useEffect } from 'react';
import { UserRole, User, Supplier, Material, ProcurementRecord, EnergyRecord } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import MasterData from './views/MasterData';
import DataManagement from './views/DataManagement';
import RecommendationEngine from './views/RecommendationEngine';
import AIAdvisor from './views/AIAdvisor';
import SupplyChainMap from './views/SupplyChainMap';
import CarbonForecasting from './views/CarbonForecasting';
import ScenarioSimulation from './views/ScenarioSimulation';
import Settings from './views/Settings';
import { api } from './api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('erp-theme') as 'light' | 'dark') || 'dark';
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [procurement, setProcurement] = useState<ProcurementRecord[]>([]);
  const [energy, setEnergy] = useState<EnergyRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'info' | 'error'}[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadAllData();
  }, []);

  const addNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const loadAllData = async () => {
    setIsSyncing(true);
    try {
      const [u, s, m, p, e] = await Promise.all([
        api.getUsers(),
        api.getSuppliers(),
        api.getMaterials(),
        api.getProcurement(),
        api.getEnergy()
      ]);
      setUsers(u);
      setSuppliers(s);
      setMaterials(m);
      setProcurement(p);
      setEnergy(e);
    } catch (err) {
      console.error("Failed to sync with database", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSyncing(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const username = (formData.get('username') as string).trim();
    const role = formData.get('role') as UserRole;

    if (!username) {
      setLoginError("Username is required.");
      setIsSyncing(false);
      return;
    }

    const userExists = await api.checkUserExists(username);
    if (!userExists) {
      setLoginError(`User "${username}" not found.`);
      setIsSyncing(false);
      return;
    }

    const user = await api.login(username, role);
    if (user) {
      setCurrentUser(user);
      addNotification(`Welcome back, ${username}!`, 'success');
      loadAllData();
    } else {
      setLoginError(`Invalid role for "${username}".`);
    }
    setIsSyncing(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError(null);
    setActiveTab('dashboard');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleDownloadReport = () => {
    setIsGeneratingReport(true);
    
    const energyCarbon = energy.reduce((sum, e) => sum + e.carbonEquivalent, 0);
    const materialCarbon = procurement.reduce((sum, p) => {
      const mat = materials.find(m => m.id === p.materialId);
      return sum + (p.quantity * (mat?.carbonFactor || 0));
    }, 0);
    const totalCarbon = energyCarbon + materialCarbon;
    const avgScore = suppliers.length > 0 ? (suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / suppliers.length).toFixed(1) : 0;

    const reportContent = `
=========================================
GREEN ERP - SUSTAINABILITY EXECUTIVE REPORT
=========================================
Generated on: ${new Date().toLocaleString()}
System User: ${currentUser?.username} (Role: ${currentUser?.role})

1. ENVIRONMENTAL KPI SUMMARY
---------------------------
Total Carbon Footprint: ${totalCarbon.toFixed(2)} kg CO2
   - Energy Scope: ${energyCarbon.toFixed(2)} kg CO2
   - Procurement Scope: ${materialCarbon.toFixed(2)} kg CO2
Avg. Recyclability Rate: ${(procurement.length > 0 ? 75 : 0)}%

2. SUPPLY CHAIN ESG PERFORMANCE
---------------------------
Average Supplier Score: ${avgScore} / 100
Total Suppliers Registered: ${suppliers.length}
Top Rated Supplier: ${suppliers.sort((a,b) => b.sustainabilityScore - a.sustainabilityScore)[0]?.name || 'N/A'}

3. PROCUREMENT INSIGHTS
---------------------------
Total Materials Procured: ${procurement.length} transactions
Total Financial Spend: $${procurement.reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}

4. SYSTEM RECOMMENDATIONS
---------------------------
- Transition to higher-rated ESG suppliers where score is < 60%.
- Review energy consumption during peak procurement cycles.
- Prioritize materials with Carbon Factor < 1.0.

End of Report.
=========================================
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sustainability_Report_${new Date().toISOString().split('T')[0]}.txt`);
    
    setTimeout(() => {
      link.click();
      URL.revokeObjectURL(url);
      setIsGeneratingReport(false);
    }, 1500);
  };

  const addProcurement = async (p: Omit<ProcurementRecord, 'id'>) => {
    const newRecord = { ...p, id: `p-${Date.now()}` };
    await api.addProcurement(newRecord);
    setProcurement(prev => [newRecord, ...prev]);
    addNotification('Procurement record logged successfully', 'success');
  };

  const addEnergy = async (e: Omit<EnergyRecord, 'id'>) => {
    const newRecord = { ...e, id: `e-${Date.now()}` };
    await api.addEnergy(newRecord);
    setEnergy(prev => [newRecord, ...prev]);
    addNotification('Energy consumption recorded', 'success');
  };

  const manageSupplier = async (supplier: Supplier, mode: 'add' | 'edit' | 'delete') => {
    if (mode === 'delete') {
      await api.deleteSupplier(supplier.id);
      setSuppliers(prev => prev.filter(s => s.id !== supplier.id));
    } else {
      await api.saveSupplier(supplier, mode);
      if (mode === 'add') setSuppliers(prev => [...prev, supplier]);
      else setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    }
  };

  const manageMaterial = async (material: Material, mode: 'add' | 'edit' | 'delete') => {
    if (mode === 'delete') {
      await api.deleteMaterial(material.id);
      setMaterials(prev => prev.filter(m => m.id !== material.id));
    } else {
      await api.saveMaterial(material, mode);
      if (mode === 'add') setMaterials(prev => [...prev, material]);
      else setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const username = (formData.get('username') as string).trim();
    const role = formData.get('role') as UserRole;

    if (!username) return alert("User name is required.");
    if (await api.checkUserExists(username)) return alert("Username taken.");

    const newUser: User = { id: `u-${Date.now()}`, username, role };
    await api.createUser(newUser);
    setUsers(prev => [...prev, newUser]);
    setShowUserModal(false);
  };

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) return alert("Cannot delete yourself.");
    if (confirm(`Remove "${user.username}"?`)) {
      await api.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} currentUser={currentUser} theme={theme} setActiveTab={setActiveTab} />;
      case 'ai-advisor':
        return <AIAdvisor suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} currentUser={currentUser} />;
      case 'carbon-forecast':
        return <CarbonForecasting procurement={procurement} energy={energy} materials={materials} />;
      case 'scenario-simulation':
        return <ScenarioSimulation procurement={procurement} energy={energy} materials={materials} suppliers={suppliers} />;
      case 'supply-chain-map':
        return <SupplyChainMap suppliers={suppliers} />;
      case 'master-data':
        return <MasterData suppliers={suppliers} materials={materials} onSupplierAction={manageSupplier} onMaterialAction={manageMaterial} />;
      case 'data-management':
        return <DataManagement materials={materials} suppliers={suppliers} procurement={procurement} energy={energy} currentRole={currentUser.role} onAddProcurement={addProcurement} onAddEnergy={addEnergy} />;
      case 'recommendations':
        return <RecommendationEngine suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} />;
      case 'reports':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-file-pdf text-emerald-500"></i>
                Executive Reporting
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Generate and export comprehensive sustainability compliance reports.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <i className="fa-solid fa-gear text-emerald-500 text-xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Report Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Report Type</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>Sustainability Executive Summary</option>
                      <option>Scope 3 Supply Chain Audit</option>
                      <option>Energy Efficiency Analysis</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500">Last 30 Days</div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500">Current Q4</div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleDownloadReport} 
                  disabled={isGeneratingReport} 
                  className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3"
                >
                  {isGeneratingReport ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-download"></i>}
                  {isGeneratingReport ? 'Compiling Data...' : 'Generate & Download'}
                </button>
              </div>

              <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all"></div>
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-eye"></i>
                  Live Preview
                </h4>
                <div className="flex-1 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 font-mono text-[10px] leading-relaxed text-slate-400 overflow-hidden">
                  <p className="text-emerald-400 mb-2">GREEN ERP SUSTAINABILITY REPORT</p>
                  <p>-----------------------------------------</p>
                  <p>TIMESTAMP: {new Date().toISOString()}</p>
                  <p>USER: {currentUser.username}</p>
                  <p className="mt-4 text-white">KPI SUMMARY:</p>
                  <p>TOTAL CARBON: {((energy.reduce((s,e)=>s+e.carbonEquivalent,0) + procurement.reduce((s,p)=>s+(p.quantity*(materials.find(m=>m.id===p.materialId)?.carbonFactor||0)),0))).toFixed(2)} kg</p>
                  <p>ESG RATING: {suppliers.length > 0 ? (suppliers.reduce((s,v)=>s+v.sustainabilityScore,0)/suppliers.length).toFixed(1) : 0}%</p>
                  <p className="mt-4">... [DATA TRUNCATED FOR PREVIEW]</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-6 font-medium italic">Reports are generated in .txt format for maximum compatibility with enterprise audit systems.</p>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Personnel</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage access for system users.</p>
                </div>
                <button onClick={() => setShowUserModal(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg">Add User</button>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
               {users.map(u => (
                 <div key={u.id} className="py-4 flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">{u.username.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.username}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase">{u.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteUser(u)} className="text-slate-400 hover:text-rose-500 p-2 transition-colors"><i className="fa-solid fa-trash"></i></button>
                 </div>
               ))}
             </div>
             {showUserModal && (
               <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                 <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
                    <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create System User</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">User Name</label>
                        <input name="username" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 placeholder-slate-400" placeholder="e.g. Rahul" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">System Role</label>
                        <select name="role" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                          <option value={UserRole.PROCUREMENT_MANAGER}>Procurement Manager</option>
                          <option value={UserRole.SUSTAINABILITY_MANAGER}>Sustainability Manager</option>
                          <option value={UserRole.ADMIN}>Administrator</option>
                        </select>
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                        <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-500 shadow-lg">Create User</button>
                      </div>
                    </form>
                 </div>
               </div>
             )}
          </div>
        );
      case 'settings':
        return <Settings currentUser={currentUser} theme={theme} onToggleTheme={toggleTheme} />;
      default: return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              <i className="fa-solid fa-leaf"></i>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Green ERP</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Sustainability Decision Support</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <input 
                name="username"
                type="text" 
                disabled={isSyncing}
                className={`w-full bg-slate-50 dark:bg-slate-800 border p-4 rounded-xl outline-none transition-all font-medium text-slate-900 dark:text-white placeholder-slate-400 ${loginError ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'}`}
                placeholder="Enter registered name"
              />
              {loginError && <p className="text-rose-500 text-xs font-bold ml-1 animate-pulse"><i className="fa-solid fa-circle-exclamation mr-1"></i> {loginError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Select Role</label>
              <select name="role" disabled={isSyncing} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl outline-none font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value={UserRole.ADMIN}>Administrator</option>
                <option value={UserRole.PROCUREMENT_MANAGER}>Procurement Manager</option>
                <option value={UserRole.SUSTAINABILITY_MANAGER}>Sustainability Manager</option>
              </select>
            </div>

            <button type="submit" disabled={isSyncing} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {isSyncing ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Sign In'} <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
          
          <div className="mt-8 flex justify-center">
            <button onClick={toggleTheme} className="text-slate-400 hover:text-emerald-500 text-sm font-bold flex items-center gap-2">
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Notifications Portal */}
      <div className="fixed top-6 right-6 z-[300] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
              n.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
              n.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <i className={`fa-solid ${n.type === 'success' ? 'fa-check-circle' : n.type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle'}`}></i>
            <span className="text-sm font-bold">{n.message}</span>
          </div>
        ))}
      </div>

      {isSyncing && (
        <div className="fixed top-0 left-0 w-full h-1 z-[200]">
          <div className="h-full bg-emerald-500 animate-pulse"></div>
        </div>
      )}
      <Sidebar 
        currentRole={currentUser.role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="pl-64 min-h-screen">
        <div className="p-10 max-w-[1400px] mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
