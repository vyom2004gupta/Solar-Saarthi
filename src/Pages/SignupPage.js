import { useState } from "react";
import { supabase } from "../supabase/supabaseClient.js";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[A-Za-z]+$/.test(value)) error = "Only letters are allowed";
        break;
      case "mobileNumber":
        if (!/^\d{10}$/.test(value)) error = "Enter a valid 10-digit number";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email";
        break;
      case "password":
        if (value.length < 6) error = "Password must be at least 6 characters";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: validateField(id, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    setErrors(newErrors);

    if (!Object.values(newErrors).every((error) => error === "")) {
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile: formData.mobileNumber,
        },
        emailRedirectTo: "http://localhost:3000/auth/callback",
      },
    });

    if (authError) {
      alert("Signup error: " + authError.message);
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "profileData",
      JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
      })
    );

    alert("Signup successful! Check your email to confirm.");

    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse.data.session;

    if (session) {
      const token = session.access_token;

      try {
        const response = await fetch("http://localhost:8000/api/save-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobileNumber: formData.mobileNumber,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert("Backend error: " + errorData.detail);
        } else {
          const result = await response.json();
          console.log(result.message);
        }
      } catch (backendError) {
        console.error("Error calling backend:", backendError);
      }
    }

    setLoading(false);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side - Image */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src="/images/signupimage.webp"
          alt="Modern home at night"
          className="w-full h-full object-cover absolute"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-black text-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-3xl font-bold mb-2">Set up your account</h1>
          <p className="text-gray-400 mb-8">Join us today and unlock the world of solar!</p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="mb-2">
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="mb-2">
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            {/* Mobile Number */}
            <div className="mb-2">
              <input
                type="tel"
                id="mobileNumber"
                placeholder="Mobile Number"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.mobileNumber}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
            </div>

            {/* Email */}
            <div className="mb-2">
              <input
                type="email"
                id="email"
                placeholder="Email Address"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="mb-2">
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="mb-2">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                className="w-full h-12 px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white text-base"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="flex items-center gap-2 my-2">
              <input
                type="checkbox"
                id="confirmPasswordCheck"
                className="w-4 h-4 border border-gray-600 rounded"
              />
              <label htmlFor="confirmPasswordCheck" className="text-gray-400 text-sm">
                Confirm Password
              </label>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full h-12 bg-blue-500 text-white border-none rounded-md text-base font-medium cursor-pointer mt-2 hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Continue"}
            </button>
          </form>

          {/* Back to Options Button */}
          <div className="mt-6 text-center">
            <button 
              className="bg-transparent border-none text-blue-500 cursor-pointer text-sm underline p-2 hover:text-blue-600"
              onClick={() => navigate("/signup-options")}
            >
              Back to options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;