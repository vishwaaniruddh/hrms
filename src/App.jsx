import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/common/CommandPalette';
import { AuthProvider } from './context/AuthContext';
import './styles/shadcn.css';

// Lazy-loaded route components
const EmployeeSelfService = lazy(() => import('./components/hrms/EmployeeSelfService.jsx'));
const ManagerApprovals = lazy(() => import('./components/hrms/ManagerApprovals.jsx'));
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendance = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));
const LeaveManagement = lazy(() => import('./components/hrms/LeaveManagement.jsx'));
const AssetManagement = lazy(() => import('./components/hrms/AssetManagement.jsx'));
const Holidays = lazy(() => import('./components/hrms/Holidays.jsx'));
const Reports = lazy(() => import('./components/hrms/Reports.jsx'));
const Recruitment = lazy(() => import('./components/hrms/Recruitment.jsx'));
const LifecycleManagement = lazy(() => import('./components/hrms/LifecycleManagement.jsx'));
const PerformanceManagement = lazy(() => import('./components/hrms/PerformanceManagement.jsx'));
const NotificationManagement = lazy(() => import('./components/hrms/NotificationManagement.jsx'));
const ShiftManagement = lazy(() => import('./components/hrms/ShiftManagement.jsx'));
const HelpdeskManagement = lazy(() => import('./components/hrms/HelpdeskManagement.jsx'));

function LoadingFallback() {
  return (
    <div className="loading-spinner" style={{ minHeight: '60vh' }}>
      <div className="spinner"></div>
    </div>
  );
}

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Sidebar onOpenSearch={() => setIsSearchOpen(true)} />
          <div className="app-main">
            <Header onOpenSearch={() => setIsSearchOpen(true)} />
            <main className="app-content">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/hrms/ess" replace />} />
                  <Route path="/hrms/ess" element={<EmployeeSelfService />} />
                  <Route path="/hrms/approvals" element={<ManagerApprovals />} />
                  <Route path="/hrms/members" element={<Member />} />
                  <Route path="/hrms/memberProfile" element={<MemberProfile />} />
                  <Route path="/hrms/attendance" element={<Attendance />} />
                  <Route path="/hrms/leaves" element={<LeaveManagement />} />
                  <Route path="/hrms/holidays" element={<Holidays />} />
                  <Route path="/hrms/assets" element={<AssetManagement />} />
                  <Route path="/hrms/salary" element={<Salary defaultTab="salaries" />} />
                  <Route path="/hrms/payroll/structures" element={<Salary defaultTab="structures" />} />
                  <Route path="/hrms/payroll/masters" element={<Salary defaultTab="masters" />} />
                  <Route path="/hrms/payroll/claims" element={<Salary defaultTab="claims" />} />
                  <Route path="/hrms/payroll/tax" element={<Salary defaultTab="tax" />} />
                  <Route path="/hrms/reports" element={<Reports />} />
                  <Route path="/hrms/recruitment" element={<Recruitment />} />
                  <Route path="/hrms/lifecycle" element={<LifecycleManagement />} />
                  <Route path="/hrms/pms" element={<PerformanceManagement />} />
                  <Route path="/hrms/notifications" element={<NotificationManagement />} />
                  <Route path="/hrms/shifts" element={<ShiftManagement />} />
                  <Route path="/hrms/helpdesk" element={<HelpdeskManagement />} />
                </Routes>
              </Suspense>
            </main>
          </div>

          <CommandPalette 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
