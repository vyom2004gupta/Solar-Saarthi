import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SolarCharts } from '../components/SolarCharts';
import { FinancialCharts } from '../components/FinancialCharts';
import { EnvironmentalCharts } from '../components/EnvironmentalCharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { supabase } from '../supabase/supabaseClient';

const states = [
  'Gujarat', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Other'
];

const PredictionPage = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [location, setLocation] = useState('Gujarat');
  const [area, setArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('sqm');
  const [showResult, setShowResult] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [predictionResults, setPredictionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionMode, setPredictionMode] = useState('historical'); // 'historical' or 'realtime'
  const [temperature, setTemperature] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [startDate, setStartDate] = useState('');
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const chartRef = useRef(null);
  const environmentalRef = useRef(null);
  const navigate = useNavigate();

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!latitude || !longitude || !area) {
      setError('Please provide all required fields: latitude, longitude, and roof area.');
      setIsLoading(false);
      return;
    }

    // Additional validation for real-time mode
    if (predictionMode === 'realtime' && (!temperature || !windSpeed || !startDate)) {
      setError('Please provide all required fields for real-time prediction.');
      setIsLoading(false);
      return;
    }

    try {
      let endpoint = predictionMode === 'historical' ? 'predict' : 'predict-realtime';
      let requestData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        roof_area: parseFloat(area),
        area_unit: areaUnit
      };

      // Add real-time specific data
      if (predictionMode === 'realtime') {
        requestData = {
          ...requestData,
          temperature: parseFloat(temperature),
          wind_speed: parseFloat(windSpeed),
          start_date: startDate
        };
      }

      console.log(`Sending request to ${endpoint} with data:`, requestData);

      const response = await axios.post(`http://localhost:8001/${endpoint}`, requestData);

      console.log('API Response:', response.data);
      // Log the detected state and capacity details
      if (response.data && response.data.state) {
        // These values are not in the response, so we recalculate them here for logging
        const state = response.data.state;
        const area_in_sqm = requestData.area_unit === 'sqft' ? requestData.roof_area * 0.092903 : requestData.roof_area;
        const max_possible_capacity = area_in_sqm / 10;
        // State cap mapping (should match backend)
        const STATE_CAPACITY_LIMITS = {
          'andhra pradesh': 1000, 'assam': 500, 'bihar': 1000, 'chhattisgarh': 500, 'goa': 500, 'gujarat': 1000, 'haryana': 500, 'himachal pradesh': 500, 'jammu & kashmir': 1000, 'jharkhand': 500, 'karnataka': 500, 'kerala': 1000, 'madhya pradesh': 500, 'maharashtra': 5000, 'manipur': 10, 'meghalaya': 500, 'mizoram': 10, 'nagaland': 500, 'odisha': 500, 'punjab': 500, 'rajasthan': 1000, 'sikkim': 500, 'tamil nadu': 500, 'telangana': 1000, 'tripura': 500, 'uttar pradesh': 1000, 'uttarakhand': 1000, 'west bengal': 500, 'delhi': 10000, 'chandigarh': 500, 'andaman & nicobar': 500, 'dadra & nagar haveli & diu': 500, 'ladakh': 1000, 'lakshadweep': 500, 'puducherry': 500,
        };
        let key = state.trim().toLowerCase();
        if (!(key in STATE_CAPACITY_LIMITS)) {
          // Try partial match
          for (const k in STATE_CAPACITY_LIMITS) {
            if (k.includes(key) || key.includes(k)) {
              key = k;
              break;
            }
          }
        }
        const state_cap = STATE_CAPACITY_LIMITS[key] || 500;
        const final_allowed_capacity = Math.min(state_cap, max_possible_capacity);
        console.log(`State: ${state}`);
        console.log(`Roof area: ${area_in_sqm} sqm`);
        console.log(`State cap: ${state_cap} kW`);
        console.log(`Max possible capacity: ${max_possible_capacity} kW`);
        console.log(`Final allowed capacity: ${final_allowed_capacity} kW`);
      } else {
        console.log('No state detected in API response.');
      }
      setPredictionResults(response.data);
      setShowResult(true);
      setActiveTab('results');
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError('Failed to get predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCoordinates = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert('Unable to fetch location. Please allow location access.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleFetchWeather = async (e) => {
    e.preventDefault();
    if (!latitude || !longitude || !startDate) {
      setError('Please provide latitude, longitude, and start date to fetch weather data.');
      return;
    }

    setIsFetchingWeather(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8001/fetch-weather', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        start_date: startDate
      });

      setWeatherForecast(response.data.forecast_data);
      
      // Set the first day's weather data to the inputs
      if (response.data.forecast_data.length > 0) {
        const firstDay = response.data.forecast_data[0];
        setTemperature(firstDay.temperature.toString());
        setWindSpeed(firstDay.wind_speed.toString());
      }
    } catch (err) {
      console.error('Weather API Error:', err.response?.data || err.message);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Helper function to safely access nested properties
  const safeNumber = (value, decimals = 2) => {
    return typeof value === 'number' ? value.toFixed(decimals) : '0';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/public/images/SignupOptionsimage.jpg')",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-white/40 z-0"></div>

      {/* Navbar */}
      <nav className="w-full bg-white flex items-center justify-between px-10 h-16 shadow-sm sticky top-0 z-10">
        <div className="font-bold text-2xl text-green-900 font-poppins tracking-tighter">SolarSaarthi</div>
        <ul className="flex gap-8 list-none m-0 p-0">
          <li className="text-base text-gray-800 font-poppins cursor-pointer transition-colors hover:text-purple-500">
            <Link to="/">Home</Link>
          </li>
          <li className="text-base text-gray-800 font-poppins cursor-pointer transition-colors hover:text-purple-500">Solar Insights</li>
          <li className="text-base text-gray-800 font-poppins cursor-pointer transition-colors hover:text-purple-500">Solar Map</li>
          <li className="text-base text-gray-800 font-poppins cursor-pointer transition-colors hover:text-purple-500">Experiences</li>
          <li className="text-base text-gray-800 font-poppins cursor-pointer transition-colors hover:text-purple-500">About Us</li>
        </ul>
      </nav>

      {/* Tab Navigation */}
      <div 
        className="flex justify-center items-center mx-auto mt-8 gap-0 rounded-t-lg max-w-4xl w-full relative z-10"
        style={{
          background: "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('/public/images/SignupOptionsimage.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          borderRadius: "12px 12px 0 0"
        }}
      >
        <button 
          className={`flex-1 py-3.5 text-lg font-poppins ${activeTab === 'calculator' 
            ? 'bg-white text-purple-500 border-b-2 border-b-purple-500 rounded-t-lg z-10' 
            : 'bg-gray-100 text-gray-500 rounded-t-lg'}`} 
          onClick={() => setActiveTab('calculator')}
        >Calculator</button>
        <button 
          className={`flex-1 py-3.5 text-lg font-poppins ${activeTab === 'results' 
            ? 'bg-white text-purple-500 border-b-2 border-b-purple-500 rounded-t-lg z-10' 
            : 'bg-gray-100 text-gray-500 rounded-t-lg'}`} 
          onClick={() => setActiveTab('results')}
        >Results</button>
      </div>

      {/* Content Area */}
      <div className={`flex justify-center items-start min-h-[60vh] bg-gray-50 p-8 ${activeTab === 'results' ? 'max-w-6xl' : 'max-w-4xl'} w-full mx-auto rounded-lg relative z-10`}>
        {activeTab === 'calculator' && (
          <form className="bg-white rounded-lg shadow-md p-8 min-w-[600px] max-w-4xl w-full mx-auto flex flex-col gap-4" onSubmit={handleCalculate}>
            <h2 className="font-poppins text-2xl font-bold text-gray-800 mb-0">Solar Calculator</h2>
            <p className="font-poppins text-base text-gray-500 mb-4">Enter your details to calculate solar potential</p>
            
            {/* Prediction Mode Selection */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  predictionMode === 'historical'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setPredictionMode('historical')}
              >
                Calculate Historical
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  predictionMode === 'realtime'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setPredictionMode('realtime')}
              >
                Calculate Real-time
              </button>
            </div>

            <div className="flex gap-8 mb-0">
              <div className="flex-1 flex flex-col gap-2 min-w-[220px]">
                <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">Latitude</label>
                <input 
                  type="text" 
                  value={latitude} 
                  readOnly 
                  placeholder="Latitude"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100" 
                />
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-[220px]">
                <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">Longitude</label>
                <input 
                  type="text" 
                  value={longitude} 
                  readOnly 
                  placeholder="Longitude"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100" 
                />
              </div>
            </div>

            <div className="flex justify-center mb-0">
              <button 
                className="mt-4 w-56 py-3 text-base font-medium bg-purple-500 text-white border-2 border-purple-500 rounded-lg cursor-pointer transition-colors hover:bg-purple-600" 
                type="button" 
                onClick={handleFetchCoordinates}
              >
                Fetch Coordinates
              </button>
            </div>

            <div className="flex gap-8 mb-0">
              <div className="flex-1 flex flex-col gap-2 min-w-[220px]">
                <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">
                  Roof Area Available 
                  <span className="inline-block bg-gray-200 text-purple-500 rounded-full w-5 h-5 text-center leading-5 ml-1 text-sm font-normal">i</span>
                </label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number"
                    min="0"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                  />
                  <select 
                    value={areaUnit}
                    onChange={e => setAreaUnit(e.target.value)}
                    className="w-20 min-w-[60px] px-2 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                  >
                    <option value="sqm">sqm</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Real-time specific inputs */}
            {predictionMode === 'realtime' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      className={`mt-2 w-56 py-3 text-base font-medium ${
                        isFetchingWeather
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-500 hover:bg-purple-600'
                      } text-white border-2 border-purple-500 rounded-lg transition-colors`}
                      onClick={handleFetchWeather}
                      disabled={isFetchingWeather}
                    >
                      {isFetchingWeather ? 'Fetching Weather...' : 'Fetch Weather'}
                    </button>
                  </div>

                  {/* Weather Forecast Display */}
                  {weatherForecast && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-poppins text-lg font-semibold text-gray-800 mb-3">5-Day Weather Forecast</h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {weatherForecast.map((day, index) => (
                          <div
                            key={day.date}
                            className={`p-3 rounded-lg ${
                              index === 0 ? 'bg-purple-100 border-2 border-purple-300' : 'bg-white border border-gray-200'
                            }`}
                          >
                            <div className="text-sm font-medium text-gray-600">{new Date(day.date).toLocaleDateString()}</div>
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="font-medium text-purple-600">Temp:</span> {day.temperature}°C
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-purple-600">Wind:</span> {day.wind_speed} m/s
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-8">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        value={temperature}
                        onChange={e => setTemperature(e.target.value)}
                        placeholder="Enter temperature"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="font-poppins text-base text-purple-500 font-medium mb-0.5">
                        Wind Speed (m/s)
                      </label>
                      <input
                        type="number"
                        value={windSpeed}
                        onChange={e => setWindSpeed(e.target.value)}
                        placeholder="Enter wind speed"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-center mt-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-center mb-0">
              <button 
                className="mt-4 w-56 py-3.5 text-lg font-semibold bg-purple-500 text-white border-none rounded-xl shadow-sm cursor-pointer transition-colors hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'results' && showResult && predictionResults && (
          <div className="w-full">
            {/* Solar Generation Charts */}
            {predictionMode === 'historical' ? (
              <>
                {/* Yearly Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {safeNumber(predictionResults.yearly_ghi)} kWh/m²
                    </div>
                    <div className="text-blue-600 font-medium">Yearly Solar Irradiance (GHI)</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {safeNumber(predictionResults.yearly_generation)} kWh
                    </div>
                    <div className="text-green-600 font-medium">Estimated Yearly Generation</div>
                  </div>
                </div>

                <SolarCharts
                  monthlyData={predictionResults.monthly_generation}
                  monthlyLabels={predictionResults.monthly_labels}
                />
              </>
            ) : (
              <>
                {/* Monthly and Daily Average Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">Solar Irradiance (GHI)</h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {safeNumber(predictionResults.total_ghi)} kWh/m²
                        </div>
                        <div className="text-blue-600 font-medium">Monthly Total</div>
                      </div>
                      <div className="w-full border-t border-blue-200 my-4"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {safeNumber(predictionResults.total_ghi / 30)} kWh/m²
                        </div>
                        <div className="text-blue-600 font-medium">Daily Average</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">Power Generation</h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {safeNumber(predictionResults.total_generation)} kWh
                        </div>
                        <div className="text-green-600 font-medium">Monthly Total</div>
                      </div>
                      <div className="w-full border-t border-green-200 my-4"></div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {safeNumber(predictionResults.total_generation / 30)} kWh
                        </div>
                        <div className="text-green-600 font-medium">Daily Average</div>
                      </div>
                    </div>
                  </div>
                </div>

                <SolarCharts
                  dailyData={predictionResults.daily_generation}
                  dailyLabels={predictionResults.daily_labels}
                  isRealtime={true}
                  dailyGhi={predictionResults.daily_ghi}
                />
              </>
            )}

            {/* Environmental Impact */}
            <div className="mt-8" ref={environmentalRef}>
              <EnvironmentalCharts
                co2SavedYearly={predictionMode === 'historical' ? predictionResults.co2_saved_yearly : predictionResults.co2_saved_monthly * 12}
                co2Saved25Years={predictionMode === 'historical' ? predictionResults.co2_saved_25_years : predictionResults.co2_saved_monthly * 12 * 25}
                treesEquivalent={predictionResults.trees_equivalent}
                waterSaved={predictionResults.water_saved}
                coalSaved={predictionResults.coal_saved}
              />
            </div>

            {/* Download Report Button */}
            <div className="flex flex-col items-center mt-8 mb-4 gap-4">
              <button
                onClick={handlePrint}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span>Print Report</span>
              </button>
              <button
                onClick={() => {
                  if (!predictionResults) return;
                  const state = predictionResults.state;
                  const yearly_generation =
                    predictionMode === 'historical'
                      ? predictionResults.yearly_generation
                      : predictionResults.total_generation;
                  const monthly_generation =
                    predictionMode === 'historical'
                      ? predictionResults.monthly_generation
                      : undefined;
                  const daily_generation =
                    predictionMode === 'realtime'
                      ? predictionResults.daily_generation
                      : undefined;
                  navigate('/tariff', {
                    state: {
                      state,
                      yearly_generation,
                      monthly_generation,
                      daily_generation
                    }
                  });
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 4h1a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2h1" />
                </svg>
                <span>View State Tariff & Policy Info</span>
              </button>
              {/* Save to Profile Button */}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center space-x-2"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    alert('Please log in to save your prediction.');
                    return;
                  }
                  const inputData = {
                    latitude,
                    longitude,
                    area,
                    areaUnit,
                    predictionMode,
                    temperature,
                    windSpeed,
                    startDate
                  };
                  const resultData = predictionResults;
                  const { error } = await supabase
                    .from('predictions')
                    .insert([
                      {
                        user_id: user.id,
                        input_data: inputData,
                        result_data: resultData,
                      }
                    ]);
                  if (error) {
                    alert('Failed to save prediction: ' + error.message);
                  } else {
                    alert('Prediction saved to your profile!');
                  }
                }}
              >
                Save to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionPage;