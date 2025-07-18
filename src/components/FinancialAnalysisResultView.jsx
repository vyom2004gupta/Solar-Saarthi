import React from 'react';
import { FinancialCharts } from './FinancialCharts';

const FinancialAnalysisResultView = ({ input, result }) => {
  if (!result) return null;
  const isHistorical = input?.isHistorical;
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
        <h2 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
          <span role="img" aria-label="money">💸</span> Your Financial Analysis ({result.state})
        </h2>
        <p className="text-gray-700 mb-2">Estimated <span className="font-bold text-green-700">monthly</span> bill savings: <span className="font-bold text-green-700">₹{result.billSavings?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
        <p className="text-gray-700 mb-2">Original bill: <span className="font-bold">₹{result.originalBill?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> &nbsp;→&nbsp; New bill: <span className="font-bold">₹{result.newBill?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
        {result.exportAllowed && (
          <p className="text-gray-700 mb-2">Estimated <span className="font-bold text-blue-700">monthly</span> export income (from surplus): <span className="font-bold text-blue-700">₹{Math.max(0, result.exportIncome)?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
        )}
        {!result.exportAllowed && (
          <p className="text-gray-700 mb-2">Export income is <span className="font-bold text-red-700">not credited</span> in your state.</p>
        )}
        <div className="flex gap-8 text-sm text-gray-500 mt-2">
          <span>Tariff: ₹{result.tariff}/kWh</span>
          <span>Metering: {result.metering}</span>
          <span>Monthly Generation: {result.produced?.toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh</span>
          <span>Monthly Consumption: {result.consumed?.toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh</span>
          {isHistorical && <span>Month: {result.month}</span>}
        </div>
      </div>
      <FinancialCharts
        monthlySavings={[result.billSavings]}
        monthlyLabels={[result.month]}
        currentMonthlyBill={result.originalBill}
        currentYearlyBill={result.originalBill * 12}
        solarMonthlyBill={result.newBill}
        solarYearlyBill={result.newBill * 12}
        exportIncome={[result.exportIncome]}
        billDecrement={[result.originalBill - result.newBill]}
        exportLabels={["Export Income"]}
        decrementLabels={["Bill Decrement"]}
      />
    </div>
  );
};

export default FinancialAnalysisResultView; 