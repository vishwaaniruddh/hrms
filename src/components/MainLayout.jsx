import React from 'react';
import Header from './header/Header'; 
import Footer from './footer/Footer'; 
const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
