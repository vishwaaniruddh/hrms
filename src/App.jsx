import React from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
const Member = React.lazy(() => import('./components/hrms/Member.jsx')); // ⚡ Bolt: Code splitting route components to reduce initial bundle size
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const MemberProfile = React.lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = React.lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = React.lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route exact path="/hrms/members" element={<Member />} />
                <Route exact path="/hrms/memberProfile" element={<MemberProfile />} />
                <Route exact path="/hrms/attendence" element={<Attendence />} />
                <Route exact path="/hrms/salary" element={<Salary />} />

                
            </Routes>
            </React.Suspense>
        </Router>

    );
};

export default HomePage;
