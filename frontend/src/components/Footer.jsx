import React from 'react';

export default function Footer() {
  return (
    <footer className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/60 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <span className="font-bold text-emerald-400">AirGuard</span>
        <p className="text-slate-500 mt-0.5">
          © 2026 AirGuard. Data provided by AirGuard Environmental Protection Agency.
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <a href="#privacy" className="hover:text-slate-200 transition-colors">Data Privacy</a>
        <a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a>
        <a href="#contact" className="hover:text-slate-200 transition-colors">Contact Expert</a>
      </div>
    </footer>
  );
}
