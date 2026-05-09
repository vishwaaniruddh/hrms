import { Suspense, lazy } from "react";
import MainLayout from './components/MainLayout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt Performance Optimization:
// Code splitting route components using React.lazy() to reduce initial bundle size.
// This ensures that heavy components are only loaded when their specific route is accessed.
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

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
