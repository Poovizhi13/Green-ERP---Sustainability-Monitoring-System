
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, setActiveTab, onLogout, theme, onToggleTheme }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'ai-advisor', label: 'AI Advisor', icon: 'fa-robot', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'carbon-forecast', label: 'Carbon Forecast', icon: 'fa-arrow-trend-up', roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'scenario-simulation', label: 'Scenario Simulator', icon: 'fa-vial-circle-check', roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'supply-chain-map', label: 'Supply Chain Map', icon: 'fa-earth-americas', roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'master-data', label: 'Master Data', icon: 'fa-database', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER] },
    { id: 'data-management', label: 'Data Input', icon: 'fa-file-import', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'recommendations', label: 'Smart Insights', icon: 'fa-lightbulb', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'reports', label: 'Reports', icon: 'fa-file-contract', roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'users', label: 'Users', icon: 'fa-users-cog', roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Settings', icon: 'fa-gear', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="w-64 bg-white dark:bg-slate-900 h-screen flex flex-col fixed left-0 top-0 text-slate-900 dark:text-white shadow-2xl border-r border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <i className="fa-solid fa-leaf"></i>
          <span>Green ERP</span>
        </h1>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-bold">Decision Support System</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">Workspace</p>
          <ul className="space-y-1">
            {filteredItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 font-bold' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5`}></i>
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 space-y-3">
        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors group"
        >
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} text-emerald-500`}></i>
            <span className="text-xs font-bold uppercase tracking-tight">Theme</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`}></div>
          </div>
        </button>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            {currentRole.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentRole.replace('_', ' ')}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              ACTIVE SESSION
            </p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-500 hover:text-rose-500 transition-all border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:border-rose-200 dark:hover:border-rose-900/30 uppercase tracking-widest"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
