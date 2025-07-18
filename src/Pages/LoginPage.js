import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!val) newErrors.email = "Email is required";
      else if (!emailRegex.test(val)) newErrors.email = "Enter a valid email";
      else delete newErrors.email;
      return newErrors;
    });
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!val) newErrors.password = "Password is required";
      else if (val.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      else delete newErrors.password;
      return newErrors;
    });
  };

  const validateOnSubmit = () => {
    const newErrors = {};

    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) newErrors.email = "Enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateOnSubmit()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      console.log("Login successful", data);
      // Fetch user profile from backend
      await fetchUserProfile(data.session?.access_token);
      // Redirect to home or dashboard
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.message);
      setErrors((prev) => ({
        ...prev,
        auth: error.message || "Failed to login. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase(),
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error.message);
        alert(`Failed to sign in with ${provider}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Unexpected error during ${provider} sign-in:`, error);
      alert(`Something went wrong with ${provider} sign-in. Please try again.`);
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async (token) => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/user-profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching user profile:", errorData);
        return;
      }

      const userData = await response.json();
      console.log("User profile fetched:", userData);
      // You can store this data in context or local storage if needed
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
          <h2 className="text-2xl font-semibold">Log in</h2>

          {errors.auth && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{errors.auth}</span>
            </div>
          )}

          <button 
            className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
            onClick={() => handleSocialLogin("Google")}
          >
            <img src="/images/search.png" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <button 
            className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 transition"
            onClick={() => handleSocialLogin("Facebook")}
          >
            <img
              src="/images/facebook.png"
              alt="Facebook"
              className="w-5 h-5 ml-3.5"
            />
            Continue with Facebook
          </button>

          <div className="w-full flex items-center gap-2 py-2">
            <hr className="flex-grow border-gray-300" />
            <span className="text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-2">
            <div className="w-full">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                className={`w-full p-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.email ? "focus:ring-red-400" : "focus:ring-blue-400"
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full p-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.password ? "focus:ring-red-400" : "focus:ring-blue-400"
                }`}
                disabled={loading}
              />
              <span
                className="absolute right-3 top-2.5 text-xl text-gray-500 cursor-pointer select-none"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="w-full flex items-center justify-between text-sm text-gray-600">
              <button
                onClick={() => navigate("/forgot-password")} // You'll need to create this route
                className="text-black-600 hover:underline focus:outline-none"
  >
                Forget your password ?
              </button>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 bg-blue-400 text-white font-semibold rounded-full hover:bg-blue-700 transition disabled:opacity-70"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup-options")}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}