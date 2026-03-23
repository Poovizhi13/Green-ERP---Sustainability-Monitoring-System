
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Calendar,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ProcurementRecord, EnergyRecord, Material } from '../types';
import { getCarbonForecast } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface CarbonForecastingProps {
  procurement: ProcurementRecord[];
  energy: EnergyRecord[];
  materials: Material[];
}

const CarbonForecasting: React.FC<CarbonForecastingProps> = ({ procurement, energy, materials }) => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<{
    forecastData: { month: string; predictedCarbon: number }[];
    insights: string;
    confidence: number;
  } | null>(null);

  const generateForecast = async () => {
    setLoading(true);
    try {
      const result = await getCarbonForecast(procurement, energy, materials);
      setForecast(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-emerald-500 w-8 h-8" />
            Predictive Carbon Forecasting
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            AI-powered projections of your enterprise environmental footprint.
          </p>
        </div>
        
        <button 
          onClick={generateForecast}
          disabled={loading}
          className="bg-slate-900 dark:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Calculating Projections...' : 'Generate 6-Month Forecast'}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {!forecast && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Calendar, title: "Time-Series Analysis", desc: "Projecting emissions based on seasonal procurement cycles." },
              { icon: Zap, title: "Energy Trends", desc: "Forecasting consumption patterns and grid-mix impact." },
              { icon: AlertTriangle, title: "Risk Identification", desc: "Early warning for potential carbon limit breaches." }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="text-emerald-500 w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 flex flex-col items-center justify-center text-center"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Analyzing Historical Trajectories</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">
              Gemini is processing your procurement records and energy logs to build a predictive model for your Scope 1, 2, and 3 emissions.
            </p>
          </motion.div>
        )}

        {forecast && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Card */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="text-emerald-500 w-5 h-5" />
                    Predicted Carbon Footprint (kg CO2e)
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Forecast</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.forecastData}>
                      <defs>
                        <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: 'none', 
                          borderRadius: '16px',
                          color: '#fff',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 800 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predictedCarbon" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCarbon)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stats & Confidence */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Model Confidence</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{forecast.confidence}%</span>
                    <CheckCircle2 className="text-emerald-500 w-6 h-6 mb-2" />
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${forecast.confidence}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-emerald-500 h-full"
                    ></motion.div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 font-medium">
                    Based on {procurement.length} procurement records and {energy.length} energy log entries.
                  </p>
                </div>

                <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Key Projections</h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Peak Month</p>
                        <p className="text-lg font-black">{forecast.forecastData.reduce((prev, current) => (prev.predictedCarbon > current.predictedCarbon) ? prev : current).month}</p>
                      </div>
                      <ArrowUpRight className="text-rose-500 w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Projected Trend</p>
                        <p className="text-lg font-black">
                          {forecast.forecastData[5].predictedCarbon > forecast.forecastData[0].predictedCarbon ? 'Upward' : 'Downward'}
                        </p>
                      </div>
                      {forecast.forecastData[5].predictedCarbon > forecast.forecastData[0].predictedCarbon ? (
                        <ArrowUpRight className="text-rose-500 w-6 h-6" />
                      ) : (
                        <ArrowDownRight className="text-emerald-500 w-6 h-6" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-10 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Strategic Forecasting Insights</h3>
              </div>
              
              <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-strong:text-emerald-600 dark:prose-strong:text-emerald-400">
                <ReactMarkdown>{forecast.insights}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarbonForecasting;
