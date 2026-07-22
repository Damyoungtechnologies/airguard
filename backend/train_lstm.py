import pandas as pd
import numpy as np
import joblib
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

print("Loading dataset (this might take a moment)...")
df = pd.read_csv('lagos_emissions_dataset.csv')

# Since the data is shuffled, we create a pseudo-chronological sequence by sorting
print("Sorting and preparing data...")
df = df.sort_values(by=['Region', 'Year', 'Month', 'Day_of_Week', 'Hour'])

# We will use Latitude and Longitude to represent the region spatially, plus the time variables
features = ['Latitude', 'Longitude', 'Month', 'Day_of_Week', 'Hour']
target = 'Emissions'

scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

# Fit the scalers on the entire dataset to ensure consistency across regions
df[features] = scaler_X.fit_transform(df[features])
df[[target]] = scaler_y.fit_transform(df[[target]])

# To ensure the training finishes reasonably fast on a CPU without crashing,
# we will sample the dataset. We'll take contiguous blocks from each region.
print("Building sequences...")
df_subset = df.groupby('Region').head(2000).reset_index(drop=True)

LOOKBACK = 5

X, y = [], []
regions = df_subset['Region'].values
feat_vals = df_subset[features].values
targ_vals = df_subset[target].values

for i in range(len(df_subset) - LOOKBACK):
    # Only create a sequence if all timesteps in the window belong to the same Region
    if regions[i] == regions[i + LOOKBACK]:
        X.append(feat_vals[i:i+LOOKBACK])
        y.append(targ_vals[i+LOOKBACK])

X = np.array(X)
y = np.array(y)

print(f"Final training shape: {X.shape}")

model = Sequential([
    LSTM(32, activation='relu', input_shape=(LOOKBACK, len(features))),
    Dense(16, activation='relu'),
    Dense(1)
])

model.compile(optimizer='adam', loss='mse')

print("Training LSTM... (This will run for 3 epochs)")
model.fit(X, y, epochs=3, batch_size=64, validation_split=0.2)

print("Saving models...")
model.save('lstm_model.keras')
joblib.dump(scaler_X, 'scaler_X.pkl')
joblib.dump(scaler_y, 'scaler_y.pkl')

print("Training complete! Models and scalers saved to disk.")
