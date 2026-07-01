import { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt: Implemented route-level code splitting using React.lazy to defer loading heavy components until they are requested.
// This reduces the initial bundle size, leading to a faster initial page load time. Expected impact: Smaller main bundle size.
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
