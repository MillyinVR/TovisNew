import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { ConversationView } from './components/shared/ConversationView';

// Admin Components
import { AdminDashboardLayout as AdminDashboard } from './components/admin/dashboard/AdminDashboardLayout';
import { ServiceManagement } from './components/admin/services/ServiceManagement';
import { ProfessionalManagement } from './components/admin/professionals/ProfessionalManagement';
import { LicenseManagement } from './components/admin/professionals/LicenseManagement';
import { ComplaintsManagement } from './components/admin/support/ComplaintsManagement';
import { SystemSettings } from './components/admin/settings/SystemSettings';

// Professional Components
import { ProfessionalDashboard } from './components/professional/ProfessionalDashboard';
import { ServiceSetup } from './components/professional/services/ServiceSetup';
import { ServiceFlow } from './components/professional/ServiceFlow';
import { CalendarManagement } from './components/professional/calendar/CalendarManagement';
import { ProfileManagementWrapper } from './components/professional/profile/ProfileManagementWrapper';
import { ActivityTab } from './components/professional/tabs/ActivityTab';
import { FinancialManagement } from './components/professional/finance/FinancialManagement';
import { PendingProfessionalDashboard } from './components/PendingProfessionalDashboard';
import { ProfessionalProfile } from './components/professional/ProfessionalProfile';
import { ProfessionalRegistration } from './components/professional/ProfessionalRegistration';

// Client Components
import { ClientDashboard } from './components/client/ClientDashboard';
import { NotificationsPage } from './components/client/NotificationsPage';
import { ServiceDiscovery } from './components/client/discovery/ServiceDiscovery';
import { ProfileSetup } from './components/client/profile/ProfileSetup';
import ServiceHistory from './components/client/tabs/ServiceHistory';
import Bookings from './components/client/tabs/Bookings';

// Shared Components
import { AuthForm } from './components/AuthForm';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types/user';
import BeautyCapture from './components/shared/BeautyCapture';
import { FooterNav } from './components/shared/FooterNav';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <MessagingProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<AuthForm isLogin={true} />} />
              <Route path="/signup" element={<AuthForm isLogin={false} />} />

              {/* Landing and Discovery Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/discover" element={<ServiceDiscovery />} />
              <Route path="/client/discover" element={<ServiceDiscovery />} />
              <Route path="/professional/discover" element={<ServiceDiscovery />} />

              {/* Professional Registration Routes */}
              <Route
                path="/professional/registration"
                element={
                  <ProtectedRoute allowedRoles={['pending_professional' as UserRole]}>
                    <ProfessionalRegistration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/professional/pending"
                element={
                  <ProtectedRoute allowedRoles={['pending_professional' as UserRole]}>
                    <PendingProfessionalDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Beauty Capture Route - Available to all authenticated users */}
              <Route
                path="/beauty-capture"
                element={
                  <ProtectedRoute allowedRoles={['admin' as UserRole, 'professional' as UserRole, 'client' as UserRole]}>
                    <BeautyCapture />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin' as UserRole]}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="services" element={<ServiceManagement />} />
                      <Route path="professionals" element={<ProfessionalManagement />} />
                      <Route path="licenses" element={<LicenseManagement />} />
                      <Route path="complaints" element={<ComplaintsManagement />} />
                      <Route path="settings" element={<SystemSettings />} />
                      <Route path="messages" element={
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                          <div className="flex-1">
                            <ConversationView />
                          </div>
                          <div className="fixed bottom-0 left-0 right-0">
                            <FooterNav userType="client" />
                          </div>
                        </div>
                      } />
                      <Route 
                        path="service-flow" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ServiceFlow />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Professional Routes */}
              <Route
                path="/professional/*"
                element={
                  <ProtectedRoute allowedRoles={['professional' as UserRole, 'pending_professional' as UserRole]}>
                    <Routes>
                      <Route 
                        path="dashboard" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ProfessionalDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="services" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ServiceSetup />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="calendar" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <CalendarManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="profile/edit" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ProfileManagementWrapper />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="activity" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ActivityTab />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="finance" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <FinancialManagement />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="profile" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ProfessionalProfile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="service-flow" 
                        element={
                          <ProtectedRoute allowedRoles={['professional' as UserRole]}>
                            <ServiceFlow />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="messages" element={
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                          <div className="flex-1">
                            <ConversationView />
                          </div>
                          <div className="fixed bottom-0 left-0 right-0">
                            <FooterNav userType="client" />
                          </div>
                        </div>
                      } />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Client Routes */}
              <Route
                path="/client/*"
                element={
                  <ProtectedRoute allowedRoles={['client' as UserRole]}>
                    <Routes>
                      <Route path="dashboard" element={<ClientDashboard />} />
                      <Route path="discover" element={<ServiceDiscovery />} />
                      <Route path="profile" element={<ProfileSetup />} />
                      <Route path="history" element={<ServiceHistory />} />
                      <Route path="bookings" element={<Bookings />} />
                      <Route path="notifications" element={
                        <ProtectedRoute allowedRoles={['client' as UserRole]}>
                          <NotificationsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="messages" element={
                        <div className="min-h-screen bg-gray-50 flex flex-col">
                          <div className="flex-1">
                            <ConversationView />
                          </div>
                          <div className="fixed bottom-0 left-0 right-0">
                            <FooterNav userType="client" />
                          </div>
                        </div>
                      } />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Messaging Route - Available to all authenticated users */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['admin' as UserRole, 'professional' as UserRole, 'client' as UserRole]}>
                    <ConversationView />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </MessagingProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
