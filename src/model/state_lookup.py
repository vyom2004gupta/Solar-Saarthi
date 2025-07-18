import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import json
import os

class StateLookup:
    def __init__(self, geojson_path="INDIA_STATES.geojson"):
        """
        Initialize state lookup with GeoJSON file
        
        Args:
            geojson_path (str): Path to the Indian states GeoJSON file
        """
        self.geojson_path = geojson_path
        self.gdf = None
        self.state_column = None
        self.load_geojson()
    
    def load_geojson(self):
        """Load and validate the GeoJSON file"""
        try:
            print(f"Loading GeoJSON file: {self.geojson_path}")
            self.gdf = gpd.read_file(self.geojson_path)
            print(f"✅ Successfully loaded GeoJSON with {len(self.gdf)} features")
            
            # Print basic info
            print(f"📊 File Info:")
            print(f"   - Number of features: {len(self.gdf)}")
            print(f"   - Geometry types: {self.gdf.geometry.type.value_counts().to_dict()}")
            print(f"   - Available columns: {list(self.gdf.columns)}")
            
            # Find state name column
            self.find_state_column()
            
            # Validate geometries
            self.validate_geometries()
            
        except Exception as e:
            print(f"❌ Error loading GeoJSON: {str(e)}")
            raise
    
    def find_state_column(self):
        """Find the column containing state names"""
        possible_columns = ['state', 'state_name', 'name', 'NAME', 'NAME_1', 'ST_NM', 'State', 'STATE']
        
        for col in possible_columns:
            if col in self.gdf.columns:
                self.state_column = col
                print(f"✅ Found state column: '{col}'")
                print(f"   Sample states: {list(self.gdf[col].head())}")
                return
        
        # If no standard column found, show all string columns
        string_columns = self.gdf.select_dtypes(include=['object']).columns
        print(f"⚠️  No standard state column found. String columns: {list(string_columns)}")
        
        if len(string_columns) > 0:
            # Use the first string column as a guess
            self.state_column = string_columns[0]
            print(f"   Using '{self.state_column}' as state column")
            print(f"   Sample values: {list(self.gdf[self.state_column].head())}")
    
    def validate_geometries(self):
        """Validate that all geometries are valid polygons"""
        print(f"🔍 Validating geometries...")
        
        # Check if geometries are valid
        valid_count = self.gdf.geometry.is_valid.sum()
        total_count = len(self.gdf)
        
        print(f"   - Valid geometries: {valid_count}/{total_count}")
        
        if valid_count < total_count:
            print(f"   ⚠️  {total_count - valid_count} invalid geometries found")
            # Try to fix invalid geometries
            self.gdf.geometry = self.gdf.geometry.buffer(0)
            valid_after_fix = self.gdf.geometry.is_valid.sum()
            print(f"   - After buffer fix: {valid_after_fix}/{total_count} valid")
        
        # Check geometry types
        geom_types = self.gdf.geometry.type.value_counts()
        print(f"   - Geometry types: {geom_types.to_dict()}")
        
        # Check if we have the expected number of states (28 states + 8 UTs = 36)
        expected_states = 36
        actual_states = len(self.gdf)
        print(f"   - Expected ~{expected_states} states/UTs, found {actual_states}")
    
    def get_state_from_coords(self, lat, lon):
        """
        Get state name from latitude and longitude
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            
        Returns:
            str: State name or None if not found
        """
        if self.gdf is None or self.state_column is None:
            raise ValueError("GeoJSON not loaded properly")
        
        point = Point(lon, lat)  # Note: GeoJSON uses [lon, lat] order
        
        # Find which polygon contains the point
        for idx, row in self.gdf.iterrows():
            if row.geometry.contains(point):
                return row[self.state_column]
        
        return None
    
    def test_coordinates(self):
        """Test the lookup with known Indian city coordinates"""
        test_cases = [
            (28.6139, 77.2090, "Delhi"),
            (19.0760, 72.8777, "Maharashtra"),  # Mumbai
            (12.9716, 77.5946, "Karnataka"),    # Bangalore
            (22.5726, 88.3639, "West Bengal"),  # Kolkata
            (13.0827, 80.2707, "Tamil Nadu"),   # Chennai
            (26.9124, 75.7873, "Rajasthan"),    # Jaipur
            (23.0225, 72.5714, "Gujarat"),      # Ahmedabad
            (25.2048, 55.2708, "Dubai"),        # Outside India (should return None)
        ]
        
        print(f"\n🧪 Testing coordinate lookup:")
        print("=" * 60)
        
        for lat, lon, expected in test_cases:
            result = self.get_state_from_coords(lat, lon)
            status = "✅" if result == expected else "❌"
            print(f"{status} ({lat:.4f}, {lon:.4f}) -> {result} (expected: {expected})")
    
    def get_all_states(self):
        """Get list of all states in the GeoJSON"""
        if self.gdf is None or self.state_column is None:
            return []
        
        return sorted(self.gdf[self.state_column].unique().tolist())
    
    def print_state_summary(self):
        """Print summary of all states"""
        states = self.get_all_states()
        print(f"\n📋 States found in GeoJSON ({len(states)} total):")
        for i, state in enumerate(states, 1):
            print(f"   {i:2d}. {state}")

def main():
    """Main function to evaluate the GeoJSON file"""
    print("🔍 Indian States GeoJSON Evaluator")
    print("=" * 50)
    
    # Check if file exists
    geojson_path = "INDIA_STATES.geojson"
    if not os.path.exists(geojson_path):
        print(f"❌ File not found: {geojson_path}")
        print("Please place your INDIAN_STATES.geojson file in the current directory")
        return
    
    try:
        # Initialize state lookup
        state_lookup = StateLookup(geojson_path)
        
        # Print state summary
        state_lookup.print_state_summary()
        
        # Test with known coordinates
        state_lookup.test_coordinates()
        
        # Interactive testing
        print(f"\n🎯 Interactive Testing:")
        print("Enter coordinates to test (or 'quit' to exit):")
        
        while True:
            try:
                user_input = input("Enter lat,lon (e.g., 28.6139,77.2090): ").strip()
                if user_input.lower() == 'quit':
                    break
                
                lat, lon = map(float, user_input.split(','))
                state = state_lookup.get_state_from_coords(lat, lon)
                
                if state:
                    print(f"📍 ({lat}, {lon}) -> {state}")
                else:
                    print(f"📍 ({lat}, {lon}) -> Not found in India")
                    
            except ValueError:
                print("❌ Invalid format. Use: lat,lon (e.g., 28.6139,77.2090)")
            except KeyboardInterrupt:
                break
        
        print("\n✅ Evaluation complete!")
        
    except Exception as e:
        print(f"❌ Error during evaluation: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 