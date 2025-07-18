import React from "react";
import { motion } from "framer-motion";
import Button from "./Button.jsx";
import image from "./image 1.png";
import { Sun, Leaf, Zap, ArrowUpRight } from "lucide-react";

function Insights({ darkMode }) {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      id="insights"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className={`${darkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'} px-4 sm:px-10 py-16 min-h-screen transition-colors duration-300`}
    >
      {/* Floating solar panel animation */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute right-10 top-20 opacity-20 ${darkMode ? 'opacity-10' : ''}`}
      >
        <Sun size={150} className="text-green-500" />
      </motion.div>

      <motion.h1
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center font-bold text-3xl md:text-5xl mb-16 relative z-10"
      >
        HARNESS THE <span className="text-green-500">SUN</span> : YOUR GUIDE TO SOLAR ENERGY
      </motion.h1>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-xl lg:w-1/2 relative z-10"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${darkMode ? 'bg-gray-700/20' : 'bg-white/5'} mb-8 p-6 rounded-xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold">How Solar Works</h2>
            </div>
            <p className="mb-6">
              Solar panels convert sunlight into electricity, powering homes and businesses with clean, renewable energy through photovoltaic cells.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${darkMode ? 'bg-gray-700/20' : 'bg-white/5'} mb-8 p-6 rounded-xl backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="text-green-500" size={24} />
              <h2 className="text-2xl font-semibold">Environmental Impact</h2>
            </div>
            <p className="mb-6">
              Switching to solar reduces carbon footprint by up to 80% compared to traditional energy sources, helping combat climate change.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-lg">
              Want to know more?{" "}
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer text-blue-500 hover:text-blue-400 inline-flex items-center"
              >
                Explore our resources{" "}
                <ArrowUpRight size={18} className="ml-1" />
              </motion.a>
            </p>
          </motion.div>

          {/* Remove the two buttons below */}
          {/*
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button variant="secondary" onClick={() => window.open('https://mnre.gov.in/', '_blank')}>
              Govt Policies
            </Button>
            <Button variant="secondary" onClick={() => window.open('mailto:solar-expert@example.com')}>
              Contact Experts
            </Button>
          </div>
          */}
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 relative z-10"
        >
          <motion.img
            src={image}
            alt="Solar panels"
            whileHover={{ scale: 1.03 }}
            className="w-full max-w-2xl rounded-2xl shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Back to top button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-24 bg-green-600 p-3 rounded-full shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <ArrowUpRight className="text-white" size={24} />
      </motion.button>
    </motion.div>
  );
}

export default Insights;