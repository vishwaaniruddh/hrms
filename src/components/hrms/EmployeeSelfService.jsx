import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Laptop, 
  Receipt, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Download, 
  ChevronRight, 
  Building2, 
  ShieldCheck, 
  User, 
  ArrowUpRight, 
  X,
  CreditCard,
  Briefcase,
  Sparkles,
  Info,
  Layers,
  Check
} from 'lucide-react';
import { essApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeSelfService() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'payslips' | 'leaves' | 'claims' | 'onboarding'

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipLoading, setPayslipLoading] = useState(false);

  // Form states
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1.0,
    is_half_day: false,
    reason: ''
  });

  const [claimForm, setClaimForm] = useState({
    title: '',
    category: 'Travel & Mileage',
    amount: '',
    claim_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Fetch ESS Dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await essApi.getDashboard(currentUser.id);
      if (res.success && res.data) {
        setData(res.data);
        if (res.data.leave_balances && res.data.leave_balances.length > 0 && !leaveForm.leave_type_id) {
          setLeaveForm(prev => ({ ...prev, leave_type_id: String(res.data.leave_balances[0].leave_type_id) }));
        }
      }
    } catch (err) {
      console.error('Failed to load ESS dashboard:', err);
      showToast(err.message || 'Failed to load employee telemetry', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Handle Web Punch Clock (Clock In / Clock Out)
  const handlePunch = async () => {
    try {
      const res = await essApi.punchAttendance({ user_id: currentUser.id });
      if (res.success) {
        showToast(res.message);
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Punch clock operation failed', 'error');
    }
  };

  // Submit Leave Request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    try {
      const res = await essApi.applyLeave({
        user_id: currentUser.id,
        leave_type_id: leaveForm.leave_type_id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        total_days: leaveForm.total_days,
        is_half_day: leaveForm.is_half_day,
        reason: leaveForm.reason
      });
      if (res.success) {
        showToast('Leave request submitted to your manager');
        setIsLeaveModalOpen(false);
        setLeaveForm({
          leave_type_id: data?.leave_balances?.[0]?.leave_type_id || '',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
          total_days: 1.0,
          is_half_day: false,
          reason: ''
        });
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit leave', 'error');
    }
  };

  // Submit Expense Claim
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    try {
      const res = await essApi.submitClaim({
        user_id: currentUser.id,
        title: claimForm.title,
        category: claimForm.category,
        amount: parseFloat(claimForm.amount),
        claim_date: claimForm.claim_date,
        description: claimForm.description
      });
      if (res.success) {
        showToast('Expense claim filed for manager approval');
        setIsClaimModalOpen(false);
        setClaimForm({
          title: '',
          category: 'Travel & Mileage',
          amount: '',
          claim_date: new Date().toISOString().split('T')[0],
          description: ''
        });
        fetchDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit claim', 'error');
    }
  };

  // Open Payslip modal
  const handleOpenPayslip = async (salaryId) => {
    setIsPayslipModalOpen(true);
    setPayslipLoading(true);
    try {
      const res = await essApi.getPayslip(salaryId);
      if (res.success && res.data) {
        setSelectedPayslip(res.data);
      }
    } catch (err) {
      showToast('Could not load detailed payslip breakdown', 'error');
    } finally {
      setPayslipLoading(false);
    }
  };

  const punch = data?.punch_status || {};
  const stats = data?.attendance_stats || {};
  const user = data?.user || currentUser;

  return (
    <div>
      {/* ── Fixed Toast Notification (Shadcn Style) ── */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '4.5rem',
            right: '2rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius)',
            backgroundColor: toast.type === 'error' ? 'oklch(0.65 0.22 25 / 0.95)' : 'oklch(0.2 0.05 162.5 / 0.95)',
            color: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.85rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toast.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />}
          <span>{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast(null)} 
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Official Shadcn Page Header ── */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Employee Self-Service (ESS)</h1>
            <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>
              {currentUser.role.toUpperCase()} VIEW
            </span>
          </div>
          <p>
            Welcome back, <strong style={{ color: 'var(--foreground)' }}>{user.full_name || currentUser.name}</strong>. Access your personal workspace, track attendance, view hardware inventory, and manage requests.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={fetchDashboard} 
            disabled={loading}
            title="Refresh dashboard"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => setIsClaimModalOpen(true)}
          >
            <Receipt size={14} />
            <span>Submit Claim</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsLeaveModalOpen(true)}
          >
            <Calendar size={14} />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* ── Live Punch Clock & Telemetry Hero Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Card 1: Web Attendance Terminal */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Web Attendance Terminal
                </span>
                <div 
                  className="font-mono" 
                  style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 700, 
                    color: 'var(--foreground)', 
                    marginTop: '0.25rem',
                    letterSpacing: '0.04em'
                  }}
                >
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              {/* Status Badge */}
              {punch.is_clocked_in ? (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                  <span>Clocked In</span>
                </span>
              ) : punch.is_clocked_out ? (
                <span className="badge badge-secondary">
                  <span>Shift Completed</span>
                </span>
              ) : (
                <span className="badge badge-warning">
                  <span>Not Clocked In</span>
                </span>
              )}
            </div>

            <div className="text-xs text-muted" style={{ lineHeight: 1.5, marginBottom: '1.25rem' }}>
              {punch.is_clocked_in ? (
                <>Sign-in recorded at <strong style={{ color: 'var(--foreground)' }}>{punch.sign_in}</strong>. Your elapsed stay time is actively logged.</>
              ) : punch.is_clocked_out ? (
                <>Completed shift at <strong style={{ color: 'var(--foreground)' }}>{punch.sign_out}</strong>. Total recorded duration: <strong style={{ color: 'var(--foreground)' }}>{punch.stay_time}</strong>.</>
              ) : (
                <>Standard morning shift starts at 08:30 AM. Punch in now to register your day's attendance.</>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className={`btn ${punch.is_clocked_in ? 'btn-destructive' : punch.is_clocked_out ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
            onClick={handlePunch}
            disabled={punch.is_clocked_out}
          >
            <Clock size={15} />
            <span>
              {punch.is_clocked_in ? 'Clock Out Now' : punch.is_clocked_out ? 'Shift Finished for Today' : 'Clock In Now'}
            </span>
          </button>
        </div>

        {/* Card 2: Attendance Month Pulse */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              This Month's Attendance
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Calendar size={15} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--muted)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted">Days Present</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', marginTop: '0.15rem' }}>
                {stats.present_days || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--muted)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted">Late Check-ins</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: stats.late_days > 0 ? '#f59e0b' : 'var(--foreground)', marginTop: '0.15rem' }}>
                {stats.late_days || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--muted)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted">Leaves Taken</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', marginTop: '0.15rem' }}>
                {stats.leave_days || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--muted)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--border)' }}>
              <div className="text-xs text-muted">Half Days</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--foreground)', marginTop: '0.15rem' }}>
                {stats.half_days || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Leave Balances Snapshot */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Leave Reserve ({new Date().getFullYear()})
            </span>
            <span className="badge badge-success">
              {data?.total_leave_rem ?? 0} Days Available
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {data?.leave_balances && data.leave_balances.length > 0 ? (
              data.leave_balances.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color === 'emerald' ? '#10b981' : b.color === 'amber' ? '#f59e0b' : '#3b82f6' }}></span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{b.leave_name}</span>
                  </div>
                  <span className="text-xs text-muted">
                    <strong style={{ color: 'var(--foreground)' }}>{b.remaining_days}</strong> / {b.total_days} left
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted" style={{ padding: '0.5rem 0' }}>
                No active leave categories allocated.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Official Shadcn Navigation Sub-Tabs ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="tabs-list">
          <button 
            type="button" 
            className={`tabs-trigger${activeTab === 'assets' ? ' active' : ''}`}
            onClick={() => setActiveTab('assets')}
          >
            <Laptop size={14} />
            <span>My Hardware & Assets</span>
            <span className="tab-count">{data?.assigned_assets?.length || 0}</span>
          </button>

          <button 
            type="button" 
            className={`tabs-trigger${activeTab === 'payslips' ? ' active' : ''}`}
            onClick={() => setActiveTab('payslips')}
          >
            <DollarSign size={14} />
            <span>Payslips & Earnings</span>
            <span className="tab-count">{data?.payslips?.length || 0}</span>
          </button>

          <button 
            type="button" 
            className={`tabs-trigger${activeTab === 'leaves' ? ' active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <Calendar size={14} />
            <span>Leave Applications</span>
            <span className="tab-count">{data?.leave_requests?.length || 0}</span>
          </button>

          <button 
            type="button" 
            className={`tabs-trigger${activeTab === 'claims' ? ' active' : ''}`}
            onClick={() => setActiveTab('claims')}
          >
            <Receipt size={14} />
            <span>Expense Claims</span>
            <span className="tab-count">{data?.expense_claims?.length || 0}</span>
          </button>

          {data?.onboarding && (
            <button 
              type="button" 
              className={`tabs-trigger${activeTab === 'onboarding' ? ' active' : ''}`}
              onClick={() => setActiveTab('onboarding')}
            >
              <Sparkles size={14} />
              <span>Onboarding Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tab Content Area ── */}
      <div>
        {/* TAB 1: Assigned Hardware & Assets */}
        {activeTab === 'assets' && (
          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>Assigned Company Equipment</h3>
                <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                  Hardware and peripherals issued to you by IT Infrastructure.
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Name & Model</th>
                    <th>Asset Tag</th>
                    <th>Serial Number</th>
                    <th>Category</th>
                    <th>Condition</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.assigned_assets && data.assigned_assets.length > 0 ? (
                    data.assigned_assets.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'oklch(0.55 0.14 163.2 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <Laptop size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{a.name}</div>
                              <div className="text-xs text-muted">{a.brand} • {a.model}</div>
                            </div>
                          </div>
                        </td>
                        <td><code className="font-mono text-xs">{a.asset_tag}</code></td>
                        <td><code className="font-mono text-xs text-muted">{a.serial_number}</code></td>
                        <td>{a.category_name || 'Hardware'}</td>
                        <td>
                          <span className={`badge ${a.condition === 'Good' || a.condition === 'New' ? 'badge-success' : 'badge-warning'}`}>
                            {a.condition}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-default">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                        No company hardware currently allocated to your account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Payslips & Earnings */}
        {activeTab === 'payslips' && (
          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>Payslip History & Disbursals</h3>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Monthly salary disbursal slips, statutory withholdings, and net payments.
              </p>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Payroll Month</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Disbursed</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.payslips && data.payslips.length > 0 ? (
                    data.payslips.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                            {new Date(p.salary_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-muted">Disbursal Date: {p.salary_date}</div>
                        </td>
                        <td>${parseFloat(p.gross_salary || p.total_salary || 0).toFixed(2)}</td>
                        <td style={{ color: 'var(--destructive)', fontWeight: 500 }}>-${parseFloat(p.total_deductions || 0).toFixed(2)}</td>
                        <td>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                            ${parseFloat(p.net_salary || p.total_salary || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge ${p.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenPayslip(p.id)}
                          >
                            <FileText size={13} />
                            <span>View Breakdown</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                        No monthly salary slips generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Leave Applications */}
        {activeTab === 'leaves' && (
          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>My Leave Requests</h3>
                <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                  Track approval status of your submitted time-off requests.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => setIsLeaveModalOpen(true)}
              >
                <Plus size={13} />
                <span>Apply Leave</span>
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leave Category</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Approver Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.leave_requests && data.leave_requests.length > 0 ? (
                    data.leave_requests.map(lr => (
                      <tr key={lr.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{lr.leave_name}</div>
                          <div className="text-xs text-muted font-mono">Code: {lr.leave_code}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{lr.start_date} to {lr.end_date}</td>
                        <td>{lr.total_days} {lr.total_days > 1 ? 'days' : 'day'}</td>
                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lr.reason}>
                          <span className="text-xs text-muted">"{lr.reason}"</span>
                        </td>
                        <td>
                          <span className={`badge ${lr.status === 'Approved' ? 'badge-success' : lr.status === 'Pending' ? 'badge-warning' : 'badge-destructive'}`}>
                            {lr.status}
                          </span>
                        </td>
                        <td className="text-xs text-muted">
                          {lr.approver_remarks || (lr.status === 'Pending' ? 'Awaiting manager review' : 'No remarks')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                        No leave applications on record. Click "Apply Leave" above to submit one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Expense Claims */}
        {activeTab === 'claims' && (
          <div className="card" style={{ border: '1px solid var(--border)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)' }}>Reimbursements & Claims</h3>
                <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                  Business travel, tech equipment, and healthcare expense claims.
                </p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
                onClick={() => setIsClaimModalOpen(true)}
              >
                <Plus size={13} />
                <span>Submit Expense Claim</span>
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Claim Number & Title</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Manager Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.expense_claims && data.expense_claims.length > 0 ? (
                    data.expense_claims.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{c.title}</div>
                          <div className="text-xs text-muted font-mono">{c.claim_number}</div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{c.category}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--foreground)' }}>
                            ${parseFloat(c.amount).toFixed(2)}
                          </strong>
                        </td>
                        <td>{c.claim_date}</td>
                        <td>
                          <span className={`badge ${c.status === 'Approved' || c.status === 'Reimbursed' ? 'badge-success' : c.status === 'Pending' ? 'badge-warning' : 'badge-destructive'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="text-xs text-muted">
                          {c.approver_remarks || (c.status === 'Pending' ? 'In queue for review' : 'No comments')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                        No expense claims logged. Click "Submit Expense Claim" to file an invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Onboarding Journey (If Active) */}
        {activeTab === 'onboarding' && data?.onboarding && (
          <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Your New Hire Orientation Roadmap</h3>
                <span className="badge badge-default">{data.onboarding.workflow.progress_percent}% Complete</span>
              </div>
              <div style={{ width: '100%', height: 8, background: 'var(--muted)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ width: `${data.onboarding.workflow.progress_percent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {data.onboarding.tasks.map((t) => (
                <div 
                  key={t.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem 1rem', 
                    background: t.status === 'Completed' ? 'oklch(0.2 0.05 162.5 / 0.15)' : 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.status === 'Completed' ? 'var(--primary)' : 'transparent', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.status === 'Completed' && <Check size={12} color="#fff" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, textDecoration: t.status === 'Completed' ? 'line-through' : 'none', color: t.status === 'Completed' ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                        {t.title}
                      </div>
                      <div className="text-xs text-muted">
                        Department: {t.department} • Due: {t.due_date || 'Day 1'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-secondary'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── QUICK LEAVE REQUEST MODAL (SHADCN DIALOG) ── */}
      {isLeaveModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="dialog-header">
              <h3 className="dialog-title">Submit Leave Application</h3>
              <p className="dialog-description">Your request will be routed to your manager for approval.</p>
              <button className="dialog-close-btn" onClick={() => setIsLeaveModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Leave Type Category *</label>
                  <select 
                    className="filter-select w-100"
                    value={leaveForm.leave_type_id}
                    onChange={e => setLeaveForm(prev => ({ ...prev, leave_type_id: e.target.value }))}
                    required
                  >
                    {data?.leave_balances?.map(lb => (
                      <option key={lb.id} value={lb.leave_type_id}>
                        {lb.leave_name} ({lb.remaining_days} days remaining)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Start Date *</label>
                    <input 
                      type="date" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }}
                      value={leaveForm.start_date}
                      onChange={e => setLeaveForm(prev => ({ ...prev, start_date: e.target.value }))}
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>End Date *</label>
                    <input 
                      type="date" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }}
                      value={leaveForm.end_date}
                      onChange={e => setLeaveForm(prev => ({ ...prev, end_date: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Total Days *</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      min="0.5" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }}
                      value={leaveForm.total_days}
                      onChange={e => setLeaveForm(prev => ({ ...prev, total_days: e.target.value }))}
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', color: 'var(--foreground)' }}>
                      <input 
                        type="checkbox" 
                        checked={leaveForm.is_half_day}
                        onChange={e => setLeaveForm(prev => ({ ...prev, is_half_day: e.target.checked, total_days: e.target.checked ? 0.5 : 1.0 }))}
                        style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                      />
                      <span>Half-Day Request</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Reason / Justification *</label>
                  <textarea 
                    className="search-input" 
                    style={{ padding: '0.65rem 0.85rem', height: 'auto', minHeight: '80px' }}
                    rows={3}
                    placeholder="Detail the reason for your time-off request..."
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QUICK EXPENSE CLAIM MODAL (SHADCN DIALOG) ── */}
      {isClaimModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsClaimModalOpen(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="dialog-header">
              <h3 className="dialog-title">File Expense Reimbursement</h3>
              <p className="dialog-description">Submit receipts for business travel, equipment, or operational expenses.</p>
              <button className="dialog-close-btn" onClick={() => setIsClaimModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Expense Title / Purpose *</label>
                  <input 
                    type="text" 
                    className="search-input" 
                    style={{ paddingLeft: '0.85rem' }}
                    placeholder="e.g. Regional Pharmacy Conference Travel"
                    value={claimForm.title}
                    onChange={e => setClaimForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Category *</label>
                    <select 
                      className="filter-select w-100"
                      value={claimForm.category}
                      onChange={e => setClaimForm(prev => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="Travel & Mileage">Travel & Mileage</option>
                      <option value="Meals & Entertainment">Meals & Entertainment</option>
                      <option value="Equipment & Tech">Equipment & Tech</option>
                      <option value="Internet & Utilities">Internet & Utilities</option>
                      <option value="Medical & Health">Medical & Health</option>
                      <option value="Training & Certs">Training & Certs</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Amount ($ USD) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="1.00" 
                      placeholder="0.00" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }}
                      value={claimForm.amount}
                      onChange={e => setClaimForm(prev => ({ ...prev, amount: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Date of Expenditure *</label>
                  <input 
                    type="date" 
                    className="search-input" 
                    style={{ paddingLeft: '0.85rem' }}
                    value={claimForm.claim_date}
                    onChange={e => setClaimForm(prev => ({ ...prev, claim_date: e.target.value }))}
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Detailed Notes / Business Justification</label>
                  <textarea 
                    className="search-input" 
                    style={{ padding: '0.65rem 0.85rem', height: 'auto', minHeight: '80px' }}
                    rows={2}
                    placeholder="Explain why this expense was incurred..."
                    value={claimForm.description}
                    onChange={e => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsClaimModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ITEMIZED PAYSLIP MODAL (SHADCN DIALOG) ── */}
      {isPayslipModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsPayslipModalOpen(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} style={{ color: 'var(--primary)' }} />
                <h3 className="dialog-title">Itemized Payslip Statement</h3>
              </div>
              <button className="dialog-close-btn" onClick={() => setIsPayslipModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {payslipLoading || !selectedPayslip ? (
              <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 0.75rem' }} />
                <p className="text-xs text-muted">Loading breakdown...</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--muted)', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
                  <div>
                    <span className="text-xs text-muted">Employee:</span>{' '}
                    <strong style={{ color: 'var(--foreground)' }}>{selectedPayslip.salary.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Pay Period:</span>{' '}
                    <strong style={{ color: 'var(--foreground)' }}>{selectedPayslip.salary.salary_date}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Designation:</span>{' '}
                    <span>{selectedPayslip.salary.designation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted">Status:</span>{' '}
                    <span className="badge badge-success">{selectedPayslip.salary.status}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  {/* Earnings */}
                  <div>
                    <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Earnings & Allowances
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                      {selectedPayslip.earnings.map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-xs text-muted">{e.component_name}</span>
                          <span style={{ fontWeight: 600 }}>${parseFloat(e.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--destructive)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      Deductions & Tax
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                      {selectedPayslip.deductions.map(d => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-xs text-muted">{d.component_name}</span>
                          <span style={{ fontWeight: 600, color: 'var(--destructive)' }}>-${parseFloat(d.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Net Pay Total Callout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'oklch(0.55 0.14 163.2 / 0.1)', border: '1px solid oklch(0.55 0.14 163.2 / 0.25)', borderRadius: 'var(--radius)', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: 600 }}>Net Take-Home Pay</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)' }}>
                      ${parseFloat(selectedPayslip.salary.net_salary || selectedPayslip.salary.total_salary).toFixed(2)}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm"
                    onClick={() => window.print()}
                  >
                    <Printer size={13} />
                    <span>Print Slip</span>
                  </button>
                </div>

                <div className="dialog-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setIsPayslipModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
