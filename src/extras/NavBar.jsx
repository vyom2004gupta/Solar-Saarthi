import { useState, useEffect, useRef } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";
import { useNavigate } from "react-router-dom";

function NavBar({ darkMode, toggleDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef();

  useEffect(() => {
    // Check active session and set user
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkSession();
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const handleAuthAction = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const menuItems = [
    { name: "Home", to: "home", path: "/" },
    { name: "Solar Insights", to: "insights", path: "/" },
    { name: "Solar Map", to: "map", path: "/" },
    { name: "Experiences", to: "reviews", path: "/" },
    { name: "About Us", to: "footer", path: "/" },
  ];

  const isHomePage = location.pathname === "/";

  if (loading) {
    return (
      <header className={`fixed w-full z-50 ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md shadow-lg`}>
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? darkMode
            ? "bg-gray-900/90 backdrop-blur-md shadow-lg"
            : "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">
              SolarSaarthi
            </span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) =>
              isHomePage ? (
                <ScrollLink
                  key={item.to}
                  to={item.to}
                  spy={true}
                  smooth={true}
                  offset={item.to === 'footer' ? 0 : -70}
                  duration={500}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    window.location.hash === `#${item.to}`
                      ? "text-green-600 bg-green-50"
                      : darkMode
                        ? "text-gray-300 hover:text-green-200 hover:bg-gray-700/50"
                        : "text-gray-700 hover:text-green-800 hover:bg-green-50/50"
                  }`}
                  aria-label={`Navigate to ${item.name} section`}
                >
                  {item.name}
                </ScrollLink>
              ) : (
                <RouterLink
                  key={item.to}
                  to={item.path}
                  className={
                    darkMode
                      ? "px-3 py-2 text-sm font-medium rounded-lg transition-all text-gray-300 hover:text-green-200 hover:bg-gray-700/50"
                      : "px-3 py-2 text-sm font-medium rounded-lg transition-all text-gray-700 hover:text-green-800 hover:bg-green-50/50"
                  }
                >
                  {item.name}
                </RouterLink>
              )
            )}

            {user ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  className="flex items-center px-4 py-2 rounded-full text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-50 focus:outline-none"
                  aria-label="Profile"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </motion.button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                      onClick={() => { setProfileDropdownOpen(false); navigate('/profile'); }}
                    >
                      History
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { setProfileDropdownOpen(false); navigate('/review'); }}
                    >
                      Review
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                      onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAuthAction}
                className="flex items-center px-4 py-2 rounded-full text-sm font-medium border border-green-600 text-green-600 hover:bg-green-50"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </motion.button>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden overflow-hidden shadow-lg rounded-lg mt-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="py-2 space-y-1">
                {menuItems.map((item) =>
                  isHomePage ? (
                    <ScrollLink
                      key={item.to}
                      to={item.to}
                      spy={true}
                      smooth={true}
                      offset={item.to === 'footer' ? 0 : -70}
                      duration={500}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                        window.location.hash === `#${item.to}`
                          ? "text-green-600 bg-green-50"
                          : darkMode
                            ? "text-gray-300 hover:text-green-200 hover:bg-gray-700"
                            : "text-gray-700 hover:text-green-800 hover:bg-green-50"
                      }`}
                      aria-label={`Navigate to ${item.name} section`}
                    >
                      {item.name}
                    </ScrollLink>
                  ) : (
                    <RouterLink
                      key={item.to}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={
                        darkMode
                          ? "block px-4 py-3 text-sm font-medium rounded-md mx-2 text-gray-300 hover:text-green-200 hover:bg-gray-700"
                          : "block px-4 py-3 text-sm font-medium rounded-md mx-2 text-gray-700 hover:text-green-800 hover:bg-green-50"
                      }
                    >
                      {item.name}
                    </RouterLink>
                  )
                )}

                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 text-red-500 border border-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleAuthAction();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 mt-2 border border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

export default NavBar;
