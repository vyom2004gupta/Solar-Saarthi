import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "../extras/NavBar.jsx";
import Footer from "../extras/Footer.jsx";
import Button from "../extras/Button.jsx";
import BG from "../extras/backgroundimage.png";
import Insights from "../extras/Insights.jsx";
import { Sun, MessageSquare } from "lucide-react";
import IndiaMapDashboard from "../extras/IndiaMapDashboard.jsx";
import { useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { supabase } from "../supabase/supabaseClient";
import HomepageReviews from '../components/HomepageReviews';

// Mini Chatbot Component with navigation logic from current HomePage.js
const ChatbotWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => navigate('/chatbot')}
        className={`fixed bottom-8 right-8 z-50 mb-[100px] p-4 rounded-full shadow-xl transition-all duration-300 bg-purple-500 text-white hover:bg-purple-600`}
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </>
  );
};

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navigateToPrediction = async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      navigate('/prediction');
    } else {
      navigate('/signup-options');
    }
  };

  const navigateToChatBot = () => {
    navigate('/chatbot');
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  // Menu items for scroll navigation
  const menuItems = [
    { name: "Home", to: "home" },
    { name: "Solar Insights", to: "insights" },
    { name: "Solar Map", to: "map" },
  ];

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Sticky NavBar at the top, pass darkMode and toggleDarkMode */}
      <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      {/* Main content with background image */}
      <main id="home" className={`flex-grow relative pt-24 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Background image with overlay that adapts to dark mode */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${BG})` }}
          >
            <div className={`absolute inset-0 ${darkMode ? 'bg-black/60' : 'bg-black/40'}`} />
          </motion.div>
        </div>
        {/* Content container with max width */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center min-h-[80vh] max-w-5xl">
          <div className="py-20 md:py-32 lg:py-40">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                Power Life on <br className="hidden sm:block" /> Your Terms
              </h1>
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium max-w-2xl mb-8">
                Go solar today to enjoy clean energy while making a lasting impact on the planet.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={navigateToPrediction}
                variant="primary"
                size="large"
                className="bg-green-600 hover:text-white border rounded-full transition-all transform hover:scale-105"
                icon={Sun}
                iconPosition="left"
              >
                Get a Free Quote
              </Button>
            </motion.div>
          </div>
        </div>
        {/* Scrolling indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="animate-bounce flex flex-col items-center">
            <p className="text-white/70 text-sm mb-2">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1 h-2 bg-white rounded-full mt-2"
              />
            </div>
          </div>
        </motion.div>
        {/* Chatbot Widget */}
        <div className="fixed bottom-6 right-6 z-20">
          <button 
            onClick={navigateToChatBot}
            className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      </main>
      {/* Insights and Map sections with container and max width, pass darkMode to Insights */}
      <div className={`container mx-auto max-w-5xl px-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`} id="insights">
        <Insights darkMode={darkMode} />
      </div>
      <div className="container mx-auto max-w-5xl px-4" id="map">
        <IndiaMapDashboard />
      </div>
      <div id="reviews">
        <HomepageReviews />
      </div>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}