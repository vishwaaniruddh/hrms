import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserCheck, 
  UserMinus, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Building2, 
  Calendar, 
  DollarSign, 
  Laptop, 
  FileText, 
  ShieldCheck, 
  X, 
  LogOut, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Check, 
  SlidersHorizontal,
  Users,
  Award,
  MoreHorizontal
} from 'lucide-react';
import { lifecycleApi, membersApi } from '../../services/api';

const DEPARTMENTS = [
  'Engineering',
  'Pharmacy Operations',
  'Human Resources',
  'Product Design',
  'Finance & Accounting',
  'Sales & Business'
];

export default function LifecycleManagement() {
  const [activeTab, setActiveTab] = useState('onboarding'); // 'onboarding' | 'offboarding' | 'clearances'
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');

  // Data
  const [workflows, setWorkflows] = useState([]);
  const [clearanceMatrix, setClearanceMatrix] = useState([]);
  const [members, setMembers] = useState([]);

  // Modals & Drawer States
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isOffboardingModalOpen, setIsOffboardingModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDept, setNewTaskDept] = useState('HR');

  // Form States
  const [onbForm, setOnbForm] = useState({
    user_id: '',
    title: '',
    target_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const [offForm, setOffForm] = useState({
    user_id: '',
    title: '',
    resignation_date: new Date().toISOString().split('T')[0],
    notice_period_days: 30,
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    reason: 'Better Career Opportunity',
    exit_interview_notes: ''
  });

  // Toast Notification State
  const [alertInfo, setAlertInfo] = useState(null);
  const showAlert = (message, type = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await lifecycleApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load lifecycle stats:', err);
    }
  }, []);

  // Fetch Workflows
  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(activeTab === 'onboarding' ? { type: 'Onboarding' } : activeTab === 'offboarding' ? { type: 'Offboarding' } : {}),
        ...(statusFilter && { status: statusFilter }),
        ...(designationFilter && { designation: designationFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      const res = await lifecycleApi.getWorkflows(params);
      if (res.success) {
        setWorkflows(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
      showAlert('Failed to load lifecycle workflows', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, designationFilter, searchTerm]);

  // Fetch Clearance Matrix
  const fetchClearanceMatrix = useCallback(async () => {
    try {
      const res = await lifecycleApi.getClearances();
      if (res.success) {
        setClearanceMatrix(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load clearances:', err);
    }
  }, []);

  // Fetch Members for Dropdowns
  const fetchMembers = useCallback(async () => {
    try {
      const res = await membersApi.getAll({ per_page: 100 });
      if (res.data) {
        setMembers(res.data);
        if (res.data.length > 0) {
          setOnbForm(prev => ({ ...prev, user_id: String(res.data[0].id), title: `New Hire Onboarding — ${res.data[0].full_name}` }));
          setOffForm(prev => ({ ...prev, user_id: String(res.data[0].id), title: `Resignation Clearance — ${res.data[0].full_name}` }));
        }
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchMembers();
  }, [fetchStats, fetchMembers]);

  useEffect(() => {
    if (activeTab === 'clearances') {
      fetchClearanceMatrix();
    } else {
      fetchWorkflows();
    }
  }, [activeTab, fetchWorkflows, fetchClearanceMatrix]);

  // Open detailed workflow dossier
  const handleOpenDossier = async (workflowId) => {
    try {
      const res = await lifecycleApi.getWorkflow(workflowId);
      if (res.success) {
        setSelectedWorkflow(res.data);
        setIsDossierOpen(true);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Failed to load workflow dossier:', err);
      showAlert('Failed to load workflow details', 'error');
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await lifecycleApi.updateTaskStatus(taskId, newStatus);
      if (res.success) {
        showAlert(`Task marked ${newStatus}`);
        fetchWorkflows();
        fetchStats();
        if (selectedWorkflow) {
          handleOpenDossier(selectedWorkflow.id);
        }
        if (activeTab === 'clearances') {
          fetchClearanceMatrix();
        }
      }
    } catch (err) {
      console.error('Task update error:', err);
      showAlert('Failed to update task status', 'error');
    }
  };

  // Add Task to Workflow
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedWorkflow) return;

    try {
      const res = await lifecycleApi.addTask(selectedWorkflow.id, {
        title: newTaskTitle.trim(),
        department: newTaskDept
      });
      if (res.success) {
        setNewTaskTitle('');
        showAlert('New task added to checklist');
        handleOpenDossier(selectedWorkflow.id);
        fetchWorkflows();
        fetchStats();
      }
    } catch (err) {
      console.error('Add task error:', err);
      showAlert('Failed to add checklist task', 'error');
    }
  };

  // Submit Initiate Onboarding
  const handleCreateOnboarding = async (e) => {
    e.preventDefault();
    if (!onbForm.user_id || !onbForm.title || !onbForm.target_date) {
      showAlert('Please fill in all mandatory onboarding fields', 'error');
      return;
    }

    try {
      const res = await lifecycleApi.createWorkflow({
        ...onbForm,
        type: 'Onboarding'
      });
      if (res.success) {
        setIsOnboardingModalOpen(false);
        showAlert('Onboarding journey initiated successfully!');
        fetchWorkflows();
        fetchStats();
      } else {
        showAlert(res.message || 'Failed to initiate onboarding', 'error');
      }
    } catch (err) {
      console.error('Create onboarding error:', err);
      showAlert('Error initiating onboarding journey', 'error');
    }
  };

  // Submit Resignation / Exit
  const handleCreateOffboarding = async (e) => {
    e.preventDefault();
    if (!offForm.user_id || !offForm.title || !offForm.target_date) {
      showAlert('Please fill in all mandatory resignation fields', 'error');
      return;
    }

    try {
      const res = await lifecycleApi.createWorkflow({
        ...offForm,
        type: 'Offboarding'
      });
      if (res.success) {
        setIsOffboardingModalOpen(false);
        showAlert('Resignation workflow initiated successfully!');
        fetchWorkflows();
        fetchStats();
      } else {
        showAlert(res.message || 'Failed to register resignation', 'error');
      }
    } catch (err) {
      console.error('Create offboarding error:', err);
      showAlert('Error registering resignation workflow', 'error');
    }
  };

  // Delete Workflow
  const handleDeleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lifecycle workflow?')) return;
    try {
      const res = await lifecycleApi.deleteWorkflow(id);
      if (res.success) {
        showAlert('Workflow deleted successfully');
        setIsDossierOpen(false);
        fetchWorkflows();
        fetchStats();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('Failed to delete workflow', 'error');
    }
  };

  // Helper for avatar colors
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #06b6d4, #0e7490)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return 'HR';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      {/* Toast Alert Notification */}
      {alertInfo && (
        <div style={{
          position: 'fixed',
          top: '4.5rem',
          right: '2rem',
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1.15rem',
          borderRadius: 'var(--radius)',
          backgroundColor: alertInfo.type === 'error' ? 'oklch(0.65 0.22 25 / 0.95)' : 'oklch(0.2 0.05 162.5 / 0.95)',
          color: '#ffffff',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.85rem',
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {alertInfo.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />}
          <span>{alertInfo.message}</span>
          <button 
            onClick={() => setAlertInfo(null)} 
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Employee Lifecycle & Exit Management</h1>
          <p>Track new hire onboarding journeys, resignation notices, multi-department clearances, and exit interviews.</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline" 
            onClick={() => { fetchStats(); fetchWorkflows(); fetchClearanceMatrix(); }}
            title="Refresh lifecycle records"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => setIsOffboardingModalOpen(true)}
          >
            <LogOut size={14} />
            <span>Submit Resignation</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={() => setIsOnboardingModalOpen(true)}
          >
            <UserPlus size={14} />
            <span>Initiate Onboarding</span>
          </button>
        </div>
      </div>

      {/* 4 Sleek Compact KPI Metric Cards with Subtle Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Active Onboardings</span>
            <div className="stat-icon-wrapper">
              <UserCheck size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? stats.active_onboarding : 0}</div>
          <div className="stat-subtext">
            <span>{stats ? stats.onboarding_avg_progress : 0}% avg journey completion</span>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Checklist Health Rate</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--primary))' }}>
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'hsl(var(--primary))' }}>
            {stats ? `${stats.overall_health_rate}%` : '0%'}
          </div>
          <div className="stat-subtext">
            <span>Task completion across all staff</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Active Exit Clearances</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))' }}>
              <LogOut size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? stats.active_offboarding : 0}</div>
          <div className="stat-subtext">
            <span>Staff in active notice period</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Pending Clearances</span>
            <div className="stat-icon-wrapper">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? stats.clearances_pending : 0}</div>
          <div className="stat-subtext">
            <span>IT, Finance & HR sign-offs</span>
          </div>
        </div>
      </div>

      {/* Unified Filter & Navigation Toolbar in Single Horizontal Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.85rem',
        flexWrap: 'wrap'
      }}>
        {/* Left: View Switcher Tabs */}
        <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
          <button
            type="button"
            className={`tabs-trigger${activeTab === 'onboarding' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('onboarding')}
          >
            <UserCheck size={13} />
            <span>Onboarding Journeys</span>
            <span className="tab-count">
              {stats ? stats.active_onboarding : 0}
            </span>
          </button>

          <button
            type="button"
            className={`tabs-trigger${activeTab === 'offboarding' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('offboarding')}
          >
            <LogOut size={13} />
            <span>Exit & Resignations</span>
            <span className="tab-count">
              {stats ? stats.active_offboarding : 0}
            </span>
          </button>

          <button
            type="button"
            className={`tabs-trigger${activeTab === 'clearances' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveTab('clearances')}
          >
            <ShieldCheck size={13} />
            <span>Department Clearances</span>
            <span className="tab-count">
              {clearanceMatrix.length}
            </span>
          </button>
        </div>

        {/* Right: Search + Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
          <div className="search-input-wrapper" style={{ maxWidth: '240px', minWidth: '170px' }}>
            <Search className="search-input-icon" size={13} />
            <input
              type="text"
              className="search-input"
              style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
              placeholder="Search employee, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.65rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.65rem' }}
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Pharmacist">Pharmacist</option>
            <option value="Accountant">Accountant</option>
            <option value="Salesman">Salesman</option>
          </select>

          {(searchTerm || statusFilter || designationFilter) && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ height: '34px', padding: '0 0.65rem', fontSize: '0.76rem' }}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDesignationFilter('');
              }}
            >
              <X size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ── VIEW 1 & 2: ONBOARDING / OFFBOARDING DATA TABLES ── */}
      {(activeTab === 'onboarding' || activeTab === 'offboarding') && (
        <div className="table-container">
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <div className="loading-spinner" style={{ minHeight: '50px' }}>
                <div className="spinner"></div>
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading lifecycle workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>No workflows found</h3>
              <p className="text-sm">Try adjusting your search criteria or register a new workflow.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap', width: '130px' }}>Workflow Code</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Employee</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Role</th>
                  <th style={{ whiteSpace: 'nowrap', width: '190px' }}>Checklist Progress</th>
                  <th style={{ whiteSpace: 'nowrap' }}>{activeTab === 'onboarding' ? 'Target Start Date' : 'Last Working Day (LWD)'}</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Timeline Status</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workflows.map((wf) => {
                  const isCompleted = wf.status === 'Completed';
                  return (
                    <tr key={wf.id}>
                      {/* Code */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: wf.type === 'Onboarding' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: wf.type === 'Onboarding' ? '#34d399' : '#f87171',
                          border: `1px solid ${wf.type === 'Onboarding' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          display: 'inline-block'
                        }}>
                          {wf.workflow_code}
                        </span>
                      </td>

                      {/* Employee */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className="user-cell">
                          <div 
                            className="cell-avatar"
                            style={{ 
                              background: getAvatarColor(wf.employee_name),
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}
                          >
                            {getInitials(wf.employee_name)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="cell-title" style={{ fontSize: '0.84rem' }}>{wf.employee_name}</span>
                            <span className="cell-subtitle" style={{ fontSize: '0.72rem' }}>{wf.employee_email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                          {wf.employee_designation}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>
                              {wf.completed_tasks} / {wf.total_tasks} Tasks
                            </span>
                            <span style={{ fontWeight: 700, color: wf.progress_percent === 100 ? '#34d399' : 'var(--foreground)' }}>
                              {wf.progress_percent}%
                            </span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${wf.progress_percent}%`,
                              height: '100%',
                              borderRadius: '9999px',
                              backgroundColor: wf.progress_percent === 100 ? '#10b981' : wf.type === 'Onboarding' ? '#0ea5e9' : '#f59e0b',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      </td>

                      {/* Target Date */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                          <Calendar size={13} style={{ color: 'var(--muted-foreground)' }} />
                          <span>{wf.target_date}</span>
                        </div>
                      </td>

                      {/* Timeline status / Countdown */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {isCompleted ? (
                          <span style={{ color: '#34d399', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        ) : wf.days_remaining > 0 ? (
                          <span className="badge badge-outline" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                            <Clock size={11} /> {wf.days_remaining} days left
                          </span>
                        ) : wf.days_remaining === 0 ? (
                          <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.72rem' }}>
                            Due Today
                          </span>
                        ) : (
                          <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.72rem' }}>
                            {Math.abs(wf.days_remaining)}d overdue
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span 
                          className="badge"
                          style={{
                            backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                            color: isCompleted ? '#34d399' : '#38bdf8',
                            border: `1px solid ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(14, 165, 233, 0.3)'}`,
                            fontSize: '0.72rem',
                            fontWeight: 600
                          }}
                        >
                          ● {wf.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.74rem', gap: '0.25rem' }}
                          onClick={() => handleOpenDossier(wf.id)}
                        >
                          <span>Checklist</span>
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── VIEW 3: DEPARTMENT CLEARANCES MATRIX ── */}
      {activeTab === 'clearances' && (
        <div className="table-container">
          {clearanceMatrix.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <ShieldCheck size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>No active exit clearances</h3>
              <p className="text-sm">All departing employees have completed multi-department sign-offs.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Departing Employee</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Role</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Last Working Day</th>
                  <th style={{ whiteSpace: 'nowrap' }}>IT Hardware & Access</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Finance & Dues</th>
                  <th style={{ whiteSpace: 'nowrap' }}>HR & Relieving Letter</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Settlement Readiness</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clearanceMatrix.map((row) => (
                  <tr key={row.workflow_id}>
                    {/* Employee */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="user-cell">
                        <div 
                          className="cell-avatar"
                          style={{ 
                            background: getAvatarColor(row.employee_name),
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}
                        >
                          {getInitials(row.employee_name)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="cell-title" style={{ fontSize: '0.84rem' }}>{row.employee_name}</span>
                          <span className="cell-subtitle" style={{ fontSize: '0.72rem' }}>{row.employee_email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {row.employee_designation}
                      </span>
                    </td>

                    {/* LWD */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                        <Calendar size={13} style={{ color: 'var(--muted-foreground)' }} />
                        <span>{row.last_working_day}</span>
                      </div>
                    </td>

                    {/* IT Clearance */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: row.it_cleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: row.it_cleared ? '#34d399' : '#fbbf24',
                          border: `1px solid ${row.it_cleared ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        {row.it_cleared ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>IT: {row.it_completed} / {row.it_total} Done</span>
                      </span>
                    </td>

                    {/* Finance Clearance */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: row.fin_cleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: row.fin_cleared ? '#34d399' : '#fbbf24',
                          border: `1px solid ${row.fin_cleared ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        {row.fin_cleared ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>Finance: {row.fin_completed} / {row.fin_total} Done</span>
                      </span>
                    </td>

                    {/* HR Clearance */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: row.hr_cleared ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: row.hr_cleared ? '#34d399' : '#fbbf24',
                          border: `1px solid ${row.hr_cleared ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        {row.hr_cleared ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>HR: {row.hr_completed} / {row.hr_total} Done</span>
                      </span>
                    </td>

                    {/* Settlement Readiness */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {row.all_cleared ? (
                        <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', fontWeight: 700, fontSize: '0.72rem' }}>
                          ★ Ready for Final Settlement
                        </span>
                      ) : (
                        <span className="badge badge-outline" style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                          Pending Department Clearance
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.74rem', gap: '0.25rem' }}
                        onClick={() => handleOpenDossier(row.workflow_id)}
                      >
                        <span>Sign-off</span>
                        <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── WORKFLOW DOSSIER & CHECKLIST MODAL ── */}
      {isDossierOpen && selectedWorkflow && (
        <div className="dialog-overlay" onClick={() => setIsDossierOpen(false)}>
          <div className="dialog-content" style={{ maxWidth: '720px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div 
                  className="cell-avatar" 
                  style={{ 
                    background: getAvatarColor(selectedWorkflow.employee_name),
                    width: '42px',
                    height: '42px',
                    fontSize: '0.9rem',
                    color: '#fff',
                    fontWeight: 700 
                  }}
                >
                  {getInitials(selectedWorkflow.employee_name)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 className="dialog-title" style={{ fontSize: '1.15rem' }}>{selectedWorkflow.title}</h2>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--foreground)'
                    }}>
                      {selectedWorkflow.workflow_code}
                    </span>
                  </div>
                  <p className="dialog-description">
                    {selectedWorkflow.employee_name} ({selectedWorkflow.employee_designation}) • {selectedWorkflow.employee_email}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsDossierOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Quick Summary Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Workflow Type</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--foreground)' }}>{selectedWorkflow.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Target Date</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--foreground)' }}>{selectedWorkflow.target_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Overall Progress</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: selectedWorkflow.progress_percent === 100 ? '#34d399' : '#38bdf8' }}>
                    {selectedWorkflow.completed_tasks} / {selectedWorkflow.total_tasks} Tasks ({selectedWorkflow.progress_percent}%)
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Status</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: selectedWorkflow.status === 'Completed' ? '#34d399' : '#38bdf8' }}>
                    {selectedWorkflow.status}
                  </div>
                </div>
              </div>

              {/* Reason & Exit Notes for Offboarding */}
              {selectedWorkflow.type === 'Offboarding' && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '0.2rem' }}>
                    Reason for Departure: {selectedWorkflow.reason || 'Not specified'}
                  </div>
                  {selectedWorkflow.exit_interview_notes && (
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                      <strong>Exit Interview Summary:</strong> {selectedWorkflow.exit_interview_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Interactive Checklist Tasks */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Interactive Department Checklist</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                    Click checkmark to sign off on clearance
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedWorkflow.tasks && selectedWorkflow.tasks.map((task) => {
                    const isDone = task.status === 'Completed';
                    return (
                      <div 
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: isDone ? 'rgba(16, 185, 129, 0.04)' : 'var(--card)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, task.status)}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '4px',
                              border: isDone ? '1px solid #10b981' : '1px solid var(--border)',
                              backgroundColor: isDone ? '#10b981' : 'transparent',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            title={isDone ? 'Mark as pending' : 'Sign off task as completed'}
                          >
                            {isDone && <Check size={14} />}
                          </button>

                          <div>
                            <div style={{
                              fontSize: '0.84rem',
                              fontWeight: 500,
                              textDecoration: isDone ? 'line-through' : 'none',
                              color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)'
                            }}>
                              {task.title}
                            </div>
                            {task.notes && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.1rem' }}>
                                {task.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                            {task.department}
                          </span>
                          <span 
                            className="badge"
                            style={{
                              backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: isDone ? '#34d399' : 'var(--muted-foreground)',
                              fontSize: '0.68rem'
                            }}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Task Form */}
                <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add custom task item..."
                    style={{ flex: 1, height: '34px', fontSize: '0.82rem' }}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <select
                    className="form-control"
                    style={{ width: '130px', height: '34px', fontSize: '0.82rem' }}
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                  >
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Department Head">Dept Head</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <button type="submit" className="btn btn-outline" style={{ height: '34px', padding: '0 0.85rem', fontSize: '0.78rem' }}>
                    <Plus size={13} />
                    <span>Add Task</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="dialog-footer" style={{ justifyContent: 'space-between' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ color: '#f87171' }}
                onClick={() => handleDeleteWorkflow(selectedWorkflow.id)}
              >
                Delete Workflow
              </button>

              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setIsDossierOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INITIATE ONBOARDING MODAL ── */}
      {isOnboardingModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsOnboardingModalOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Initiate New Hire Onboarding</h2>
              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsOnboardingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOnboarding}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Select Employee *</label>
                    <select
                      className="form-control"
                      value={onbForm.user_id}
                      onChange={(e) => {
                        const m = members.find(u => String(u.id) === e.target.value);
                        setOnbForm({
                          ...onbForm,
                          user_id: e.target.value,
                          title: m ? `New Hire Onboarding — ${m.full_name}` : onbForm.title
                        });
                      }}
                      required
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.designation} • {m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Onboarding Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={onbForm.title}
                      onChange={(e) => setOnbForm({ ...onbForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Target Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={onbForm.target_date}
                      onChange={(e) => setOnbForm({ ...onbForm, target_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsOnboardingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Start Onboarding Journey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBMIT RESIGNATION / EXIT MODAL ── */}
      {isOffboardingModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsOffboardingModalOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Submit Resignation & Exit Clearance</h2>
              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsOffboardingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOffboarding}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Departing Employee *</label>
                    <select
                      className="form-control"
                      value={offForm.user_id}
                      onChange={(e) => {
                        const m = members.find(u => String(u.id) === e.target.value);
                        setOffForm({
                          ...offForm,
                          user_id: e.target.value,
                          title: m ? `Resignation Clearance — ${m.full_name}` : offForm.title
                        });
                      }}
                      required
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.designation} • {m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Workflow Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={offForm.title}
                      onChange={(e) => setOffForm({ ...offForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Resignation Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={offForm.resignation_date}
                      onChange={(e) => setOffForm({ ...offForm, resignation_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notice Period (Days)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={offForm.notice_period_days}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        const lwd = new Date(new Date(offForm.resignation_date).getTime() + days * 86400000).toISOString().split('T')[0];
                        setOffForm({
                          ...offForm,
                          notice_period_days: days,
                          target_date: lwd
                        });
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Last Working Day (LWD) *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={offForm.target_date}
                      onChange={(e) => setOffForm({ ...offForm, target_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Reason for Departure</label>
                    <select
                      className="form-control"
                      value={offForm.reason}
                      onChange={(e) => setOffForm({ ...offForm, reason: e.target.value })}
                    >
                      <option value="Better Career Opportunity">Better Career Opportunity</option>
                      <option value="Higher Education & Studies">Higher Education & Studies</option>
                      <option value="Relocation / Family">Relocation / Family</option>
                      <option value="Health / Personal Reasons">Health / Personal Reasons</option>
                      <option value="Retirement">Retirement</option>
                      <option value="Mutual Separation">Mutual Separation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Exit Interview / Feedback Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Feedback regarding team, culture, or transition plan..."
                      value={offForm.exit_interview_notes}
                      onChange={(e) => setOffForm({ ...offForm, exit_interview_notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsOffboardingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Exit Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
