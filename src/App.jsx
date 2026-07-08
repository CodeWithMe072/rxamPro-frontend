import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Route guards
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layout Wrappers
import { PublicLayout } from './layout/PublicLayout';
import { SidebarLayout } from './layout/SidebarLayout';
import { AdminLayout } from './layout/AdminLayout';

// Pages
import { LandingPage } from './pages/LandingPage/LandingPage';
import { Login } from './pages/Auth/Login';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';

import { StudentDashboard } from './pages/Dashboard/StudentDashboard';
import { AvailableTests } from './pages/Tests/AvailableTests';
import { TestDetails } from './pages/Tests/TestDetails';
import { ExamScreen } from './pages/Exam/ExamScreen';

import { ResultScreen } from './pages/Results/ResultScreen';
import { PreviousAttempts } from './pages/Results/PreviousAttempts';
import { Leaderboard } from './pages/Leaderboard/Leaderboard';
import { Profile } from './pages/User/Profile';
import { Settings } from './pages/User/Settings';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { ManageTests } from './pages/Admin/ManageTests';
import { ManageQuestions } from './pages/Admin/ManageQuestions';
import { UploadConfig } from './pages/Admin/UploadConfig';
import { AnalyticsPanel } from './pages/Admin/AnalyticsPanel';
import { UserManagement } from './pages/Admin/UserManagement';
import { ManageBatches } from './pages/Admin/ManageBatches';
import { ThemeSettings } from './pages/Admin/ThemeSettings';

// Error Page
import { NotFound } from './pages/Errors/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  React.useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--color-surface-container)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
              }}
            />
            <Routes>
              
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
              <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

              {/* Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><StudentDashboard /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/tests" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><AvailableTests /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/tests/:id" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><TestDetails /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/attempts" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><PreviousAttempts /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><Leaderboard /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><Profile /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><Settings /></SidebarLayout>
                </ProtectedRoute>
              } />
              <Route path="/results/summary" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <SidebarLayout><ResultScreen /></SidebarLayout>
                </ProtectedRoute>
              } />

              {/* High-Fidelity Exam Player (Distraction-Free) */}
              <Route path="/exam/:id" element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <ExamScreen />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/tests" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><ManageTests /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/tests/:id/questions" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><ManageQuestions /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/batches" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><ManageBatches /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/upload" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><UploadConfig /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><AnalyticsPanel /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin', 'sub-admin', 'staff']}>
                  <AdminLayout><UserManagement /></AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/admin/theme" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout><ThemeSettings /></AdminLayout>
                </ProtectedRoute>
              } />

              {/* Fallback Catch-all Route */}
              <Route path="/404" element={<PublicLayout><NotFound /></PublicLayout>} />
              <Route path="*" element={<Navigate to="/404" replace />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
