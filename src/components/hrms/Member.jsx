import React from 'react'
const Member = () => {
return (
<div className="nk-main ">
   <div className="nk-wrap ">
      <div className="nk-content ">
         <div className="container-fluid">
            <div className="nk-content-inner">
               <div className="nk-content-body">
                  <div className="nk-block-head nk-block-head-sm">
                     <div className="nk-block-between">
                        <div className="nk-block-head-content">
                           <h3 className="nk-block-title page-title">Members</h3>
                           <div className="nk-block-des text-soft">
                              <p>You have total 56 Members.</p>
                           </div>
                        </div>
                        <div className="nk-block-head-content">
                           <a href="/demo7/pharmacy/add-member.html" className="btn btn-icon btn-primary d-md-none">
                           <em className="icon ni ni-plus"></em></a>
                           <a href="/demo7/pharmacy/add-member.html" className="btn btn-primary d-none d-md-inline-flex"><em className="icon ni ni-plus"></em><span>Add Member</span></a>
                        </div>
                     </div>
                  </div>
                  <div className="nk-block">
                     <div className="card card-bordered card-stretch">
                        <div className="card-inner-group">
                           <div className="card-inner position-relative card-tools-toggle">
                              <div className="card-title-group">
                                 <div className="card-tools">
                                    <div className="form-inline flex-nowrap gx-3">
                                       <div className="form-wrap w-150px">
                                          <select className="form-select form-select-sm js-select2 select2-hidden-accessible" data-search="off" data-placeholder="Bulk Action" data-select2-id="1" tabIndex="-1" aria-hidden="true">
                                             <option value="" data-select2-id="3">Bulk Action</option>
                                             <option value="email">Send Email</option>
                                             <option value="suspend">Suspend</option>
                                             <option value="delete">Delete</option>
                                          </select>
                                          </div>
                                       <div className="btn-wrap"><span className="d-none d-md-block"><button className="btn btn-dim btn-outline-light disabled">Apply</button></span><span className="d-md-none"><button className="btn btn-dim btn-outline-light btn-icon disabled"><em className="icon ni ni-arrow-right"></em></button></span></div>
                                    </div>
                                 </div>
                                 <div className="card-tools me-n1">
                                    <ul className="btn-toolbar gx-1">
                                       <li><a href="#" className="btn btn-icon search-toggle toggle-search" data-target="search"><em className="icon ni ni-search"></em></a></li>
                                       <li className="btn-toolbar-sep"></li>
                                       <li>
                                          <div className="toggle-wrap">
                                             <a href="#" className="btn btn-icon btn-trigger toggle" data-target="cardTools"><em className="icon ni ni-menu-right"></em></a>
                                             <div className="toggle-content" data-content="cardTools">
                                                <ul className="btn-toolbar gx-1">
                                                   <li className="toggle-close"><a href="#" className="btn btn-icon btn-trigger toggle" data-target="cardTools"><em className="icon ni ni-arrow-left"></em></a></li>
                                                   <li>
                                                      <div className="dropdown">
                                                         <a href="#" className="btn btn-trigger btn-icon dropdown-toggle" data-bs-toggle="dropdown">
                                                            <div className="dot dot-primary"></div>
                                                            <em className="icon ni ni-filter-alt"></em>
                                                         </a>
                                                         <div className="filter-wg dropdown-menu dropdown-menu-xl dropdown-menu-end">
                                                            <div className="dropdown-head">
                                                               <span className="sub-title dropdown-title">Filter Members</span>
                                                               <div className="dropdown"><a href="#" className="btn btn-sm btn-icon"><em className="icon ni ni-more-h"></em></a></div>
                                                            </div>
                                                            <div className="dropdown-body dropdown-body-rg">
                                                               <div className="row gx-6 gy-3">
                                                                  <div className="col-6">
                                                                     <div className="form-group">
                                                                        <label className="overline-title overline-title-alt">Designation</label>
                                                                        <select className="form-select form-select-sm js-select2 select2-hidden-accessible" data-select2-id="4" tabIndex="-1" aria-hidden="true">
                                                                           <option value="any" data-select2-id="6">Any Sector</option>
                                                                           <option value="medicine">Admin</option>
                                                                           <option value="gastroenterology">Manager</option>
                                                                           <option value="cardiology">Pharmacist</option>
                                                                           <option value="orthopaedics">Accountant</option>
                                                                           <option value="neurology">Salesman</option>
                                                                           <option value="urology">Cleaner</option>
                                                                        </select>
                                                                        <span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="5" style={{width: 'auto'}}><span className="selection"><span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabIndex="0" aria-disabled="false" aria-labelledby="select2-z75h-container"><span className="select2-selection__rendered" id="select2-z75h-container" role="textbox" aria-readonly="true" title="Any Sector">Any Sector</span><span className="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span className="dropdown-wrapper" aria-hidden="true"></span></span>
                                                                     </div>
                                                                  </div>
                                                                  <div className="col-6">
                                                                     <div className="form-group">
                                                                        <label className="overline-title overline-title-alt">Status</label>
                                                                        <select className="form-select form-select-sm js-select2 select2-hidden-accessible" data-select2-id="7" tabIndex="-1" aria-hidden="true">
                                                                           <option value="any" data-select2-id="9">Any Status</option>
                                                                           <option value="active">Active</option>
                                                                           <option value="inactive">Inactive</option>
                                                                           <option value="suspend">Suspend</option>
                                                                        </select>
                                                                        <span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="8" style={{width: 'auto'}}><span className="selection"><span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabIndex="0" aria-disabled="false" aria-labelledby="select2-p45k-container"><span className="select2-selection__rendered" id="select2-p45k-container" role="textbox" aria-readonly="true" title="Any Status">Any Status</span><span className="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span className="dropdown-wrapper" aria-hidden="true"></span></span>
                                                                     </div>
                                                                  </div>
                                                                  <div className="col-12">
                                                                     <div className="form-group"><button type="button" className="btn btn-secondary">Filter</button></div>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                            <div className="dropdown-foot between"><a className="clickable" href="#">Reset Filter</a><a href="#">Save Filter</a></div>
                                                         </div>
                                                      </div>
                                                   </li>
                                                   <li>
                                                      <div className="dropdown">
                                                         <a href="#" className="btn btn-trigger btn-icon dropdown-toggle" data-bs-toggle="dropdown"><em className="icon ni ni-setting"></em></a>
                                                         <div className="dropdown-menu dropdown-menu-xs dropdown-menu-end">
                                                            <ul className="link-check">
                                                               <li><span>Show</span></li>
                                                               <li className="active"><a href="#">10</a></li>
                                                               <li><a href="#">20</a></li>
                                                               <li><a href="#">50</a></li>
                                                            </ul>
                                                            <ul className="link-check">
                                                               <li><span>Order</span></li>
                                                               <li className="active"><a href="#">DESC</a></li>
                                                               <li><a href="#">ASC</a></li>
                                                            </ul>
                                                         </div>
                                                      </div>
                                                   </li>
                                                </ul>
                                             </div>
                                          </div>
                                       </li>
                                    </ul>
                                 </div>
                              </div>
                              <div className="card-search search-wrap" data-search="search">
                                 <div className="card-body">
                                    <div className="search-content"><a href="#" className="search-back btn btn-icon toggle-search" data-target="search"><em className="icon ni ni-arrow-left"></em></a>
                                    <input type="text" className="form-control border-transparent form-focus-none" placeholder="Search by Member name or email" /><button className="search-submit btn btn-icon"><em className="icon ni ni-search"></em></button></div>
                                 </div>
                              </div>
                           </div>
                           <div className="card-inner p-0">
                              <div className="nk-tb-list nk-tb-ulist">
                                 <div className="nk-tb-item nk-tb-head">
                                    <div className="nk-tb-col nk-tb-col-check">
                                       <div className="custom-control custom-control-sm custom-checkbox notext"><input type="checkbox" className="custom-control-input" id="uid" /><label className="custom-control-label" htmlFor="uid"></label></div>
                                    </div>
                                    <div className="nk-tb-col"><span className="sub-text">Members</span></div>
                                    <div className="nk-tb-col tb-col-md"><span className="sub-text">Phone</span></div>
                                    <div className="nk-tb-col tb-col-mb"><span className="sub-text">Designation</span></div>
                                    <div className="nk-tb-col tb-col-lg"><span className="sub-text">Document</span></div>
                                    <div className="nk-tb-col tb-col-xxl"><span className="sub-text">Address</span></div>
                                    <div className="nk-tb-col tb-col-xxl"><span className="sub-text">Joining Date</span></div>
                                    <div className="nk-tb-col tb-col-md"><span className="sub-text">Status</span></div>
                                    <div className="nk-tb-col nk-tb-col-tools">
                                       <ul className="nk-tb-actions gx-1 my-n1">
                                          <li>
                                             <div className="drodown">
                                                <a href="#" className="dropdown-toggle btn btn-icon btn-trigger me-n1" data-bs-toggle="dropdown"><em className="icon ni ni-more-h"></em></a>
                                                <div className="dropdown-menu dropdown-menu-end">
                                                   <ul className="link-list-opt no-bdr">
                                                      <li><a href="#"><em className="icon ni ni-mail"></em><span>Send Email to All</span></a></li>
                                                      <li><a href="#"><em className="icon ni ni-na"></em><span>Suspend Selected</span></a></li>
                                                      <li><a data-bs-toggle="modal" href="#addMember"><em className="icon ni ni-edit"></em><span>Edit Selected</span></a></li>
                                                      <li><a data-bs-toggle="modal" href="#modalDelete"><em className="icon ni ni-trash"></em><span>Remove Selected</span></a></li>
                                                   </ul>
                                                </div>
                                             </div>
                                          </li>
                                       </ul>
                                    </div>
                                 </div>
                                 <div className="nk-tb-item">
                                    <div className="nk-tb-col nk-tb-col-check">
                                       <div className="custom-control custom-control-sm custom-checkbox notext"><input type="checkbox" className="custom-control-input" id="uid1" /><label className="custom-control-label" htmlFor="uid1"></label></div>
                                    </div>
                                    <div className="nk-tb-col">
                                       <a href="/demo7/pharmacy/Members-profile-regular.html">
                                          <div className="user-card">
                                             <div className="user-avatar sm bg-primary"><span>AB</span></div>
                                             <div className="user-info"><span className="tb-lead">Abu Bin Ishtiyak <span className="dot dot-success d-md-none ms-1"></span></span><span>info@softnio.com</span></div>
                                          </div>
                                       </a>
                                    </div>
                                    <div className="nk-tb-col tb-col-md"><span>+811 847-4958</span></div>
                                    <div className="nk-tb-col tb-col-mb"><span className="fw-bold">Admin</span></div>
                                    <div className="nk-tb-col tb-col-lg">
                                       <ul className="list-inline list-download">
                                          <li>National Id <a href="#" className="popup"><em className="icon ni ni-download"></em></a></li>
                                          <li>Certificates <a href="#" className="popup"><em className="icon ni ni-download"></em></a></li>
                                       </ul>
                                    </div>
                                    <div className="nk-tb-col tb-col-xxl"><span>Large cottage</span></div>
                                    <div className="nk-tb-col tb-col-xxl"><span>10 Feb 2020</span></div>
                                    <div className="nk-tb-col tb-col-md"><span className="tb-status text-success">Active</span></div>
                                    <div className="nk-tb-col nk-tb-col-tools">
                                       <ul className="nk-tb-actions gx-1">
                                          <li className="nk-tb-action-hidden"><a href="#" className="btn btn-trigger btn-icon" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Send Email" data-bs-original-title="Send Email"><em className="icon ni ni-mail-fill"></em></a></li>
                                          <li className="nk-tb-action-hidden"><a href="#" className="btn btn-trigger btn-icon" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Suspend" data-bs-original-title="Suspend"><em className="icon ni ni-user-cross-fill"></em></a></li>
                                          <li>
                                             <div className="drodown">
                                                <a href="#" className="dropdown-toggle btn btn-icon btn-trigger" data-bs-toggle="dropdown"><em className="icon ni ni-more-h"></em></a>
                                                <div className="dropdown-menu dropdown-menu-end">
                                                   <ul className="link-list-opt no-bdr">
                                                      <li><a href="/demo7/pharmacy/members-profile-regular.html"><em className="icon ni ni-eye"></em><span>View Details</span></a></li>
                                                      <li><a data-bs-toggle="modal" href="#addMember"><em className="icon ni ni-edit"></em><span>Edit</span></a></li>
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
                                          <select className="form-select form-select-sm js-select2 select2-hidden-accessible" data-search="on" data-dropdown="xs center" data-select2-id="10" tabIndex="-1" aria-hidden="true">
                                             <option value="page-1" data-select2-id="12">1</option>
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
);
};
export default Member;