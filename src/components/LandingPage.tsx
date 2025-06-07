import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, Menu, X, ChevronRight, Scissors, Star, Info, HelpCircle, Users, PartyPopper } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthHeader } from './auth/AuthHeader';
import { ProviderMap } from './shared/ProviderMap';

export const LandingPage = () => {
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const sections = target.querySelectorAll('.scroll-fade-section');
      if (sections) {
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const fadeStart = 150; // Increased trigger point
          const fadeEnd = 250; // Increased fade end point
          
          let opacity = 1;
          if (rect.top <= fadeStart) {
            opacity = Math.max(0, (rect.top + rect.height - fadeStart) / (fadeEnd - fadeStart));
          }
          
          section.style.opacity = opacity.toString();
        });
      }
    };

    const container = document.querySelector('.relative.z-10.h-screen.overflow-y-auto');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Slide-out Menu */}
      <div className={`fixed inset-0 z-50 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`absolute top-0 left-0 w-[280px] sm:w-96 h-full bg-white transform transition-transform duration-300 overflow-hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <h2 className="text-xl font-semibold">Menu</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="py-2 h-full overflow-y-auto">
            <Link to="/salon/register" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <Scissors className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">Add Your Salon</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link to="/professional/register" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">Create a Professional Account</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link to="/discover" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">Browse Services</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link to="/special-event/register" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <PartyPopper className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">Create Special Event Account</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <div className="border-t my-2" />
            
            <Link to="/about" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">About Us</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link to="/help" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
                <span className="text-gray-700">Help</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1501699169021-3759ee435d66?q=80&w=1919&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          minWidth: '100vw',
          filter: 'brightness(0.6)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-screen overflow-y-auto" style={{ scrollPaddingTop: '72px' }}>
        {/* Header */}
        <AuthHeader onMenuClick={() => setIsMenuOpen(true)} showLoginButton={true} />

        {/* Hero Section with scroll fade */}
        <div className="scroll-fade-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16" style={{ marginTop: '72px' }}>
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              Find a Beauty Professional
              <br />
              Near You
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-200 max-w-3xl mx-auto px-4">
              Connect with top beauty professionals in your area. Book appointments for hair, makeup, nails, and more.
            </p>

            {/* Search Box */}
            <div className="mt-6 sm:mt-10 max-w-xl mx-auto px-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Search for services or beauty professionals..."
                />
              </div>
              <button className="mt-3 sm:mt-4 w-full bg-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors mb-2 text-sm sm:text-base">
                Search
              </button>
              <div className="text-center">
                <Link to="/signup" className="text-xs sm:text-sm text-gray-300 hover:text-white">
                  or sign up
                </Link>
              </div>
            </div>

            {/* Trending Services */}
            <div className="mt-12 sm:mt-16 max-w-3xl mx-auto px-4">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-left">
                <div className="flex items-center mb-4">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <h3 className="ml-3 text-xl sm:text-2xl font-semibold text-white">Stay on Trend!</h3>
                </div>
                <p className="text-gray-200 text-sm sm:text-base mb-6">
                  Find professionals already offering the trending services you're seeing on your favorite social media platforms. 
                  No more guessing if they can create your desired look - book with confidence!
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/trending-services"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all text-center"
                  >
                    Explore Trending Services
                  </Link>
                  <Link
                    to="/professionals/trending"
                    className="w-full sm:w-auto bg-white/20 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-white/30 transition-colors text-center"
                  >
                    View Top Professionals
                  </Link>
                </div>
              </div>
            </div>

            {/* Special Event Promotion */}
            <div className="mt-8 sm:mt-12 max-w-3xl mx-auto px-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-left">
                <div className="flex items-center mb-4">
                  <PartyPopper className="h-8 w-8 text-pink-400" />
                  <h3 className="ml-3 text-xl sm:text-2xl font-semibold text-white">Book with your Party!</h3>
                </div>
                <p className="text-gray-200 text-sm sm:text-base mb-6">
                  Planning a special event? Create a Special Event account and connect with your friends or family to book together. Perfect for weddings, proms, or any group celebration!
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to="/special-event/register"
                    className="w-full sm:w-auto bg-pink-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-pink-700 transition-colors text-center"
                  >
                    Create Event Account
                  </Link>
                  <Link
                    to="/special-event/learn-more"
                    className="w-full sm:w-auto bg-white/20 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-white/30 transition-colors text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Professional Services</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-200">Book appointments with verified beauty professionals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">Group Bookings</h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-200">Coordinate appointments for your entire party</p>
                </div>
                <Users className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 transform rotate-12" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Real Reviews</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-200">Read verified customer reviews and ratings</p>
              </div>
            </div>

            {/* Provider Map */}
            <div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Find a Provider Near You</h3>
                <p className="text-gray-200 text-sm sm:text-base">
                  Connect with beauty professionals in your area and book your next appointment
                </p>
              </div>
              <ProviderMap />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-black/80 backdrop-blur-sm py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a 
                href="#" 
                className="transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-12"
                />
              </a>
              <a 
                href="#" 
                className="transition-transform hover:scale-105"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="h-[46px]"
                />
              </a>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
                  <li><Link to="/careers" className="text-gray-400 hover:text-white text-sm">Careers</Link></li>
                  <li><Link to="/press" className="text-gray-400 hover:text-white text-sm">Press</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Professionals</h4>
                <ul className="space-y-2">
                  <li><Link to="/professional/register" className="text-gray-400 hover:text-white text-sm">Join as Professional</Link></li>
                  <li><Link to="/professional/resources" className="text-gray-400 hover:text-white text-sm">Resources</Link></li>
                  <li><Link to="/professional/success" className="text-gray-400 hover:text-white text-sm">Success Stories</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><Link to="/help" className="text-gray-400 hover:text-white text-sm">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact Us</Link></li>
                  <li><Link to="/safety" className="text-gray-400 hover:text-white text-sm">Safety</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link></li>
                  <li><Link to="/accessibility" className="text-gray-400 hover:text-white text-sm">Accessibility</Link></li>
                </ul>
              </div>
            </div>

            {/* Social Links & Copyright */}
            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                  </a>
                </div>
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} TOVIS Beauty. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};