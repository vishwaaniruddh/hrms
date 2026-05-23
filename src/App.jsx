import React, { Suspense } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt: Implemented code splitting using React.lazy() for route components.
// This reduces the initial bundle size, allowing the application to load faster.
// Expected Impact: Faster initial load times and smaller JavaScript payload.
const Member = React.lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = React.lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = React.lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = React.lazy(() => import('./components/hrms/Salary.jsx'));

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
