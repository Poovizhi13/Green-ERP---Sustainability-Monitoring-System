
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'master-data', label: 'Master Data', icon: 'fa-database', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER] },
    { id: 'data-management', label: 'Data Input', icon: 'fa-file-import', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'recommendations', label: 'Smart Insights', icon: 'fa-lightbulb', roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'reports', label: 'Reports', icon: 'fa-file-contract', roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'users', label: 'Users', icon: 'fa-users-cog', roles: [UserRole.ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col fixed left-0 top-0 text-white shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
          <i className="fa-solid fa-leaf"></i>
          <span>Green ERP</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Sustainability Monitoring</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          <ul className="space-y-1">
            {filteredItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-5`}></i>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-3 mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
            {currentRole.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{currentRole.replace('_', ' ')}</p>
            <p className="text-xs text-slate-500 truncate">Connected</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors border border-slate-700 rounded-lg hover:border-red-400"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
