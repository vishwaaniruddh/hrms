import React, { Suspense } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt: Implement code splitting for route components to reduce initial bundle size
const Member = React.lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = React.lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = React.lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = React.lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<div className="d-flex justify-content-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
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
