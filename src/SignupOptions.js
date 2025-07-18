import { useNavigate } from "react-router-dom";
import "./SignupOptions.css";

function SignupOptions() {
  const navigate = useNavigate();

  // Handle social signup
  const handleSocialSignup = (provider) => {
    alert(`Signup with ${provider} initiated`);
    // Implement actual signup logic here later
  };

  // Navigate to login page
  const navigateToLogin = () => {
    navigate("/login"); // Adjust path as needed
  };

  // Navigate to email/phone signup page
  const navigateToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="signup-options-container">
      {/* Left side - Image */}
      <div className="image-container">
        <img src="/images/SignupOptionsimage.jpg" alt="Scenery" className="home-image" />
      </div>

      {/* Right side - Options */}
      <div className="options-container">
        <div className="options-content">
          <div className="logo-circle"></div>
          <div className="logo-container">
            <h1 className="company-name">SolarSaarthi</h1>
          </div>

          <p className="join-subtitle">Join us today</p>

          {/* Social Signup Buttons */}
          <div className="social-signup-container">
            <button
              className="social-signup-button google-button"
              onClick={() => handleSocialSignup("Google")}
            >
              {/* SVG omitted for brevity */}
              Sign up with Google
            </button>

            <button
              className="social-signup-button apple-button"
              onClick={() => handleSocialSignup("Apple")}
            >
              {/* SVG omitted for brevity */}
              Sign up with Apple
            </button>
          </div>

          <div className="divider">
            <span className="divider-text">OR</span>
          </div>

          {/* Email/Phone Signup Button */}
          <button className="email-signup-button" onClick={navigateToSignup}>
            Sign up with phone or email
          </button>

          {/* Terms Agreement */}
          <p className="terms-text">
            By signing up, you agree to the{" "}
            <a href="#" className="terms-link">Terms of Service</a> and{" "}
            <a href="#" className="terms-link">Privacy Policy</a>, including cookie use.
          </p>

          {/* Already have account */}
          <div className="account-prompt">
            <p>Already have an account?</p>
            <button className="login-button" onClick={navigateToLogin}>
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupOptions;
