import React, { useState } from 'react';
import { Search, X, Activity, Users, Info } from 'lucide-react';
import LocationDetailPanel from './LocationDetailPanel';

export default function MapOverlay({ locations }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute inset-0 z-20 pointer-events-none p-6 pt-24 overflow-hidden">
      {/* Top Search Bar Overlay */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-white" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/40 backdrop-blur-2xl text-sm font-semibold text-white border border-white/20 rounded-full focus:outline-none focus:border-emerald-400 transition-all shadow-2xl placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Left Floating Sidebar: Risk Directory */}
      <div className="absolute top-24 left-8 w-72 sm:w-80 flex flex-col gap-3 pointer-events-auto">
        <h2 className="text-xl font-bold text-white tracking-wide mb-1 drop-shadow-md">
          Location Risk (Overall AQI)
        </h2>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {locations.length === 0 ? (
             <p className="text-sm text-slate-300 p-2 font-medium">Loading data from backend...</p>
          ) : null}
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="flex items-center justify-between p-3.5 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-all cursor-pointer group"
            >
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors drop-shadow-sm">
                  {loc.name}
                </h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  AQI: <span className="text-white">{loc.aqi}</span>
                </p>
              </div>

              {/* Risk Level Badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-md ${loc.color}`}
              >
                <span className={`w-2 h-2 rounded-full shadow-inner ${loc.badgeColor}`}></span>
                {loc.risk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Detailed Location Panel (Centered) */}
      {selectedLocation && (
        <LocationDetailPanel 
          location={selectedLocation} 
          onClose={() => setSelectedLocation(null)} 
        />
      )}

      {/* Bottom Floating Legend: Risk Scale */}
      <div className="absolute bottom-8 right-8 p-5 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl min-w-[160px] pointer-events-auto animate-bounce">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 drop-shadow-sm">
          AQI Risk Scale
        </h4>
        <div className="space-y-3 text-xs font-bold">
          <div className="flex items-center gap-3 text-white">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]"></span>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span>Severe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
