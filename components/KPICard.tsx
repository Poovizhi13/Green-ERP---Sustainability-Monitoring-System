
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
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const iconColorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border shadow-sm transition-transform hover:scale-[1.02] cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl text-white shadow-lg ${iconColorMap[color]}`}>
          <i className={`fa-solid ${icon} text-lg`}></i>
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trend.isUp ? 'text-rose-500' : 'text-emerald-500'}`}>
            <i className={`fa-solid ${trend.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
      </div>
    </div>
  );
};

export default KPICard;
