from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded data matching the UI spec, augmented with coordinates for the map
locations = [
  { "id": 1, "name": "Ikeja", "aqi": 215, "risk": "Severe", "color": "bg-red-500/20 text-red-400 border-red-500/40", "badgeColor": "bg-red-500", "lat": 6.5965, "lng": 3.3421, "radius": 12, "pathOptions": {"color": "#f87171", "fillColor": "#ef4444", "fillOpacity": 0.8} },
  { "id": 2, "name": "Victoria Island", "aqi": 165, "risk": "High", "color": "bg-rose-400/20 text-rose-300 border-rose-400/40", "badgeColor": "bg-rose-300", "lat": 6.4281, "lng": 3.4219, "radius": 10, "pathOptions": {"color": "#fda4af", "fillColor": "#fb7185", "fillOpacity": 0.8} },
  { "id": 3, "name": "Surulere", "aqi": 85, "risk": "Moderate", "color": "bg-amber-400/20 text-amber-300 border-amber-400/40", "badgeColor": "bg-amber-400", "lat": 6.4988, "lng": 3.3481, "radius": 10, "pathOptions": {"color": "#fcd34d", "fillColor": "#fbbf24", "fillOpacity": 0.8} },
  { "id": 4, "name": "Epe", "aqi": 42, "risk": "Low", "color": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", "badgeColor": "bg-emerald-400", "lat": 6.5841, "lng": 3.9833, "radius": 10, "pathOptions": {"color": "#6ee7b7", "fillColor": "#34d399", "fillOpacity": 0.8} },
]

@app.get("/api/locations")
def get_locations():
    return locations

@app.get("/api/emissions/{location_id}")
def get_emissions(location_id: int):
    # TODO: Once you upload your model file to the backend folder, 
    # we will load it using joblib and pass data into model.predict() here!
    
    # For now, returning mock hourly data dynamically calculated from the base AQI
    base_val = next((loc["aqi"] for loc in locations if loc["id"] == location_id), 50)
    
    return [
        { "time": "6:00 AM", "value": max(10, base_val - 30), "isCurrent": False },
        { "time": "9:00 AM", "value": max(10, base_val - 10), "isCurrent": False },
        { "time": "12:00 PM", "value": base_val, "isCurrent": False },
        { "time": "NOW", "value": base_val - 5, "isCurrent": True },
        { "time": "6:00 PM", "value": max(10, base_val - 15), "isCurrent": False },
        { "time": "9:00 PM", "value": max(10, base_val - 40), "isCurrent": False },
    ]
