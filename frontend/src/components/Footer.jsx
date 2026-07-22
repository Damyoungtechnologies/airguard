import React from 'react';

export default function Footer() {
  return (
    <footer className="px-6 py-4 bg-slate-950/40 backdrop-blur-2xl border-t border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl pointer-events-auto">
      <div>
        <span className="font-bold text-emerald-400 drop-shadow-md">AirGuard</span>
        <p className="text-slate-300 mt-0.5 font-medium">
          © 2026 AirGuard. Data provided by AirGuard Environmental Protection Agency.
        </p>
      </div>

      <div className="flex items-center space-x-6 font-medium">
        <a href="#privacy" className="hover:text-white transition-colors">Data Privacy</a>
        <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#contact" className="hover:text-white transition-colors">Contact Expert</a>
      </div>
    </footer>
  );
}
