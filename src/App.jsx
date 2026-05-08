import React, { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load route components for code splitting to improve initial load time
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

// Simple loading fallback
const PageLoader = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
    </div>
);

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route exact path="/hrms/members" element={<Member />} />
                    <Route exact path="/hrms/memberProfile" element={<MemberProfile />} />
                    <Route exact path="/hrms/attendence" element={<Attendence />} />
                    <Route exact path="/hrms/salary" element={<Salary />} />
                </Routes>
            </Suspense>
        </Router>

    );
};

export default HomePage;
