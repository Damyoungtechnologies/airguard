import pandas as pd
import numpy as np
import joblib
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

def train():
    print("Loading dataset...")
    df = pd.read_csv("lagos_emissions_dataset_v2.csv")
    
    features = ['Latitude', 'Longitude', 'Month', 'Day_of_Week', 'Hour', 'Temperature_C', 'Humidity_pct', 'Wind_Speed_kmh']
    targets = ['Overall_Emissions_Index', 'CO2_ppm', 'CO_ppm', 'CH4_ppm', 'CFCs_ppt']
    
    X = df[features]
    y = df[targets]
    
    # Re-ordering targets to match what main.py expects:
    # CO2=0, CO=1, CH4=2, CFCs=3, overall=4
    # Wait, in main.py it extracts:
    # "overall": actual_pred[4], "CO2": actual_pred[0], "CO": actual_pred[1], "CH4": actual_pred[2], "CFCs": actual_pred[3]
    targets = ['CO2_ppm', 'CO_ppm', 'CH4_ppm', 'CFCs_ppt', 'Overall_Emissions_Index']
    y = df[targets]
    
    scaler_X = StandardScaler()
    scaler_y = StandardScaler()
    
    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y)
    
    print(f"Training MultiOutputRegressor with HistGradientBoostingRegressor on {X.shape[0]} rows...")
    
    base_model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    model = MultiOutputRegressor(base_model)
    model.fit(X_scaled, y_scaled)
    
    print("Saving models...")
    joblib.dump(model, 'ml_model.pkl')
    joblib.dump(scaler_X, 'scaler_X.pkl')
    joblib.dump(scaler_y, 'scaler_y.pkl')
    print("Done!")

if __name__ == "__main__":
    train()
