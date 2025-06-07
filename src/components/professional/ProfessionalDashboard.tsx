import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AuthContextType } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { useNotifications } from '../../hooks/useNotifications';
import { LicenseExpirationWarning } from './LicenseExpirationWarning';
import { FooterNav } from '../shared/FooterNav';
import { ProfessionalService } from '../../types/service';
import { saveService } from '../../lib/api/services';
import { CustomerRetentionChart } from './charts/CustomerRetentionChart';
import { RevenueReport } from './reports/RevenueReport';
import { PerformanceMetrics } from './metrics/PerformanceMetrics';
import { ProfileManagement } from './profile/ProfileManagement';
import { ReviewsTab } from './tabs/ReviewsTab';
import { AftercareSummaries } from './tabs/AftercareSummaries';
import { BookingCalendar } from './tabs/BookingCalendar';
import { AIConsultations } from './tabs/AIConsultations';
import { StoreTab } from './tabs/StoreTab';
import { LastMinuteTab } from './tabs/LastMinuteTab';
import { TrendingServicesTab } from './tabs/TrendingServicesTab';
import { ServicesTab } from './tabs/ServicesTab';
import './tabs/navigation-tabs.css';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingUp,
  Calendar,
  Star,
  UserCircle,
  ClipboardList,
  Bot,
  LogOut,
  Store,
  Clock,
  Bell,
  Briefcase
} from 'lucide-react';

type TabType = 'overview' | 'profile' | 'analytics' | 'reviews' | 'aftercare' | 'bookings' | 'ai-consult' | 'store' | 'lastminute' | 'trending' | 'services';

export const ProfessionalDashboard = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  const location = useLocation();
  
  useEffect(() => {
    const refreshToken = async () => {
      try {
        // Force token refresh when dashboard loads to ensure permissions are up to date
        if (auth.currentUser) {
          console.log('Refreshing token on dashboard load');
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
    
    // Refresh token first
    refreshToken();
    
    if (userProfile?.uid) {
      setLoading(false);
    }
    
    // Set active tab based on URL query parameter
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'bookings') {
      setActiveTab('bookings');
    } else if (tabParam === 'activity') {
      // Navigate to ActivityTab when the notification bell is clicked
      navigate('/professional/activity');
    }
  }, [userProfile, location.search, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile || !userProfile.uid) {
    return <div>Error: User profile not available</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded">
                    <DollarSign className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Revenue</p>
                    <h3 className="text-lg font-semibold text-gray-900">$15,780</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Clients</p>
                    <h3 className="text-lg font-semibold text-gray-900">48</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rating</p>
                    <h3 className="text-lg font-semibold text-gray-900">4.8</h3>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Retention</p>
                    <h3 className="text-lg font-semibold text-gray-900">75%</h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerRetentionChart />
              <RevenueReport />
            </div>
            <PerformanceMetrics />
          </div>
        );
      case 'profile':
        return (
          <ProfileManagement 
            profileData={{
              ...userProfile,
              uid: userProfile?.uid || '',
              name: userProfile?.name || '',
              bio: userProfile?.bio || '',
              location: userProfile?.location || '',
              profilePhotoUrl: userProfile?.profilePhotoUrl || '',
              verification: {
                status: userProfile?.professionalProfile?.verification?.status || 'pending',
                documentType: userProfile?.professionalProfile?.professionalType,
                documentId: userProfile?.professionalProfile?.licenseNumber,
                verifiedDate: userProfile?.professionalProfile?.verification?.verifiedDate || userProfile?.professionalProfile?.submissionDate,
                expirationDate: userProfile?.professionalProfile?.licenseExpirationDate
              }
            }}
            updateProfile={async (data) => {
              if (!userProfile?.uid) {
                throw new Error('Professional ID not found');
              }
              // TODO: Implement profile update
              console.log('Updating profile:', data);
              return Promise.resolve();
            }}
          />
        );
      case 'services':
        return <ServicesTab />;
      case 'reviews':
        return <ReviewsTab />;
      case 'aftercare':
        return <AftercareSummaries />;
      case 'bookings':
        return <BookingCalendar />;
      case 'ai-consult':
        return <AIConsultations />;
      case 'store':
        return <StoreTab />;
      case 'lastminute':
        return <LastMinuteTab />;
      case 'trending':
        return <TrendingServicesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white">
        {/* Main Header */}
        <div>
          <LicenseExpirationWarning 
            licenseExpirationDate={userProfile?.professionalProfile?.licenseExpirationDate}
            userId={userProfile.uid}
          />
          <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Professional Dashboard
                </h1>
                <p className="text-xs text-gray-500">
                  Welcome back, {userProfile?.displayName}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/professional/dashboard?tab=activity')}
                  className="p-1.5 hover:bg-gray-100 rounded-full relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 text-xs text-white bg-red-500 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-full text-xs font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Navigation Tabs - Fixed right below header */}
        <div className="border-b border-gray-200 shadow-sm relative">
          <div className="max-w-7xl mx-auto relative">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-8 fade-edge-left z-10 pointer-events-none"></div>
            
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-8 fade-edge-right z-10 pointer-events-none"></div>
            
            <div className="relative px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-hide">
              <nav className="flex w-full -mb-px">
                <div className="flex space-x-1 min-w-max px-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'services'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="h-5 w-5 mr-2" />
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'profile'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserCircle className="h-5 w-5 mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'reviews'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Star className="h-5 w-5 mr-2" />
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('aftercare')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'aftercare'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Aftercare
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'bookings'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('lastminute')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'lastminute'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Last Minute
                </button>
                <button
                  onClick={() => setActiveTab('store')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'store'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Store className="h-5 w-5 mr-2" />
                  Store
                </button>
                <button
                  onClick={() => setActiveTab('ai-consult')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'ai-consult'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  AI Consult
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'trending'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Services
                </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted top padding to account for fixed header + nav */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[108px] pb-24">
        {renderContent()}
      </main>

      {/* Footer Navigation */}
      <div className="z-40">
        <FooterNav 
          userType="professional"
          onServiceAction={() => {
            const { currentUser } = useAuth() as AuthContextType;
            if (!currentUser) {
              navigate('/login');
              return;
            }
            navigate('/service-flow');
          }}
        />
      </div>
    </div>
  );
};
