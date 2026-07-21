import React from 'react';
import { Wind, Home, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

// Health tip cards data matching your image
const healthRecommendations = [
  {
    id: 1,
    title: 'Wear N95 Mask',
    description: 'Recommended for all outdoor activities today due to high PM2.5 levels.',
    icon: ShieldAlert,
  },
  {
    id: 2,
    title: 'Avoid Exercise',
    description: 'Reschedule strenuous outdoor physical activities to minimize deep inhalation.',
    icon: Activity,
  },
  {
    id: 3,
    title: 'Close Windows',
    description: 'Keep indoor air clean. Close doors and windows to prevent outdoor air ingress.',
    icon: Home,
  },
  {
    id: 4,
    title: 'Run Purifier',
    description: 'Operate indoor air purifiers on high settings, especially in sleeping areas.',
    icon: Wind,
  },
  {
    id: 5,
    title: 'Sensitive Groups',
    description: 'Individuals with asthma or heart conditions should keep medication accessible.',
    icon: HeartPulse,
  },
];

export default function HealthTips() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-rose-500 selection:text-slate-950">
      {/* Shared Header */}
      <Header />

      {/* Main Content Area with Blur Map Backdrop */}
      <main className="relative flex-1 w-full p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-[#09101d] overflow-hidden">
        {/* Background Map Graphic Accent */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:28px_28px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/30 rounded-full blur-3xl"></div>
        </div>

        {/* Floating Content Container */}
        <div className="relative z-10 w-full max-w-5xl space-y-6 my-auto">
          
          {/* Top Banner: Health Alert */}
          <div className="relative p-6 sm:p-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Status Badges */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  High Risk
                </span>
                <span className="text-xs font-semibold text-slate-400 tracking-wider">
                  AQI 154
                </span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
                Health Alert
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Current atmospheric data indicates elevated particulate matter (PM2.5) across Lagos mainland. General public may experience health effects; members of sensitive groups may experience more serious health effects.
              </p>
            </div>

            {/* Right Gauge Badge */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="relative w-32 h-32 rounded-full border border-rose-400/40 bg-rose-950/20 flex flex-col items-center justify-center shadow-lg shadow-rose-500/10">
                <span className="text-3xl font-black text-rose-300 tracking-tight">
                  High
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400/80 mt-1">
                  Caution
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Action Cards */}
          <div className="p-6 sm:p-8 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {healthRecommendations.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="space-y-3 group">
                  {/* Circular Icon */}
                  <div className="w-10 h-10 rounded-full bg-rose-900/30 border border-rose-800/40 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
