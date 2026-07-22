import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

function HeatmapLayer({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (!locations || locations.length === 0) return;
    
    // Instead of a massive spreading grid, just place a small heat-ball at each location
    const points = locations.map(loc => {
      // Map AQI to a higher baseline intensity so it's more obvious (0.5 to 1.0)
      const intensity = Math.min(1.0, 0.5 + (loc.aqi / 150));
      return [loc.lat, loc.lng, intensity];
    });
    
    const heat = L.heatLayer(points, {
      radius: 60,     // Larger ball so it's visible
      blur: 25,       // Less blur so the core is more intense
      maxZoom: 13,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);
    
    return () => {
      map.removeLayer(heat);
    };
  }, [map, locations]);
  
  return null;
}

export default function BackgroundMap({ locations, selectedRegion }) {
  const filteredLocations = selectedRegion === 'All' 
    ? locations 
    : locations.filter(l => l.name === selectedRegion);

  return (
    <div className="fixed inset-0 z-0">
      <MapContainer 
        center={filteredLocations.length === 1 ? [filteredLocations[0].lat, filteredLocations[0].lng] : [6.5244, 3.3792]} 
        zoom={filteredLocations.length === 1 ? 13 : 11} 
        minZoom={5}
        style={{ height: '100%', width: '100%', backgroundColor: '#020617' }} // Dark background prevents bright white flashing while tiles load
        zoomControl={false}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {filteredLocations.map((loc) => (
           <CircleMarker 
             key={loc.id}
             center={[loc.lat, loc.lng]} 
             radius={loc.radius} 
             className="glowing-circle"
             pathOptions={{
                color: loc.pathOptions.fillColor, // Drives the drop-shadow color
                weight: 2,
                fillColor: loc.pathOptions.fillColor, 
                fillOpacity: 0.8
             }} 
           >
             {/* Tooltip text rendered in white for legibility */}
             <Popup className="custom-popup">
               <div className="p-1 min-w-[200px]">
                 <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2">
                   <h3 className="text-sm font-black text-white">{loc.name}</h3>
                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${loc.badgeColor} border-white/20 text-slate-900`}>
                     AQI {loc.aqi}
                   </span>
                 </div>
                 
                 <div className="space-y-2 text-xs">
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-300">CO2</span>
                     <div className="text-right">
                       <span className="text-white font-black">{loc.pollutants?.CO2 || 0} ppm</span>
                       <p className="text-[9px] text-slate-400">Limit: 400 ppm</p>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-300">CO</span>
                     <div className="text-right">
                       <span className="text-white font-black">{loc.pollutants?.CO || 0} ppm</span>
                       <p className="text-[9px] text-slate-400">Limit: 9 ppm</p>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-300">CH4</span>
                     <div className="text-right">
                       <span className="text-white font-black">{loc.pollutants?.CH4 || 0} ppm</span>
                       <p className="text-[9px] text-slate-400">Limit: 1.8 ppm</p>
                     </div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                     <span className="font-bold text-slate-300">CFCs</span>
                     <div className="text-right">
                       <span className="text-white font-black">{loc.pollutants?.CFCs || 0} ppt</span>
                       <p className="text-[9px] text-slate-400">Limit: 0 ppt</p>
                     </div>
                   </div>
                 </div>
                 
                 <div className="mt-4 pt-2 border-t border-white/20">
                    <p className="text-[10px] text-slate-300 italic leading-tight">
                      *Values exceeding limits trigger elevated risk status and dynamic ML health interventions.
                    </p>
                 </div>
               </div>
             </Popup>
             
             <Tooltip 
               direction="bottom" 
               offset={[0, 10]} 
               opacity={1}
               className="custom-tooltip"
             >
               <div className="text-center mb-1 pb-1 border-b border-white/20 text-[11px]">{loc.name}</div>
               <div className="flex justify-between gap-3 text-[9px] mt-1">
                 <span className="text-slate-400">CO2:</span> 
                 <span className={loc.pollutants?.CO2 > 400 ? 'text-rose-400 font-black' : 'text-emerald-400'}>{loc.pollutants?.CO2 > 600 ? 'Severe' : loc.pollutants?.CO2 > 400 ? 'High' : 'Normal'}</span>
               </div>
               <div className="flex justify-between gap-3 text-[9px]">
                 <span className="text-slate-400">CO:</span> 
                 <span className={loc.pollutants?.CO > 9 ? 'text-rose-400 font-black' : 'text-emerald-400'}>{loc.pollutants?.CO > 9 ? 'Severe' : loc.pollutants?.CO > 5 ? 'High' : 'Normal'}</span>
               </div>
               <div className="flex justify-between gap-3 text-[9px]">
                 <span className="text-slate-400">CH4:</span> 
                 <span className={loc.pollutants?.CH4 > 1.8 ? 'text-rose-400 font-black' : 'text-emerald-400'}>{loc.pollutants?.CH4 > 2.0 ? 'Severe' : loc.pollutants?.CH4 > 1.8 ? 'High' : 'Normal'}</span>
               </div>
               <div className="flex justify-between gap-3 text-[9px]">
                 <span className="text-slate-400">CFCs:</span> 
                 <span className={loc.pollutants?.CFCs > 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}>{loc.pollutants?.CFCs > 100 ? 'Severe' : loc.pollutants?.CFCs > 0 ? 'High' : 'Normal'}</span>
               </div>
             </Tooltip>
           </CircleMarker>
        ))}

         {/* Render the Heatmap on top of the tiles but behind the circles/popups */}
         <HeatmapLayer locations={filteredLocations} />
      </MapContainer>
      
      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none z-10 backdrop-blur-[1px]"></div>
    </div>
  );
}
