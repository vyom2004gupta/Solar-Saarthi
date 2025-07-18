import h5py
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

class SolarGHIModel:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.conversion_factor = None
    
    def detect_conversion_factor(self, first_loc):
        """Detect the correct conversion factor for GHI values"""
        typical_daily_sum = np.mean([np.sum(first_loc[d*24:(d+1)*24]) for d in range(30)])
        print(f"Typical daily sum in data: {typical_daily_sum:.1f}")
        
        target_daily_range = (3, 7)  # kWh/m²/day
        current_daily = typical_daily_sum
        
        if current_daily > 20000:
            conversion_factor = 1000
            print("→ Data appears to be in Wh/m², using conversion factor: 1000")
        elif current_daily > 2000:
            conversion_factor = 10000
            print("→ Data appears to be in W/m² with 10x scaling, using conversion factor: 10000")
        else:
            conversion_factor = 1
            print("→ Data appears to be in correct units already")
        
        estimated_daily = current_daily / conversion_factor
        print(f"After conversion, estimated daily average: {estimated_daily:.2f} kWh/m²/day")
        
        if estimated_daily < target_daily_range[0] or estimated_daily > target_daily_range[1]:
            print(f"WARNING: This doesn't match expected range {target_daily_range} for India")
            ideal_factor = current_daily / 5  # Target ~5 kWh/m²/day
            conversion_factor = ideal_factor
            print(f"Auto-adjusting conversion factor to: {conversion_factor:.1f}")
        
        return conversion_factor
    
    def process_ghi_data(self, ghi, coords, conversion_factor):
        """Process GHI data into monthly and yearly values"""
        hours_per_month = [744, 672, 744, 720, 744, 720, 744, 744, 720, 744, 720, 744]
        monthly_ghi = []
        yearly_ghi = []
        features = []
        
        for loc_index in range(ghi.shape[1]):
            start = 0
            month_ghis = []
            
            for month_hours in hours_per_month:
                end = start + month_hours
                monthly_sum = np.sum(ghi[start:end, loc_index])
                monthly_kwh = monthly_sum / conversion_factor
                month_ghis.append(monthly_kwh)
                start = end
            
            monthly_ghi.append(month_ghis)
            yearly_ghi.append(np.mean(month_ghis))
            
            lat, lon = coords[loc_index]
            features.append([lat, lon])
        
        features_df = pd.DataFrame(features, columns=["lat", "lon"])
        monthly_df = pd.DataFrame(monthly_ghi, columns=[f"ghi_month_{i+1}" for i in range(12)])
        yearly_df = pd.Series(yearly_ghi, name="ghi_yearly_avg")
        
        return pd.concat([features_df, monthly_df, yearly_df], axis=1)
    
    def prepare_training_data(self, df):
        """Prepare data for training by expanding into lat, lon, month format"""
        expanded_features = []
        expanded_targets = []
        
        for i, row in df.iterrows():
            lat, lon = row["lat"], row["lon"]
            for month in range(1, 13):
                ghi_value = row[f"ghi_month_{month}"]
                expanded_features.append([lat, lon, month])
                expanded_targets.append(ghi_value)
        
        X = pd.DataFrame(expanded_features, columns=["lat", "lon", "month"])
        y = pd.Series(expanded_targets, name="ghi")
        
        return X, y
    
    def train(self, h5_path, save_path=None):
        """Train the model using data from HDF5 file"""
        with h5py.File(h5_path, 'r') as file:
            ghi = file["GHI_1000"][:]
            coords = file["coordinates"][:]
            
            # Detect conversion factor
            self.conversion_factor = self.detect_conversion_factor(ghi[:, 0])
            
            # Process data
            df = self.process_ghi_data(ghi, coords, self.conversion_factor)
            
            # Prepare training data
            X, y = self.prepare_training_data(df)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train XGBoost model
            self.model = xgb.XGBRegressor(
                n_estimators=400,
                max_depth=5,
                learning_rate=0.08,
                subsample=0.8,
                colsample_bytree=1,
                reg_alpha=1,
                reg_lambda=1,
                random_state=42,
                n_jobs=-1
            )
            
            self.model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"✅ MAE: {mae:.2f} kWh/m²")
            print(f"✅ R² Score: {r2:.2f}")
            
            self.is_trained = True
            
            # Save the model if path is provided
            if save_path:
                joblib.dump(self.model, save_path)
                print(f"Model saved to {save_path}")
    
    def load_model(self, model_path):
        """Load a trained model from file"""
        self.model = joblib.load(model_path)
        self.is_trained = True
    
    def predict(self, latitude, longitude):
        """
        Predict monthly and yearly GHI values for given coordinates
        
        Args:
            latitude (float): Latitude of the location
            longitude (float): Longitude of the location
            
        Returns:
            tuple: (monthly_ghi, yearly_ghi) where
                  monthly_ghi is a list of 12 values
                  yearly_ghi is the total annual value
        """
        if not self.is_trained:
            raise ValueError("Model is not trained. Please train or load a model first.")
        
        months = list(range(1, 13))
        monthly_ghi = []
        
        for month in months:
            X_input = pd.DataFrame([[latitude, longitude, month]], columns=["lat", "lon", "month"])
            pred = self.model.predict(X_input)[0]
            monthly_ghi.append(pred)
        
        yearly_ghi = np.mean(monthly_ghi) * 12  # Convert average to yearly total
        
        return monthly_ghi, yearly_ghi

# Example usage:
if __name__ == "__main__":
    model = SolarGHIModel()
    
    # Train the model
    h5_path = os.path.join("src", "model", "data", "india_spectral_tmy.h5")
    model_save_path = os.path.join("src", "model", "data", "xgboost_model_ghi_predictor.pkl")
    
    # Train and save the model
    model.train(h5_path, save_path=model_save_path)
    
    # Example prediction for BLR
    lat, lon = 12.937321, 77.564018
    monthly_ghi, yearly_ghi = model.predict(lat, lon)
    print(f"\nPredictions for Jaipur ({lat}, {lon}):")
    print(f"Monthly GHI values (kWh/m²):")
    for month, ghi in enumerate(monthly_ghi, 1):
        print(f"  Month {month}: {ghi:.2f}")
    print(f"Yearly GHI total: {yearly_ghi:.2f} kWh/m²/year") 