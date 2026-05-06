import React from 'react'

export default function Salary() {
  return (
    <div className="nk-main ">
   <div className="nk-wrap ">
      <div className="nk-header nk-header-fixed nk-header-fluid">
         <div className="container-fluid">
            <div className="nk-header-wrap">
               <div className="nk-menu-trigger d-xl-none ml-n1"><a href="#" className="nk-nav-toggle nk-quick-nav-icon" data-target="sidebarMenu"><em className="icon ni ni-menu"></em></a></div>
               <div className="nk-header-brand d-xl-none"><a href="/demo7/index.html" className="logo-link"><img className="logo-light logo-img" src="/demo7/images/logo.png" srcSet="/demo7/images/logo2x.png 2x" alt="logo" /><img className="logo-dark logo-img" src="/demo7/images/logo-dark.png" srcSet="/demo7/images/logo-dark2x.png 2x" alt="logo-dark" /></a></div>
               <div className="nk-header-search ml-3 ml-xl-0"><em className="icon ni ni-search"></em><input type="text" className="form-control border-transparent form-focus-none" placeholder="Search anything" /></div>
               <div className="nk-header-tools">
                  <ul className="nk-quick-nav">
                     <li className="dropdown chats-dropdown hide-mb-xs">
                        <a href="#" className="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown">
                           <div className="icon-status icon-status-na"><em className="icon ni ni-comments"></em></div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-xl dropdown-menu-end">
                           <div className="dropdown-head"><span className="sub-title nk-dropdown-title">Recent Chats</span><a href="#">Setting</a></div>
                           <div className="dropdown-body">
                              <ul className="chat-list">
                                 <li className="chat-item">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar"><span>IH</span><span className="status dot dot-lg dot-gray"></span></div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">Iliash Hossain</div>
                                             <span className="time">Now</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">You: Please confrim if you got my last messages.</div>
                                             <div className="status delivered"><em className="icon ni ni-check-circle-fill"></em></div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                                 <li className="chat-item is-unread">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar bg-pink"><span>AB</span><span className="status dot dot-lg dot-success"></span></div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">Abu Bin Ishtiyak</div>
                                             <span className="time">4:49 AM</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">Hi, I am Ishtiyak, can you help me with this problem ?</div>
                                             <div className="status unread"><em className="icon ni ni-bullet-fill"></em></div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                                 <li className="chat-item">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar"><img src="/demo7/images/avatar/b-sm.jpg" alt="" /></div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">George Philips</div>
                                             <span className="time">6 Apr</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">Have you seens the claim from Rose?</div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                                 <li className="chat-item">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar user-avatar-multiple">
                                          <div className="user-avatar"><img src="/demo7/images/avatar/c-sm.jpg" alt="" /></div>
                                          <div className="user-avatar"><span>AB</span></div>
                                       </div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">Softnio Group</div>
                                             <span className="time">27 Mar</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">You: I just bought a new computer but i am having some problem</div>
                                             <div className="status sent"><em className="icon ni ni-check-circle"></em></div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                                 <li className="chat-item">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar"><img src="/demo7/images/avatar/a-sm.jpg" alt="" /><span className="status dot dot-lg dot-success"></span></div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">Larry Hughes</div>
                                             <span className="time">3 Apr</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">Hi Frank! How is you doing?</div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                                 <li className="chat-item">
                                    <a className="chat-link" href="/demo7/pharmacy/support.html">
                                       <div className="chat-media user-avatar bg-purple"><span>TW</span></div>
                                       <div className="chat-info">
                                          <div className="chat-from">
                                             <div className="name">Tammy Wilson</div>
                                             <span className="time">27 Mar</span>
                                          </div>
                                          <div className="chat-context">
                                             <div className="text">You: I just bought a new computer but i am having some problem</div>
                                             <div className="status sent"><em className="icon ni ni-check-circle"></em></div>
                                          </div>
                                       </div>
                                    </a>
                                 </li>
                              </ul>
                           </div>
                           <div className="dropdown-foot center"><a href="/demo7/pharmacy/support.html">View All</a></div>
                        </div>
                     </li>
                     <li className="dropdown notification-dropdown">
                        <a href="#" className="dropdown-toggle nk-quick-nav-icon" data-bs-toggle="dropdown">
                           <div className="icon-status icon-status-info"><em className="icon ni ni-bell"></em></div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-xl dropdown-menu-end">
                           <div className="dropdown-head"><span className="sub-title nk-dropdown-title">Notifications</span><a href="#">Mark All as Read</a></div>
                           <div className="dropdown-body">
                              <div className="nk-notification">
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">You have requested to <span>Widthdrawl</span></div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">Your <span>Deposit Order</span> is placed</div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">You have requested to <span>Widthdrawl</span></div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">Your <span>Deposit Order</span> is placed</div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-warning-dim ni ni-curve-down-right"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">You have requested to <span>Widthdrawl</span></div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                                 <div className="nk-notification-item dropdown-inner">
                                    <div className="nk-notification-icon"><em className="icon icon-circle bg-success-dim ni ni-curve-down-left"></em></div>
                                    <div className="nk-notification-content">
                                       <div className="nk-notification-text">Your <span>Deposit Order</span> is placed</div>
                                       <div className="nk-notification-time">2 hrs ago</div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="dropdown-foot center"><a href="#">View All</a></div>
                        </div>
                     </li>
                     <li className="dropdown user-dropdown">
                        <a href="#" className="dropdown-toggle mr-n1" data-bs-toggle="dropdown">
                           <div className="user-toggle">
                              <div className="user-avatar sm"><em className="icon ni ni-user-alt"></em></div>
                           </div>
                        </a>
                        <div className="dropdown-menu dropdown-menu-md dropdown-menu-end">
                           <div className="dropdown-inner user-card-wrap bg-lighter">
                              <div className="user-card">
                                 <div className="user-avatar"><span>AB</span></div>
                                 <div className="user-info"><span className="lead-text">Abu Bin Ishtiyak</span><span className="sub-text">info@softnio.com</span></div>
                              </div>
                           </div>
                           <div className="dropdown-inner">
                              <ul className="link-list">
                                 <li><a href="/demo7/pharmacy/members-profile-regular.html"><em className="icon ni ni-user-alt"></em><span>View Profile</span></a></li>
                                 <li><a href="/demo7/pharmacy/general-settings.html"><em className="icon ni ni-setting-alt"></em><span>Account Setting</span></a></li>
                                 <li><a href="/demo7/pharmacy/account-log.html"><em className="icon ni ni-activity-alt"></em><span>Login Activity</span></a></li>
                              </ul>
                           </div>
                           <div className="dropdown-inner">
                              <ul className="link-list">
                                 <li><a href="#"><em className="icon ni ni-signout"></em><span>Sign out</span></a></li>
                              </ul>
                           </div>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
      <div className="nk-content ">
         <div className="container-fluid">
            <div className="nk-content-inner">
               <div className="nk-content-body">
                  <div className="nk-block-head nk-block-head-sm">
                     <div className="nk-block-between">
                        <div className="nk-block-head-content">
                           <h3 className="nk-block-title page-title">Salary</h3>
                        </div>
                     </div>
                  </div>
                  <div className="nk-block">
                     <div className="row gy-5">
                        <div className="col-lg-12">
                           <div className="nk-block-head">
                              <div className="nk-block-head-content">
                                 <h5 className="nk-block-title title">Add a salary</h5>
                              </div>
                           </div>
                           <div className="card card-bordered">
                              <div className="card-inner">
                                 <form action="#">
                                    <div className="row gy-4">
                                       <div className="col-xxl-3 col-sm-6">
                                          <div className="form-group"><label className="form-label" htmlFor="member">Member</label><input type="text" className="form-control" id="member" placeholder="Member" required="" /></div>
                                       </div>
                                       <div className="col-xxl-3 col-sm-6">
                                          <div className="form-group">
                                             <label className="form-label">Date</label>
                                             <div className="form-control-wrap">
                                                <div className="form-icon form-icon-right"><em className="icon ni ni-calendar"></em></div>
                                                <input type="text" className="form-control date-picker" data-date-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" />
                                             </div>
                                          </div>
                                       </div>
                                       <div className="col-xxl-3 col-sm-6">
                                          <div className="form-group"><label className="form-label" htmlFor="salary">Total Salary</label><input type="number" className="form-control" id="salary" placeholder="Salary" required="" /></div>
                                       </div>
                                       <div className="col-xxl-3 col-sm-6">
                                          <div className="form-group"><label className="form-label" htmlFor="days">Working Days</label><input type="number" className="form-control" id="days" placeholder="Working Days" required="" /></div>
                                       </div>
                                       <div className="col-12">
                                          <div className="form-group">
                                             <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                                                <li><button type="submit" className="btn btn-primary ">Save Informations</button></li>
                                                <li><button data-bs-dismiss="modal" className="btn btn-danger">Cancel</button></li>
                                             </ul>
                                          </div>
                                       </div>
                                    </div>
                                 </form>
                              </div>
                           </div>
                        </div>
                        <div className="col-lg-12">
                           <div className="nk-block-head">
                              <div className="nk-block-head-content">
                                 <h5 className="nk-block-title title">Salary List</h5>
                              </div>
                           </div>
                           <div className="nk-block">
                              <div className="card card-bordered card-stretch">
                                 <div className="card-inner-group">
                                    <div className="card-inner position-relative card-tools-toggle">
                                       <div className="card-title-group">
                                          <div className="card-tools">
                                             <div className="form-control-wrap">
                                                <div className="input-daterange date-picker-range input-group">
                                                   <input type="text" className="form-control" placeholder="Start Date" />
                                                   <div className="input-group-addon">TO</div>
                                                   <input type="text" className="form-control" placeholder="End Date" />
                                                </div>
                                             </div>
                                          </div>
                                          <div className="card-tools me-n1">
                                             <ul className="btn-toolbar gx-1">
                                                <li><a href="#" className="btn btn-icon search-toggle toggle-search" data-target="search"><em className="icon ni ni-search"></em></a></li>
                                             </ul>
                                          </div>
                                          <div className="card-search search-wrap" data-search="search">
                                             <div className="card-body">
                                                <div className="search-content"><a href="#" className="search-back btn btn-icon toggle-search" data-target="search"><em className="icon ni ni-arrow-left"></em></a><input type="text" className="form-control border-transparent form-focus-none" placeholder="Search by name" /><button className="search-submit btn btn-icon"><em className="icon ni ni-search"></em></button></div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="card-inner p-0">
                                       <div className="nk-tb-list nk-tb-ulist">
                                          <div className="nk-tb-item nk-tb-head  bg-lighter">
                                             <div className="nk-tb-col"><span className="sub-text">Member</span></div>
                                             <div className="nk-tb-col tb-col-sm"><span className="sub-text">Date</span></div>
                                             <div className="nk-tb-col"><span className="sub-text">Total salary</span></div>
                                             <div className="nk-tb-col tb-col-md"><span className="sub-text">Working Days</span></div>
                                             <div className="nk-tb-col tb-col-lg"><span className="sub-text">Generated By</span></div>
                                             <div className="nk-tb-col tb-col-md"><span className="sub-text">Status</span></div>
                                             <div className="nk-tb-col nk-tb-col-tools">
                                                <ul className="nk-tb-actions gx-1 my-n1">
                                                   <li>
                                                      <div className="drodown">
                                                         <a href="#" className="dropdown-toggle btn btn-icon btn-trigger me-n1" data-bs-toggle="dropdown"><em className="icon ni ni-more-h"></em></a>
                                                         <div className="dropdown-menu dropdown-menu-end">
                                                            <ul className="link-list-opt no-bdr">
                                                               <li><a data-bs-toggle="modal" href="#editSalary"><em className="icon ni ni-edit"></em><span>Edit Selected</span></a></li>
                                                               <li><a data-bs-toggle="modal" href="#modalDelete"><em className="icon ni ni-trash"></em><span>Remove Seleted</span></a></li>
                                                            </ul>
                                                         </div>
                                                      </div>
                                                   </li>
                                                </ul>
                                             </div>
                                          </div>
                                          <div className="nk-tb-item">
                                             <div className="nk-tb-col">
                                                <a href="#">
                                                   <div className="user-card">
                                                      <div className="user-info"><span className="tb-lead">Emma Walker</span></div>
                                                   </div>
                                                </a>
                                             </div>
                                             <div className="nk-tb-col tb-col-sm"><span>12/12/2021</span></div>
                                             <div className="nk-tb-col"><span className="tb-amount">7800.00 <span className="currency">USD</span></span></div>
                                             <div className="nk-tb-col tb-col-md"><span className="badge bg-danger">22Days</span></div>
                                             <div className="nk-tb-col tb-col-lg"><span>Manager</span></div>
                                             <div className="nk-tb-col tb-col-md"><span className="tb-status text-danger">Unpaid</span></div>
                                             <div className="nk-tb-col nk-tb-col-tools">
                                                <ul className="nk-tb-actions gx-1">
                                                   <li>
                                                      <div className="drodown">
                                                         <a href="#" className="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown"><em className="icon ni ni-more-h"></em></a>
                                                         <div className="dropdown-menu dropdown-menu-end">
                                                            <ul className="link-list-opt no-bdr">
                                                               <li><a data-bs-toggle="modal" href="#addPay"><em className="icon ni ni-coin-alt"></em><span>Pay Now</span></a></li>
                                                               <li><a data-bs-toggle="modal" href="#editSalary"><em className="icon ni ni-edit"></em><span>Edit</span></a></li>
                                                               <li><a data-bs-toggle="modal" href="#modalDelete"><em className="icon ni ni-trash"></em><span>Remove</span></a></li>
                                                            </ul>
                                                         </div>
                                                      </div>
                                                   </li>
                                                </ul>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="card-inner">
                                       <div className="nk-block-between-md g-3">
                                          <div className="g">
                                             <ul className="pagination justify-content-center justify-content-md-start">
                                                <li className="page-item"><a className="page-link" href="#">Prev</a></li>
                                                <li className="page-item"><a className="page-link" href="#">1</a></li>
                                                <li className="page-item"><a className="page-link" href="#">2</a></li>
                                                <li className="page-item"><span className="page-link"><em className="icon ni ni-more-h"></em></span></li>
                                                <li className="page-item"><a className="page-link" href="#">6</a></li>
                                                <li className="page-item"><a className="page-link" href="#">7</a></li>
                                                <li className="page-item"><a className="page-link" href="#">Next</a></li>
                                             </ul>
                                          </div>
                                          <div className="g">
                                             <div className="pagination-goto d-flex justify-content-center justify-content-md-start gx-3">
                                                <div>Page</div>
                                                <div>
                                                   <select className="form-select form-select-sm js-select2 select2-hidden-accessible" data-search="on" data-dropdown="xs center" data-select2-id="1" tabIndex="-1" aria-hidden="true">
                                                      <option value="page-1" data-select2-id="3">1</option>
                                                      <option value="page-2">2</option>
                                                      <option value="page-4">4</option>
                                                      <option value="page-5">5</option>
                                                      <option value="page-6">6</option>
                                                      <option value="page-7">7</option>
                                                      <option value="page-8">8</option>
                                                      <option value="page-9">9</option>
                                                      <option value="page-10">10</option>
                                                      <option value="page-11">11</option>
                                                      <option value="page-12">12</option>
                                                      <option value="page-13">13</option>
                                                      <option value="page-14">14</option>
                                                      <option value="page-15">15</option>
                                                      <option value="page-16">16</option>
                                                      <option value="page-17">17</option>
                                                      <option value="page-18">18</option>
                                                      <option value="page-19">19</option>
                                                      <option value="page-20">20</option>
                                                   </select>
                                                   <span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="2" style={{width: '80.6424px'}}><span className="selection"><span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabIndex="0" aria-disabled="false" aria-labelledby="select2-plpd-container"><span className="select2-selection__rendered" id="select2-plpd-container" role="textbox" aria-readonly="true" title="1">1</span><span className="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span className="dropdown-wrapper" aria-hidden="true"></span></span>
                                                </div>
                                                <div>OF 102</div>
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
         </div>
      </div>
   </div>
</div>
  )
}
