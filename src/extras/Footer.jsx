import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 mt-20 text-white dark:bg-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-green-400">SolarSaarthi</h3>
            <p className="text-gray-300">
              Empowering sustainable futures through solar energy solutions.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Solar Calculator
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Installation Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Government Schemes
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="text-green-400 mt-1" size={18} />
                <span className="text-gray-300">contact@solarsaarthi.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="text-green-400 mt-1" size={18} />
                <span className="text-gray-300">+91 98765 43210</span>
              </li>
              <li className="text-gray-300">
                Solar Energy Park, Sector 18
                <br />
                Gurugram, Haryana 122015
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">
              Subscribe
            </h4>
            <p className="text-gray-300 mb-4">
              Get the latest updates on solar technology and offers.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SolarSaarthi. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-400 hover:text-green-400 text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-green-400 text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-green-400 text-sm transition-colors"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;