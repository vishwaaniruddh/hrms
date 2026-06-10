import { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt Performance Optimization:
// Implemented route-based code splitting using React.lazy().
// This prevents the application from loading the entire bundle upfront.
// Expected Impact: Faster initial page load time and reduced TTI (Time to Interactive).
// Measurement: Initial JS bundle size should be noticeably smaller.
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            {/* ⚡ Bolt: Added Suspense boundary to show fallback UI while lazy components load */}
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
