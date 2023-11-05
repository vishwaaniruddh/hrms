import React from 'react';
import MainLayout from './components/MainLayout'; // Import your MainLayout component

const HomePage = () => {
    return (
        <MainLayout>

            <div className="nk-main">

                <div className="nk-wrap">
                    <div className="nk-content ">
                        <div className="container-fluid">
                            <div className="nk-content-inner">
                                <div className="nk-content-body">
                                    <p>Starter page .</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
};

export default HomePage;
