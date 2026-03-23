
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Supplier } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Globe, Info, Loader2, Sparkles, Navigation } from 'lucide-react';
import { getGeospatialInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Fix for Leaflet default icon issue in React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface SupplyChainMapProps {
  suppliers: Supplier[];
}

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const SupplyChainMap: React.FC<SupplyChainMapProps> = ({ suppliers }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const result = await getGeospatialInsights(suppliers);
      setInsights(result);
    } catch (error) {
      setInsights("Failed to load geospatial insights.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const mapCenter: [number, number] = [20, 0];
  const mapZoom = 2;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="text-emerald-500 w-8 h-8" />
            Supply Chain Geospatial Map
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            Visualizing global supplier distribution and transport-related carbon impact.
          </p>
        </div>
        
        <button 
          onClick={fetchInsights}
          disabled={loadingInsights}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
        >
          {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loadingInsights ? 'Analyzing Geography...' : 'Get Geospatial Insights'}
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative z-0">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {suppliers.filter(s => s.coordinates).map(supplier => (
              <Marker 
                key={supplier.id} 
                position={[supplier.coordinates!.lat, supplier.coordinates!.lng]}
                eventHandlers={{
                  click: () => setSelectedSupplier(supplier),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-bold text-slate-900">{supplier.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">{supplier.location}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${supplier.sustainabilityScore > 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        ESG: {supplier.sustainabilityScore}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Selected Supplier Details */}
          <AnimatePresence mode="wait">
            {selectedSupplier ? (
              <motion.div
                key={selectedSupplier.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="text-emerald-500 w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => setSelectedSupplier(null)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{selectedSupplier.name}</h3>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {selectedSupplier.location}
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sustainability Profile</p>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">ESG Score</span>
                      <span className="text-sm font-black text-emerald-500">{selectedSupplier.sustainabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${selectedSupplier.sustainabilityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Carbon Eff.</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedSupplier.carbonEfficiency}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Category</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedSupplier.category}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                <Info className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">No Supplier Selected</h4>
                <p className="text-xs text-slate-500 font-medium">Click on a map marker to view detailed regional sustainability metrics.</p>
              </div>
            )}
          </AnimatePresence>

          {/* AI Insights Section */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-6 text-white shadow-xl overflow-hidden flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Geospatial Insights
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingInsights ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consulting Gemini...</p>
                </div>
              ) : insights ? (
                <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-400 prose-p:text-slate-300 prose-strong:text-white">
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                  <Globe className="w-12 h-12 mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">Click the button above for AI analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainMap;
