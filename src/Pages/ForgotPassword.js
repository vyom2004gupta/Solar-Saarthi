import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/reset-password",
      });

      if (error) throw error;
      
      setMessage("Password reset link sent to your email!");
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url('/images/SignupOptionsimage.jpg')` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gray-300" />
          <h2 className="text-2xl font-semibold">Reset Password</h2>

          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {message && (
            <div className="w-full bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{message}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="w-full space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-400 text-white font-semibold rounded-full hover:bg-blue-700 transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}