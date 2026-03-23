
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  Shield, 
  Database, 
  Moon, 
  Sun,
  Save,
  Trash2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, theme, onToggleTheme }) => {
  const [notifications, setNotifications] = useState(true);
  const [carbonThreshold, setCarbonThreshold] = useState(5000);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-emerald-500 w-8 h-8" />
          System Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Manage your account preferences and sustainability thresholds.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: UserIcon },
            { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data Management', icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                item.id === 'profile' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-500" />
              User Profile
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                    {currentUser.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Role</label>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400 uppercase text-xs">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Preferences & Thresholds
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500">Toggle system-wide dark theme.</p>
                </div>
                <button 
                  onClick={onToggleTheme}
                  className={`w-12 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Email Alerts</p>
                  <p className="text-xs text-slate-500">Receive notifications for ESG score drops.</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-900 dark:text-white">Carbon Threshold (kg CO2e)</label>
                  <span className="text-emerald-500 font-black">{carbonThreshold}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="10000" 
                  step="500"
                  value={carbonThreshold}
                  onChange={(e) => setCarbonThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Alerts will trigger when monthly emissions exceed this value.
                </p>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={saveStatus !== 'idle'}
              className="flex-1 bg-slate-900 dark:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Changes Saved!' : 'Save Preferences'}
            </button>
            <button className="px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-900/30 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-50 hover:dark:bg-rose-900/10 transition-all flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
