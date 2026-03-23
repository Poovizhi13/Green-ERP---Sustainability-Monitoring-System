
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { Supplier, Material, ProcurementRecord, EnergyRecord, User } from '../types';
import KPICard from '../components/KPICard';

interface DashboardProps {
  suppliers: Supplier[];
  materials: Material[];
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  currentUser: User;
  theme: 'light' | 'dark';
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ suppliers, materials, procurement, energy, currentUser, theme, setActiveTab }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showLogic, setShowLogic] = useState(false);

  const stats = useMemo(() => {
    const energyCarbon = energy.reduce((sum, e) => sum + e.carbonEquivalent, 0);
    const materialCarbon = procurement.reduce((sum, p) => {
      const mat = materials.find(m => m.id === p.materialId);
      return sum + (p.quantity * (mat?.carbonFactor || 0));
    }, 0);
    const totalCarbon = energyCarbon + materialCarbon;
    const avgSupplierScore = suppliers.length > 0 ? Math.round(suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / suppliers.length) : 0;
    const totalSpend = procurement.reduce((sum, p) => sum + p.totalCost, 0);
    const totalQty = procurement.reduce((sum, p) => sum + p.quantity, 0);
    const avgRecyclability = totalQty > 0 ? Math.round(procurement.reduce((sum, p) => {
      const mat = materials.find(m => m.id === p.materialId);
      return sum + (p.quantity * (mat?.recyclabilityRate || 0));
    }, 0) / totalQty) : 0;

    return { totalCarbon, avgSupplierScore, totalSpend, avgRecyclability, energyCarbon, materialCarbon, totalQty };
  }, [suppliers, materials, procurement, energy]);

  const handleExport = () => {
    setIsExporting(true);
    const csvRows = [
      ["Metric", "Value", "Unit"],
      ["Total Carbon Footprint", stats.totalCarbon.toFixed(2), "kg CO2"],
      ["Energy Carbon Impact", stats.energyCarbon.toFixed(2), "kg CO2"],
      ["Procurement Carbon Impact", stats.materialCarbon.toFixed(2), "kg CO2"],
      ["Average Supplier ESG Score", stats.avgSupplierScore, "points / 100"],
      ["Total Material Spend", stats.totalSpend.toFixed(2), "USD"],
      ["Average Recyclability Rate", stats.avgRecyclability, "%"]
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GreenERP_KPI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  const trendData = [
    { month: 'Jul', co2: 2400 },
    { month: 'Aug', co2: 2100 },
    { month: 'Sep', co2: 2800 },
    { month: 'Oct', co2: Math.round(stats.totalCarbon) || 2500 },
  ];

  const emissionBySourceData = [
    { name: 'Energy (Scope 2)', value: stats.energyCarbon, color: '#10b981' },
    { name: 'Supply Chain (Scope 3)', value: stats.materialCarbon, color: '#3b82f6' },
  ];

  const chartColors = theme === 'dark' ? {
    grid: '#1e293b', text: '#94a3b8', tooltipBg: '#0f172a', tooltipBorder: '#1e293b'
  } : {
    grid: '#e2e8f0', text: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h2>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 shadow-sm">
              REAL-TIME SYNC ACTIVE
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Comprehensive environmental impact monitoring for {currentUser.username}.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowLogic(!showLogic)}
            className="px-5 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-calculator"></i>
            {showLogic ? 'Hide Logic' : 'View Calculation Logic'}
          </button>
          <button onClick={handleExport} disabled={isExporting} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center gap-2">
            {isExporting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-download"></i>}
            Export CSV
          </button>
        </div>
      </header>

      {showLogic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
           <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20 p-5 rounded-2xl">
              <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">Carbon Equation</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Calculated as: <code className="bg-emerald-100 dark:bg-emerald-900/40 px-1 rounded">Energy(kWh * Factor) + Material(Qty * Factor)</code>.
                Currently processing {energy.length} energy logs and {procurement.length} procurement records.
              </p>
           </div>
           <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-500/20 p-5 rounded-2xl">
              <h4 className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-2">Recyclability Weight</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Uses a <strong>Weighted Average</strong> based on total quantity ({stats.totalQty} units). 
                High-volume purchases of non-recyclables will pull this KPI down faster.
              </p>
           </div>
           <div className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-500/20 p-5 rounded-2xl">
              <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">ESG Scoring</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                The mean average of <strong>Environmental, Social, and Governance</strong> scores provided for {suppliers.length} active suppliers in the Master Data.
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Gross Carbon Footprint" value={stats.totalCarbon.toLocaleString()} unit="kg CO2" icon="fa-cloud" color="rose" />
        <KPICard title="Supply Chain Health" value={stats.avgSupplierScore} unit="/ 100" icon="fa-award" color="emerald" />
        <KPICard title="Operational Spend" value={`$${stats.totalSpend.toLocaleString()}`} icon="fa-wallet" color="indigo" />
        <KPICard title="Circular Economy Rate" value={stats.avgRecyclability} unit="%" icon="fa-recycle" color="amber" />
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i>
            Quick Actions
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Log Energy', icon: 'fa-bolt', color: 'bg-amber-500', tab: 'data-management' },
            { label: 'New Supplier', icon: 'fa-truck-field', color: 'bg-emerald-500', tab: 'master-data' },
            { label: 'AI Audit', icon: 'fa-robot', color: 'bg-indigo-500', tab: 'ai-advisor' },
            { label: 'Gen Report', icon: 'fa-file-pdf', color: 'bg-rose-500', tab: 'reports' },
          ].map((action) => (
            <button 
              key={action.label}
              onClick={() => setActiveTab(action.tab)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] hover:shadow-lg transition-all group"
            >
              <div className={`w-12 h-12 ${action.color} text-white rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:rotate-6 transition-transform`}>
                <i className={`fa-solid ${action.icon} text-xl`}></i>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">CO2 Emission Trajectory</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Aggregation</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '16px', border: `1px solid ${chartColors.tooltipBorder}`, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', color: theme === 'dark' ? '#fff' : '#000' }} 
                  itemStyle={{ color: '#10b981', fontWeight: 700 }}
                  formatter={(value) => [`${value} kg CO2`, 'Emissions']}
                />
                <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={4} fill="url(#colorEmerald)" fillOpacity={1} />
                <defs>
                  <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white text-center">Impact Attribution</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={emissionBySourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value">
                  {emissionBySourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '16px', border: `1px solid ${chartColors.tooltipBorder}` }}
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Total CO2</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{Math.round(stats.totalCarbon / 1000)}t</p>
            </div>
          </div>
          <div className="w-full space-y-3 mt-6">
             {emissionBySourceData.map(s => (
               <div key={s.name} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: s.color}}></div> 
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{s.name}</span>
                 </div>
                 <span className="font-black text-slate-900 dark:text-white">{stats.totalCarbon > 0 ? Math.round((s.value / stats.totalCarbon) * 100) : 0}%</span>
               </div>
             ))}
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium mt-6">Calculated based on GHG Protocol standards.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
