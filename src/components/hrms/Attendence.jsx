import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  X, 
  UserCheck, 
  UserX, 
  AlertCircle,
  Calendar,
  Download,
  Plus
} from 'lucide-react';
import { attendanceApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Present', 'Late', 'On Leave'];

export default function Attendance() {
  const { currentUser, isEmployee } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [todaySummary, setTodaySummary] = useState({ present: 0, late: 0, absent: 0, on_leave: 0 });
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ 
    user_id: '', 
    date: new Date().toISOString().split('T')[0], 
    sign_in: '09:00', 
    sign_out: '18:00',
    notes: 'Regular shift'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (isEmployee) {
        params.user_id = currentUser.id;
      }
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (statusTab !== 'All') params.status = statusTab;

      const res = await attendanceApi.getAll(params);
      setRecords(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo, statusTab, isEmployee, currentUser.id]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    attendanceApi.getToday().then(res => {
      if (res.data) setTodaySummary(res.data);
    }).catch(() => {});
    membersApi.getAll({ per_page: 100 }).then(res => setMembers(res.data || [])).catch(() => {});
  }, []);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSaving(true);
    try {
      await attendanceApi.create(formData);
      setShowAddForm(false);
      setFormData({ 
        user_id: '', 
        date: new Date().toISOString().split('T')[0], 
        sign_in: '09:00', 
        sign_out: '18:00',
        notes: 'Regular shift'
      });
      fetchRecords();
      attendanceApi.getToday().then(res => setTodaySummary(res.data)).catch(() => {});
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else alert(err.error || 'Failed to save attendance record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await attendanceApi.delete(id);
      setShowDeleteConfirm(null);
      fetchRecords();
    } catch (err) {
      console.error('Failed to delete attendance record', err);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ['ID', 'Employee', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status', 'Notes'];
    const rows = records.map(r => [
      r.id, 
      `"${r.member_name}"`, 
      r.date, 
      r.sign_in || '', 
      r.sign_out || '', 
      `"${r.stay_time || ''}"`, 
      r.status, 
      `"${r.notes || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.csv`);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1>{isEmployee ? 'My Attendance & Shifts' : 'Time & Attendance'}</h1>
            {isEmployee && <span className="badge badge-emerald">Personal View</span>}
          </div>
          <p>
            {isEmployee 
              ? `Personal check-in/out records, stay durations, and shift history for ${currentUser.name}.`
              : 'Daily employee timesheets, shifts, clock-in tracking, and stay durations.'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportCSV} title="Export attendance records to CSV" aria-label="Export attendance records to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {!isEmployee && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={15} />
              <span>Log Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards with Rich Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Present Today</span>
            <div className="stat-icon-wrapper">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="stat-value">{todaySummary.present || 0}</div>
          <div className="stat-subtext">
            <span>On-time attendance</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Late Arrivals</span>
            <div className="stat-icon-wrapper">
              <Clock size={14} />
            </div>
          </div>
          <div className="stat-value">{todaySummary.late || 0}</div>
          <div className="stat-subtext">
            <span>After scheduled shift</span>
          </div>
        </div>

        <div className="stat-card gradient-rose">
          <div className="stat-header">
            <span className="stat-label">Absent</span>
            <div className="stat-icon-wrapper">
              <UserX size={14} />
            </div>
          </div>
          <div className="stat-value">{todaySummary.absent || 0}</div>
          <div className="stat-subtext">
            <span>Unscheduled absence</span>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">On Leave</span>
            <div className="stat-icon-wrapper">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="stat-value">{todaySummary.on_leave || 0}</div>
          <div className="stat-subtext">
            <span>Approved leave status</span>
          </div>
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
        {/* Left: Segmented Tabs */}
        <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`tabs-trigger${statusTab === tab ? ' active' : ''}`}
              style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => { setStatusTab(tab); setPage(1); }}
            >
              <span>{tab === 'All' ? 'All Logs' : tab}</span>
            </button>
          ))}
        </div>

        {/* Right: Search + Date Filters + Result Count in same row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '340px' }}>
          <div className="search-input-wrapper" style={{ maxWidth: '240px', minWidth: '160px' }}>
            <Search className="search-input-icon" size={13} />
            <input
              type="text"
              className="search-input"
              style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
              placeholder="Search by employee..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <input
              type="date"
              className="filter-select"
              style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.5rem' }}
              title="From date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
            <span className="text-xs text-muted">to</span>
            <input
              type="date"
              className="filter-select"
              style={{ height: '34px', fontSize: '0.78rem', padding: '0 0.5rem' }}
              title="To date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>

          <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: '0.25rem' }}>
            Showing <strong>{records.length}</strong> of <strong>{total}</strong>
          </span>
        </div>
      </div>


      {/* Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
            <Clock size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>No attendance records found</h3>
            <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>No clock-ins recorded for the specified date range.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Stay Duration</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
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
                  <td className="text-sm text-muted font-mono">{r.date}</td>
                  <td className="text-sm font-mono">{r.sign_in || '—'}</td>
                  <td className="text-sm font-mono">{r.sign_out || '—'}</td>
                  <td>
                    <span className="badge badge-secondary font-mono" style={{ fontSize: '0.75rem' }}>
                      {r.stay_time || '0 hrs 0 mins'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      r.status === 'Present' ? 'badge-success' :
                      r.status === 'Late' ? 'badge-warning' :
                      r.status === 'Absent' ? 'badge-destructive' : 'badge-outline'
                    }`}>
                      <span className="badge-dot"></span>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon" 
                      style={{ color: 'hsl(var(--destructive))' }}
                      title="Delete Entry"
                      aria-label="Delete Entry" onClick={() => setShowDeleteConfirm(r.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
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

      {/* Manual Attendance Log Modal */}
      {showAddForm && (
        <div className="dialog-overlay" onClick={() => setShowAddForm(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Log Member Attendance</h2>
              <p className="dialog-description">Record shift timing and attendance status for an employee.</p>
              <button 
                type="button" 
                className="dialog-close-btn"
                aria-label="Close dialog" onClick={() => setShowAddForm(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dialog-body">
                <div className="form-grid single-col">
                  <div className="form-group">
                    <label className="form-label">Employee <span className="required">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.user_id}
                      onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                    >
                      <option value="">Select Employee...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                      ))}
                    </select>
                    {formErrors.user_id && <span className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{formErrors.user_id}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Clock In Time <span className="required">*</span></label>
                      <input
                        type="time"
                        className="form-input"
                        required
                        value={formData.sign_in}
                        onChange={e => setFormData({ ...formData, sign_in: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Clock Out Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={formData.sign_out}
                        onChange={e => setFormData({ ...formData, sign_out: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shift Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Regular shift, On-call coverage, Remote work"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Recording...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="dialog-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title" style={{ color: 'hsl(var(--destructive))' }}>Delete Attendance Entry</h2>
              <p className="dialog-description">Are you sure you want to remove this attendance record?</p>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
