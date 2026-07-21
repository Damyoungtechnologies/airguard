import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import Header from './Header';
import Footer from './Footer';

export default function MapView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState([]);
  
  // Fetch real locations from the FastAPI backend on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/locations')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error("Error fetching locations data:", err));
  }, []);

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Shared Header */}
      <Header />

      {/* Main Map Canvas Section */}
      <main className="relative flex-1 w-full min-h-[calc(100vh-130px)] overflow-hidden bg-slate-950">
        
        {/* Actual Interactive Map bounded strictly to Lagos */}
        <div className="absolute inset-0 z-0">
          <MapContainer 
            center={[6.5244, 3.3792]} 
            zoom={11} 
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
            {/* Dynamically plotting the pins fetched from the backend API */}
            {locations.map((loc) => (
               <CircleMarker 
                 key={loc.id}
                 center={[loc.lat, loc.lng]} 
                 radius={loc.radius} 
                 pathOptions={loc.pathOptions} 
               />
            ))}
          </MapContainer>
          <div className="absolute inset-0 bg-[radial-gradient(#273549_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>
        </div>

        {/* Top Search Bar Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-sm px-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 backdrop-blur-md text-sm text-slate-200 border border-slate-700/60 rounded-full focus:outline-none focus:border-emerald-400 transition-all shadow-lg placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Left Floating Sidebar: Risk Directory */}
        <div className="absolute top-6 left-6 z-20 w-72 sm:w-80 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-emerald-400 tracking-wide mb-1 drop-shadow-md">
            Risk Directory
          </h2>

          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
            {locations.length === 0 ? (
               <p className="text-sm text-slate-400 p-2">Loading data from backend...</p>
            ) : null}
            {filteredLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl hover:bg-slate-800/60 transition-all cursor-pointer group"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    AQI: <span className="text-slate-200">{loc.aqi}</span>
                  </p>
                </div>

                {/* Risk Level Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${loc.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${loc.badgeColor}`}></span>
                  {loc.risk}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Floating Legend: Risk Scale */}
        <div className="absolute bottom-8 right-6 z-20 p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl min-w-[140px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Risk Scale
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300"></span>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Severe</span>
            </div>
          </div>
        </div>

      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
