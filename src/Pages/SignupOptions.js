import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient.js";

function SignupOptions() {
  const navigate = useNavigate();

  // Handle social signup
  const handleSocialSignup = async (provider) => {
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

  // Navigate to login page
  const navigateToLogin = () => {
    navigate("/login");
  };

  // Navigate to email/phone signup page
  const navigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side - Image */}
      <div className="hidden md:block w-1/2 relative">
        <img 
          src="/images/SignupOptionsimage.jpg" 
          alt="Scenery" 
          className="w-full h-full object-cover absolute"
        />
      </div>

      {/* Right side - Options */}
      <div className="w-full md:w-1/2 bg-white text-black p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="w-8 h-8 bg-gray-300 rounded-full mb-2 mr-3"></div>
          <div className="flex items-center">
            <h1 className="text-5xl font-bold font-poppins">SolarSaarthi</h1>
          </div>

          <p className="text-4xl text-gray-400 mb-8 font-poppins">Join us today</p>

          {/* Social Signup Buttons */}
          <div className="flex flex-col gap-4 mb-6">
            <button
              className="flex items-center justify-center gap-2.5 w-full h-12 rounded-full text-base font-medium border border-gray-600 bg-transparent text-black hover:bg-gray-100 transition-colors"
              onClick={() => handleSocialSignup("Google")}
            >
              <img 
                src="/images/search.png" 
                alt="Google icon" 
                className="w-5 h-5 object-contain -ml-6 mr-4" 
              />
              Sign up with Google
            </button>

            <button
              className="flex items-center justify-center gap-2.5 w-full h-12 rounded-full text-base font-medium border border-gray-600 bg-transparent text-black hover:bg-gray-100 transition-colors"
              onClick={() => handleSocialSignup("Facebook")}
            >
              <img 
                src="/images/facebook.png" 
                alt="Facebook icon" 
                className="w-6 h-6 object-contain -ml-3 mr-3" 
              />
              Sign up with Facebook
            </button>
          </div>

          <div className="flex items-center my-6 text-gray-400">
            <div className="flex-1 border-b border-gray-600"></div>
            <span className="px-4 text-sm font-poppins">OR</span>
            <div className="flex-1 border-b border-gray-600"></div>
          </div>

          {/* Email/Phone Signup Button */}
          <button 
            className="w-full h-12 bg-black text-white rounded-full text-base font-medium border border-gray-600 mb-6 hover:bg-opacity-80 transition-colors font-poppins"
            onClick={navigateToSignup}
          >
            Sign up with phone or email
          </button>

          {/* Terms Agreement */}
          <p className="text-xs text-gray-400 my-6 text-center font-poppins">
            By signing up, you agree to the{" "}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>, including cookie use.
          </p>

          {/* Already have account */}
          <div className="flex flex-col items-center mt-6 gap-3">
            <p className="text-sm text-gray-400">Already have an account?</p>
            <button 
              className="w-full h-12 bg-transparent text-black border border-gray-600 rounded-full text-base font-medium hover:bg-gray-100 transition-colors font-poppins"
              onClick={navigateToLogin}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupOptions;