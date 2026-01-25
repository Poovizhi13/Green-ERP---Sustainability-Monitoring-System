
import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'emerald' | 'blue' | 'amber' | 'rose' | 'indigo';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, icon, trend, color }) => {
  const iconColorMap = {
    emerald: 'bg-emerald-500 dark:bg-emerald-500 text-white shadow-emerald-500/20',
    blue: 'bg-blue-500 dark:bg-blue-500 text-white shadow-blue-500/20',
    amber: 'bg-amber-500 dark:bg-amber-500 text-white shadow-amber-500/20',
    rose: 'bg-rose-500 dark:bg-rose-500 text-white shadow-rose-500/20',
    indigo: 'bg-indigo-500 dark:bg-indigo-500 text-white shadow-indigo-500/20',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl transition-all hover:translate-y-[-4px] hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl shadow-lg ${iconColorMap[color]}`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
        {trend && (
          <span className={`text-[10px] font-extrabold flex items-center gap-1 px-2 py-1 rounded-full ${trend.isUp ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
            <i className={`fa-solid ${trend.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h3>
        {unit && <span className="text-slate-400 dark:text-slate-500 text-sm font-bold ml-1">{unit}</span>}
      </div>
    </div>
  );
};

export default KPICard;
