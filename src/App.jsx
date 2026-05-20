import React, { Suspense } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt: Performance Optimization - Code Splitting
// Lazily load route components to reduce initial bundle size and improve TTI (Time to Interactive).
// These components are large (e.g., Salary.jsx is 31KB+, Attendence.jsx is 39KB+) and aren't needed
// until the user navigates to their specific routes.
const Member = React.lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = React.lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = React.lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = React.lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
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
