import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase/supabaseClient.js";

function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Extract hash parameters from URL if they exist (for OAuth)
        const hashParams = window.location.hash
          ? Object.fromEntries(
              new URLSearchParams(window.location.hash.substring(1))
            )
          : {};

        // Get current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(`Session error: ${error.message}`);
        }

        if (!data?.session?.access_token) {
          throw new Error("No valid session found");
        }

        const session = data.session;
        console.log("Authentication successful");
        console.log("Access token:", session.access_token);
        console.log("User info:", session.user);

        // Check if this is a social login or email signup
        const isSocialLogin = session.user?.app_metadata?.provider && 
                             session.user.app_metadata.provider !== 'email';

        if (isSocialLogin) {
          // For social login, we need to save user data to our database
          const userProfile = {
            firstName: session.user.user_metadata?.full_name?.split(' ')[0] || 
                       session.user.user_metadata?.name?.split(' ')[0] || '',  // Facebook uses 'name'
            lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 
                      session.user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
            mobileNumber: session.user.phone || '',
            password: '', // Social logins don't have passwords
          };

          // Save the social user data to your backend
          await saveUserToBackend(userProfile, session.access_token);
        } else {
          // For email signup, handle the profile data saved in localStorage
          const profileData = JSON.parse(localStorage.getItem("profileData"));
          
          if (profileData) {
            await saveUserToBackend(profileData, session.access_token);
            localStorage.removeItem("profileData"); // Clean up
          }
        }

        // Redirect to home or dashboard
        navigate("/");
      } catch (err) {
        console.error("Auth callback error:", err.message);
        setError(err.message);
        navigate("/?error=auth-failed");
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [navigate]);

  const saveUserToBackend = async (profileData, token) => {
    try {
      const response = await fetch("http://localhost:8000/api/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${errorData.detail}`);
      }

      const result = await response.json();
      console.log("User saved:", result);
      return result;
    } catch (error) {
      console.error("Error saving user to backend:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="auth-callback-container">
        <p>Finalizing your account... Please wait.</p>
        {/* You could add a loading spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-callback-container error">
        <p>Authentication error: {error}</p>
        <button onClick={() => navigate("/")}>Return to homepage</button>
      </div>
    );
  }

  return null;
}

export default AuthCallback;