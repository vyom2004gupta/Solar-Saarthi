import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if we have a session (user came from reset link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Invalid or expired reset link");
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setMessage("Password updated successfully!");
      
      // Auto redirect after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password");
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
          <h2 className="text-2xl font-semibold">Set New Password</h2>

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

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="w-full relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                disabled={loading}
              />
              <span
                className="absolute right-3 top-9 text-xl text-gray-500 cursor-pointer select-none"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}