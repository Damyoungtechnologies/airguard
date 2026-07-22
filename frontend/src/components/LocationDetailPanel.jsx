import React, { useState, useEffect } from 'react';
import { X, Activity, Users, Info, Wind } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export default function LocationDetailPanel({ location, onClose }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('hourly');

  useEffect(() => {
    if (!location) return;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:8000/api/historical/${location.name}?timeframe=${timeframe}`).then(res => res.json()),
      fetch(`http://localhost:8000/api/forecast/${location.name}?timeframe=${timeframe}`).then(res => res.json())
    ])
    .then(([histData, forecastData]) => {
      // Normalize values to % of safe limits
      // CO2: 400, CO: 9, CH4: 1.8, CFCs: 0.1
      const normalize = (data, isForecast) => {
        return data.map(d => ({
          time: d.time,
          isForecast: isForecast,
          CO2: Math.round((d.CO2 / 400) * 100),
          CO: Math.round((d.CO / 9) * 100),
          CH4: Math.round((d.CH4 / 1.8) * 100),
          CFCs: Math.round((d.CFCs / 0.1) * 100),
          raw: {
            CO2: d.CO2, CO: d.CO, CH4: d.CH4, CFCs: d.CFCs
          }
        }));
      };

      const combined = [...normalize(histData, false), ...normalize(forecastData, true)];
      setChartData(combined);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [location, timeframe]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/20 p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md">
          <p className="font-bold text-white mb-2">{label} {data.isForecast ? "(Predicted)" : "(Historical)"}</p>
          {payload.map(p => (
            <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
              <span style={{ color: p.color }} className="font-bold">{p.dataKey}</span>
              <span className="text-white">{data.raw[p.dataKey]} {p.dataKey === 'CFCs' ? 'ppt' : 'ppm'} <span className="text-slate-400 text-[9px]">({p.value}%)</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-auto bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950/95 border border-white/20 rounded-[2rem] shadow-2xl p-6 md:p-8 my-auto animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-black text-white">{location.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${location.color}`}>
              {location.risk} Risk Level
            </span>
            <span className="text-sm font-semibold text-slate-300">AQI: {location.aqi}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Context & Reason */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3 text-emerald-400" /> AI Risk Assessment
            </h3>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              {location.reasoning || "Analyzing forecasted metrics against local thresholds."}
            </p>
          </div>
          
          {location.profile && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-3 h-3 text-emerald-400" /> Demographic Context
              </h3>
              <p className="text-sm font-bold text-emerald-300 mb-1">{location.profile.activity}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {location.profile.context}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/60 rounded-xl p-3 border border-white/5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-white">{location.profile.density.toLocaleString()} / sq km</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Pollutant Values & Chart */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
          
          {/* Pollutant Breakdown (Current) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "CO2", val: location.pollutants?.CO2, limit: 400, unit: "ppm", color: "text-amber-400" },
              { name: "CO", val: location.pollutants?.CO, limit: 9, unit: "ppm", color: "text-rose-400" },
              { name: "CH4", val: location.pollutants?.CH4, limit: 1.8, unit: "ppm", color: "text-purple-400" },
              { name: "CFCs", val: location.pollutants?.CFCs, limit: 0, unit: "ppt", color: "text-blue-400" }
            ].map(p => (
              <div key={p.name} className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-bold text-slate-400">{p.name}</span>
                <span className={`text-lg font-black ${p.color}`}>{p.val || 0}</span>
                <span className="text-[9px] text-slate-500 font-medium">Lim: {p.limit}{p.unit}</span>
              </div>
            ))}
          </div>

          {/* Continuous Timeline Chart */}
          <div className="flex-1 bg-slate-900/60 rounded-2xl border border-white/5 p-4 min-h-[250px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Wind className="w-3 h-3 text-emerald-400" /> Continuous AI Timeline (% of Safe Limit)
              </h3>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-slate-950 text-slate-300 text-[10px] font-bold px-2 py-1 rounded border border-white/10 outline-none cursor-pointer"
              >
                <option value="hourly">Next 12 Hours</option>
                <option value="daily">Next 7 Days</option>
                <option value="weekly">Next 4 Weeks</option>
                <option value="monthly">Next 12 Months</option>
              </select>
            </div>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm font-medium">Loading ML forecast data...</div>
            ) : (
              <div className="flex-1 w-full h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickMargin={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      domain={[0, 'dataMax + 20']} 
                      tickFormatter={(val) => `${val}%`}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'DANGER LIMIT', fill: '#ef4444', fontSize: 9 }} />
                    
                    <Line type="monotone" dataKey="CO2" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="CO" stroke="#fb7185" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="CH4" stroke="#c084fc" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="CFCs" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
