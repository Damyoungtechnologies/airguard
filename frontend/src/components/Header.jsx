import React from 'react';
import { MapPin, Clock, ChevronDown, Activity } from 'lucide-react';

export default function Header({ locations, selectedRegion, onSelectRegion, hash }) {
  // Helper to determine active tab class
  const activeClass = "text-emerald-400 border-b-2 border-emerald-400 pb-1";
  const inactiveClass = "text-slate-300 hover:text-white transition-colors border-b-2 border-transparent pb-1";

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 text-slate-200 gap-4 shadow-2xl pointer-events-auto">
      {/* Brand & Location */}
      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wide flex items-center gap-2 drop-shadow-md">
          <Activity className="w-5 h-5 text-emerald-400" />
          AirGuard
        </h1>
        
        {/* Global Select Dropdown */}
        <div className="relative group">
          <select 
            value={selectedRegion}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="appearance-none bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 pl-9 pr-9 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold uppercase text-slate-100 transition-all cursor-pointer outline-none shadow-inner"
          >
            <option value="All" className="text-slate-900 font-bold">Lagos (All)</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.name} className="text-slate-900 font-bold">{loc.name}</option>
            ))}
          </select>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-8 text-sm font-medium">
        <a href="#dashboard" className={hash === '#dashboard' ? activeClass : inactiveClass}>
          Dashboard
        </a>
        <a href="#map" className={hash === '#map' ? activeClass : inactiveClass}>
          Map View
        </a>
        <a href="#tips" className={hash === '#tips' ? activeClass : inactiveClass}>
          Health Tips
        </a>
      </nav>

      {/* Action Icons */}
      <div className="hidden md:flex items-center space-x-3 text-slate-300">
        <a href="#map" className={`p-2 rounded-full transition-all border shadow-lg backdrop-blur-md flex items-center justify-center ${hash === '#map' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
          <MapPin className="w-4 h-4" />
        </a>
        <a href="#dashboard" className={`p-2 rounded-full transition-all border shadow-lg backdrop-blur-md flex items-center justify-center ${hash === '#dashboard' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
          <Clock className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
}
