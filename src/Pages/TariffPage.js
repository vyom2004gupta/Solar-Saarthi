import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FinancialCharts } from '../components/FinancialCharts';
import { supabase } from '../supabase/supabaseClient';

// Tariff and policy mapping (simplified for demo)
const TARIFF_DATA = {
  'andhra pradesh': { metering: 'Net & Gross', export: 2.4, gross: 3.7, policy: 'APERC 2023 - % of APPC', exportAllowed: true, status: 'confirmed' },
  'arunachal pradesh': { metering: 'Net', export: 6.0, policy: 'Retail rate assumed', exportAllowed: true, status: 'estimated' },
  'assam': { metering: 'Net & Gross', export: 4.0, policy: 'No fixed rate, APPC-based', exportAllowed: true, status: 'estimated' },
  'bihar': { metering: 'Net', export: 6.3, policy: 'Retail tariff tier 2', exportAllowed: true, status: 'confirmed' },
  'chhattisgarh': { metering: 'Net', export: 6.1, policy: 'Avg domestic slab', exportAllowed: true, status: 'estimated' },
  'goa': { metering: 'Net', export: 6.0, policy: 'Based on low-tension tariff', exportAllowed: true, status: 'estimated' },
  'gujarat': { metering: 'Net & Gross', export: 5.5, gross: 3.0, policy: 'Net: 1:1 until 2030, then 80% of retail', exportAllowed: true, status: 'confirmed' },
  'haryana': { metering: 'Net & Gross', export: 3.11, policy: 'HERC 2021', exportAllowed: true, status: 'confirmed' },
  'himachal pradesh': { metering: 'Net', export: 5.5, policy: 'Avg residential', exportAllowed: true, status: 'estimated' },
  'jammu & kashmir': { metering: 'Net', export: 5.8, policy: 'Per UT policy', exportAllowed: true, status: 'estimated' },
  'jharkhand': { metering: 'Net & Gross', export: 3.8, gross: 4.16, policy: 'JSERC Tariff Order 2023-24', exportAllowed: true, status: 'confirmed' },
  'karnataka': { metering: 'Net & Gross', export: 2.9, policy: 'KERC Generic Tariff 2024', exportAllowed: true, status: 'confirmed' },
  'kerala': { metering: 'Net', export: 6.0, policy: 'KSERC policy', exportAllowed: true, status: 'confirmed' },
  'madhya pradesh': { metering: 'Net', export: 6.2, policy: 'MPSERC', exportAllowed: true, status: 'confirmed' },
  'maharashtra': { metering: 'Net', export: 6.1, policy: 'MSEDCL residential rate', exportAllowed: true, status: 'confirmed' },
  'manipur': { metering: 'Net', export: 5.8, policy: 'NE state average', exportAllowed: true, status: 'estimated' },
  'meghalaya': { metering: 'Net', export: 6.0, policy: '-', exportAllowed: true, status: 'estimated' },
  'uttar pradesh': { metering: 'Net', export: 6.0, policy: 'PVUNL, NPCL rates', exportAllowed: true, status: 'confirmed' },
  'west bengal': { metering: 'Net', export: 4.5, policy: 'Net metering paused (2019)', exportAllowed: false, status: 'confirmed' },
  'delhi': { metering: 'Net', export: 6.0, policy: 'Adjusted at year-end', exportAllowed: true, status: 'confirmed' },
  'ladakh': { metering: 'Net', export: 5.8, policy: '-', exportAllowed: true, status: 'estimated' },
  'puducherry': { metering: 'Net', export: 5.8, policy: '-', exportAllowed: true, status: 'estimated' },
  'daman & diu': { metering: 'Net', export: 3.9, policy: 'Low domestic rate', exportAllowed: true, status: 'estimated' },
  'andaman & nicobar': { metering: 'Net', export: 6.5, policy: '-', exportAllowed: true, status: 'estimated' },
  'lakshadweep': { metering: 'Net', export: 6.0, policy: '-', exportAllowed: true, status: 'estimated' },
  'chandigarh': { metering: 'Net', export: 5.9, policy: 'Smart grid zone', exportAllowed: true, status: 'estimated' },
  'mizoram': { metering: 'Net', export: 5.5, policy: '-', exportAllowed: true, status: 'estimated' },
  'nagaland': { metering: 'Net', export: 5.8, policy: '-', exportAllowed: true, status: 'estimated' },
  'odisha': { metering: 'Net', export: 5.9, policy: 'CESU', exportAllowed: true, status: 'confirmed' },
  'punjab': { metering: 'Net', export: 0.0, policy: 'Surplus not credited', exportAllowed: false, status: 'confirmed' },
  'rajasthan': { metering: 'Net', export: 0.0, policy: 'Surplus goes to grid', exportAllowed: false, status: 'confirmed' },
  'sikkim': { metering: 'Net', export: 6.2, policy: '-', exportAllowed: true, status: 'estimated' },
  'tamil nadu': { metering: 'Net', export: 6.0, policy: '≤ 10 kW systems only', exportAllowed: true, status: 'confirmed' },
  'telangana': { metering: 'Net', export: 6.3, policy: 'TSSPDCL', exportAllowed: true, status: 'confirmed' },
  'tripura': { metering: 'Net', export: 6.0, policy: '-', exportAllowed: true, status: 'estimated' },
  'uttarakhand': { metering: 'Net', export: 6.0, policy: 'UERC domestic slabs', exportAllowed: true, status: 'confirmed' },
};

const fallbackTariff = { metering: 'Net', export: 5.0, policy: 'Fallback rate', exportAllowed: true };
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Slab mapping: stateKey -> array of { upTo, rate }
const SLAB_DATA = {
  'andhra pradesh': [
    { upTo: 50, rate: 2.60 },
    { upTo: 100, rate: 3.25 },
    { upTo: 150, rate: 4.88 },
    { upTo: 200, rate: 5.63 },
    { upTo: 250, rate: 6.38 },
    { upTo: 300, rate: 6.88 },
    { upTo: 400, rate: 7.38 },
    { upTo: 500, rate: 7.88 },
    { upTo: Infinity, rate: 8.38 },
  ],
  'telangana': [
    { upTo: 50, rate: 1.95 },
    { upTo: 100, rate: 3.10 },
    { upTo: 200, rate: 4.80 },
    { upTo: 300, rate: 7.70 },
    { upTo: 400, rate: 9.00 },
    { upTo: 800, rate: 9.50 },
    { upTo: Infinity, rate: 10.00 },
  ],
  'uttar pradesh': [
    { upTo: 100, rate: 5.50 },
    { upTo: 150, rate: 6.00 },
    { upTo: 300, rate: 6.50 },
    { upTo: Infinity, rate: 7.00 },
  ],
  'delhi': [
    { upTo: 200, rate: 3.00 },
    { upTo: 400, rate: 4.50 },
    { upTo: 800, rate: 6.50 },
    { upTo: 1200, rate: 7.00 },
    { upTo: Infinity, rate: 8.00 },
  ],
  'haryana': [
    { upTo: 50, rate: 2.20 },
    { upTo: 100, rate: 2.70 },
    { upTo: 150, rate: 2.95 },
    { upTo: 300, rate: 5.25 },
    { upTo: 500, rate: 6.45 },
    { upTo: Infinity, rate: 7.10 },
  ],
  'kerala': [
    { upTo: 50, rate: 3.30 },
    { upTo: 100, rate: 4.15 },
    { upTo: 150, rate: 5.25 },
    { upTo: 200, rate: 7.10 },
    { upTo: 250, rate: 8.35 },
    { upTo: 300, rate: 6.55 },
    { upTo: 350, rate: 7.40 },
    { upTo: 400, rate: 7.75 },
    { upTo: 500, rate: 8.05 },
    { upTo: Infinity, rate: 9.00 },
  ],
  'rajasthan': [
    { upTo: 50, rate: 3.50 },
    { upTo: 150, rate: 5.00 },
    { upTo: 300, rate: 6.50 },
    { upTo: Infinity, rate: 8.00 },
  ],
  'maharashtra': [
    { upTo: 100, rate: 3.50 },
    { upTo: 300, rate: 5.00 },
    { upTo: 500, rate: 6.50 },
    { upTo: Infinity, rate: 8.00 },
  ],
  'gujarat': [
    { upTo: 50, rate: 3.80 },
    { upTo: 100, rate: 4.80 },
    { upTo: 200, rate: 6.00 },
    { upTo: Infinity, rate: 7.00 },
  ],
  'bihar': [
    { upTo: 50, rate: 4.00 },
    { upTo: 100, rate: 5.20 },
    { upTo: 200, rate: 6.20 },
    { upTo: Infinity, rate: 7.20 },
  ],
  'odisha': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.50 },
    { upTo: 400, rate: 5.50 },
    { upTo: Infinity, rate: 6.50 },
  ],
  'chhattisgarh': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.50 },
    { upTo: 400, rate: 5.50 },
    { upTo: Infinity, rate: 6.50 },
  ],
  'west bengal': [
    { upTo: 102, rate: 3.80 },
    { upTo: 180, rate: 5.20 },
    { upTo: Infinity, rate: 6.80 },
  ],
  'karnataka': [
    { upTo: Infinity, rate: 5.80 },
  ],
  'jharkhand': [
    { upTo: Infinity, rate: 6.00 },
  ],
  'punjab': [
    { upTo: 300, rate: 5.72 },
    { upTo: 500, rate: 6.44 },
    { upTo: Infinity, rate: 6.80 },
  ],
  'jammu & kashmir': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.00 },
    { upTo: Infinity, rate: 5.50 },
  ],
  'ladakh': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.00 },
    { upTo: Infinity, rate: 5.50 },
  ],
  'tripura': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'mizoram': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'manipur': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'nagaland': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'meghalaya': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'arunachal pradesh': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'sikkim': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'puducherry': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'andaman & nicobar': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'chandigarh': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'lakshadweep': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'dadra & nagar haveli & diu': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'himachal pradesh': [
    { upTo: 60, rate: 3.10 },
    { upTo: 250, rate: 4.60 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'uttarakhand': [
    { upTo: 100, rate: 3.20 },
    { upTo: 200, rate: 4.70 },
    { upTo: Infinity, rate: 6.20 },
  ],
  'goa': [
    { upTo: 100, rate: 2.85 },
    { upTo: 200, rate: 4.50 },
    { upTo: Infinity, rate: 6.00 },
  ],
  'madhya pradesh': [
    { upTo: 100, rate: 3.75 },
    { upTo: 200, rate: 5.00 },
    { upTo: 500, rate: 6.25 },
    { upTo: Infinity, rate: 7.50 },
  ],
  'tamil nadu': [
    { upTo: 100, rate: 3.00 },
    { upTo: 200, rate: 4.50 },
    { upTo: 500, rate: 6.00 },
    { upTo: Infinity, rate: 7.00 },
  ],
  'assam': [
    { upTo: 100, rate: 3.50 },
    { upTo: 200, rate: 4.80 },
    { upTo: Infinity, rate: 6.00 },
  ],
};

// Calculate bill for a given consumption and slab structure
function calculateSlabBill(consumption, slabs) {
  let bill = 0;
  let prev = 0;
  for (let i = 0; i < slabs.length; i++) {
    const { upTo, rate } = slabs[i];
    const slabUnits = Math.max(0, Math.min(consumption, upTo) - prev);
    bill += slabUnits * rate;
    prev = upTo;
    if (consumption <= upTo) break;
  }
  return bill;
}

// Calculate new slab allocation after solar offsets the most expensive units first
function calculatePostSolarBill(consumption, solarGen, slabs) {
  // Work backwards from the highest slab
  let remainingSolar = solarGen;
  let slabAlloc = [];
  let prev = 0;
  // First, calculate original slab allocations
  for (let i = 0; i < slabs.length; i++) {
    const { upTo } = slabs[i];
    const slabUnits = Math.max(0, Math.min(consumption, upTo) - prev);
    slabAlloc.push(slabUnits);
    prev = upTo;
    if (consumption <= upTo) break;
  }
  // Now, offset from the highest slab down
  for (let i = slabAlloc.length - 1; i >= 0 && remainingSolar > 0; i--) {
    const used = Math.min(slabAlloc[i], remainingSolar);
    slabAlloc[i] -= used;
    remainingSolar -= used;
  }
  // Calculate new bill
  let bill = 0;
  for (let i = 0; i < slabAlloc.length; i++) {
    bill += slabAlloc[i] * slabs[i].rate;
  }
  return bill;
}

const TariffPage = () => {
  const location = useLocation();
  const { state = 'Gujarat', yearly_generation = 10000, monthly_generation = null, daily_generation = null } = location.state || {};
  const [unitsConsumed, setUnitsConsumed] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = January
  const [results, setResults] = useState(null);

  // Determine mode
  const isHistorical = Array.isArray(monthly_generation) && monthly_generation.length === 12;
  const isRealtime = Array.isArray(daily_generation) && daily_generation.length > 0;

  const stateKey = state.trim().toLowerCase();
  const tariffInfo = TARIFF_DATA[stateKey] || fallbackTariff;

  // Get monthly generation for selected mode
  let monthlyGen = 0;
  if (isHistorical) {
    monthlyGen = monthly_generation[selectedMonth] || 0;
  } else if (isRealtime) {
    monthlyGen = Array.isArray(daily_generation) ? daily_generation.reduce((a, b) => a + b, 0) : yearly_generation;
  } else {
    monthlyGen = yearly_generation / 12;
  }

  const handleCalculate = () => {
    const consumed = parseFloat(unitsConsumed);
    const produced = parseFloat(monthlyGen);
    const tariff = parseFloat(tariffInfo.export);
    const exportAllowed = tariffInfo.exportAllowed;
    // Slab-based bill calculation
    const slabs = SLAB_DATA[stateKey];
    let originalBill = 0.0;
    let newBill = 0.0;
    if (slabs) {
      originalBill = parseFloat(calculateSlabBill(consumed, slabs));
      newBill = parseFloat(calculatePostSolarBill(consumed, produced, slabs));
    } else {
      // Fallback: flat rate
      originalBill = consumed * 5.0;
      newBill = Math.max(0, consumed - produced) * 5.0;
    }
    const billSavings = parseFloat(originalBill - newBill);
    // Export income: only if allowed and production > consumption
    let exportIncome = 0.0;
    if (exportAllowed && produced > consumed) {
      exportIncome = parseFloat((produced - consumed) * tariff);
    }
    setResults({
      billSavings,
      exportIncome,
      exportAllowed,
      tariff,
      policy: tariffInfo.policy,
      metering: tariffInfo.metering,
      state,
      produced,
      consumed,
      month: isHistorical ? MONTHS[selectedMonth] : 'Current Month',
      originalBill,
      newBill,
    });
    // Console logs for debugging
    console.log('State:', state);
    console.log('Tariff info:', tariffInfo);
    console.log('Units consumed:', consumed);
    console.log('Monthly generation:', produced);
    console.log('Original bill:', originalBill);
    console.log('New bill:', newBill);
    console.log('Bill savings:', billSavings);
    console.log('Export income:', exportIncome);
    if (isHistorical) console.log('Selected month:', MONTHS[selectedMonth]);
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

      {/* Main Content */}
      <div className="flex justify-center items-start min-h-[60vh] bg-gray-50 p-8 max-w-4xl w-full mx-auto rounded-lg relative z-10 mt-10">
        <div className="w-full">
          <h1 className="font-poppins text-3xl font-bold text-purple-700 mb-4">State-wise Net Metering Policies & Tariff Rates</h1>
          <p className="font-poppins text-base text-gray-600 mb-8">Find the latest net metering and feed-in tariff policies for your state. This information is updated regularly from official sources and regulatory commissions.</p>

          {/* User input for units consumed and month selection */}
          <div className="mb-8">
            {isHistorical && (
              <p className="text-sm text-gray-500 mb-2">This is an approximated result based on historical data.</p>
            )}
            {isRealtime && (
              <p className="text-sm text-gray-500 mb-2">Enter an estimated value for electricity units used in the next 30 days.</p>
            )}
            <label className="block text-purple-600 font-medium mb-2">Enter Your Monthly Units Consumed (kWh)</label>
            <input
              type="number"
              className="w-full max-w-xs px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
              value={unitsConsumed}
              onChange={e => setUnitsConsumed(e.target.value)}
              placeholder="e.g. 500"
            />
            {isHistorical && (
              <select
                className="ml-4 px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-gray-50 text-gray-800 outline-none focus:border-purple-500 focus:shadow-purple-100"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
            </select>
            )}
            <button
              className="ml-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition-colors"
              onClick={handleCalculate}
              disabled={!unitsConsumed}
            >
              Calculate Monthly Savings
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-green-500">
                <h2 className="text-xl font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <span role="img" aria-label="money">💸</span> Your Financial Analysis ({results.state})
                </h2>
                <p className="text-gray-700 mb-2">Estimated <span className="font-bold text-green-700">monthly</span> bill savings: <span className="font-bold text-green-700">₹{results.billSavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                <p className="text-gray-700 mb-2">Original bill: <span className="font-bold">₹{results.originalBill.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> &nbsp;→&nbsp; New bill: <span className="font-bold">₹{results.newBill.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                {results.exportAllowed && (
                  <p className="text-gray-700 mb-2">Estimated <span className="font-bold text-blue-700">monthly</span> export income (from surplus): <span className="font-bold text-blue-700">₹{Math.max(0, results.exportIncome).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></p>
                )}
                {!results.exportAllowed && (
                  <p className="text-gray-700 mb-2">Export income is <span className="font-bold text-red-700">not credited</span> in your state.</p>
                )}
                <div className="flex gap-8 text-sm text-gray-500 mt-2">
                  <span>Tariff: ₹{results.tariff}/kWh</span>
                  <span>Metering: {results.metering}</span>
                  <span>Monthly Generation: {results.produced.toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh</span>
                  <span>Monthly Consumption: {results.consumed.toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh</span>
                  {isHistorical && <span>Month: {results.month}</span>}
                </div>
              </div>
              {/* Financial Analysis Charts */}
              <FinancialCharts
                monthlySavings={[results.billSavings]}
                monthlyLabels={[results.month]}
                currentMonthlyBill={results.originalBill}
                currentYearlyBill={results.originalBill * 12}
                solarMonthlyBill={results.newBill}
                solarYearlyBill={results.newBill * 12}
                exportIncome={[results.exportIncome]}
                billDecrement={[results.originalBill - results.newBill]}
                exportLabels={["Export Income"]}
                decrementLabels={["Bill Decrement"]}
              />
              {/* Policy Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <span role="img" aria-label="bolt">⚡</span> Policy for {results.state}
            </h2>
            <p className="text-gray-700 mb-2">{results.policy}</p>
            {/* Status display */}
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Status:</span> {TARIFF_DATA[stateKey]?.status === 'confirmed' ? (
                <span className="text-green-700 font-semibold">Confirmed</span>
              ) : (
                <span className="text-yellow-700 font-semibold">Estimated</span>
              )}
            </p>
            {/* Tariff Table */}
            <div className="overflow-x-auto mt-4 mb-6">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Tariff Rates for Export Income</h3>
              <table className="min-w-[300px] border border-gray-200 rounded">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="px-3 py-2 border-b text-left">Type</th>
                    <th className="px-3 py-2 border-b text-left">Rate (₹/kWh)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-1 border-b">Export</td>
                    <td className="px-3 py-1 border-b">₹{TARIFF_DATA[stateKey]?.export ?? fallbackTariff.export}</td>
                  </tr>
                  {TARIFF_DATA[stateKey]?.gross && (
                    <tr>
                      <td className="px-3 py-1 border-b">Gross</td>
                      <td className="px-3 py-1 border-b">₹{TARIFF_DATA[stateKey]?.gross}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Slab Table */}
            <div className="overflow-x-auto mt-4">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Slab Rates for Electricity Bill</h3>
              {SLAB_DATA[stateKey] ? (
                <table className="min-w-[300px] border border-gray-200 rounded">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="px-3 py-2 border-b text-left">Units (up to)</th>
                      <th className="px-3 py-2 border-b text-left">Rate (₹/kWh)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SLAB_DATA[stateKey].map((slab, idx, arr) => {
                      // Determine the label for the units column
                      let unitLabel = '';
                      if (arr.length === 1 && slab.upTo === Infinity) {
                        unitLabel = 'Above 0';
                      } else if (idx === 0) {
                        unitLabel = `0-${slab.upTo}`;
                      } else if (slab.upTo === Infinity) {
                        unitLabel = `Above ${arr[idx - 1].upTo}`;
                      } else {
                        unitLabel = `${arr[idx - 1].upTo + 1}-${slab.upTo}`;
                      }
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-1 border-b">{unitLabel}</td>
                          <td className="px-3 py-1 border-b">₹{slab.rate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 mt-2">No slab data available for this state.</p>
              )}
            </div>
          </div>
            {/* Save to Profile Button at the bottom */}
            <div className="flex justify-center mt-8">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    alert('Please log in to save your financial analysis.');
                    return;
                  }
                  const inputData = {
                    state,
                    unitsConsumed,
                    selectedMonth,
                    isHistorical,
                    isRealtime,
                    monthly_generation,
                    daily_generation,
                    yearly_generation
                  };
                  const resultData = results;
                  const { error } = await supabase
                    .from('financial_analyses')
                    .insert([
                      {
                        user_id: user.id,
                        input_data: inputData,
                        result_data: resultData,
                      }
                    ]);
                  if (error) {
                    alert('Failed to save financial analysis: ' + error.message);
                  } else {
                    alert('Financial analysis saved to your profile!');
                  }
                }}
              >
                Save to Profile
              </button>
            </div>
          </div>
          )}

          {/* Fallback message for unavailable data */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mt-8">
            <span className="text-yellow-700 font-semibold">Data not available for your state?</span> <a href="https://www.cea.nic.in/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline ml-2">Check your SERC/DISCOM official site</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffPage; 