import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import PredictionResultView from '../components/PredictionResultView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FinancialAnalysisResultView from '../components/FinancialAnalysisResultView';

const ProfilePage = () => {
  const [predictions, setPredictions] = useState([]);
  const [financialAnalyses, setFinancialAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState({ type: null, idx: null });
  const navigate = useNavigate();
  const printRefs = useRef({ predictions: [], financial: [] });

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        setLoading(false);
        return;
      }
      const [{ data: predData }, { data: finData }] = await Promise.all([
        supabase.from('predictions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('financial_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      setPredictions(predData || []);
      setFinancialAnalyses(finData || []);
      setLoading(false);
    };
    fetchUserAndData();
  }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const table = type === 'prediction' ? 'predictions' : 'financial_analyses';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (type === 'prediction') setPredictions(predictions.filter((p) => p.id !== id));
      else setFinancialAnalyses(financialAnalyses.filter((f) => f.id !== id));
    } else {
      alert('Failed to delete: ' + error.message);
    }
  };

  const handleDownload = async (type, idx) => {
    const printContent = printRefs.current[type][idx];
    if (!printContent) return;
    const originalScroll = window.scrollY;
    const canvas = await html2canvas(printContent, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 20;
    pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
    pdf.save(type === 'prediction' ? 'solar_prediction_report.pdf' : 'financial_analysis_report.pdf');
    window.scrollTo(0, originalScroll);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p className="mb-4">Please log in to view your saved data.</p>
      <button
        onClick={() => navigate('/login')}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
      >
        Login
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Saved Predictions</h2>
      {predictions.length === 0 ? (
        <div className="text-center text-gray-500">No saved predictions yet.</div>
      ) : (
        <div className="space-y-4 mb-12">
          {predictions.map((pred, idx) => {
            const input = pred.input_data || {};
            const result = pred.result_data || {};
            return (
              <div key={pred.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(expanded.type === 'prediction' && expanded.idx === idx ? { type: null, idx: null } : { type: 'prediction', idx })}>
                  <div>
                    <div className="font-semibold text-lg">{input.predictionMode === 'realtime' ? 'Real-time' : 'Historical'} Prediction</div>
                    <div className="text-sm text-gray-600">{new Date(pred.created_at).toLocaleString()}</div>
                    <div className="text-sm text-gray-700 mt-1">Lat: {input.latitude}, Lon: {input.longitude}, Area: {input.area} {input.areaUnit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expanded.type === 'prediction' && expanded.idx === idx && (
                      <button
                        className="text-green-600 font-semibold hover:underline text-sm px-2 py-1"
                        onClick={e => { e.stopPropagation(); handleDownload('predictions', idx); }}
                        title={'Download/Export this report as PDF'}
                      >
                        Download
                      </button>
                    )}
                    <button
                      className="text-red-500 font-semibold hover:underline text-sm px-2 py-1"
                      onClick={e => { e.stopPropagation(); handleDelete('prediction', pred.id); }}
                    >
                      Delete
                    </button>
                    <button className="text-blue-500 font-semibold text-sm px-2 py-1">
                      {expanded.type === 'prediction' && expanded.idx === idx ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>
                {expanded.type === 'prediction' && expanded.idx === idx && (
                  <div className="mt-4 text-sm text-gray-800" ref={el => printRefs.current.predictions[idx] = el}>
                    <PredictionResultView input={input} result={result} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <h2 className="text-3xl font-bold mb-6 text-center">Your Saved Financial Analyses</h2>
      {financialAnalyses.length === 0 ? (
        <div className="text-center text-gray-500">No saved financial analyses yet.</div>
      ) : (
        <div className="space-y-4">
          {financialAnalyses.map((fa, idx) => {
            const input = fa.input_data || {};
            const result = fa.result_data || {};
            return (
              <div key={fa.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpanded(expanded.type === 'financial' && expanded.idx === idx ? { type: null, idx: null } : { type: 'financial', idx })}>
                  <div>
                    <div className="font-semibold text-lg">Financial Analysis ({result.state})</div>
                    <div className="text-sm text-gray-600">{new Date(fa.created_at).toLocaleString()}</div>
                    <div className="text-sm text-gray-700 mt-1">Units Consumed: {input.unitsConsumed} | Month: {input.selectedMonth !== undefined ? input.selectedMonth : 'N/A'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expanded.type === 'financial' && expanded.idx === idx && (
                      <button
                        className="text-green-600 font-semibold hover:underline text-sm px-2 py-1"
                        onClick={e => { e.stopPropagation(); handleDownload('financial', idx); }}
                        title={'Download/Export this report as PDF'}
                      >
                        Download
                      </button>
                    )}
                    <button
                      className="text-red-500 font-semibold hover:underline text-sm px-2 py-1"
                      onClick={e => { e.stopPropagation(); handleDelete('financial', fa.id); }}
                    >
                      Delete
                    </button>
                    <button className="text-blue-500 font-semibold text-sm px-2 py-1">
                      {expanded.type === 'financial' && expanded.idx === idx ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>
                {expanded.type === 'financial' && expanded.idx === idx && (
                  <div className="mt-4 text-sm text-gray-800" ref={el => printRefs.current.financial[idx] = el}>
                    <FinancialAnalysisResultView input={input} result={result} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 