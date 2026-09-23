import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Receipt, 
  UserCheck, 
  Search, 
  Filter, 
  RefreshCw, 
  Building2, 
  ChevronRight, 
  FileText, 
  X, 
  Sparkles, 
  AlertTriangle,
  Users,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { approvalsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ManagerApprovals() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'leaves' | 'claims' | 'clearances'
  const [searchTerm, setSearchTerm] = useState('');

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Review Dialog State
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    type: null, // 'leave' | 'claim' | 'clearance'
    item: null,
    action: 'Approved',
    remarks: ''
  });

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      const res = await approvalsApi.getInbox(currentUser.id);
      if (res.success && res.data) {
        setInbox(res.data);
      }
    } catch (err) {
      console.error('Failed to load manager approvals:', err);
      showToast(err.message || 'Failed to load approvals queue', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  // Open Review Dialog
  const openReview = (type, item, action) => {
    setReviewModal({
      isOpen: true,
      type,
      item,
      action,
      remarks: action === 'Approved' ? 'Approved per operational review.' : ''
    });
  };

  // Submit Review Action
  const submitReview = async (e) => {
    e.preventDefault();
    const { type, item, action, remarks } = reviewModal;
    if (!item) return;

    try {
      let res;
      if (type === 'leave') {
        res = await approvalsApi.reviewLeave(item.id, currentUser.id, action, remarks);
      } else if (type === 'claim') {
        res = await approvalsApi.reviewClaim(item.id, currentUser.id, action, remarks);
      } else if (type === 'clearance') {
        res = await approvalsApi.reviewClearance(item.id, currentUser.id, action === 'Approved' ? 'Completed' : 'Waived', remarks);
      }

      if (res?.success) {
        showToast(res.data?.message || `Item successfully marked as ${action}`, 'success');
        setReviewModal({ isOpen: false, type: null, item: null, action: 'Approved', remarks: '' });
        fetchInbox();
      } else {
        showToast(res?.error || 'Failed to update approval status', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error processing approval', 'error');
    }
  };

  const summary = inbox?.summary || {
    total_pending: 0,
    pending_leaves_count: 0,
    pending_claims_count: 0,
    pending_clearances_count: 0,
    pending_claims_amount: 0
  };

  // Filter lists based on search
  const filteredLeaves = useMemo(() => {
    if (!inbox?.leaves) return [];
    return inbox.leaves.filter(l => 
      l.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inbox?.leaves, searchTerm]);

  const filteredClaims = useMemo(() => {
    if (!inbox?.claims) return [];
    return inbox.claims.filter(c => 
      c.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.claim_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inbox?.claims, searchTerm]);

  const filteredClearances = useMemo(() => {
    if (!inbox?.clearances) return [];
    return inbox.clearances.filter(cl => 
      cl.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cl.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inbox?.clearances, searchTerm]);

  return (
    <div className="manager-approvals page-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Manager Approvals Portal</h1>
            <span className="badge badge-amber" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {summary.total_pending} Pending Actions
            </span>
          </div>
          <p className="page-description" style={{ margin: 0 }}>
            Unified operational decision queue. Review direct report leave applications, business expense claims, and exit clearances.
          </p>
        </div>

        <div className="header-actions-group" style={{ display: 'flex', gap: '0.625rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={fetchInbox} 
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Total Pending */}
        <div className="card stat-card gradient-amber" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="card-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Pending Actions
            </span>
            <AlertCircle size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {summary.total_pending}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Across all functional queues</div>
        </div>

        {/* Card 2: Pending Leaves */}
        <div className="card stat-card gradient-blue" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="card-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Leave Applications
            </span>
            <Calendar size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {summary.pending_leaves_count}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Awaiting manager authorization</div>
        </div>

        {/* Card 3: Pending Claims Amount */}
        <div className="card stat-card gradient-emerald" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="card-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Expense Claims
            </span>
            <Receipt size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            ${summary.pending_claims_amount.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{summary.pending_claims_count} receipts in queue</div>
        </div>

        {/* Card 4: Exit Clearances */}
        <div className="card stat-card gradient-purple" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="card-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Exit Clearances
            </span>
            <UserCheck size={18} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {summary.pending_clearances_count}
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Department handover milestones</div>
        </div>
      </div>

      {/* Filter and Navigation Bar */}
      <div className="filter-nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>All Items ({summary.total_pending})</span>
          </button>
          <button 
            type="button" 
            className={`filter-tab ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Calendar size={14} />
            <span>Leave Requests ({summary.pending_leaves_count})</span>
          </button>
          <button 
            type="button" 
            className={`filter-tab ${activeTab === 'claims' ? 'active' : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            <Receipt size={14} />
            <span>Expense Claims ({summary.pending_claims_count})</span>
          </button>
          <button 
            type="button" 
            className={`filter-tab ${activeTab === 'clearances' ? 'active' : ''}`}
            onClick={() => setActiveTab('clearances')}
          >
            <UserCheck size={14} />
            <span>Exit Clearances ({summary.pending_clearances_count})</span>
          </button>
        </div>

        {/* Quick Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="search-input-wrapper" style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-control form-control-sm"
              placeholder="Search applicant or item..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: 220, paddingLeft: '1.75rem' }}
            />
            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
          </div>
        </div>
      </div>

      {/* QUEUE TABLES */}
      <div className="approval-tables-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECTION 1: LEAVE REQUESTS */}
        {(activeTab === 'all' || activeTab === 'leaves') && (
          <div className="card table-card" style={{ border: '1px solid hsl(var(--border))' }}>
            <div className="card-header" style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'hsl(var(--primary))' }} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Pending Leave Applications</h3>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{filteredLeaves.length}</span>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Category</th>
                    <th>Dates & Duration</th>
                    <th>Reason</th>
                    <th>Schedule Impact</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map(l => (
                      <tr key={l.id}>
                        <td>
                          <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                              {l.employee_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'EM'}
                            </div>
                            <div>
                              <div className="cell-title" style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{l.employee_name}</div>
                              <div className="cell-subtitle" style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{l.employee_designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{l.leave_type_name}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{l.start_date} to {l.end_date}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                            {l.total_days} {l.total_days > 1 ? 'days' : 'day'} {l.is_half_day ? '(Half Day)' : ''}
                          </div>
                        </td>
                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span title={l.reason}>{l.reason}</span>
                        </td>
                        <td>
                          {l.team_overlap_count > 0 ? (
                            <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <AlertTriangle size={12} />
                              <span>{l.team_overlap_count} other on leave</span>
                            </span>
                          ) : (
                            <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={12} />
                              <span>No conflicts</span>
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444' }}
                              onClick={() => openReview('leave', l, 'Rejected')}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                              onClick={() => openReview('leave', l, 'Approved')}
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                        No pending leave applications in this queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: EXPENSE CLAIMS */}
        {(activeTab === 'all' || activeTab === 'claims') && (
          <div className="card table-card" style={{ border: '1px solid hsl(var(--border))' }}>
            <div className="card-header" style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={16} style={{ color: 'hsl(var(--primary))' }} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Pending Reimbursement Claims</h3>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{filteredClaims.length}</span>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Claimant</th>
                    <th>Claim Title & Code</th>
                    <th>Category</th>
                    <th>Claim Amount</th>
                    <th>Date Incurred</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length > 0 ? (
                    filteredClaims.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                              {c.employee_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'EM'}
                            </div>
                            <div>
                              <div className="cell-title" style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{c.employee_name}</div>
                              <div className="cell-subtitle" style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{c.employee_designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}><code>{c.claim_number}</code></div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{c.category}</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: '0.9375rem', color: '#10b981' }}>
                            ${parseFloat(c.amount).toFixed(2)}
                          </strong>
                        </td>
                        <td>{c.claim_date}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#ef4444' }}
                              onClick={() => openReview('claim', c, 'Rejected')}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                              onClick={() => openReview('claim', c, 'Approved')}
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve Claim</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                        No pending reimbursement claims found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: EXIT CLEARANCES */}
        {(activeTab === 'all' || activeTab === 'clearances') && (
          <div className="card table-card" style={{ border: '1px solid hsl(var(--border))' }}>
            <div className="card-header" style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} style={{ color: 'hsl(var(--primary))' }} />
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Employee Exit & Departure Clearances</h3>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>{filteredClearances.length}</span>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr>
                    <th>Departing Staff</th>
                    <th>Clearance Milestone</th>
                    <th>Department</th>
                    <th>Last Working Day</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClearances.length > 0 ? (
                    filteredClearances.map(cl => (
                      <tr key={cl.id}>
                        <td>
                          <div className="user-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                              {cl.employee_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'EM'}
                            </div>
                            <div>
                              <div className="cell-title" style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{cl.employee_name}</div>
                              <div className="cell-subtitle" style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{cl.employee_designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{cl.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{cl.notes || 'Department sign-off required'}</div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{cl.department}</span>
                        </td>
                        <td>{cl.last_working_day || 'End of Month'}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                              onClick={() => openReview('clearance', cl, 'Approved')}
                            >
                              <CheckCircle2 size={13} />
                              <span>Sign Off</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                        No pending exit clearances assigned to your management group.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REVIEW CONFIRMATION DIALOG */}
      {reviewModal.isOpen && (
        <div className="dialog-overlay" onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="dialog-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Confirm {reviewModal.action}
              </h2>
              <button type="button" className="btn-icon" onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitReview}>
              <div style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', lineHeight: 1.5 }}>
                You are about to mark this {reviewModal.type} request from{' '}
                <strong style={{ color: 'hsl(var(--foreground))' }}>
                  {reviewModal.item?.employee_name}
                </strong>{' '}
                as <strong style={{ color: reviewModal.action === 'Approved' ? '#10b981' : '#ef4444' }}>{reviewModal.action}</strong>.
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Reviewer Comments / Remarks</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  placeholder="Optional review notes or reason..."
                  value={reviewModal.remarks}
                  onChange={e => setReviewModal(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>

              <div className="dialog-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setReviewModal(prev => ({ ...prev, isOpen: false }))}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn ${reviewModal.action === 'Approved' ? 'btn-primary' : 'btn-danger'}`}
                  style={reviewModal.action === 'Approved' ? { background: '#10b981', borderColor: '#10b981' } : {}}
                >
                  Confirm {reviewModal.action}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
