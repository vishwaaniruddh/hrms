import React from 'react'

export default function MemberProfile() {
    return (

        <div className="nk-main ">
            <div className="nk-wrap ">

                <div className="nk-content ">
                    <div className="container-fluid">
                        <div className="nk-content-inner">
                            <div className="nk-content-body">
                                <div className="nk-block">
                                    <div className="card card-bordered">
                                        <div className="card-aside-wrap">
                                            <div className="card-inner card-inner-lg">
                                                <div className="nk-block-head nk-block-head-lg">
                                                    <div className="nk-block-between">
                                                        <div className="nk-block-head-content">
                                                            <h4 className="nk-block-title">Personal Information</h4>
                                                            <div className="nk-block-des">
                                                                <p>Basic info, like your name and address, that you use on Nio Platform.</p>
                                                            </div>
                                                        </div>
                                                        <div className="nk-block-head-content align-self-start d-lg-none"><a href="#" className="toggle btn btn-icon btn-trigger mt-n1" data-target="userAside"><em className="icon ni ni-menu-alt-r"></em></a></div>
                                                    </div>
                                                </div>
                                                <div className="nk-block">
                                                    <div className="nk-data data-list">
                                                        <div className="data-head">
                                                            <h6 className="overline-title">Basics</h6>
                                                        </div>
                                                        <div className="data-item" data-bs-toggle="modal" data-bs-target="#profile-edit">
                                                            <div className="data-col"><span className="data-label">Full Name</span><span className="data-value">Abu Bin Ishtiyak</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more"><em className="icon ni ni-forward-ios"></em></span></div>
                                                        </div>
                                                        <div className="data-item" data-bs-toggle="modal" data-bs-target="#profile-edit">
                                                            <div className="data-col"><span className="data-label">Display Name</span><span className="data-value">Ishtiyak</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more"><em className="icon ni ni-forward-ios"></em></span></div>
                                                        </div>
                                                        <div className="data-item">
                                                            <div className="data-col"><span className="data-label">Email</span><span className="data-value">info@softnio.com</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more disable"><em className="icon ni ni-lock-alt"></em></span></div>
                                                        </div>
                                                        <div className="data-item" data-bs-toggle="modal" data-bs-target="#profile-edit">
                                                            <div className="data-col"><span className="data-label">Phone Number</span><span className="data-value text-soft">Not add yet</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more"><em className="icon ni ni-forward-ios"></em></span></div>
                                                        </div>
                                                        <div className="data-item" data-bs-toggle="modal" data-bs-target="#profile-edit">
                                                            <div className="data-col"><span className="data-label">Date of Birth</span><span className="data-value">29 Feb, 1986</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more"><em className="icon ni ni-forward-ios"></em></span></div>
                                                        </div>
                                                        <div className="data-item" data-bs-toggle="modal" data-bs-target="#profile-edit" data-tab-target="#address">
                                                            <div className="data-col"><span className="data-label">Address</span><span className="data-value">2337 Kildeer Drive,<br />Kentucky, Canada</span></div>
                                                            <div className="data-col data-col-end"><span className="data-more"><em className="icon ni ni-forward-ios"></em></span></div>
                                                        </div>
                                                    </div>
                                                    <div className="nk-data data-list">
                                                        <div className="data-head">
                                                            <h6 className="overline-title">Preferences</h6>
                                                        </div>
                                                        <div className="data-item">
                                                            <div className="data-col"><span className="data-label">Language</span><span className="data-value">English (United State)</span></div>
                                                            <div className="data-col data-col-end"><a href="#" className="link link-primary">Change Language</a></div>
                                                        </div>
                                                        <div className="data-item">
                                                            <div className="data-col"><span className="data-label">Date Format</span><span className="data-value">M d, YYYY</span></div>
                                                            <div className="data-col data-col-end"><a href="#" className="link link-primary">Change</a></div>
                                                        </div>
                                                        <div className="data-item">
                                                            <div className="data-col"><span className="data-label">Timezone</span><span className="data-value">Bangladesh (GMT +6)</span></div>
                                                            <div className="data-col data-col-end"><a href="#" className="link link-primary">Change</a></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg toggle-screen-lg" data-content="userAside" data-toggle-screen="lg" data-toggle-overlay="true">
                                                <div className="card-inner-group" data-simplebar="init">
                                                    <div className="simplebar-wrapper" style={{ margin: '0px' }}>
                                                        <div className="simplebar-height-auto-observer-wrapper">
                                                            <div className="simplebar-height-auto-observer"></div>
                                                        </div>
                                                        <div className="simplebar-mask">
                                                            <div className="simplebar-offset" style={{ right: '0px', bottom: '0px' }}>
                                                                <div className="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content" style={{ height: 'auto', overflow: 'hidden' }}>
                                                                    <div className="simplebar-content" style={{ padding: '0px' }}>
                                                                        <div className="card-inner">
                                                                            <div className="user-card">
                                                                                <div className="user-avatar bg-primary"><span>AB</span></div>
                                                                                <div className="user-info"><span className="lead-text">Abu Bin Ishtiyak</span><span className="sub-text">info@softnio.com</span></div>
                                                                                <div className="user-action">
                                                                                    <div className="dropdown">
                                                                                        <a className="btn btn-icon btn-trigger me-n2" data-bs-toggle="dropdown" href="#"><em className="icon ni ni-more-v"></em></a>
                                                                                        <div className="dropdown-menu dropdown-menu-end">
                                                                                            <ul className="link-list-opt no-bdr">
                                                                                                <li><a href="#"><em className="icon ni ni-camera-fill"></em><span>Change Photo</span></a></li>
                                                                                                <li><a href="#"><em className="icon ni ni-edit-fill"></em><span>Update Profile</span></a></li>
                                                                                            </ul>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="card-inner p-0">
                                                                            <ul className="link-list-menu">
                                                                                <li><a className="active" href="/demo7/pharmacy/members-profile-regular.html"><em className="icon ni ni-user-fill-c"></em><span>Personal Infomation</span></a></li>
                                                                                <li><a href="/demo7/pharmacy/members-profile-notification.html"><em className="icon ni ni-bell-fill"></em><span>Notifications</span></a></li>
                                                                                <li><a href="/demo7/pharmacy/members-profile-activity.html"><em className="icon ni ni-activity-round-fill"></em><span>Account Activity</span></a></li>
                                                                                <li><a href="/demo7/pharmacy/members-profile-setting.html"><em className="icon ni ni-lock-alt-fill"></em><span>Security Settings</span></a></li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="simplebar-placeholder" style={{ width: 'auto', height: '327px' }}></div>
                                                    </div>
                                                    <div className="simplebar-track simplebar-horizontal" style={{ visibility: 'hidden' }}>
                                                        <div className="simplebar-scrollbar" style={{ width: '0px', display: 'none' }}></div>
                                                    </div>
                                                    <div className="simplebar-track simplebar-vertical" style={{ visibility: 'hidden' }}>
                                                        <div className="simplebar-scrollbar" style={{ height: '0px', display: 'none' }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
