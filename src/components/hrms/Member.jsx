import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Download, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { membersApi, rolesApi } from '../../services/api';

const DESIGNATIONS = ['Admin', 'Manager', 'Pharmacist', 'Accountant', 'Salesman', 'Cleaner'];
const STATUSES = ['All', 'Active', 'Inactive', 'Suspend'];

export default function Member() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({ active: 0, inactive: 0, suspend: 0, total: 0 });

  const [formData, setFormData] = useState({
    full_name: '', display_name: '', email: '', phone: '',
    date_of_birth: '', address: '', designation: 'Pharmacist',
    role_id: 3, joining_date: new Date().toISOString().split('T')[0], status: 'Active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch Member stats
  const fetchStats = async () => {
    try {
      const res = await membersApi.getStats();
      if (res.data) setStats(res.data);
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  };

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (search) params.search = search;
      if (filterDesignation) params.designation = filterDesignation;
      if (statusTab !== 'All') params.status = statusTab;

      const res = await membersApi.getAll(params);
      setMembers(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDesignation, statusTab]);

  useEffect(() => { 
    fetchMembers(); 
    fetchStats();
  }, [fetchMembers]);

  useEffect(() => {
    rolesApi.getAll().then(res => setRoles(res.data || [])).catch(() => {});
  }, []);

  // Debounced search input
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resetForm = () => {
    setFormData({
      full_name: '', display_name: '', email: '', phone: '',
      date_of_birth: '', address: '', designation: 'Pharmacist',
      role_id: 3, joining_date: new Date().toISOString().split('T')[0], status: 'Active'
    });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSaving(true);
    try {
      if (editMember) {
        await membersApi.update(editMember.id, formData);
      } else {
        await membersApi.create(formData);
      }
      setShowAddModal(false);
      setEditMember(null);
      resetForm();
      fetchMembers();
      fetchStats();
    } catch (err) {
      if (err.errors) setFormErrors(err.errors);
      else alert(err.error || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m) => {
    setEditMember(m);
    setFormData({
      full_name: m.full_name, display_name: m.display_name || '',
      email: m.email, phone: m.phone || '',
      date_of_birth: m.date_of_birth || '', address: m.address || '',
      designation: m.designation, role_id: m.role_id,
      joining_date: m.joining_date, status: m.status,
    });
    setShowAddModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (id) => {
    try {
      await membersApi.delete(id);
      setShowDeleteConfirm(null);
      fetchMembers();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete member', err);
    }
  };

  const exportCSV = () => {
    if (members.length === 0) return;
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Designation', 'Joining Date', 'Status'];
    const rows = members.map(m => [m.id, `"${m.full_name}"`, m.email, m.phone || '', m.designation, m.joining_date, m.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1>Employees Directory</h1>
          <p>Manage full-time staff, contract personnel, roles, and status access.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportCSV} title="Export current view to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => { resetForm(); setEditMember(null); setShowAddModal(true); }}
          >
            <UserPlus size={15} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Metric / KPI Cards with Rich Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Total Headcount</span>
            <div className="stat-icon-wrapper">
              <Users size={15} />
            </div>
          </div>
          <div className="stat-value">{stats.total || total}</div>
          <div className="stat-subtext">
            <span className="stat-trend-up">100%</span>
            <span>registered employees</span>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Active Members</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))' }}>
              <UserCheck size={15} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'hsl(var(--primary))' }}>{stats.Active || 0}</div>
          <div className="stat-subtext">
            <span>Ready for scheduling</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Inactive / Leave</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--warning))' }}>
              <UserX size={15} />
            </div>
          </div>
          <div className="stat-value">{(stats.Inactive || 0) + (stats.Suspend || 0)}</div>
          <div className="stat-subtext">
            <span>Requires review</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">System Roles</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--primary))' }}>
              <Shield size={15} />
            </div>
          </div>
          <div className="stat-value">{roles.length || 6}</div>
          <div className="stat-subtext">
            <span>Access privilege levels</span>
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
          {STATUSES.map(status => (
            <button
              key={status}
              type="button"
              className={`tabs-trigger${statusTab === status ? ' active' : ''}`}
              style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
              onClick={() => { setStatusTab(status); setPage(1); }}
            >
              <span>{status === 'All' ? 'All Members' : status}</span>
              <span className="tab-count">
                {status === 'All' ? (stats.total || total) :
                 status === 'Active' ? (stats.Active || 0) :
                 status === 'Inactive' ? (stats.Inactive || 0) : (stats.Suspend || 0)}
              </span>
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
              placeholder="Search by name, email, or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', minWidth: '140px' }}
            value={filterDesignation}
            onChange={(e) => { setFilterDesignation(e.target.value); setPage(1); }}
          >
            <option value="">All Designations</option>
            {DESIGNATIONS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: '0.35rem' }}>
            Showing <strong>{members.length}</strong> of <strong>{total}</strong> employees
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>No employees found</h3>
            <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Employee</th>
                <th style={{ whiteSpace: 'nowrap' }}>Role & Designation</th>
                <th style={{ whiteSpace: 'nowrap' }}>Phone</th>
                <th style={{ whiteSpace: 'nowrap' }}>Joining Date</th>
                <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar">
                        {getInitials(m.full_name)}
                      </div>
                      <div>
                        <div 
                          className="cell-title" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/hrms/memberProfile?id=${m.id}`)}
                        >
                          {m.full_name}
                        </div>
                        <div className="cell-subtitle">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontWeight: 500 }}>{m.designation}</span>
                      <span className="badge badge-secondary" style={{ width: 'fit-content', fontSize: '0.7rem' }}>
                        {m.role_name || 'Member'}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-muted">
                    {m.phone || '—'}
                  </td>
                  <td className="text-sm text-muted">
                    {m.joining_date || '—'}
                  </td>
                  <td>
                    <span className={`badge ${
                      m.status === 'Active' ? 'badge-success' :
                      m.status === 'Inactive' ? 'badge-secondary' : 'badge-destructive'
                    }`}>
                      <span className="badge-dot"></span>
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" aria-label="View Profile" title="View Profile"

                        onClick={() => navigate(`/hrms/memberProfile?id=${m.id}`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" aria-label="Edit Details" title="Edit Details"

                        onClick={() => handleEdit(m)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm btn-icon" aria-label="Delete Employee" title="Delete Employee"
                        style={{ color: 'hsl(var(--destructive))' }}

                        onClick={() => setShowDeleteConfirm(m.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

      {/* Add / Edit Dialog Modal */}
      {showAddModal && (
        <div className="dialog-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">{editMember ? 'Edit Employee Details' : 'Create New Employee'}</h2>
              <p className="dialog-description">Enter personal details, organizational role, and employment credentials.</p>
              <button 
                type="button" 
                className="dialog-close-btn" aria-label="Close dialog"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="e.g. Jane Doe"
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    />
                    {formErrors.full_name && <span className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{formErrors.full_name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Jane"
                      value={formData.display_name}
                      onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formErrors.email && <span className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    >
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role Permission</label>
                    <select 
                      className="form-select"
                      value={formData.role_id}
                      onChange={e => setFormData({ ...formData, role_id: Number(e.target.value) })}
                    >
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Joining Date <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required
                      value={formData.joining_date}
                      onChange={e => setFormData({ ...formData, joining_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspend">Suspend</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Work Address</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Headquarters, Floor 4, Suite 402"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editMember ? 'Update Employee' : 'Create Employee'}
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
              <h2 className="dialog-title" style={{ color: 'hsl(var(--destructive))' }}>Confirm Employee Deletion</h2>
              <p className="dialog-description">This action cannot be undone. All associated records will be permanently removed.</p>
            </div>
            <div className="dialog-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-destructive" 
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}