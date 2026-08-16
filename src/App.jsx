import React, { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt Optimization: Lazy load route components to reduce initial bundle size and speed up first paint.
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            {/* ⚡ Bolt Optimization: Wrap Routes in Suspense to provide a fallback while lazy components load */}
            <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
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
