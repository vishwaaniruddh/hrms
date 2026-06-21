import { Suspense, lazy } from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
// Bolt: Use React.lazy for code splitting to reduce initial main bundle size
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
            {/* Bolt: Wrap routes in Suspense boundary for lazy loading */}
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
