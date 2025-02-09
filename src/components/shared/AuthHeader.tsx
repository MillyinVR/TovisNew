import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, UserPlus } from 'lucide-react';

interface AuthHeaderProps {
  onMenuClick: () => void;
  showLoginButton?: boolean;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ onMenuClick, showLoginButton = true }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-b from-black/80 via-black/50 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        </button>
        <Link to="/" className="text-xs sm:text-sm font-medium text-white tracking-tight">
          T O V I S Beauty
        </Link>
        {showLoginButton ? (
          <Link
            to="/login"
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          >
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </Link>
        ) : (
          <div className="w-8 sm:w-10"></div>
        )}
      </div>
    </header>
  );
};