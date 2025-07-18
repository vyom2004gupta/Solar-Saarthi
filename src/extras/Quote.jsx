import React from "react";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";

function QuotePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    roofArea: "",
    electricityBill: "",
    location: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login?redirect=/quote");
        return;
      }

      // Submit form data to backend
      const response = await fetch(
        "http://localhost:8000/api/calculate-quote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to calculate quote");
      }

      const result = await response.json();
      console.log("Quote result:", result);
      // Handle successful quote calculation
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white flex flex-col">
      <NavBar />

      <main className="flex-grow container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            Get Your Solar Quote
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Roof Area (sq ft)
              </label>
              <input
                type="number"
                name="roofArea"
                value={formData.roofArea}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your roof area"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Monthly Electricity Bill (₹)
              </label>
              <input
                type="number"
                name="electricityBill"
                value={formData.electricityBill}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your average bill"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your city"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Calculate Quote
            </button>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default QuotePage;