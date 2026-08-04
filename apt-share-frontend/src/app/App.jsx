import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { SocketProvider } from './providers/SocketProvider';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { OnboardingPage } from '../pages/onboarding/OnboardingPage';
import { DashboardPage } from '../pages/app/DashboardPage';
import { BrowsePage } from '../pages/app/BrowsePage';
import { ItemDetailPage } from '../pages/app/ItemDetailPage';
import { ItemFormPage } from '../pages/app/ItemFormPage';
import { MyListingsPage } from '../pages/app/MyListingsPage';
import { WishlistPage } from '../pages/app/WishlistPage';
import { BookingsPage } from '../pages/app/BookingsPage';
import { BookingDetailPage } from '../pages/app/BookingDetailPage';
import { PublicProfilePage } from '../pages/app/PublicProfilePage';
import { DisputePage } from '../pages/admin/DisputePage';
import { ChatListPage } from '../pages/app/ChatListPage';
import { ChatThreadPage } from '../pages/app/ChatThreadPage';
import { NotificationsPage } from '../pages/app/NotificationsPage';
import { FeedPage } from '../pages/app/FeedPage';
import { AnalyticsPage } from '../pages/app/AnalyticsPage';
import { CommunityAdminDashboard } from '../pages/admin/CommunityAdminDashboard';
import { PlatformAdminDashboard } from '../pages/admin/PlatformAdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-secondary">
        Loading apt.share application...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyEmailPage />} />
              
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <BrowsePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/items/new"
                element={
                  <ProtectedRoute>
                    <ItemFormPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/items/:listingId"
                element={
                  <ProtectedRoute>
                    <ItemDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <PublicProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/disputes"
                element={
                  <ProtectedRoute>
                    <DisputePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <CommunityAdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/platform/dashboard"
                element={
                  <ProtectedRoute>
                    <PlatformAdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat/:threadId"
                element={
                  <ProtectedRoute>
                    <ChatThreadPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
