import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

print("Loading V2 dataset (this might take a moment)...")
df = pd.read_csv('lagos_emissions_dataset_v2.csv')

print("Sorting and preparing data...")
df = df.sort_values(by=['Region', 'Year', 'Month', 'Day_of_Week', 'Hour'])

features = ['Latitude', 'Longitude', 'Month', 'Day_of_Week', 'Hour']
targets = ['CO2_ppm', 'CO_ppm', 'CH4_ppm', 'CFCs_ppt', 'Overall_Emissions_Index']

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

df[features] = scaler_X.fit_transform(df[features])
df[targets] = scaler_y.fit_transform(df[targets])

print("Building training data...")
X = df[features].values
y = df[targets].values

# Split data into 80% training and 20% testing to calculate performance metrics
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training shape: {X_train.shape}")
print(f"Testing shape: {X_test.shape}")

# Wrap HistGradientBoostingRegressor to handle multi-output natively
base_estimator = HistGradientBoostingRegressor(max_iter=150, random_state=42)
model = MultiOutputRegressor(base_estimator)

print("Training multi-target predictive model... (This is super fast!)")
model.fit(X_train, y_train)

print("Evaluating model...")
y_pred = model.predict(X_test)

# Calculate regression metrics
r2 = r2_score(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)

print("\n" + "=" * 60)
print("     MULTI-POLLUTANT FORECASTING MODEL METRICS")
print("=" * 60)
print(f"Average R2 Score: {r2:.4f} (Closer to 1.0 is better)")
print(f"Average MSE:      {mse:.4f} (Lower is better)")
print(f"Average RMSE:     {rmse:.4f} (Lower is better)")
print(f"Average MAE:      {mae:.4f} (Lower is better)")
print("=" * 60 + "\n")

print("Saving models...")
joblib.dump(model, 'ml_model.pkl')
joblib.dump(scaler_X, 'scaler_X.pkl')
joblib.dump(scaler_y, 'scaler_y.pkl')

print("Training complete! Models and scalers saved to disk.")
