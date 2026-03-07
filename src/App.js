import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Layout
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import AcademyPage from './pages/AcademyPage';
import BadgesPage from './pages/BadgesPage';
import MemberCardPage from './pages/MemberCardPage';
import MaintenancePage from './pages/MaintenancePage';
import RidingPage from './pages/RidingPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import MembersPage from './pages/MembersPage';

import Toast from './components/common/Toast';
import LoadingSpinner from './components/common/LoadingSpinner';

import './styles/globals.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, initialized } = useSelector(s => s.auth);
  if (!initialized) return <LoadingSpinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !['admin', 'moderator'].includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useSelector(s => s.auth);
  if (!initialized) return <LoadingSpinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const { initialized } = useSelector(s => s.auth);
  const toasts = useSelector(s => s.ui.toasts);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(getMe());
    else dispatch({ type: 'auth/getMe/rejected' });
  }, [dispatch]);

  if (!initialized) return <LoadingSpinner fullscreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/member-card" element={<MemberCardPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/riding" element={<RidingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(toast => <Toast key={toast.id} toast={toast} />)}
      </div>
    </BrowserRouter>
  );
}
