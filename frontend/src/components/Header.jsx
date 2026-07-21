import React from 'react';
import { MapPin, Clock, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-200 gap-4">
      {/* Brand & Location */}
      <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-start">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wide">AirGuard</h1>
        <button className="flex items-center text-xs font-semibold uppercase bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/60 transition-colors">
          <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          IKEJA, LAGOS
          <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-8 text-sm font-medium">
        <a href="#dashboard" className="text-emerald-400 border-b-2 border-emerald-400 pb-1">
          Dashboard
        </a>
        <a href="#map" className="text-slate-400 hover:text-slate-200 transition-colors">
          Map View
        </a>
        <a href="#tips" className="text-slate-400 hover:text-slate-200 transition-colors">
          Health Tips
        </a>
      </nav>

      {/* Action Icons */}
      <div className="hidden md:flex items-center space-x-3 text-slate-400">
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <MapPin className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <Clock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
