// Optimization: Use React.lazy for code splitting route components.
// This reduces the initial bundle size by loading these components
// dynamically only when their respective routes are visited.
import { lazy, Suspense } from 'react';
import React from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
const Member = lazy(() => import('./components/hrms/Member.jsx'));
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            {/* Optimization: Wrap Routes in Suspense to handle the loading state of lazy-loaded components */}
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
