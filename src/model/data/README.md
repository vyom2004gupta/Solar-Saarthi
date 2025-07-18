# Solar GHI Model Data

This directory should contain the following files:

1. `solar_data.h5` - The HDF5 dataset file containing:
   - GHI_1000 dataset with solar irradiance data
   - Format: HDF5 with compound data types
   - Contains latitude, longitude, and GHI values

Please place your .h5 file here before running the model training code.

Note: The model specifically uses the 'GHI_1000' dataset from this .h5 file. 