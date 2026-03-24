
import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Database, 
  FileUp, 
  Lightbulb, 
  FileText, 
  Users, 
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'ai-advisor', label: 'AI Advisor', icon: BrainCircuit, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'master-data', label: 'Master Data', icon: Database, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER] },
    { id: 'data-management', label: 'Data Input', icon: FileUp, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'recommendations', label: 'Smart Insights', icon: Lightbulb, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: [UserRole.ADMIN, UserRole.SUSTAINABILITY_MANAGER] },
    { id: 'users', label: 'Users', icon: Users, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, roles: [UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.SUSTAINABILITY_MANAGER] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-950 h-screen flex flex-col fixed left-0 top-0 text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Leaf className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Green ERP
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold">Enterprise Intelligence</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <div className="space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group relative ${
                activeTab === item.id 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-emerald-600 rounded-r-full"
                />
              )}
              <item.icon className={`w-4 h-4 transition-colors ${activeTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'}`} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6 space-y-4">
        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/30 group"
        >
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-emerald-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">Appearance</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`}></div>
          </div>
        </button>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-600 border border-slate-200 dark:border-slate-700">
              {currentRole.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentRole.replace('_', ' ')}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/10 uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
