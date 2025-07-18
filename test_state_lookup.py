import requests
import json

# Test the state lookup endpoint
def test_state_lookup():
    url = "http://localhost:8001/get-state"
    
    # Test cases with known Indian cities
    test_cases = [
        {"lat": 28.6139, "lon": 77.2090, "expected": "DELHI"},
        {"lat": 19.0760, "lon": 72.8777, "expected": "MAHARASHTRA"},
        {"lat": 12.9716, "lon": 77.5946, "expected": "KARNATAKA"},
        {"lat": 22.5726, "lon": 88.3639, "expected": "WEST BENGAL"},
        {"lat": 13.0827, "lon": 80.2707, "expected": "TAMIL NADU"},
        {"lat": 26.9124, "lon": 75.7873, "expected": "RAJASTHAN"},
        {"lat": 23.0225, "lon": 72.5714, "expected": "GUJARAT"},
    ]
    
    print("🧪 Testing State Lookup API")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        try:
            response = requests.post(url, json={
                "latitude": test_case["lat"],
                "longitude": test_case["lon"]
            })
            
            if response.status_code == 200:
                data = response.json()
                state = data.get("state", "Unknown")
                message = data.get("message", "")
                
                status = "✅" if state == test_case["expected"] else "❌"
                print(f"{status} Test {i}: ({test_case['lat']}, {test_case['lon']}) -> {state}")
                print(f"   Message: {message}")
            else:
                print(f"❌ Test {i}: HTTP {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Test {i}: Could not connect to server. Make sure the API is running on port 8001.")
            break
        except Exception as e:
            print(f"❌ Test {i}: Error - {str(e)}")

def test_prediction_with_state():
    url = "http://localhost:8001/predict"
    
    test_data = {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "roof_area": 100,
        "area_unit": "sqm"
    }
    
    print(f"\n🧪 Testing Prediction with State Detection")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=test_data)
        
        if response.status_code == 200:
            data = response.json()
            state = data.get("state", "Unknown")
            yearly_generation = data.get("yearly_generation", 0)
            
            print(f"✅ Prediction successful!")
            print(f"   State: {state}")
            print(f"   Yearly Generation: {yearly_generation:.2f} kWh")
            print(f"   CO2 Saved: {data.get('co2_saved_yearly', 0):.2f} kg/year")
        else:
            print(f"❌ HTTP {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the API is running on port 8001.")
    except Exception as e:
        print(f"❌ Error - {str(e)}")

if __name__ == "__main__":
    test_state_lookup()
    test_prediction_with_state() 