import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './Pages/SignupPage';
import AuthCallback from './AuthCallback';
import SignupOptions from './Pages/SignupOptions';
import LoginPage from './Pages/LoginPage';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import PredictionPage from './Pages/PredictionPage';
import HomePage from './Pages/HomePage';
import ChatBot from './Pages/ChatBotPage';
import TariffPage from './Pages/TariffPage';
import IndiaMapDashboard from './extras/IndiaMapDashboard';
import Insights from './extras/Insights';
import ProfilePage from './Pages/ProfilePage';
import ReviewPage from './Pages/ReviewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup-options" element={<SignupOptions />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/tariff" element={<TariffPage />} />
        <Route path="/map" element={<IndiaMapDashboard />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;