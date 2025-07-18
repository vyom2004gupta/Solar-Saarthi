from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
try:
    from .solar_model import SolarGHIModel
    from .realtime_model.realtime_solar_model import predict_realtime_ghi
    from .state_lookup import StateLookup
except ImportError:
    from solar_model import SolarGHIModel
    from realtime_model.realtime_solar_model import predict_realtime_ghi
    from state_lookup import StateLookup
import numpy as np
import joblib
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
model = SolarGHIModel()
model_path = os.path.join("src", "model", "data", "xgboost_model_ghi_predictor.pkl")
model.load_model(model_path)

# Load realtime model
realtime_model_path = os.path.join("src", "model", "realtime_model", "xgboost_model_realtime.pkl")
realtime_scaler_path = os.path.join("src", "model", "realtime_model", "scaler_realtime.pkl")

# Initialize state lookup
state_lookup = StateLookup()

# OpenWeather API configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
OPENWEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/forecast"

# State max allowed capacity mapping (kW)
STATE_CAPACITY_LIMITS = {
    'andhra pradesh': 1000,
    'assam': 500,
    'bihar': 1000,
    'chhattisgarh': 500,
    'goa': 500,
    'gujarat': 1000,
    'haryana': 500,
    'himachal pradesh': 500,
    'jammu & kashmir': 1000,
    'jharkhand': 500,
    'karnataka': 500,
    'kerala': 1000,
    'madhya pradesh': 500,
    'maharashtra': 5000,
    'manipur': 10,
    'meghalaya': 500,
    'mizoram': 10,
    'nagaland': 500,
    'odisha': 500,
    'punjab': 500,
    'rajasthan': 1000,
    'sikkim': 500,
    'tamil nadu': 500,
    'telangana': 1000,
    'tripura': 500,
    'uttar pradesh': 1000,
    'uttarakhand': 1000,
    'west bengal': 500,
    'delhi': 10000,  # Dummy high value for Delhi
    'chandigarh': 500,
    'andaman & nicobar': 500,
    'dadra & nagar haveli & diu': 500,
    'ladakh': 1000,
    'lakshadweep': 500,
    'puducherry': 500,
}

# Helper to get state cap (case-insensitive, fallback to 500)
def get_state_capacity_limit(state_name):
    if not state_name:
        return 500
    key = state_name.strip().lower()
    # Try direct match
    if key in STATE_CAPACITY_LIMITS:
        return STATE_CAPACITY_LIMITS[key]
    # Try removing extra spaces and ampersands
    key = key.replace('&', 'and').replace('  ', ' ')
    if key in STATE_CAPACITY_LIMITS:
        return STATE_CAPACITY_LIMITS[key]
    # Try partial match
    for k in STATE_CAPACITY_LIMITS:
        if k in key or key in k:
            return STATE_CAPACITY_LIMITS[k]
    return 500

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    roof_area: float
    area_unit: str  # 'sqm' or 'sqft'

class RealtimePredictionRequest(BaseModel):
    latitude: float
    longitude: float
    roof_area: float
    area_unit: str  # 'sqm' or 'sqft'
    temperature: float  # °C
    wind_speed: float  # m/s
    start_date: str  # YYYY-MM-DD

class PredictionResponse(BaseModel):
    monthly_ghi: list[float]
    yearly_ghi: float
    monthly_generation: list[float]
    yearly_generation: float
    monthly_labels: list[str] = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    # Location information
    state: str
    # Environmental metrics
    co2_saved_yearly: float
    co2_saved_25_years: float
    trees_equivalent: float
    water_saved: float
    coal_saved: float

class RealtimePredictionResponse(BaseModel):
    daily_ghi: list[float]
    total_ghi: float
    daily_generation: list[float]
    total_generation: float
    daily_labels: list[str]  # Will contain dates
    # Location information
    state: str
    # Environmental metrics
    co2_saved_monthly: float
    trees_equivalent: float
    water_saved: float
    coal_saved: float

class WeatherForecastRequest(BaseModel):
    latitude: float
    longitude: float
    start_date: str

class WeatherForecastResponse(BaseModel):
    forecast_data: list[dict]
    message: str

class StateLookupRequest(BaseModel):
    latitude: float
    longitude: float

class StateLookupResponse(BaseModel):
    state: str
    message: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Convert roof area to square meters if needed
        area_in_sqm = request.roof_area
        if request.area_unit == "sqft":
            area_in_sqm = request.roof_area * 0.092903  # Convert sqft to sqm
        
        # Get state from coordinates
        state = state_lookup.get_state_from_coords(request.latitude, request.longitude)
        if not state:
            state = "Unknown Location"
        
        # --- New logic for capacity limits ---
        max_possible_capacity = area_in_sqm / 10  # kW
        state_cap = get_state_capacity_limit(state)
        final_allowed_capacity = min(state_cap, max_possible_capacity)
        
        # Get GHI predictions (in kWh/m²)
        monthly_ghi, yearly_ghi = model.predict(request.latitude, request.longitude)
        
        # Calculate generation based on GHI and system parameters
        system_efficiency = 0.15  # Typical solar panel efficiency
        performance_ratio = 0.75  # Standard performance ratio
        efficiency = system_efficiency * performance_ratio
        
        # Calculate generation (in kWh)
        monthly_generation = [ghi * final_allowed_capacity * 10 * efficiency for ghi in monthly_ghi]
        yearly_generation = sum(monthly_generation)
        
        # Environmental impact calculations based on generation
        co2_per_kwh = 0.82  # kg CO2 per kWh (India's grid emission factor)
        co2_saved_yearly = yearly_generation * co2_per_kwh  # kg CO2/year
        co2_saved_25_years = co2_saved_yearly * 25  # kg CO2 over 25 years
        trees_equivalent = co2_saved_yearly / 20  # One tree absorbs ~20kg CO2 per year
        water_saved = yearly_generation * 3.79  # Liters of water saved per kWh
        coal_saved = yearly_generation * 0.4  # kg of coal saved per kWh
        
        # Round values for cleaner display
        monthly_ghi = [float(round(ghi, 2)) for ghi in monthly_ghi]
        monthly_generation = [float(round(gen, 2)) for gen in monthly_generation]
        yearly_generation = float(round(yearly_generation, 2))
        co2_saved_yearly = float(round(co2_saved_yearly, 2))
        co2_saved_25_years = float(round(co2_saved_25_years, 2))
        trees_equivalent = float(round(trees_equivalent, 1))
        water_saved = float(round(water_saved, 2))
        coal_saved = float(round(coal_saved, 2))
        
        # Print debug information
        print("\nDebug Information:")
        print(f"Location: {request.latitude}, {request.longitude}")
        print(f"Area: {area_in_sqm} m²")
        print(f"State: {state}")
        print(f"Max possible capacity: {max_possible_capacity} kW, State cap: {state_cap} kW, Final allowed: {final_allowed_capacity} kW")
        print(f"Yearly GHI: {yearly_ghi:.2f} kWh/m²")
        print(f"Monthly GHI: {monthly_ghi} kWh/m²")
        print(f"Yearly Generation: {yearly_generation} kWh")
        print(f"Monthly Generation: {monthly_generation} kWh")
        print(f"Environmental Impact:")
        print(f"- CO2 Saved Yearly: {co2_saved_yearly} kg")
        print(f"- CO2 Saved 25 Years: {co2_saved_25_years} kg")
        print(f"- Trees Equivalent: {trees_equivalent}")
        print(f"- Water Saved: {water_saved} L")
        print(f"- Coal Saved: {coal_saved} kg")
        
        return PredictionResponse(
            monthly_ghi=monthly_ghi,
            yearly_ghi=yearly_ghi,
            monthly_generation=monthly_generation,
            yearly_generation=yearly_generation,
            monthly_labels=[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            state=state,
            co2_saved_yearly=co2_saved_yearly,
            co2_saved_25_years=co2_saved_25_years,
            trees_equivalent=trees_equivalent,
            water_saved=water_saved,
            coal_saved=coal_saved
        )
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/predict-realtime", response_model=RealtimePredictionResponse)
async def predict_realtime(request: RealtimePredictionRequest):
    try:
        # Convert roof area to square meters if needed
        area_in_sqm = request.roof_area
        if request.area_unit == "sqft":
            area_in_sqm = request.roof_area * 0.092903  # Convert sqft to sqm
        
        # Get state from coordinates
        state = state_lookup.get_state_from_coords(request.latitude, request.longitude)
        if not state:
            state = "Unknown Location"
        
        # --- New logic for capacity limits ---
        max_possible_capacity = area_in_sqm / 10  # kW
        state_cap = get_state_capacity_limit(state)
        final_allowed_capacity = min(state_cap, max_possible_capacity)
        
        # Get GHI predictions for 30 days (in kWh/m²)
        daily_ghi, total_ghi = predict_realtime_ghi(
            request.latitude,
            request.longitude,
            request.start_date,
            request.temperature,
            request.wind_speed
        )
        
        # Calculate generation based on GHI and system parameters
        system_efficiency = 0.15  # Typical solar panel efficiency
        performance_ratio = 0.75  # Standard performance ratio
        efficiency = system_efficiency * performance_ratio
        
        # Calculate generation (in kWh)
        daily_generation = [ghi * final_allowed_capacity * 10 * efficiency for ghi in daily_ghi]
        total_generation = sum(daily_generation)
        
        # Generate daily labels (dates)
        start_dt = datetime.strptime(request.start_date, '%Y-%m-%d')
        daily_labels = [(start_dt + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
        
        # Environmental impact calculations based on generation
        co2_per_kwh = 0.82  # kg CO2 per kWh (India's grid emission factor)
        co2_saved_monthly = total_generation * co2_per_kwh  # kg CO2/month
        trees_equivalent = co2_saved_monthly / 20  # One tree absorbs ~20kg CO2 per year
        water_saved = total_generation * 3.79  # Liters of water saved per kWh
        coal_saved = total_generation * 0.4  # kg of coal saved per kWh
        
        # Round values for cleaner display
        daily_ghi = [float(round(ghi, 2)) for ghi in daily_ghi]
        daily_generation = [float(round(gen, 2)) for gen in daily_generation]
        total_generation = float(round(total_generation, 2))
        co2_saved_monthly = float(round(co2_saved_monthly, 2))
        trees_equivalent = float(round(trees_equivalent, 1))
        water_saved = float(round(water_saved, 2))
        coal_saved = float(round(coal_saved, 2))
        
        # Print debug information
        print("\nDebug Information (Realtime):")
        print(f"Location: {request.latitude}, {request.longitude}")
        print(f"Area: {area_in_sqm} m²")
        print(f"State: {state}")
        print(f"Max possible capacity: {max_possible_capacity} kW, State cap: {state_cap} kW, Final allowed: {final_allowed_capacity} kW")
        print(f"Total GHI: {total_ghi:.2f} kWh/m²")
        print(f"Total Generation: {total_generation} kWh")
        print(f"Environmental Impact:")
        print(f"- CO2 Saved Monthly: {co2_saved_monthly} kg")
        print(f"- Trees Equivalent: {trees_equivalent}")
        print(f"- Water Saved: {water_saved} L")
        print(f"- Coal Saved: {coal_saved} kg")
        
        return RealtimePredictionResponse(
            daily_ghi=daily_ghi,
            total_ghi=total_ghi,
            daily_generation=daily_generation,
            total_generation=total_generation,
            daily_labels=daily_labels,
            state=state,
            co2_saved_monthly=co2_saved_monthly,
            trees_equivalent=trees_equivalent,
            water_saved=water_saved,
            coal_saved=coal_saved
        )
    
    except Exception as e:
        print(f"Error in realtime prediction: {str(e)}")
        import traceback
        traceback.print_exc()  # Print full stack trace
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/fetch-weather", response_model=WeatherForecastResponse)
async def fetch_weather(request: WeatherForecastRequest):
    try:
        # Fetch 5-day forecast from OpenWeather API
        params = {
            "lat": request.latitude,
            "lon": request.longitude,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",  # For Celsius and m/s
            "cnt": 40  # Get 5 days of data (8 readings per day)
        }
        
        response = requests.get(OPENWEATHER_BASE_URL, params=params)
        response.raise_for_status()
        weather_data = response.json()
        
        # Process and format the forecast data
        start_date = datetime.strptime(request.start_date, '%Y-%m-%d')
        forecast_data = []
        
        # Group data by day and calculate daily averages
        daily_data = {}
        for item in weather_data['list']:
            dt = datetime.fromtimestamp(item['dt'])
            date_key = dt.date()
            
            if date_key not in daily_data:
                daily_data[date_key] = {
                    'temp_sum': 0,
                    'wind_sum': 0,
                    'count': 0
                }
            
            daily_data[date_key]['temp_sum'] += item['main']['temp']
            daily_data[date_key]['wind_sum'] += item['wind']['speed']
            daily_data[date_key]['count'] += 1
        
        # Calculate daily averages and format response
        for i in range(5):  # Get 5 days including start date
            current_date = start_date.date() + timedelta(days=i)
            if current_date in daily_data:
                count = daily_data[current_date]['count']
                forecast_data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'temperature': round(daily_data[current_date]['temp_sum'] / count, 2),
                    'wind_speed': round(daily_data[current_date]['wind_sum'] / count, 2)
                })
        
        return WeatherForecastResponse(
            forecast_data=forecast_data,
            message="Weather forecast fetched successfully"
        )
    
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching weather data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/get-state", response_model=StateLookupResponse)
async def get_state(request: StateLookupRequest):
    """Get state name from latitude and longitude coordinates"""
    try:
        state = state_lookup.get_state_from_coords(request.latitude, request.longitude)
        
        if state:
            return StateLookupResponse(
                state=state,
                message=f"Location found in {state}"
            )
        else:
            return StateLookupResponse(
                state="Unknown Location",
                message="Coordinates are outside India or not found"
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error looking up state: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)