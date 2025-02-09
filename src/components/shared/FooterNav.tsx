import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Calendar,
  Compass,
  History,
  DollarSign,
  MessageSquare,
  Camera,
  User,
  BookOpen
} from 'lucide-react';

interface FooterNavProps {
  userType: 'professional' | 'client';
  serviceState?: 'idle' | 'started' | 'completed';
  onServiceAction?: () => void;
}

export const FooterNav: React.FC<FooterNavProps> = ({ 
  userType,
  serviceState = 'idle',
  onServiceAction 
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.includes(path);

  const { currentUser } = useAuth();
  
  const navItems = userType === 'professional' ? [
    { icon: Home, label: 'Home', path: '/professional/dashboard?tab=bookings' },
    { icon: Camera, label: 'Capture', path: '/beauty-capture' },
    { 
      icon: DollarSign, 
      label: serviceState === 'started' ? 'Checkout' : 'START',
      path: '/professional/service-flow',
      onClick: () => {
        if (serviceState === 'idle' && onServiceAction) {
          try {
            onServiceAction();
          } catch (error) {
            console.error('Service action failed:', error);
            window.location.href = '/professional/service-flow';
          }
        } else {
          window.location.href = '/professional/service-flow';
        }
      }
    },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: `/professional/profile` }
  ] : [
    { icon: Home, label: 'Home', path: '/client/dashboard' },
    { icon: BookOpen, label: 'Bookings', path: '/client/bookings' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: History, label: 'History', path: '/client/history' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map(({ icon: Icon, label, path, onClick }) => 
            onClick ? (
              <button
                key={path}
                onClick={onClick}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive(path) ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="mt-1 text-xs">{label}</span>
              </button>
            ) : (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-3 px-2 ${
                  isActive(path) ? 'text-indigo-500' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="mt-1 text-xs">{label}</span>
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
