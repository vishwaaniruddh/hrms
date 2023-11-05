
import React from 'react';
import A_avatarImage from '../../images/avatar/a-sm.jpg'; // Import your image
import B_avatarImage from '../../images/avatar/b-sm.jpg'; // Import your image
import C_avatarImage from '../../images/avatar/c-sm.jpg'; // Import your image

import english_sq from '../../images/flags/english-sq.png'
import english from '../../images/flags/english.png'
import spanish from '../../images/flags/spanish.png'
import french from '../../images/flags/french.png'
import turkey from '../../images/flags/turkey.png'

import logo_small from '../../images/logo-small.png'
import logo_dark_small from '../../images/logo-dark-small.png'



const Header = () => {
    return (
        <>
            <div className="nk-sidebar" data-content="sidebarMenu">
                <div className="nk-sidebar-bar">
                    <div className ="nk-apps-brand">
                        <a href="/demo7/index.html" className ="logo-link">
                            <img className ="logo-light logo-img" src={logo_small} alt="logo" />
                            <img className ="logo-dark logo-img" src={logo_dark_small} alt="logo-dark" />
                        </a>
                    </div>

                    <div className="nk-sidebar-element">
                        <div className="nk-sidebar-body">
                            <div className="nk-sidebar-content" data-simplebar>
                                <div className="nk-sidebar-menu">
                                    <ul className="nk-menu apps-menu">
                                        <li className="nk-menu-item active"><a href="#" className="nk-menu-link nk-menu-switch"
                                            data-target="navPharmacy"><span className="nk-menu-icon"><em
                                                className="icon ni ni-capsule"></em></span></a></li>
                                    </ul>
                                </div>
                                <div className="nk-sidebar-footer">
                                    <ul className="nk-menu nk-menu-md apps-menu">
                                        <li className="nk-menu-item"><a href="#" className="nk-menu-link" title="Settings"><span
                                            className="nk-menu-icon"><em className="icon ni ni-setting"></em></span></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="nk-sidebar-profile nk-sidebar-profile-fixed"><a href="#" className="toggle"
                                data-target="profileDD">
                                <div className="user-avatar"><span>AB</span></div>
                            </a>
                                <div className="dropdown-menu dropdown-menu-md m-1 nk-sidebar-profile-dropdown"
                                    data-content="profileDD">
                                    <div className="dropdown-inner user-card-wrap d-none d-md-block">
                                        <div className="user-card">
                                            <div className="user-avatar"><span>AB</span></div>
                                            <div className="user-info"><span className="lead-text">Abu Bin Ishtiyak</span><span
                                                className="sub-text text-soft">info@softnio.com</span></div>
                                        </div>
                                    </div>
                                    <div className="dropdown-inner">
                                        <ul className="link-list">
                                            <li><a href="user-profile-regular.html"><em
                                                className="icon ni ni-user-alt"></em><span>View Profile</span></a></li>
                                            <li><a href="user-profile-setting.html"><em
                                                className="icon ni ni-setting-alt"></em><span>Account Setting</span></a>
                                            </li>
                                            <li><a href="user-profile-activity.html"><em
                                                className="icon ni ni-activity-alt"></em><span>Login Activity</span></a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="dropdown-inner">
                                        <ul className="link-list">
                                            <li><a href="#"><em className="icon ni ni-signout"></em><span>Sign out</span></a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="nk-sidebar-main is-light">
                    <div className="nk-sidebar-inner" data-simplebar>
                        <div className="nk-menu-content menu-active" data-content="navPharmacy">
                            <h5 className="title">Pharmacy</h5>
                            <ul className="nk-menu">
                                <li className="nk-menu-item"><a href="pharmacy/index.html" className="nk-menu-link"><span
                                    className="nk-menu-icon"><em className="icon ni ni-dashboard-fill"></em></span><span
                                        className="nk-menu-text">Dashboard</span></a></li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-users-fill"></em></span><span
                                        className="nk-menu-text">Customer</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/add-customer.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Add Customer</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/customer.html" className="nk-menu-link"><span
                                            className="nk-menu-text">Customer List</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/customer-ledger.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Customer Ledger</span></a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-capsule-fill"></em></span><span
                                        className="nk-menu-text">Medicine</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/add-medicine.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Add Medicine</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/medicine-list.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Medicine List</span></a>
                                        </li>
                                        <li className="nk-menu-item"><a href="pharmacy/medicine-details.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Medicine Details</span></a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-home-fill"></em></span><span
                                        className="nk-menu-text">Manufacturer</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/manufacturer.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Manufacturer List</span></a>
                                        </li>
                                        <li className="nk-menu-item"><a href="pharmacy/manufacturer-ledger.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Manufacturer
                                                Ledger</span></a></li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-repeat"></em></span><span
                                        className="nk-menu-text">Return</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/add-wastage-return.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Add Wastage
                                                Return</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/wastage-return.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Wastage Return
                                                List</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/add-manufacturer-return.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Add Manufacture
                                                Return</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/manufacturer-return.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Manufacturer Return
                                                List</span></a></li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-user-circle-fill"></em></span><span
                                        className="nk-menu-text">Human resource</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/member.html" className="nk-menu-link"><span
                                            className="nk-menu-text">Member</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/members-profile-regular.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Members Profile</span></a>
                                        </li>
                                        <li className="nk-menu-item"><a href="pharmacy/attendence.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Attendence</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/salary.html" className="nk-menu-link"><span
                                            className="nk-menu-text">Salary</span></a></li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em className="icon ni ni-coin-alt-fill"></em></span><span
                                        className="nk-menu-text">Finance</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/income-list.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Income</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/expense-list.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Expence</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/invoice-list.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Invoice List</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/invoice-details.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Invoice Details</span></a>
                                        </li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item has-sub"><a href="#" className="nk-menu-link nk-menu-toggle"><span
                                    className="nk-menu-icon"><em
                                        className="icon ni ni-activity-round-fill"></em></span><span
                                            className="nk-menu-text">Report</span></a>
                                    <ul className="nk-menu-sub">
                                        <li className="nk-menu-item"><a href="pharmacy/sales-report.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Sales Report</span></a></li>
                                        <li className="nk-menu-item"><a href="pharmacy/purchase-report.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Purchase Report</span></a>
                                        </li>
                                        <li className="nk-menu-item"><a href="pharmacy/stock-report.html"
                                            className="nk-menu-link"><span className="nk-menu-text">Stock Report</span></a></li>
                                    </ul>
                                </li>
                                <li className="nk-menu-item"><a href="pharmacy/support.html" className="nk-menu-link"><span
                                    className="nk-menu-icon"><em className="icon ni ni-msg-fill"></em></span><span
                                        className="nk-menu-text">Support</span></a></li>
                                <li className="nk-menu-item"><a href="pharmacy/general-settings.html" className="nk-menu-link"><span
                                    className="nk-menu-icon"><em className="icon ni ni-setting-fill"></em></span><span
                                        className="nk-menu-text">Setting</span></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>



            <div className="nk-header nk-header-fixed nk-header-fluid">
                <div className="container-fluid">
                    <div className="nk-header-wrap">
                        <div className="nk-menu-trigger d-xl-none ms-n1"><a href="#"
                            className="nk-nav-toggle nk-quick-nav-icon" data-target="sidebarMenu"><em
                                className="icon ni ni-menu"></em></a></div>
                        <div className="nk-header-brand d-xl-none"><a href="index-2.html" className="logo-link">
                        </a></div>
                        <div className="nk-header-search ms-3 ms-xl-0 d-none d-md-flex"><em
                            className="icon ni ni-search"></em><input type="text"
                                className="form-control border-transparent form-focus-none"
                                placeholder="Search anything" /></div>
                        <div className="nk-header-tools">
                            <ul className="nk-quick-nav">
                                <li className="nav-item"><a data-bs-toggle="modal" href="#region"
                                    className="nk-quick-nav-icon"><em className="icon ni ni-globe"></em></a></li>
                                <li className="dropdown chats-dropdown hide-mb-xs"><a href="#"
                                    className="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown">
                                    <div className="icon-status icon-status-na"><em
                                        className="icon ni ni-comments"></em></div>
                                </a>
                                    <div className="dropdown-menu dropdown-menu-xl dropdown-menu-end">
                                        <div className="dropdown-head"><span className="sub-title nk-dropdown-title">Recent
                                            Chats</span><a href="#">Setting</a></div>
                                        <div className="dropdown-body">
                                            <ul className="chat-list">
                                                <li className="chat-item"><a className="chat-link" href="apps-chats.html">
                                                    <div className="chat-media user-avatar"><span>IH</span><span
                                                        className="status dot dot-lg dot-gray"></span></div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">Iliash Hossain</div><span
                                                                className="time">Now</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">You: Please confrim if you got my
                                                                last messages.</div>
                                                            <div className="status delivered"><em
                                                                className="icon ni ni-check-circle-fill"></em>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                                <li className="chat-item is-unread"><a className="chat-link"
                                                    href="apps-chats.html">
                                                    <div className="chat-media user-avatar bg-pink">
                                                        <span>AB</span><span
                                                            className="status dot dot-lg dot-success"></span></div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">Abu Bin Ishtiyak</div><span
                                                                className="time">4:49 AM</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">Hi, I am Ishtiyak, can you help me
                                                                with this problem ?</div>
                                                            <div className="status unread"><em
                                                                className="icon ni ni-bullet-fill"></em></div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                                <li className="chat-item"><a className="chat-link" href="apps-chats.html">
                                                    <div className="chat-media user-avatar">
                                                        <img src={B_avatarImage} alt="User Avatar" />

                                                    </div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">George Philips</div><span
                                                                className="time">6 Apr</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">Have you seens the claim from
                                                                Rose?</div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                                <li className="chat-item"><a className="chat-link" href="apps-chats.html">
                                                    <div className="chat-media user-avatar user-avatar-multiple">
                                                        <div className="user-avatar">

                                                            <img src={C_avatarImage} alt="User Avatar" />

                                                        </div>
                                                        <div className="user-avatar"><span>AB</span></div>
                                                    </div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">Softnio Group</div><span
                                                                className="time">27 Mar</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">You: I just bought a new computer
                                                                but i am having some problem</div>
                                                            <div className="status sent"><em
                                                                className="icon ni ni-check-circle"></em></div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                                <li className="chat-item"><a className="chat-link" href="apps-chats.html">
                                                    <div className="chat-media user-avatar"><img
                                                        src={A_avatarImage} alt="" /><span
                                                            className="status dot dot-lg dot-success"></span></div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">Larry Hughes</div><span
                                                                className="time">3 Apr</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">Hi Frank! How is you doing?</div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                                <li className="chat-item"><a className="chat-link" href="apps-chats.html">
                                                    <div className="chat-media user-avatar bg-purple">
                                                        <span>TW</span></div>
                                                    <div className="chat-info">
                                                        <div className="chat-from">
                                                            <div className="name">Tammy Wilson</div><span
                                                                className="time">27 Mar</span>
                                                        </div>
                                                        <div className="chat-context">
                                                            <div className="text">You: I just bought a new computer
                                                                but i am having some problem</div>
                                                            <div className="status sent"><em
                                                                className="icon ni ni-check-circle"></em></div>
                                                        </div>
                                                    </div>
                                                </a></li>
                                            </ul>
                                        </div>
                                        <div className="dropdown-foot center"><a href="apps-chats.html">View All</a>
                                        </div>
                                    </div>
                                </li>
                                <li className="dropdown notification-dropdown"><a href="#"
                                    className="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown">
                                    <div className="icon-status icon-status-info"><em className="icon ni ni-bell"></em>
                                    </div>
                                </a>
                                    <div className="dropdown-menu dropdown-menu-xl dropdown-menu-end">
                                        <div className="dropdown-head"><span
                                            className="sub-title nk-dropdown-title">Notifications</span><a
                                                href="#">Mark All as Read</a></div>
                                        <div className="dropdown-body">
                                            <div className="nk-notification">
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">You have requested to
                                                            <span>Widthdrawl</span></div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">Your <span>Deposit
                                                            Order</span> is placed</div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">You have requested to
                                                            <span>Widthdrawl</span></div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">Your <span>Deposit
                                                            Order</span> is placed</div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">You have requested to
                                                            <span>Widthdrawl</span></div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                                <div className="nk-notification-item dropdown-inner">
                                                    <div className="nk-notification-icon"><em
                                                        className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em>
                                                    </div>
                                                    <div className="nk-notification-content">
                                                        <div className="nk-notification-text">Your <span>Deposit
                                                            Order</span> is placed</div>
                                                        <div className="nk-notification-time">2 hrs ago</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dropdown-foot center"><a href="#">View All</a></div>
                                    </div>
                                </li>
                                <li className="dropdown language-dropdown d-none d-sm-block me-n1"><a href="#"
                                    className="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown">
                                    <div className="quick-icon border border-light"><img className="icon"
                                        src={english_sq} alt="" /></div>
                                </a>
                                    <div className="dropdown-menu dropdown-menu-end dropdown-menu-s1">
                                        <ul className="language-list">
                                            <li><a href="#" className="language-item"><img
                                                src={english} alt=""
                                                className="language-flag" /><span
                                                    className="language-name">English</span></a></li>
                                            <li><a href="#" className="language-item"><img
                                                src={spanish} alt=""
                                                className="language-flag" /><span
                                                    className="language-name">Español</span></a></li>
                                            <li><a href="#" className="language-item"><img src={french}
                                                alt="" className="language-flag" /><span
                                                    className="language-name">Français</span></a></li>
                                            <li><a href="#" className="language-item">
                                                <img src={turkey}
                                                    alt="" className="language-flag" />
                                                <span
                                                    className="language-name">Türkçe</span></a></li>
                                        </ul>
                                    </div>
                                </li>
                                <li className="dropdown user-dropdown"><a href="#" className="dropdown-toggle me-n1"
                                    data-bs-toggle="dropdown">
                                    <div className="user-toggle">
                                        <div className="user-avatar sm"><em className="icon ni ni-user-alt"></em></div>
                                    </div>
                                </a>
                                    <div className="dropdown-menu dropdown-menu-md dropdown-menu-end">
                                        <div className="dropdown-inner user-card-wrap bg-lighter">
                                            <div className="user-card">
                                                <div className="user-avatar"><span>AB</span></div>
                                                <div className="user-info"><span className="lead-text">Abu Bin
                                                    Ishtiyak</span><span
                                                        className="sub-text">info@softnio.com</span></div>
                                            </div>
                                        </div>
                                        <div className="dropdown-inner">
                                            <ul className="link-list">
                                                <li><a href="user-profile-regular.html"><em
                                                    className="icon ni ni-user-alt"></em><span>View
                                                        Profile</span></a></li>
                                                <li><a href="user-profile-setting.html"><em
                                                    className="icon ni ni-setting-alt"></em><span>Account
                                                        Setting</span></a></li>
                                                <li><a href="user-profile-activity.html"><em
                                                    className="icon ni ni-activity-alt"></em><span>Login
                                                        Activity</span></a></li>
                                            </ul>
                                        </div>
                                        <div className="dropdown-inner">
                                            <ul className="link-list">
                                                <li><a href="#"><em className="icon ni ni-signout"></em><span>Sign
                                                    out</span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Header;
