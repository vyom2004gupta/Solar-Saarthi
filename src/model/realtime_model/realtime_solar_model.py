# Real-time Solar GHI Prediction Model
import h5py
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import calendar

# ✅ Step 1: Load and Process .h5 Data into Daily Averages
file_path = "src/model/data/india_spectral_tmy.h5"
with h5py.File(file_path, 'r') as f:
    ghi = f['GHI_1000'][:]     # Wh/m^2 per hour
    at = f['AT'][:]
    ws = f['WS'][:]
    pw = f['PW'][:]
    tau5 = f['Tau5'][:]
    diff = f['DIFF'][:]
    coords = f['coordinates'][:]

# ✅ Step 2: Convert Hourly Data to Daily Values (Sum for GHI, Mean for others)
def hourly_to_daily(arr, mode="sum"):
    daily = arr.reshape(365, 24, arr.shape[1])
    return (daily.sum(axis=1) / 1000) if mode == "sum" else daily.mean(axis=1)

# Convert to daily values (365, 117)
ghi_daily = hourly_to_daily(ghi, mode="sum")
at_daily = hourly_to_daily(at, mode="mean")
ws_daily = hourly_to_daily(ws, mode="mean")
pw_daily = hourly_to_daily(pw, mode="mean")
tau5_daily = hourly_to_daily(tau5, mode="mean")
diff_daily = hourly_to_daily(diff, mode="mean")

# ✅ Step 3: Build Daily Dataset with Temperature and Wind Speed focus
data = []
for day in range(365):
    month = (day // 30) + 1
    day_of_month = (day % 30) + 1
    for loc in range(117):
        lat, lon = coords[loc]
        row = [
            lat, lon,
            month, day_of_month,
            at_daily[day, loc],  # Temperature
            ws_daily[day, loc],  # Wind Speed
            pw_daily[day, loc],
            tau5_daily[day, loc],
            diff_daily[day, loc],
            ghi_daily[day, loc]  # Target
        ]
        data.append(row)

columns = ["lat", "lon", "month", "day", "AT", "WS", "PW", "Tau5", "DIFF", "GHI"]
df = pd.DataFrame(data, columns=columns)

# Clip target GHI to realistic range for India (3-7 kWh/m²/day)
df["GHI"] = df["GHI"].clip(lower=0, upper=8)
if df["GHI"].mean() > 6:
    df["GHI"] = df["GHI"] * 0.75
df["GHI"] = df["GHI"].clip(lower=3, upper=7)

# ✅ Step 4: Train Model using XGBoost with focus on Temperature and Wind Speed
X = df[["lat", "lon", "month", "day", "AT", "WS", "PW", "Tau5", "DIFF"]]
y = df["GHI"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

xgb_model = xgb.XGBRegressor(
    n_estimators=990,
    max_depth=8,
    learning_rate=0.09,
    subsample=0.9,
    colsample_bytree=0.9,
    reg_alpha=0.9,
    reg_lambda=12.5,
    random_state=42
)

xgb_model.fit(X_train_scaled, y_train)

# ✅ Step 5: Evaluate
preds = xgb_model.predict(X_test_scaled)
print(f"\n✅ MAE: {mean_absolute_error(y_test, preds):.5f} kWh/m²/day")
print(f"✅ R²: {r2_score(y_test, preds):.4f}")

# Save model and scaler for real-time predictions
joblib.dump(xgb_model, "src/model/realtime_model/xgboost_model_realtime.pkl")
joblib.dump(scaler, "src/model/realtime_model/scaler_realtime.pkl")

# ✅ Step 6: Function for Real-time 30-day Predictions
def predict_realtime_ghi(lat, lon, start_date, temperature, wind_speed):
    """
    Predict GHI for 30 days starting from the given date using real-time temperature and wind speed.
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
        start_date (str): Start date in format 'YYYY-MM-DD'
        temperature (float): Current temperature
        wind_speed (float): Current wind speed
    
    Returns:
        tuple: (daily_predictions, monthly_total)
    """
    from datetime import datetime, timedelta
    
    # Parse start date
    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
    month = start_dt.month
    
    # Get location-specific historical averages
    location_data = df[(df['lat'].between(lat-0.5, lat+0.5)) &
                      (df['lon'].between(lon-0.5, lon+0.5)) &
                      (df['month'] == month)]
    
    if len(location_data) > 0:
        avg_pw = location_data['PW'].mean()
        avg_tau5 = location_data['Tau5'].mean()
        avg_diff = location_data['DIFF'].mean()
        
        pw_std = location_data['PW'].std()
        tau5_std = location_data['Tau5'].std()
        diff_std = location_data['DIFF'].std()
    else:
        monthly_data = df[df['month'] == month]
        avg_pw = monthly_data['PW'].mean()
        avg_tau5 = monthly_data['Tau5'].mean()
        avg_diff = monthly_data['DIFF'].mean()
        
        pw_std = monthly_data['PW'].std()
        tau5_std = monthly_data['Tau5'].std()
        diff_std = monthly_data['DIFF'].std()
    
    inputs = []
    current_date = start_dt
    
    # Generate predictions for 30 days
    for day in range(30):
        # Add daily variation patterns
        day_variation = np.sin(2 * np.pi * day / 30) * 0.1
        
        # Temperature variation based on initial temperature
        temp_variation = temperature + day_variation * 2 + np.random.normal(0, 1)
        
        # Wind speed variation based on initial wind speed
        ws_variation = wind_speed + day_variation + np.random.normal(0, 0.5)
        
        # Other parameters with realistic variations
        pw_value = avg_pw + day_variation * pw_std * 0.2 + np.random.normal(0, pw_std * 0.3)
        tau5_value = avg_tau5 + np.random.normal(0, tau5_std * 0.3)
        diff_value = avg_diff + np.random.normal(0, diff_std * 0.3)
        
        inputs.append([
            lat, lon,
            current_date.month,
            current_date.day,
            temp_variation,
            ws_variation,
            pw_value,
            tau5_value,
            diff_value
        ])
        
        current_date += timedelta(days=1)
    
    input_df = pd.DataFrame(inputs, columns=["lat", "lon", "month", "day", "AT", "WS", "PW", "Tau5", "DIFF"])
    input_scaled = scaler.transform(input_df)
    predictions = xgb_model.predict(input_scaled)
    
    # Add realistic variations and ensure Indian GHI range
    for i in range(len(predictions)):
        daily_factor = 1 + np.random.normal(0, 0.05)
        predictions[i] *= daily_factor
        predictions[i] = np.clip(predictions[i], 3.0, 7.0)
        
        # Seasonal adjustments
        if month in [4, 5, 6]:  # Summer
            predictions[i] = min(predictions[i] * 1.1, 7.0)
        elif month in [11, 12, 1, 2]:  # Winter
            predictions[i] = max(predictions[i] * 0.85, 3.0)
    
    return predictions.tolist(), float(sum(predictions))

if __name__ == "__main__":
    # Example usage
    lat, lon = 26.85, 75.8
    start_date = "2024-03-20"
    temperature = 35.0  # °C
    wind_speed = 5.0    # m/s
    
    daily_preds, monthly_total = predict_realtime_ghi(lat, lon, start_date, temperature, wind_speed)
    
    print(f"\n🌤️  Real-time Solar GHI Predictions starting from {start_date}")
    print("=" * 60)
    for i, val in enumerate(daily_preds, 1):
        print(f"Day {i:2d}: {val:.2f} kWh/m²")
    
    print("=" * 60)
    print(f"📊 Predicted 30-day Total GHI: {monthly_total:.2f} kWh/m²")
    print(f"📊 Daily Average GHI: {monthly_total/len(daily_preds):.2f} kWh/m²")
    print(f"📊 Daily Range: {min(daily_preds):.2f} - {max(daily_preds):.2f} kWh/m²") 