import React, { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt: Code splitting route components to reduce initial bundle size and improve page load time
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

// ⚡ Bolt: Added fallback UI for Suspense during lazy loading
const LoadingFallback = () => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<LoadingFallback />}>
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
