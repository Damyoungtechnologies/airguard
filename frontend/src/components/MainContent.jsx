import React, { useState, useEffect } from 'react';
import { Shield, Wind, Home, Map, Activity, CloudFog, Factory, Sun } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

function LeftSection({ selectedRegion, currentLoc }) {
  const [tips, setTips] = useState([]);
  const pollutants = currentLoc?.pollutants || { CO2: 0, CO: 0, CH4: 0, CFCs: 0, Overall: 0 };

  useEffect(() => {
    const regionToFetch = selectedRegion === 'All' ? 'Ikeja' : selectedRegion;
    fetch(`http://localhost:8000/api/health-tips/${regionToFetch}`)
      .then(res => res.json())
      .then(data => setTips(data.tips || []))
      .catch(err => console.error("Error fetching tips:", err));
  }, [selectedRegion]);

  return (
    <div className="flex flex-col gap-6 w-full lg:w-5/12 pointer-events-auto">
      {/* Multi-Pollutant Grid */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 backdrop-blur-2xl shadow-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Pollutant Breakdown ({selectedRegion})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm shadow-inner flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CloudFog className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">CO2 (ppm)</p>
              <p className="text-lg font-black text-white">{pollutants.CO2}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm shadow-inner flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">CO (ppm)</p>
              <p className="text-lg font-black text-white">{pollutants.CO}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm shadow-inner flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">CH4 (ppm)</p>
              <p className="text-lg font-black text-white">{pollutants.CH4}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm shadow-inner flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">CFCs (ppt)</p>
              <p className="text-lg font-black text-white">{pollutants.CFCs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Actionable Advice */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Real-time Health Directives</span>
        </div>

        <div className="space-y-3">
          {tips.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium p-2">Analyzing forecast data...</p>
          ) : (
            tips.slice(0, 2).map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner">
                <div className="p-2 rounded-lg bg-white/10 text-emerald-400 border border-white/10 mt-0.5">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{tip.title}</h4>
                  <p className="text-[11px] font-medium text-slate-300 mt-0.5">{tip.desc}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RightSection({ selectedRegion }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('forecast'); // Default to forecast for predictive focus

  useEffect(() => {
    const regionToFetch = selectedRegion === 'All' ? 'Ikeja' : selectedRegion;
    setLoading(true);
    
    Promise.all([
      fetch(`http://localhost:8000/api/historical/${regionToFetch}`).then(res => res.json()),
      fetch(`http://localhost:8000/api/forecast/${regionToFetch}`).then(res => res.json())
    ])
    .then(([histData, foreData]) => {
      setHistoricalData(histData);
      setForecastData(foreData);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching emissions data:", err);
      setLoading(false);
    });
  }, [selectedRegion]);

  const activeData = viewMode === 'historical' ? historicalData : forecastData;
  const currentData = forecastData[0] || { value: 0 };
  const riskLabel = currentData.value > 200 ? 'Severe' : currentData.value > 150 ? 'High' : currentData.value > 100 ? 'Moderate' : 'Low';
  
  // Dynamic border glow for the circular dial
  const dialBorder = riskLabel === 'Severe' ? 'border-red-500 shadow-red-500/20' : 
                     riskLabel === 'High' ? 'border-rose-400 shadow-rose-500/20' : 
                     riskLabel === 'Moderate' ? 'border-amber-400 shadow-amber-500/20' : 
                     'border-emerald-400 shadow-emerald-500/20';

  const riskBadge = riskLabel === 'Severe' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    riskLabel === 'High' ? 'bg-rose-400/20 text-rose-300 border-rose-400/30' : 
                    riskLabel === 'Moderate' ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div className="flex flex-col justify-between gap-8 w-full lg:w-7/12 pointer-events-auto bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      {/* Header Toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button 
          onClick={() => setViewMode('historical')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'historical' ? 'bg-white/20 text-white shadow-md border border-white/30' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Past 12h History
        </button>
        <button 
          onClick={() => setViewMode('forecast')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'forecast' ? 'bg-emerald-500/30 text-emerald-300 shadow-md border border-emerald-500/50' : 'bg-transparent text-slate-400 hover:text-slate-200'}`}
        >
          ML Forecast (Next 12h)
        </button>
      </div>

      {/* Main Dial */}
      <div className="flex flex-col items-center justify-center pt-2">
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-widest">{viewMode === 'forecast' ? 'Predicted Avg Index' : 'Historical Avg Index'}</p>
        <div className={`relative w-48 h-48 rounded-full border-[10px] flex flex-col items-center justify-center shadow-lg bg-slate-950/50 backdrop-blur-md ${dialBorder} transition-all duration-700`}>
          <span className="text-5xl font-extrabold text-white tracking-tight">{loading ? '...' : currentData.value}</span>
          <span className={`mt-2 text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border ${riskBadge}`}>
            {loading ? '...' : riskLabel}
          </span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-4">
        {loading ? (
           <p className="text-slate-400 col-span-full text-center text-sm font-medium">Loading AI predictions...</p>
        ) : activeData.length === 0 ? (
           <p className="text-slate-400 col-span-full text-center text-sm">No data available.</p>
        ) : activeData.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center p-3 rounded-xl transition-all border backdrop-blur-md ${
              item.isCurrent
                ? 'bg-white/20 border-white/40 shadow-lg'
                : viewMode === 'forecast'
                  ? 'bg-emerald-950/40 border-emerald-500/20'
                  : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-300 whitespace-nowrap">{item.time}</span>
            <span className={`text-sm font-bold mt-2 ${viewMode === 'forecast' ? 'text-emerald-400' : 'text-white'}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MainContent({ selectedRegion, locations }) {
  const currentLoc = locations.find(l => l.name === (selectedRegion === 'All' ? 'Ikeja' : selectedRegion));

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
      <LeftSection selectedRegion={selectedRegion} currentLoc={currentLoc} />
      <RightSection selectedRegion={selectedRegion} />
    </main>
  );
}
