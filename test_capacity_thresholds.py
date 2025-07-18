import requests

# Test cases: (latitude, longitude, roof_area, area_unit, expected_state, expected_cap)
test_cases = [
    # Gujarat, large area (should be capped at 1000)
    (23.0225, 72.5714, 20000, 'sqm', 'Gujarat', 1000),
    # Maharashtra, huge area (should be capped at 5000)
    (19.0760, 72.8777, 60000, 'sqm', 'Maharashtra', 5000),
    # Delhi, huge area (should be capped at 10000)
    (28.6139, 77.2090, 200000, 'sqm', 'Delhi', 10000),
    # Manipur, large area (should be capped at 10)
    (24.8170, 93.9368, 1000, 'sqm', 'Manipur', 10),
    # Rajasthan, small area (should be capped by area, not state)
    (26.9124, 75.7873, 50, 'sqm', 'Rajasthan', 5),
    # Tamil Nadu, area exactly at state cap
    (13.0827, 80.2707, 5000, 'sqm', 'Tamil Nadu', 500),
    # Unknown location (should fallback to 500)
    (0.0, 0.0, 10000, 'sqm', 'Unknown Location', 500),
]

print("\n🧪 Testing State Capacity Thresholds (/predict endpoint)")
print("=" * 60)

for i, (lat, lon, area, unit, expected_state, expected_cap) in enumerate(test_cases, 1):
    payload = {
        "latitude": lat,
        "longitude": lon,
        "roof_area": area,
        "area_unit": unit
    }
    try:
        response = requests.post("http://localhost:8001/predict", json=payload)
        if response.status_code == 200:
            data = response.json()
            state = data.get("state", "?")
            yearly_gen = data.get("yearly_generation", 0)
            print(f"Test {i}: {state} | Area: {area} sqm | Expected Cap: {expected_cap} kW")
            print(f"   Yearly Generation: {yearly_gen:.2f} kWh")
            print(f"   (Check backend logs for cap details)")
        else:
            print(f"Test {i}: HTTP {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Test {i}: Error - {e}") 