import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { FooterNav } from '../shared/FooterNav';
import { SavedServices } from './tabs/SavedServices';
import { SavedProfessionals } from './tabs/SavedProfessionals';
import { TrendRequests } from './tabs/TrendRequests';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { AftercareSummaries } from './tabs/AftercareSummaries';
import { DiscoveryLayout } from '../discovery/DiscoveryLayout';
import ServiceHistory from './tabs/ServiceHistory';
import Bookings from './tabs/Bookings';
import { 
  Bookmark, 
  Users, 
  TrendingUp, 
  Calendar, 
  ClipboardList,
  LogOut,
  Bell,
  Search
} from 'lucide-react';

type TabType = 'appointments' | 'services' | 'professionals' | 'requests' | 'aftercare' | 'history' | 'bookings' | 'discover';
type NonDiscoverTab = Exclude<TabType, 'discover'>;

const isNotDiscoverTab = (tab: TabType): tab is NonDiscoverTab => {
  const nonDiscoverTabs: NonDiscoverTab[] = ['appointments', 'services', 'professionals', 'requests', 'aftercare', 'history', 'bookings'];
  return nonDiscoverTabs.includes(tab as NonDiscoverTab);
};

interface DashboardHeaderProps {
  userProfile: any;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userProfile,
  activeTab,
  setActiveTab,
  onLogout
}) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {userProfile?.displayName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your beauty journey
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            className="p-2 text-gray-400 hover:text-gray-500 relative"
            onClick={() => navigate('/client/notifications')}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            )}
          </button>
        </div>
        <button
          onClick={onLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="mb-8 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`${
            activeTab === 'appointments'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <Calendar className="h-5 w-5 mr-2" />
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`${
            activeTab === 'services'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <Bookmark className="h-5 w-5 mr-2" />
          Saved Services
        </button>
        <button
          onClick={() => setActiveTab('professionals')}
          className={`${
            activeTab === 'professionals'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <Users className="h-5 w-5 mr-2" />
          Saved Professionals
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`${
            activeTab === 'requests'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Trend Requests
        </button>
        <button
          onClick={() => setActiveTab('aftercare')}
          className={`${
            activeTab === 'aftercare'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <ClipboardList className="h-5 w-5 mr-2" />
          Aftercare
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`${
            activeTab === 'history'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <ClipboardList className="h-5 w-5 mr-2" />
          Service History
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`${
            activeTab === 'bookings'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <Calendar className="h-5 w-5 mr-2" />
          Bookings
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`${
            activeTab === 'discover'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
        >
          <Search className="h-5 w-5 mr-2" />
          Discover
        </button>
      </nav>
    </div>
  </div>
  );
};

export const ClientDashboard = () => {
  const { userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const navigate = useNavigate();

  // Add token refresh on dashboard load
  useEffect(() => {
    const refreshToken = async () => {
      try {
        // Force token refresh when dashboard loads to ensure permissions are up to date
        if (auth.currentUser) {
          console.log('Refreshing token on client dashboard load');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        // If token refresh fails, try again after a short delay
        setTimeout(() => {
          if (auth.currentUser) {
            console.log('Retrying token refresh');
            auth.currentUser.getIdToken(true)
              .then(() => console.log('Token refresh retry successful'))
              .catch(retryError => {
                console.error('Token refresh retry failed:', retryError);
                // If retry fails, we'll rely on the periodic refresh in AuthContext
              });
          }
        }, 5000);
      }
    };
    
    // Refresh token when dashboard loads
    refreshToken();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentsTab />;
      case 'services':
        return <SavedServices />;
      case 'professionals':
        return <SavedProfessionals />;
      case 'requests':
        return <TrendRequests />;
      case 'aftercare':
        return <AftercareSummaries />;
      case 'discover':
        return <DiscoveryLayout />;
      case 'history':
        return <ServiceHistory />;
      case 'bookings':
        return <Bookings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header and Navigation */}
        {isNotDiscoverTab(activeTab) && (
          <DashboardHeader
            userProfile={userProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content */}
        <div className="space-y-6 pb-24">
          {renderContent()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0">
        <FooterNav userType="client" />
      </div>
    </div>
  );
};
