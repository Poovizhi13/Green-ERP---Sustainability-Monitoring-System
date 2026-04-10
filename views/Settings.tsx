
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  CheckCircle2,
  ChevronRight,
  Globe,
  Lock,
  Mail,
  RefreshCw as RefreshIcon
} from 'lucide-react';
import { api } from '../api';

interface SettingsProps {
  currentUser: User;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, theme, onToggleTheme, onUpdateUser }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [notifications, setNotifications] = useState(true);
  const [carbonThreshold, setCarbonThreshold] = useState(5000);
  const [username, setUsername] = useState(currentUser.username);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await api.getSettings();
        setCarbonThreshold(settings.carbonThreshold);
        setNotifications(settings.notifications);
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await api.saveSettings({ carbonThreshold, notifications });
      if (username !== currentUser.username) {
        await onUpdateUser({ ...currentUser, username });
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Failed to save settings", error);
      setSaveStatus('idle');
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setIsLoading(true);
      try {
        const defaultSettings = await api.resetSettings();
        setCarbonThreshold(defaultSettings.carbonThreshold);
        setNotifications(defaultSettings.notifications);
        setUsername(currentUser.username);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error("Failed to reset settings", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePurge = async () => {
    if (window.confirm("This will clear all temporary data. Are you sure?")) {
      setIsPurging(true);
      try {
        await api.purgeCache();
        alert("Cache purged successfully.");
      } catch (error) {
        console.error("Failed to purge cache", error);
      } finally {
        setIsPurging(false);
      }
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !newPassword) return;
    alert("Password updated successfully (simulated).");
    setPassword('');
    setNewPassword('');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: UserIcon, description: 'Manage your personal identity' },
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun, description: 'Customize the visual interface' },
    { id: 'notifications', label: 'Alerts', icon: Bell, description: 'Configure system notifications' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Protect your account data' },
    { id: 'data', label: 'Data Management', icon: Database, description: 'Control your enterprise data' },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Configuration</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
            Settings
          </h2>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {saveStatus === 'saving' ? <Loader2 className="w-3 h-3 animate-spin" /> : saveStatus === 'saved' ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
            {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Synced' : 'Save Changes'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Rail */}
        <div className="lg:col-span-4 space-y-2">
          {sections.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full group flex items-start gap-4 p-4 rounded-3xl transition-all border ${
                activeSection === item.id 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl' 
                  : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all ${
                activeSection === item.id 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-black tracking-tight ${activeSection === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.description}</p>
              </div>
              {activeSection === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto self-center text-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-8">
                {activeSection === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 rounded-[32px] bg-emerald-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-emerald-500/30">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account Identity</h3>
                        <p className="text-sm text-slate-500 font-medium">Your system-wide profile information.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</label>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Role</label>
                        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-emerald-600 dark:text-emerald-400 uppercase text-[10px] tracking-widest">
                          {currentUser.role.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                      <div className="p-2 bg-amber-500/10 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Role Restrictions</p>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Your role is managed by the system administrator. To change your permissions, please contact the IT department.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'appearance' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Visual Theme</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <button 
                        onClick={() => theme === 'dark' && onToggleTheme()}
                        className={`p-6 rounded-[32px] border-2 transition-all text-left space-y-4 ${theme === 'light' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-slate-900">
                          <Sun className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">Light Mode</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard Interface</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => theme === 'light' && onToggleTheme()}
                        className={`p-6 rounded-[32px] border-2 transition-all text-left space-y-4 ${theme === 'dark' ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-emerald-500">
                          <Moon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-white">Dark Mode</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">High Contrast</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Alert Preferences</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/10 rounded-2xl">
                            <Mail className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Email Notifications</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Critical Sustainability Alerts</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setNotifications(!notifications)}
                          className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${notifications ? 'left-8' : 'left-1'}`}></div>
                        </button>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Carbon Threshold</p>
                            <p className="text-xs text-slate-500">Trigger alerts when monthly emissions exceed this value.</p>
                          </div>
                          <span className="text-2xl font-black text-emerald-500">{carbonThreshold.toLocaleString()} <span className="text-[10px] uppercase tracking-widest text-slate-400">kg</span></span>
                        </div>
                        <input 
                          type="range" 
                          min="1000" 
                          max="20000" 
                          step="500"
                          value={carbonThreshold}
                          onChange={(e) => setCarbonThreshold(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'security' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Security & Privacy</h3>
                    
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                      >
                        Update Password
                      </button>
                    </form>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                          <Shield className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                        Add an extra layer of security to your account by requiring a verification code when you sign in.
                      </p>
                      <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                )}

                {activeSection === 'data' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Data Management</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Globe className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Regional Data Hosting</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Current: EU-West (Frankfurt)</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed</span>
                      </div>

                      <div className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-rose-500/10 rounded-2xl">
                            <Trash2 className="w-5 h-5 text-rose-500" />
                          </div>
                          <div>
                            <p className="font-bold text-rose-500">Purge Local Cache</p>
                            <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest">Clears all temporary system data</p>
                          </div>
                        </div>
                        <button 
                          onClick={handlePurge}
                          disabled={isPurging}
                          className="px-4 py-2 bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all disabled:opacity-50"
                        >
                          {isPurging ? 'Purging...' : 'Execute'}
                        </button>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-2xl">
                            <RefreshIcon className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Reset All Settings</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Restore system to factory defaults</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleReset}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        >
                          Reset
                        </button>
                      </div>

                      <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <Database className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-600">Reset Database</p>
                            <p className="text-[10px] text-amber-600/60 font-bold uppercase tracking-widest">Restore all ERP records to initial state</p>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            if (window.confirm("This will delete all your current records and restore initial demo data. Continue?")) {
                              await api.resetDatabase();
                            }
                          }}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all"
                        >
                          Reset DB
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
