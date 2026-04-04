import React from 'react';
import { 
  FileText, 
  Download, 
  Settings as SettingsIcon, 
  Eye, 
  Clock, 
  Calendar,
  FileSearch,
  RefreshCw
} from 'lucide-react';
import { Supplier, Material, ProcurementRecord, EnergyRecord, User } from '../types';

interface ReportsProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  currentUser: User;
  onDownloadReport: () => void;
  isGeneratingReport: boolean;
}

const Reports: React.FC<ReportsProps> = ({ 
  suppliers, 
  materials, 
  procurement, 
  energy, 
  currentUser,
  onDownloadReport,
  isGeneratingReport
}) => {
  const totalCarbon = useMemo(() => {
    const energyCarbon = energy.reduce((sum, e) => sum + e.carbonEquivalent, 0);
    const materialCarbon = procurement.reduce((sum, p) => {
      const mat = materials.find(m => m.id === p.materialId);
      return sum + (p.quantity * (mat?.carbonFactor || 0));
    }, 0);
    return energyCarbon + materialCarbon;
  }, [energy, procurement, materials]);

  const avgScore = useMemo(() => {
    return suppliers.length > 0 
      ? (suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / suppliers.length).toFixed(1) 
      : 0;
  }, [suppliers]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Reporting</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">Generate and export comprehensive sustainability compliance reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase rounded-md border border-emerald-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Reporting Engine v2.4
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Configuration</h3>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Report Type</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                  <option>Sustainability Executive Summary</option>
                  <option>Scope 3 Supply Chain Audit</option>
                  <option>Energy Efficiency Analysis</option>
                </select>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Time Horizon</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" /> Last 30 Days
                  </button>
                  <button className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <Calendar className="w-4 h-4" /> Current Q4
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={onDownloadReport} 
                  disabled={isGeneratingReport} 
                  className="w-full bg-slate-900 dark:bg-emerald-600 text-white py-5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isGeneratingReport ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isGeneratingReport ? 'Compiling Data...' : 'Generate & Download'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <FileSearch className="w-4 h-4 text-slate-400" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Audit History</h4>
            </div>
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Report_v{i}.pdf</span>
                  <span>24 Mar 2026</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-950 rounded-2xl p-8 text-white shadow-2xl flex flex-col relative overflow-hidden group h-full min-h-[500px]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Real-time Preview
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Sync Active</span>
              </div>
            </div>

            <div className="flex-1 bg-slate-900/50 rounded-xl p-10 border border-slate-800/50 font-mono text-xs leading-relaxed text-slate-400 overflow-hidden relative z-10">
              <div className="space-y-1.5 mb-10">
                <p className="text-emerald-400 font-black tracking-widest uppercase text-sm">GREEN ERP SUSTAINABILITY REPORT</p>
                <p className="text-slate-600">-----------------------------------------</p>
                <p><span className="text-slate-500 font-bold">TIMESTAMP:</span> {new Date().toISOString()}</p>
                <p><span className="text-slate-500 font-bold">USER:</span> {currentUser.username}</p>
                <p><span className="text-slate-500 font-bold">ROLE:</span> {currentUser.role}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white font-black mb-3 uppercase tracking-widest text-xs">1. KPI SUMMARY</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1.5">Total Carbon</p>
                      <p className="text-emerald-400 font-black text-base">{totalCarbon.toFixed(2)} kg</p>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1.5">ESG Rating</p>
                      <p className="text-emerald-400 font-black text-base">{avgScore}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-white font-black mb-3 uppercase tracking-widest text-xs">2. SYSTEM INSIGHTS</p>
                  <p className="text-slate-500 leading-relaxed italic text-sm">
                    Analysis indicates a 12% reduction in Scope 2 emissions compared to previous quarter. 
                    Supply chain ESG average remains stable at {avgScore}%.
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-800/50">
                  <p className="text-slate-600 italic">... [REMAINDER OF DATA TRUNCATED FOR PREVIEW] ...</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-3 relative z-10">
              <FileText className="w-4 h-4 text-slate-500" />
              <p className="text-[10px] text-slate-500 font-medium italic">
                Reports are generated in .txt format for maximum compatibility with enterprise audit systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useMemo } from 'react';
export default Reports;
