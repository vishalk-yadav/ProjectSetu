import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { CitizenSignup } from './pages/CitizenSignup';
import { VerifyOtp } from './pages/VerifyOtp';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { Departments } from './pages/Departments';
import { MilestonesPage } from './pages/MilestonesPage';
import { BudgetMonitoring } from './pages/BudgetMonitoring';
import { RiskIntelligence } from './pages/RiskIntelligence';
import { AIInsights } from './pages/AIInsights';
import { ProjectMapPage } from './pages/ProjectMapPage';
import { Reports } from './pages/Reports';
import { DocumentsPage } from './pages/DocumentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Complaints } from './pages/Complaints';
import { UserManagement } from './pages/UserManagement';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { CitizenPortal } from './pages/CitizenPortal';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner message="Verifying security credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Auth & Citizen Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<CitizenSignup />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/public-report" element={<ReportIssuePage />} />

              {/* Protected Application Routes inside AppLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="citizen" element={<CitizenPortal />} />
                <Route path="report-issue" element={<ReportIssuePage />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="departments" element={<Departments />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="approvals" element={<ApprovalCenter />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="milestones" element={<MilestonesPage />} />
                <Route path="budget" element={<BudgetMonitoring />} />
                <Route path="risks" element={<RiskIntelligence />} />
                <Route path="ai-insights" element={<AIInsights />} />
                <Route path="map" element={<ProjectMapPage />} />
                <Route path="reports" element={<Reports />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
