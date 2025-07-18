import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import BG from "../assets/backgroundimage.png";
import Insights from "./Insights.jsx";
import { ArrowRight, Sun, MessageCircle, X } from "lucide-react";
import IndiaMapDashboard from "./IndiaMapDashboard.jsx";
import Review from "./Review.jsx";
import { supabase } from "../supabase/supabaseClient.js";
import { fetchGeminiResponse } from "../geminiService/geminiService";

// Mini Chatbot Component with Gemini Integration
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm Saarthi, your solar energy assistant. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const botResponse = await fetchGeminiResponse(input);
      setMessages((prev) => [...prev, { from: "bot", text: botResponse }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Sorry, I'm having connection issues. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 right-8 z-50 mb-[100px] p-4 rounded-full shadow-xl transition-all duration-300 ${
          isOpen ? "hidden" : "bg-[#8055FF] text-white hover:bg-[#6a46d9]"
        }`}
        aria-label="Open chat"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chatbot Container */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 mb-[100px] right-8 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col border border-gray-200 dark:border-gray-700"
        >
          {/* Chatbot Header */}
          <div className="bg-[#8055FF] text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">Solar Saarthi Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                  msg.from === "user"
                    ? "ml-auto bg-[#8055FF] text-white rounded-tr-none"
                    : "mr-auto bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none rounded-lg px-3 py-2 max-w-[90%] text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about solar..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8055FF] dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-300"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={loading}
              />
              <button
                onClick={handleSend}
                className="p-2 bg-[#8055FF] text-white rounded-lg hover:bg-[#6a46d9] disabled:opacity-50"
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

function Home() {
  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white flex flex-col overflow-x-hidden">
      {/* NavBar at the top */}
      <header className="w-full">
        <NavBar />
      </header>

      {/* Main content with background image */}
      <main id="home" className="flex-grow relative mt-[70px]">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${BG})` }}
          >
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
          </motion.div>
        </div>

        {/* Content container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center min-h-[80vh]">
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
                Go solar today to enjoy clean energy while making a lasting
                impact on the planet.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={() => {
                  const getQuote = async () => {
                    const {
                      data: { session },
                    } = await supabase.auth.getSession();
                    if (session?.user) {
                      window.location.href = "/quote";
                    } else {
                      window.location.href = "/login?redirect=/quote";
                    }
                  };
                  getQuote();
                }}
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

        {/* Chatbot Widget - Now with real Gemini integration */}
        <ChatbotWidget />
      </main>

      <div className="c">
        <Insights />
      </div>
      <div className="c">
        <IndiaMapDashboard />
      </div>
      <div className="c">
        <Review />
      </div>

      {/* Footer at the bottom */}
      <footer className="w-full relative z-10">
        <Footer />
      </footer>
    </div>
  );
}

export default Home;