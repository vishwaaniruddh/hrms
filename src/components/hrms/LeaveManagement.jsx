import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Download, 
  FileText, 
  UserMinus, 
  Info,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { leavesApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

export default function LeaveManagement() {
  const { currentUser, isEmployee, isManager, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [filterType, setFilterType] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [stats, setStats] = useState({ total_requests: 0, pending_count: 0, approved_count: 0, rejected_count: 0, on_leave_today: 0 });
  const [members, setMembers] = useState([]);
  const [userBalances, setUserBalances] = useState([]);
  const [selectedUserForBalance, setSelectedUserForBalance] = useState(currentUser?.id || 2);

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [decisionModal, setDecisionModal] = useState(null); // { id, action: 'approve' | 'reject', request }
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  // Apply Form State
  const [formData, setFormData] = useState({
    user_id: currentUser?.id ? String(currentUser.id) : '2',
    leave_type_id: '1',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    is_half_day: false,
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (isEmployee && currentUser?.id) params.user_id = currentUser.id;
      if (search) params.search = search;
      if (statusTab !== 'All') params.status = statusTab;
      if (filterType) params.leave_type_id = filterType;

      const res = await leavesApi.getRequests(params);
      setRequests(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch leave requests', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab, filterType, isEmployee, currentUser?.id]);

  const fetchStats = useCallback(async () => {
    try {
      const params = isEmployee && currentUser?.id ? { user_id: currentUser.id } : {};
      const res = await leavesApi.getStats(params);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load leave stats', err);
    }
  }, [isEmployee, currentUser?.id]);

  const fetchBalances = async (userId) => {
    try {
      const res = await leavesApi.getBalances(userId);
      if (res.data) setUserBalances(res.data);
    } catch (err) {
      console.error('Failed to load user balances', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  useEffect(() => {
    leavesApi.getTypes().then(res => setLeaveTypes(res.data || [])).catch(() => {});
    membersApi.getAll({ per_page: 100 }).then(res => setMembers(res.data || [])).catch(() => {});
    fetchBalances(selectedUserForBalance);
  }, []);

  useEffect(() => {
    if (isEmployee && currentUser?.id) {
      setSelectedUserForBalance(currentUser.id);
      setFormData(prev => ({ ...prev, user_id: String(currentUser.id) }));
      fetchBalances(currentUser.id);
    }
  }, [isEmployee, currentUser?.id]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle Apply Submission
  const handleApply = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSaving(true);
    try {
      await leavesApi.apply(formData);
      setShowApplyModal(false);
      setFormData({
        user_id: '2',
        leave_type_id: '1',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_half_day: false,
        reason: ''
      });
      fetchRequests();
      fetchStats();
      fetchBalances(formData.user_id);
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else alert(err.error || 'Failed to submit application');
    } finally {
      setSaving(false);
    }
  };

  // Handle Approval or Rejection
  const handleDecision = async () => {
    if (!decisionModal) return;
    setSaving(true);
    try {
      if (decisionModal.action === 'approve') {
        await leavesApi.approve(decisionModal.id, { remarks: remarks || 'Approved by manager' });
      } else {
        await leavesApi.reject(decisionModal.id, { remarks: remarks || 'Rejected by manager' });
      }
      setDecisionModal(null);
      setRemarks('');
      fetchRequests();
      fetchStats();
      fetchBalances(selectedUserForBalance);
    } catch (err) {
      alert(err.error || 'Failed to update leave request');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (requests.length === 0) return;
    const headers = ['ID', 'Employee', 'Policy', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Approver'];
    const rows = requests.map(r => [
      r.id, 
      `"${r.member_name}"`, 
      r.type_name, 
      r.start_date, 
      r.end_date, 
      r.total_days, 
      `"${r.reason.replace(/"/g, '""')}"`, 
      r.status, 
      `"${r.approver_name || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leave_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>{isEmployee ? 'My Leave Applications & Balances' : 'Leave Management & Approvals'}</h1>
          <p>
            {isEmployee 
              ? 'Submit time-off requests, track approval status, and monitor your personal quota balance.' 
              : 'Review leave applications, enforce department policies, and manage quota balances.'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportCSV} title="Export requests to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
            <Plus size={15} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards with Rich Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Total Applications</span>
            <div className="stat-icon-wrapper">
              <Calendar size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.total_requests}</div>
          <div className="stat-subtext">
            <span>Fiscal year submissions</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Pending Approval</span>
            <div className="stat-icon-wrapper">
              <Clock size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats.pending_count > 0 ? 'var(--warning)' : 'inherit' }}>
            {stats.pending_count}
          </div>
          <div className="stat-subtext">
            <span className="stat-trend-down">Requires sign-off</span>
          </div>
        </div>

        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Approved Leaves</span>
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats.approved_count}</div>
          <div className="stat-subtext">
            <span className="stat-trend-up">{stats.total_requests ? Math.round((stats.approved_count / stats.total_requests) * 100) : 0}%</span>
            <span>approval rate</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">On Leave Today</span>
            <div className="stat-icon-wrapper">
              <UserMinus size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.on_leave_today}</div>
          <div className="stat-subtext">
            <span>Currently away</span>
          </div>
        </div>
      </div>


      {/* Live Quota Progress Widgets */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>
              {isEmployee ? 'My Leave Quota Utilization' : 'Employee Quota Utilization'}
            </span>
            <span className="text-xs text-muted">
              {isEmployee ? `(${currentUser?.name || 'My Quota'})` : '(Preview for selected member)'}
            </span>
          </div>

          {!isEmployee && (
            <select
              className="filter-select"
              style={{ height: '32px', fontSize: '0.8rem', padding: '0 0.65rem' }}
              value={selectedUserForBalance}
              onChange={(e) => {
                const uid = Number(e.target.value);
                setSelectedUserForBalance(uid);
                fetchBalances(uid);
              }}
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {userBalances.slice(0, 4).map(b => {
            const used = Number(b.used_days) + Number(b.pending_days);
            const total = Number(b.total_days);
            const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
            return (
              <div key={b.id} className="card" style={{ padding: '1rem 1.15rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{b.type_name}</span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{b.type_code}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--foreground)' }}>{b.remaining_days}</span>
                  <span className="text-xs text-muted">/ {b.total_days} days left</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '5px', borderRadius: '9999px', background: 'var(--muted)', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${percent}%`, 
                      background: percent > 80 ? 'var(--destructive)' : 'var(--primary)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>
                  <span>{b.used_days} used</span>
                  {Number(b.pending_days) > 0 && <span style={{ color: 'var(--warning)' }}>{b.pending_days} pending</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Filter & Action Bar in Single Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.85rem',
        flexWrap: 'wrap'
      }}>
        {/* Left: Status Filter Tabs */}
        <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`tabs-trigger${statusTab === tab ? ' active' : ''}`}
              style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => { setStatusTab(tab); setPage(1); }}
            >
              <span>{tab === 'All' ? 'All Requests' : tab}</span>
              {tab === 'Pending' && stats.pending_count > 0 && (
                <span className="tab-count" style={{ background: 'var(--warning)', color: '#000' }}>
                  {stats.pending_count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: Search + Filter + Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
          <div className="search-input-wrapper" style={{ maxWidth: '260px', minWidth: '180px' }}>
            <Search className="search-input-icon" size={13} />
            <input
              type="text"
              className="search-input"
              style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
              placeholder="Search by employee or reason..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', minWidth: '140px' }}
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="">All Leave Types</option>
            {leaveTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
            ))}
          </select>

          <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: '0.35rem' }}>
            Showing <strong>{requests.length}</strong> of <strong>{total}</strong> applications
          </span>
        </div>
      </div>


      {/* Main Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <Calendar size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>No leave applications found</h3>
            <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>No requests match the current filters.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Date Schedule</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar">
                        {getInitials(r.member_name)}
                      </div>
                      <div>
                        <div className="cell-title">{r.member_name}</div>
                        <div className="cell-subtitle">{r.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary font-mono" style={{ fontSize: '0.75rem' }}>
                      {r.type_name}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span className="text-sm font-mono">{r.start_date} → {r.end_date}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                      {r.total_days} {r.total_days === '1.0' ? 'day' : 'days'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.825rem' }} title={r.reason}>
                      {r.reason}
                    </div>
                    {r.approver_remarks && (
                      <div className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '0.2rem' }}>
                        Note: {r.approver_remarks}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${
                      r.status === 'Approved' ? 'badge-success' :
                      r.status === 'Pending' ? 'badge-warning' : 'badge-destructive'
                    }`}>
                      <span className="badge-dot"></span>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isEmployee ? (
                      <div className="text-xs text-muted font-mono" style={{ textAlign: 'right' }}>
                        {r.status === 'Pending' ? (
                          <span style={{ color: 'var(--warning)', fontStyle: 'italic' }}>Awaiting Review</span>
                        ) : r.approver_name ? (
                          `Reviewed by ${r.approver_name}`
                        ) : (
                          'Settled'
                        )}
                      </div>
                    ) : r.status === 'Pending' ? (
                      <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0 0.65rem', height: '28px', fontSize: '0.75rem' }}
                          title="Approve Leave"
                          onClick={() => setDecisionModal({ id: r.id, action: 'approve', request: r })}
                        >
                          <Check size={13} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0 0.65rem', height: '28px', fontSize: '0.75rem', borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                          title="Reject Leave"
                          onClick={() => setDecisionModal({ id: r.id, action: 'reject', request: r })}
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-muted font-mono" style={{ textAlign: 'right' }}>
                        {r.approver_name ? `By ${r.approver_name}` : 'Settled'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Table Pagination */}
        <div className="table-pagination">
          <div>
            Page {page} of {totalPages || 1}
          </div>
          <div className="pagination-controls">
            <button 
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-outline btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {showApplyModal && (
        <div className="dialog-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Submit Leave Application</h2>
              <p className="dialog-description">Select leave policy type, date schedule, and submit for manager approval.</p>
              <button 
                type="button" 
                className="dialog-close-btn" aria-label="Close dialog"
                onClick={() => setShowApplyModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApply}>
              <div className="dialog-body">
                <div className="form-grid single-col">
                  {isEmployee ? (
                    <div className="form-group">
                      <label className="form-label">Employee</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        disabled 
                        value={`${currentUser?.name || ''} (${currentUser?.designation || 'Staff'})`} 
                        style={{ opacity: 0.8, backgroundColor: 'var(--muted)' }}
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Employee <span className="required">*</span></label>
                      <select
                        className="form-select"
                        required
                        value={formData.user_id}
                        onChange={e => {
                          const uid = e.target.value;
                          setFormData({ ...formData, user_id: uid });
                          fetchBalances(Number(uid));
                        }}
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Leave Policy <span className="required">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.leave_type_id}
                      onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })}
                    >
                      {leaveTypes.map(t => {
                        const bal = userBalances.find(b => b.leave_type_id == t.id);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.code}) — {bal ? `${bal.remaining_days} days remaining` : `${t.days_allowed_per_year} days/yr`}
                          </option>
                        );
                      })}
                    </select>
                    {formErrors.leave_type_id && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{formErrors.leave_type_id}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Start Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      />
                      {formErrors.start_date && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{formErrors.start_date}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date <span className="required">*</span></label>
                      <input
                        type="date"
                        className="form-input"
                        required
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      />
                      {formErrors.end_date && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{formErrors.end_date}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.is_half_day}
                        onChange={e => setFormData({ ...formData, is_half_day: e.target.checked })}
                      />
                      <span>Half-day request (0.5 day deduction)</span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reason for Absence <span className="required">*</span></label>
                    <textarea
                      className="form-textarea"
                      required
                      placeholder="Please describe reason for leave (e.g. medical appointment, personal obligations, vacation)..."
                      value={formData.reason}
                      onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    />
                    {formErrors.reason && <span className="text-xs" style={{ color: 'var(--destructive)' }}>{formErrors.reason}</span>}
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Modal (Approve / Reject) */}
      {decisionModal && (
        <div className="dialog-overlay" onClick={() => setDecisionModal(null)}>
          <div className="dialog-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title" style={{ color: decisionModal.action === 'approve' ? 'var(--primary)' : 'var(--destructive)' }}>
                {decisionModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h2>
              <p className="dialog-description">
                {decisionModal.request.member_name} • {decisionModal.request.type_name} ({decisionModal.request.total_days} days)
              </p>
            </div>

            <div className="dialog-body">
              <div className="form-group">
                <label className="form-label">Manager Remarks (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={decisionModal.action === 'approve' ? 'e.g. Approved. Project tasks handed over.' : 'e.g. Critical deployment window, please reschedule.'}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-outline" onClick={() => setDecisionModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${decisionModal.action === 'approve' ? 'btn-primary' : 'btn-destructive'}`}
                disabled={saving}
                onClick={handleDecision}
              >
                {saving ? 'Processing...' : decisionModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
