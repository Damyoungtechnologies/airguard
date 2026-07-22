import pandas as pd
import numpy as np

def inject_weather():
    print("Reading CSV...")
    df = pd.read_csv("lagos_emissions_dataset_v2.csv")
    
    print("Injecting mock weather data...")
    # Lagos typical weather:
    # Temp: 24 - 34 C
    # Humidity: 60 - 90 %
    # Wind: 5 - 20 kmh
    np.random.seed(42)
    
    # We can add some correlation: e.g. higher temp during the day (Hour 10-16)
    temp_base = np.where((df['Hour'] >= 10) & (df['Hour'] <= 16), 32, 26)
    df['Temperature_C'] = np.round(temp_base + np.random.normal(0, 2, len(df)), 1)
    
    hum_base = np.where((df['Hour'] >= 10) & (df['Hour'] <= 16), 65, 85)
    df['Humidity_pct'] = np.round(hum_base + np.random.normal(0, 5, len(df)), 1)
    
    df['Wind_Speed_kmh'] = np.round(np.random.uniform(5, 20, len(df)), 1)
    
    print("Saving updated CSV...")
    df.to_csv("lagos_emissions_dataset_v2.csv", index=False)
    print("Done!")

if __name__ == "__main__":
    inject_weather()
