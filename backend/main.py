from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import os
import random
from datetime import datetime, timedelta, timezone
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import HistGradientBoostingRegressor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Starting AirGuard Backend API...")

# 1. Parse CSV once on startup to extract locations and history dynamically
df = None
locations_cache = []

REGION_PROFILES = {
    "Agege": {"density": 43812, "activity": "High-Density Residential & Commercial", "context": "Heavy vehicular congestion and dense localized informal markets."},
    "Ajeromi-Ifelodun": {"density": 89221, "activity": "Hyper-Dense Urban/Slum", "context": "Extremely high population density with high reliance on localized diesel generators."},
    "Alimosho": {"density": 18345, "activity": "Sprawling Residential", "context": "Large residential population with dispersed commercial activity causing widespread baseline emissions."},
    "Amuwo-Odofin": {"density": 11203, "activity": "Mixed Residential & Industrial", "context": "Proximity to industrial estates and trade fairs elevates particulate matters."},
    "Apapa": {"density": 6203, "activity": "Major Seaport & Heavy Industrial", "context": "Massive shipping logistics, continuous idling of heavy-duty diesel trucks, and maritime emissions."},
    "Badagry": {"density": 916, "activity": "Peri-Urban & Coastal", "context": "Lower baseline emissions, primarily influenced by coastal activities and cross-border transit."},
    "Epe": {"density": 600, "activity": "Rural & Agricultural", "context": "Low population density with minimal industrial footprint; emissions mostly from local biomass burning."},
    "Eti-Osa": {"density": 4584, "activity": "Upscale Commercial & Residential", "context": "High concentration of corporate hubs, heavy commuter traffic, and continuous generator usage in commercial real estate."},
    "Ikeja": {"density": 9523, "activity": "State Capital & Industrial Core", "context": "Major industrial estates (Ogba/Ikeja) and high daytime commercial traffic drive consistent emissions."},
    "Ikorodu": {"density": 5865, "activity": "Rapidly Expanding Suburban", "context": "Expanding residential zones with increasing vehicular traffic and localized manufacturing."},
    "Kosofe": {"density": 13443, "activity": "Dense Residential & Markets", "context": "Major markets (Mile 12) cause heavy localized traffic bottlenecks and related vehicle emissions."},
    "Lagos Island": {"density": 35570, "activity": "Core Commercial & Financial District", "context": "Extreme daytime population surges, heavy traffic gridlocks, and commercial power generation."},
    "Lagos Mainland": {"density": 26758, "activity": "Established Urban Mixed-Use", "context": "Older industrial zones intermixed with highly dense residential areas (Yaba, Ebute Metta)."},
    "Mushin": {"density": 37972, "activity": "High-Density Commercial", "context": "Intense market activities, cottage industries, and severe traffic congestion in narrow corridors."},
    "Ojo": {"density": 10083, "activity": "Commercial & University Town", "context": "Major trade hubs (Alaba) creating localized commercial emissions and transport bottlenecks."},
    "Oshodi-Isolo": {"density": 22995, "activity": "Transport Hub & Industrial", "context": "Massive transit interchange, airport proximity, and significant industrial manufacturing (Amuwo-Odofin border)."},
    "Surulere": {"density": 34256, "activity": "Dense Residential/Commercial", "context": "High-density residential with vibrant nightlife and commercial activity leading to evening emission spikes."}
}

try:
    print("Loading dataset for API serving...")
    df = pd.read_csv('lagos_emissions_dataset_v2.csv')
    unique_regions = df['Region'].unique()
    
    color_map = {
        "Low": {"color": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", "badge": "bg-emerald-400", "path": {"color": "#6ee7b7", "fillColor": "#34d399", "fillOpacity": 0.8}},
        "Moderate": {"color": "bg-amber-400/20 text-amber-300 border-amber-400/40", "badge": "bg-amber-400", "path": {"color": "#fcd34d", "fillColor": "#fbbf24", "fillOpacity": 0.8}},
        "High": {"color": "bg-rose-400/20 text-rose-300 border-rose-400/40", "badge": "bg-rose-300", "path": {"color": "#fda4af", "fillColor": "#fb7185", "fillOpacity": 0.8}},
        "Severe": {"color": "bg-red-500/20 text-red-400 border-red-500/40", "badge": "bg-red-500", "path": {"color": "#f87171", "fillColor": "#ef4444", "fillOpacity": 0.8}}
    }
    
    for i, region in enumerate(unique_regions):
        region_df = df[df['Region'] == region]
        lat = region_df['Latitude'].mean()
        lng = region_df['Longitude'].mean()
        
        # Take an average of recent emissions for each pollutant
        recent = region_df.tail(10)
        co2 = recent['CO2_ppm'].mean()
        co = recent['CO_ppm'].mean()
        ch4 = recent['CH4_ppm'].mean()
        cfcs = recent['CFCs_ppt'].mean()
        overall = recent['Overall_Emissions_Index'].mean()
        
        # Scaled down index for UI readability (0-300 approx)
        latest_aqi = int(overall / 7) 
        
        risk = "Severe" if latest_aqi > 200 else "High" if latest_aqi > 150 else "Moderate" if latest_aqi > 100 else "Low"
        styles = color_map[risk]
        
        # Determine specific reason based on highest pollutant relative to its limit
        # Limits: CO2: 400, CO: 9, CH4: 1.8, CFCs: 0
        ratios = {
            "CO2": co2 / 400,
            "CO": co / 9,
            "CH4": ch4 / 1.8,
            "CFCs": cfcs / 0.1 # Using 0.1 as a strict baseline for CFCs
        }
        primary_driver = max(ratios, key=ratios.get)
        reasoning = f"Forecasts indicate that {primary_driver} levels are exceeding safe limits, driven by local {REGION_PROFILES.get(region, {}).get('activity', 'activity')}."
        if risk == "Low":
            reasoning = "All forecasted pollutants are within acceptable threshold limits."
        
        locations_cache.append({
            "id": region,
            "name": region,
            "aqi": latest_aqi,
            "risk": risk,
            "reasoning": reasoning,
            "profile": REGION_PROFILES.get(region, {"density": 0, "activity": "Unknown", "context": "No context available"}),
            "color": styles["color"],
            "badgeColor": styles["badge"],
            "lat": lat,
            "lng": lng,
            "radius": max(8, min(14, latest_aqi / 10)),
            "pathOptions": styles["path"],
            "pollutants": {
                "CO2": round(co2, 1),
                "CO": round(co, 2),
                "CH4": round(ch4, 2),
                "CFCs": round(cfcs, 2),
                "Overall": round(overall, 1)
            }
        })
    print(f"Loaded {len(locations_cache)} unique regions from dataset.")
except Exception as e:
    print(f"Error loading CSV data: {e}")

# 2. Load ML models if available
try:
    ml_model = joblib.load('ml_model.pkl')
    scaler_X = joblib.load('scaler_X.pkl')
    scaler_y = joblib.load('scaler_y.pkl')
    print("ML models successfully loaded!")
except Exception as e:
    ml_model = None
    scaler_X = None
    scaler_y = None
    print(f"ML model not loaded. Waiting for training to complete.")


@app.get("/api/locations")
def get_locations():
    return locations_cache

@app.get("/api/historical/{region_name}")
def get_historical(region_name: str, timeframe: str = "hourly"):
    """Returns the past historical data from the CSV, grouped by timeframe."""
    if df is None:
        return []
    
    region_df = df[df['Region'] == region_name]
    
    if timeframe == "hourly":
        recent = region_df.tail(12)
        group_size = 1
    elif timeframe == "daily":
        recent = region_df.tail(7 * 24)
        group_size = 24
    elif timeframe == "weekly":
        recent = region_df.tail(4 * 7 * 24)
        group_size = 168
    elif timeframe == "monthly":
        recent = region_df.tail(12 * 30 * 24)
        group_size = 720
    else:
        recent = region_df.tail(12)
        group_size = 1
    
    results = []
    
    wat_tz = timezone(timedelta(hours=1))
    now = datetime.now(wat_tz)
    
    if timeframe == "hourly":
        for i, row in enumerate(recent.iterrows()):
            # Past 12 hours
            hours_ago = 12 - i
            t = now - timedelta(hours=hours_ago)
            time_str = t.strftime("%I:00 %p")
            
            results.append({
                "time": time_str,
                "value": int(row[1]['Overall_Emissions_Index'] / 7),
                "CO2": round(row[1]['CO2_ppm'], 1),
                "CO": round(row[1]['CO_ppm'], 2),
                "CH4": round(row[1]['CH4_ppm'], 2),
                "CFCs": round(row[1]['CFCs_ppt'], 2),
                "isCurrent": False,
                "type": "historical"
            })
    else:
        num_groups = len(recent) // group_size
        if num_groups == 0: num_groups = 1
        
        for i in range(num_groups):
            chunk = recent.iloc[i * group_size : (i + 1) * group_size]
            steps_ago = num_groups - i
            if timeframe == "daily":
                t = now - timedelta(days=steps_ago)
                time_str = t.strftime("%a, %b %d") # e.g., Mon, Jul 22
            elif timeframe == "weekly":
                t = now - timedelta(weeks=steps_ago)
                time_str = f"Week of {t.strftime('%b %d')}"
            else:
                # Approximate months with 30 days
                t = now - timedelta(days=30 * steps_ago)
                time_str = t.strftime("%b %Y") # e.g., Jun 2026
            
            results.append({
                "time": time_str,
                "value": int(chunk['Overall_Emissions_Index'].mean() / 7),
                "CO2": round(chunk['CO2_ppm'].mean(), 1),
                "CO": round(chunk['CO_ppm'].mean(), 2),
                "CH4": round(chunk['CH4_ppm'].mean(), 2),
                "CFCs": round(chunk['CFCs_ppt'].mean(), 2),
                "isCurrent": False,
                "type": "historical"
            })
    
    if results:
        results[-1]["isCurrent"] = True
        results[-1]["time"] = "NOW"
        
    return results

@app.get("/api/forecast/{region_name}")
def get_forecast(region_name: str, timeframe: str = "hourly"):
    """Uses the ML model to generate forecasts based on timeframe."""
    if ml_model is None or df is None:
        return [{"time": "...", "value": 0, "isCurrent": False, "type": "forecast"}]
        
    region_df = df[df['Region'] == region_name].tail(1)
    if len(region_df) == 0:
        return []
        
    last_row = region_df.iloc[-1]
    
    if timeframe == "hourly":
        steps = 12
        group_size = 1
    elif timeframe == "daily":
        steps = 7 * 24
        group_size = 24
    elif timeframe == "weekly":
        steps = 4 * 7 * 24
        group_size = 168
    elif timeframe == "monthly":
        steps = 12 * 30 * 24
        group_size = 720
    else:
        steps = 12
        group_size = 1
        
    current_lat = last_row['Latitude']
    current_lng = last_row['Longitude']
    current_month = last_row['Month']
    current_day = last_row['Day_of_Week']
    current_hour = last_row['Hour']
    
    # Grab the latest weather values to feed the forecast
    current_temp = last_row['Temperature_C']
    current_hum = last_row['Humidity_pct']
    current_wind = last_row['Wind_Speed_kmh']
    
    raw_predictions = []
    
    for step in range(steps):
        current_hour += 1
        if current_hour > 23:
            current_hour = 0
            current_day = (current_day + 1) % 7
            
        new_step_df = pd.DataFrame(
            [[current_lat, current_lng, current_month, current_day, current_hour, current_temp, current_hum, current_wind]], 
            columns=['Latitude', 'Longitude', 'Month', 'Day_of_Week', 'Hour', 'Temperature_C', 'Humidity_pct', 'Wind_Speed_kmh']
        )
        scaled_step = scaler_X.transform(new_step_df)
        
        scaled_pred = ml_model.predict(scaled_step)[0]
        actual_pred = scaler_y.inverse_transform([scaled_pred])[0]
        
        raw_predictions.append({
            "hour": current_hour,
            "overall": actual_pred[4],
            "CO2": actual_pred[0],
            "CO": actual_pred[1],
            "CH4": actual_pred[2],
            "CFCs": actual_pred[3]
        })
        
    wat_tz = timezone(timedelta(hours=1))
    now = datetime.now(wat_tz)

    results = []
    if timeframe == "hourly":
        for i, p in enumerate(raw_predictions):
            t = now + timedelta(hours=i+1)
            results.append({
                "time": t.strftime("%I:00 %p"),
                "value": int(p["overall"] / 7),
                "CO2": round(p["CO2"], 1),
                "CO": round(p["CO"], 2),
                "CH4": round(p["CH4"], 2),
                "CFCs": round(p["CFCs"], 2),
                "isCurrent": False,
                "type": "forecast"
            })
    else:
        num_groups = len(raw_predictions) // group_size
        for i in range(num_groups):
            chunk = raw_predictions[i*group_size : (i+1)*group_size]
            
            if timeframe == "daily":
                t = now + timedelta(days=i+1)
                t_str = t.strftime("%a, %b %d")
            elif timeframe == "weekly":
                t = now + timedelta(weeks=i+1)
                t_str = f"Week of {t.strftime('%b %d')}"
            else:
                t = now + timedelta(days=30 * (i+1))
                t_str = t.strftime("%b %Y")
            
            results.append({
                "time": t_str,
                "value": int(np.mean([c["overall"] for c in chunk]) / 7),
                "CO2": round(np.mean([c["CO2"] for c in chunk]), 1),
                "CO": round(np.mean([c["CO"] for c in chunk]), 2),
                "CH4": round(np.mean([c["CH4"] for c in chunk]), 2),
                "CFCs": round(np.mean([c["CFCs"] for c in chunk]), 2),
                "isCurrent": False,
                "type": "forecast"
            })
            
    return results

@app.get("/api/health-tips/{region_name}")
def get_health_tips(region_name: str):
    """Generates nuanced, dynamic health forecast tips and government interventions."""
    forecast = get_forecast(region_name)
    if not forecast or len(forecast) == 0 or "CO" not in forecast[0]:
        return {"status": "Loading...", "tips": []}
    
    max_co = max([f["CO"] for f in forecast])
    max_co2 = max([f["CO2"] for f in forecast])
    max_ch4 = max([f["CH4"] for f in forecast])
    max_cfcs = max([f["CFCs"] for f in forecast])
    
    profile = REGION_PROFILES.get(region_name, {"density": 5000, "activity": "Urban", "context": "General emissions"})
    density = profile["density"]
    
    tips = []
    
    # 1. Government / Policy Interventions (Macro)
    if density > 30000 and max_co > 8.0:
        tips.append({
            "type": "Policy", "title": "Urgent: Traffic Rerouting Required", "icon": "shield",
            "desc": f"With {density} people/sq km facing {round(max_co, 1)} ppm CO (Limit: 9 ppm), city planners must temporarily limit heavy-duty diesel traffic in {region_name} to prevent mass respiratory incidents."
        })
    if max_co2 > 900 and "Industrial" in profile["activity"]:
        tips.append({
            "type": "Policy", "title": "Industrial Emission Curtailment", "icon": "shield",
            "desc": f"The ML model links the {round(max_co2, 1)} ppm CO2 spike (Limit: 400 ppm) to {region_name}'s industrial estate. Local environmental agencies should enforce daytime emission caps on surrounding factories."
        })
    if max_cfcs > 100:
        tips.append({
            "type": "Policy", "title": "Investigate CFC Source", "icon": "shield",
            "desc": f"Illegal refrigerant or aerosol venting detected in {region_name} ({round(max_cfcs, 1)} ppt). Environmental inspectors must identify the source to prevent localized ozone depletion."
        })
        
    # 2. Individual / Community Health Interventions (Micro)
    if max_co > 9.0:
        tips.append({
            "type": "Individual", "title": "Critical: Carbon Monoxide Alert", "icon": "mask",
            "desc": f"CO levels will exceed safe limits ({round(max_co, 1)} ppm). Avoid walking near heavy traffic corridors. If you experience dizziness, move indoors immediately."
        })
    elif max_co > 5.0:
        tips.append({
            "type": "Individual", "title": "Moderate CO Exposure", "icon": "mask",
            "desc": f"Due to {profile['activity']} traffic, CO is elevated at {round(max_co, 1)} ppm. Limit outdoor exercise during peak rush hours."
        })
        
    if max_co2 > 1000:
        tips.append({
            "type": "Individual", "title": "Severe CO2 Saturation", "icon": "window",
            "desc": f"Air quality is highly stagnant at {round(max_co2, 1)} ppm (Limit: 400 ppm). Keep windows closed and operate indoor air purifiers on max."
        })
    elif max_co2 > 600:
        tips.append({
            "type": "Individual", "title": "Ventilation Warning", "icon": "wind",
            "desc": f"Elevated CO2 forecasted ({round(max_co2, 1)} ppm). Avoid densely packed indoor areas without proper HVAC filtering."
        })
        
    if max_ch4 > 2.0:
        tips.append({
            "type": "Individual", "title": "Methane (CH4) Spike", "icon": "flame",
            "desc": f"Unusually high methane predicted ({round(max_ch4, 1)} ppm, Limit: 1.8 ppm), possibly from local landfills or gas leaks. Report strong odors to authorities."
        })
        
    # Fallbacks for very clean days
    if len(tips) < 2:
        tips.append({
            "type": "Individual", "title": "Optimal Air Quality", "icon": "heart",
            "desc": f"Forecasts indicate {region_name} will enjoy safe air quality today. Excellent time for outdoor community activities!"
        })
        
    return {
        "status": "Severe" if (max_co > 10 or max_co2 > 1200) else "High" if (max_co > 8 or max_co2 > 900) else "Moderate",
        "tips": tips[:5] # Return top 5 most relevant tips
    }
