import pandas as pd
import numpy as np
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import time

def evaluate_model():
    print("Loading dataset...")
    df = pd.read_csv("lagos_emissions_dataset_v2.csv")
    df = df.sample(n=min(10000, len(df)), random_state=42)
    
    # KFold will shuffle anyway, so sorting is not strictly necessary
    
    features = ['Latitude', 'Longitude', 'Month', 'Day_of_Week', 'Hour', 'Temperature_C', 'Humidity_pct', 'Wind_Speed_kmh']
    targets = ['CO2_ppm', 'CO_ppm', 'CH4_ppm', 'CFCs_ppt', 'Overall_Emissions_Index']
    
    X = df[features]
    y = df[targets]
    
    print(f"Dataset shape: {X.shape}")
    print("Initializing MultiOutput HistGradientBoostingRegressor...")
    base_model = HistGradientBoostingRegressor(max_iter=100, random_state=42)
    model = MultiOutputRegressor(base_model)
    
    # K-Fold Cross Validation
    n_splits = 5
    kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    print(f"\nStarting {n_splits}-Fold Cross Validation...")
    
    r2_scores = []
    mse_scores = []
    mae_scores = []
    
    start_time = time.time()
    
    for fold, (train_idx, test_idx) in enumerate(kf.split(X)):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        # Train
        model.fit(X_train, y_train)
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Evaluate
        r2 = r2_score(y_test, y_pred, multioutput='uniform_average')
        mse = mean_squared_error(y_test, y_pred, multioutput='uniform_average')
        mae = mean_absolute_error(y_test, y_pred, multioutput='uniform_average')
        
        r2_scores.append(r2)
        mse_scores.append(mse)
        mae_scores.append(mae)
        
        print(f"Fold {fold+1} | R2 Score: {r2:.4f} | MSE: {mse:.4f} | MAE: {mae:.4f}")
        
    end_time = time.time()
    
    print("\n" + "="*40)
    print("      MODEL PERFORMANCE SUMMARY      ")
    print("="*40)
    print(f"Average R2 Score : {np.mean(r2_scores):.4f} (± {np.std(r2_scores):.4f})")
    print(f"Average MSE      : {np.mean(mse_scores):.4f} (± {np.std(mse_scores):.4f})")
    print(f"Average MAE      : {np.mean(mae_scores):.4f} (± {np.std(mae_scores):.4f})")
    print(f"Total Time       : {end_time - start_time:.2f} seconds")
    print("="*40)

if __name__ == "__main__":
    evaluate_model()
