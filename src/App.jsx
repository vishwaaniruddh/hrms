import MainLayout from './components/MainLayout'; // Import your MainLayout component
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt Performance Optimization: Lazy loading route components to reduce initial bundle size
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<div>Loading...</div>}>
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
