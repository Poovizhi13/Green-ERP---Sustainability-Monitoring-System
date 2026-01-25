
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
}

const Dashboard: React.FC<DashboardProps> = ({ suppliers, materials, procurement, energy, currentUser }) => {
  const [isExporting, setIsExporting] = useState(false);

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
    const avgRecyclability = totalQty > 0 ? Math.round(procurement.reduce((sum, p) => sum + (p.quantity * (materials.find(m => m.id === p.materialId)?.recyclabilityRate || 0)), 0) / totalQty) : 0;

    return { totalCarbon, avgSupplierScore, totalSpend, avgRecyclability, energyCarbon, materialCarbon };
  }, [suppliers, materials, procurement, energy]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 800);
  };

  const trendData = [
    { month: 'Jul', co2: 2400 },
    { month: 'Aug', co2: 2100 },
    { month: 'Sep', co2: 2800 },
    { month: 'Oct', co2: Math.round(stats.totalCarbon) || 2500 },
  ];

  const emissionBySourceData = [
    { name: 'Energy', value: stats.energyCarbon, color: '#10b981' },
    { name: 'Procurement', value: stats.materialCarbon, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sustainability Overview</h2>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 shadow-sm flex items-center gap-2">
              <i className="fa-solid fa-user-circle"></i>
              Session: {currentUser.username} ({currentUser.role.split('_')[0]})
            </div>
          </div>
          <p className="text-slate-500">Real-time environmental and procurement analytics for this session.</p>
        </div>
        <button onClick={handleExport} disabled={isExporting} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50">
          <i className={`fa-solid ${isExporting ? 'fa-spinner animate-spin' : 'fa-download'} mr-2`}></i> {isExporting ? 'Exporting...' : 'Export Results'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Carbon" value={stats.totalCarbon.toLocaleString()} unit="kg CO2" icon="fa-cloud" color="rose" />
        <KPICard title="Avg Supplier Score" value={stats.avgSupplierScore} unit="/ 100" icon="fa-award" color="emerald" />
        <KPICard title="Total Material Spend" value={`$${(stats.totalSpend / 1000).toFixed(1)}k`} icon="fa-wallet" color="indigo" />
        <KPICard title="Avg Recyclability" value={stats.avgRecyclability} unit="%" icon="fa-recycle" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Carbon Emission Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold mb-6">Source Breakdown</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={emissionBySourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {emissionBySourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                <p className="text-xl font-bold text-slate-800">{Math.round(stats.totalCarbon / 1000)}t</p>
            </div>
          </div>
          <div className="w-full space-y-2 mt-4">
             {emissionBySourceData.map(s => (
               <div key={s.name} className="flex justify-between items-center text-xs">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></div> {s.name}</span>
                 <span className="font-bold">{Math.round((s.value / (stats.totalCarbon || 1)) * 100)}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
