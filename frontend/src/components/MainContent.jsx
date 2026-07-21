import React, { useState, useEffect } from 'react';
import { Shield, Wind, Home, Activity, Map } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';

// Left Section Component
function LeftSection() {
  return (
    <div className="flex flex-col gap-6 w-full lg:w-5/12">
      {/* Local Hotspots Map Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lagos Hotspots
          </span>
          <Map className="w-4 h-4 text-slate-400" />
        </div>
        <div className="relative h-56 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 z-0">
          <MapContainer 
            center={[6.5244, 3.3792]} 
            zoom={10} 
            minZoom={10}
            maxBounds={[[6.35, 3.0], [6.75, 4.0]]}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }} 
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
            <CircleMarker center={[6.5965, 3.3421]} radius={6} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.7 }} />
          </MapContainer>
        </div>
      </div>

      {/* Actionable Advice */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Actionable Advice</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-red-950/50 text-red-400 border border-red-900/40 mt-0.5">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Wear a Mask Outdoors</h4>
              <p className="text-xs text-slate-400 mt-0.5">Recommended for sensitive individuals in current conditions.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-red-950/50 text-red-400 border border-red-900/40 mt-0.5">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Keep Windows Closed</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prevent outdoor particulate matter from entering indoors.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <div className="p-2 rounded-lg bg-red-950/50 text-red-400 border border-red-900/40 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">Reduce Intense Exertion</h4>
              <p className="text-xs text-slate-400 mt-0.5">Limit heavy outdoor physical activity until levels drop.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Right Section Component
function RightSection() {
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Defaulting to Ikeja (id = 1) for the dashboard view
  useEffect(() => {
    fetch('http://localhost:8000/api/emissions/1')
      .then(res => res.json())
      .then(data => {
        setHourlyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching emissions data:", err);
        setLoading(false);
      });
  }, []);

  const currentData = hourlyData.find(item => item.isCurrent) || { value: 0 };
  const riskLabel = currentData.value > 150 ? 'Severe' : currentData.value > 100 ? 'High' : currentData.value > 50 ? 'Moderate' : 'Low';

  return (
    <div className="flex flex-col justify-between gap-8 w-full lg:w-7/12">
      {/* Air Quality Index Gauge */}
      <div className="flex flex-col items-center justify-center pt-4">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          Current Air Quality Index
        </span>

        {/* Circular Dial */}
        <div className="relative w-48 h-48 rounded-full border-[10px] border-amber-400 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10 bg-slate-900/30">
          <span className="text-5xl font-extrabold text-slate-100 tracking-tight">{loading ? '...' : currentData.value}</span>
          <span className="mt-2 text-[10px] font-bold uppercase px-3 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
            {loading ? '...' : riskLabel}
          </span>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-xs mt-6 leading-relaxed">
          Sensitive groups should consider reducing prolonged or heavy outdoor exertion.
        </p>
      </div>

      {/* Hourly Timeline */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-4">
        {loading ? (
           <p className="text-slate-400 col-span-6 text-center text-sm">Loading dynamic hourly data from backend...</p>
        ) : hourlyData.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              item.isCurrent
                ? 'bg-slate-800/80 border border-amber-400/40 shadow-lg shadow-amber-400/5'
                : 'bg-slate-900/30 border border-slate-800/40'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
            <Wind className={`w-5 h-5 my-2 ${item.isCurrent ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-sm font-bold text-slate-200">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MainContent() {
  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
      <LeftSection />
      <RightSection />
    </main>
  );
}
