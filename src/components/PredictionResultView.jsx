import React from 'react';
import { SolarCharts } from './SolarCharts';
import { EnvironmentalCharts } from './EnvironmentalCharts';

const safeNumber = (value, decimals = 2) =>
  typeof value === 'number' ? value.toFixed(decimals) : '0';

const PredictionResultView = ({ input, result }) => {
  if (!result) return null;
  const predictionMode = input?.predictionMode || 'historical';

  return (
    <div className="w-full">
      {/* Solar Generation Charts */}
      {predictionMode === 'historical' ? (
        <>
          {/* Yearly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {safeNumber(result.yearly_ghi)} kWh/m²
              </div>
              <div className="text-blue-600 font-medium">Yearly Solar Irradiance (GHI)</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {safeNumber(result.yearly_generation)} kWh
              </div>
              <div className="text-green-600 font-medium">Estimated Yearly Generation</div>
            </div>
          </div>

          <SolarCharts
            monthlyData={result.monthly_generation}
            monthlyLabels={result.monthly_labels}
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
                    {safeNumber(result.total_ghi)} kWh/m²
                  </div>
                  <div className="text-blue-600 font-medium">Monthly Total</div>
                </div>
                <div className="w-full border-t border-blue-200 my-4"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {safeNumber(result.total_ghi / 30)} kWh/m²
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
                    {safeNumber(result.total_generation)} kWh
                  </div>
                  <div className="text-green-600 font-medium">Monthly Total</div>
                </div>
                <div className="w-full border-t border-green-200 my-4"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {safeNumber(result.total_generation / 30)} kWh
                  </div>
                  <div className="text-green-600 font-medium">Daily Average</div>
                </div>
              </div>
            </div>
          </div>

          <SolarCharts
            dailyData={result.daily_generation}
            dailyLabels={result.daily_labels}
            isRealtime={true}
            dailyGhi={result.daily_ghi}
          />
        </>
      )}

      {/* Environmental Impact */}
      <div className="mt-8">
        <EnvironmentalCharts
          co2SavedYearly={predictionMode === 'historical' ? result.co2_saved_yearly : result.co2_saved_monthly * 12}
          co2Saved25Years={predictionMode === 'historical' ? result.co2_saved_25_years : result.co2_saved_monthly * 12 * 25}
          treesEquivalent={result.trees_equivalent}
          waterSaved={result.water_saved}
          coalSaved={result.coal_saved}
        />
      </div>
    </div>
  );
};

export default PredictionResultView; 