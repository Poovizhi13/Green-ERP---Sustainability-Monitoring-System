
import React, { useState, useEffect } from 'react';
import { UserRole, User, Supplier, Material, ProcurementRecord, EnergyRecord } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import MasterData from './views/MasterData';
import DataManagement from './views/DataManagement';
import RecommendationEngine from './views/RecommendationEngine';
import AIAdvisor from './views/AIAdvisor';
import Settings from './views/Settings';
import Reports from './views/Reports';
import Users from './views/Users';
import { api } from './api';
import { 
  Leaf, 
  ArrowRight, 
  Sun, 
  Moon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
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

  const handleUpdateUser = async (updatedUser: User) => {
    await api.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    addNotification('Profile updated successfully', 'success');
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
      addNotification('Report generated successfully', 'success');
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
      addNotification('Supplier removed', 'info');
    } else {
      await api.saveSupplier(supplier, mode);
      if (mode === 'add') {
        setSuppliers(prev => [...prev, supplier]);
        addNotification('Supplier added', 'success');
      } else {
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
        addNotification('Supplier updated', 'success');
      }
    }
  };

  const manageMaterial = async (material: Material, mode: 'add' | 'edit' | 'delete') => {
    if (mode === 'delete') {
      await api.deleteMaterial(material.id);
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      addNotification('Material removed', 'info');
    } else {
      await api.saveMaterial(material, mode);
      if (mode === 'add') {
        setMaterials(prev => [...prev, material]);
        addNotification('Material added', 'success');
      } else {
        setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
        addNotification('Material updated', 'success');
      }
    }
  };

  const handleCreateUser = async (username: string, role: UserRole) => {
    if (await api.checkUserExists(username)) {
      addNotification('Username already taken', 'error');
      return;
    }

    const newUser: User = { id: `u-${Date.now()}`, username, role };
    await api.createUser(newUser);
    setUsers(prev => [...prev, newUser]);
    addNotification('System user created', 'success');
  };

  const deleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      addNotification('Cannot delete your own account', 'error');
      return;
    }
    await api.deleteUser(user.id);
    setUsers(prev => prev.filter(u => u.id !== user.id));
    addNotification('User access revoked', 'info');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} currentUser={currentUser} theme={theme} setActiveTab={setActiveTab} />;
      case 'ai-advisor':
        return <AIAdvisor suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} currentUser={currentUser} />;
      case 'master-data':
        return <MasterData suppliers={suppliers} materials={materials} onSupplierAction={manageSupplier} onMaterialAction={manageMaterial} />;
      case 'data-management':
        return <DataManagement materials={materials} suppliers={suppliers} procurement={procurement} energy={energy} currentRole={currentUser.role} onAddProcurement={addProcurement} onAddEnergy={addEnergy} />;
      case 'recommendations':
        return <RecommendationEngine suppliers={suppliers} materials={materials} procurement={procurement} energy={energy} />;
      case 'reports':
        return (
          <Reports 
            suppliers={suppliers} 
            materials={materials} 
            procurement={procurement} 
            energy={energy} 
            currentUser={currentUser} 
            onDownloadReport={handleDownloadReport}
            isGeneratingReport={isGeneratingReport}
          />
        );
      case 'users':
        return (
          <Users 
            users={users} 
            currentUser={currentUser} 
            onDeleteUser={deleteUser} 
            onCreateUser={handleCreateUser} 
          />
        );
      case 'settings':
        return <Settings currentUser={currentUser} theme={theme} onToggleTheme={toggleTheme} onUpdateUser={handleUpdateUser} />;
      default: return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500 font-sans">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Green ERP</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-bold uppercase tracking-widest text-[9px]">Strategic Sustainability Suite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity</label>
              <input 
                name="username"
                type="text" 
                disabled={isSyncing}
                className={`w-full bg-slate-50 dark:bg-slate-800 border p-4 rounded-xl outline-none transition-all font-semibold text-sm text-slate-900 dark:text-white placeholder-slate-400 ${loginError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500'}`}
                placeholder="Enter registered username"
              />
              {loginError && <p className="text-rose-500 text-[10px] font-bold ml-1 flex items-center gap-1.5 mt-2"><AlertCircle className="w-3 h-3" /> {loginError}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Access Level</label>
              <select name="role" disabled={isSyncing} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl outline-none font-semibold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all">
                <option value={UserRole.ADMIN}>Administrator</option>
                <option value={UserRole.PROCUREMENT_MANAGER}>Procurement Manager</option>
                <option value={UserRole.SUSTAINABILITY_MANAGER}>Sustainability Manager</option>
              </select>
            </div>

            <button type="submit" disabled={isSyncing} className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]">
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isSyncing ? 'Authenticating...' : 'Access Terminal'}
              {!isSyncing && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          
          <div className="mt-10 flex justify-center border-t border-slate-100 dark:border-slate-800 pt-8">
            <button onClick={toggleTheme} className="text-slate-400 hover:text-emerald-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Notifications Portal */}
      <div className="fixed top-8 right-8 z-[300] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-300 ${
              n.type === 'success' ? 'bg-emerald-600/90 border-emerald-500 text-white' : 
              n.type === 'error' ? 'bg-rose-600/90 border-rose-500 text-white' : 
              'bg-slate-900/90 border-slate-800 text-white'
            }`}
          >
            {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : n.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{n.message}</span>
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
      <main className="pl-64 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
        <div className="p-8 max-w-[1400px] mx-auto min-h-full flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
