import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-thryvance-neutral-light border-t border-thryvance-neutral w-full">
      <div className="container mx-auto px-4 md:px-6 py-12 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo className="mb-4" />
            <p className="text-gray-600 mb-4">
              Building stronger communities through mutual support and kindness.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/thryvance.ca/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-thryvance-green transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com/thryvance" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-thryvance-green transition-colors"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Community Feed
                </Link>
              </li>
              <li>
                <Link to="/nonprofit-directory" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Find Nonprofits
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/values" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/safety-tips" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support Us</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/donate" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link to="/partner-with-us" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link to="/donate-goods" className="text-gray-600 hover:text-thryvance-green transition-colors">
                  Donate Goods
                </Link>
              </li>
            </ul>
            
            <div className="mt-6">
              <p className="text-gray-600">
                Subscribe to our newsletter
              </p>
              <div className="flex mt-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-thryvance-green focus:border-transparent"
                  aria-label="Email address for newsletter subscription"
                />
                <Link to="/subscribe">
                  <button 
                    className="bg-thryvance-green hover:bg-thryvance-green-dark text-white px-4 py-2 rounded-r-md transition-colors"
                    aria-label="Subscribe to newsletter"
                  >
                    Subscribe
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-thryvance-neutral mt-10 pt-6 text-center text-gray-600 text-sm space-y-2">
          <p>© {new Date().getFullYear()} Thryvance. Unregistered BC non-profit.</p>
          <p>Donations support our mission but are not tax-deductible.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
