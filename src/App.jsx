import React from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component
import Member from './components/hrms/Member.jsx';
// import { Routes, Route, Router } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MemberProfile from './components/hrms/MemberProfile.jsx';
import Attendence from './components/hrms/Attendence.jsx';
import Salary from './components/hrms/Salary.jsx';

const HomePage = () => {
    return (
        <Router>
            <MainLayout />
            <Routes>
                <Route exact path="/hrms/members" element={<Member />} />
                <Route exact path="/hrms/memberProfile" element={<MemberProfile />} />
                <Route exact path="/hrms/attendence" element={<Attendence />} />
                <Route exact path="/hrms/salary" element={<Salary />} />

                
            </Routes>
        </Router>

    );
};

export default HomePage;
