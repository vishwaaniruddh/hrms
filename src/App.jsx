import { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ⚡ Bolt Performance Optimization:
// Using React.lazy for route-based code splitting. This defers downloading the Javascript
// for these components until they are requested, significantly reducing the initial bundle size.
const Member = lazy(() => import('./components/hrms/Member.jsx'));
const MemberProfile = lazy(() => import('./components/hrms/MemberProfile.jsx'));
const Attendence = lazy(() => import('./components/hrms/Attendence.jsx'));
const Salary = lazy(() => import('./components/hrms/Salary.jsx'));

const FallbackLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
    </div>
);

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Suspense fallback={<FallbackLoader />}>
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
