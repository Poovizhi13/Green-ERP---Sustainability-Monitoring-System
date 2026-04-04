import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { 
  Cloud, 
  Award, 
  Wallet, 
  Recycle, 
  Zap, 
  Truck, 
  Bot, 
  FileText, 
  Calculator, 
  Download,
  Activity,
  ArrowRight
} from 'lucide-react';
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
    grid: '#f1f5f9', text: '#64748b', tooltipBg: '#ffffff', tooltipBorder: '#e2e8f0'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h2>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase rounded-md border border-emerald-500/20 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live Sync
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">Environmental impact monitoring for {currentUser.username}.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLogic(!showLogic)}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {showLogic ? 'Hide Logic' : 'Logic'}
          </button>
          <button onClick={handleExport} disabled={isExporting} className="bg-slate-900 dark:bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm">
            {isExporting ? <Download className="w-4 h-4 animate-bounce" /> : <Download className="w-4 h-4" />}
            Export
          </button>
        </div>
      </header>

      {showLogic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
              <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Carbon Equation</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Energy(kWh * Factor) + Material(Qty * Factor)</code>.
                Processing {energy.length} energy logs and {procurement.length} procurement records.
              </p>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
              <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Recyclability Weight</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Weighted Average based on total quantity ({stats.totalQty} units). 
                High-volume purchases of non-recyclables impact this KPI significantly.
              </p>
           </div>
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
              <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">ESG Scoring</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Mean average of <strong>Environmental, Social, and Governance</strong> scores for {suppliers.length} active suppliers.
              </p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Gross Carbon Footprint" value={stats.totalCarbon.toLocaleString()} unit="kg CO2" icon={Cloud} color="rose" />
        <KPICard title="Supply Chain Health" value={stats.avgSupplierScore} unit="/ 100" icon={Award} color="emerald" />
        <KPICard title="Operational Spend" value={`$${stats.totalSpend.toLocaleString()}`} icon={Wallet} color="indigo" />
        <KPICard title="Circular Economy Rate" value={stats.avgRecyclability} unit="%" icon={Recycle} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">CO2 Emission Trajectory</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Aggregation</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 11, fontWeight: 500}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: chartColors.text, fontSize: 11, fontWeight: 500}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '12px', border: `1px solid ${chartColors.tooltipBorder}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: theme === 'dark' ? '#fff' : '#000' }} 
                    itemStyle={{ color: '#10b981', fontWeight: 600 }}
                    formatter={(value) => [`${value} kg CO2`, 'Emissions']}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fill="url(#colorEmerald)" fillOpacity={1} />
                  <defs>
                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Log Energy', icon: Zap, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', tab: 'data-management' },
                { label: 'New Supplier', icon: Truck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', tab: 'master-data' },
                { label: 'AI Advisor', icon: Bot, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', tab: 'ai-advisor' },
                { label: 'Reports', icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20', tab: 'reports' },
              ].map((action) => (
                <button 
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all group"
                >
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">{action.label}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <h3 className="text-base font-bold mb-8 text-slate-900 dark:text-white text-center">Impact Attribution</h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={emissionBySourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {emissionBySourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '12px', border: `1px solid ${chartColors.tooltipBorder}` }}
                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Total CO2</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{Math.round(stats.totalCarbon / 1000)}t</p>
              </div>
            </div>
            <div className="w-full space-y-2 mt-8">
               {emissionBySourceData.map(s => (
                 <div key={s.name} className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div> 
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{s.name}</span>
                   </div>
                   <span className="font-bold text-slate-900 dark:text-white">{stats.totalCarbon > 0 ? Math.round((s.value / stats.totalCarbon) * 100) : 0}%</span>
                 </div>
               ))}
            </div>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium mt-auto pt-6">Calculated based on GHG Protocol standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
