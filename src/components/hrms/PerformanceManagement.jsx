import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Target, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Star, 
  DollarSign, 
  ArrowUpRight, 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  BarChart2, 
  Users, 
  Layers, 
  Zap, 
  X, 
  Check, 
  RefreshCw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { pmsApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'okrs', label: 'OKRs & Milestones', icon: Target },
  { id: 'reviews', label: '360° Review Cycles', icon: Award },
  { id: 'talent', label: '9-Box Talent Matrix', icon: Layers },
  { id: 'payroll', label: 'Appraisal to Payroll Link', icon: DollarSign },
];

const QUARTERS = ['All', 'Q1', 'Q2', 'Q3', 'Q4', 'Annual'];
const OKR_CATEGORIES = ['All', 'Company Strategic', 'Department Milestone', 'Individual Growth', 'Operational Excellence'];

export default function PerformanceManagement() {
  const { currentUser, isEmployee, isManager, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('okrs');
  const [loading, setLoading] = useState(true);

  // Core Data State
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [stats, setStats] = useState({
    avg_okr_progress: 0,
    total_okrs: 0,
    total_reviews: 0,
    pending_self: 0,
    pending_manager: 0,
    finalized_reviews: 0,
    payroll_applied: 0,
    avg_rating: 0
  });
  const [competencies, setCompetencies] = useState([]);
  const [okrs, setOkrs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [talentMatrix, setTalentMatrix] = useState(null);
  const [salaryIncrements, setSalaryIncrements] = useState([]);
  const [members, setMembers] = useState([]);

  // Filters
  const [quarterFilter, setQuarterFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateOkrModal, setShowCreateOkrModal] = useState(false);
  const [checkinKrModal, setCheckinKrModal] = useState(null); // { kr, okr }
  const [selfEvalModal, setSelfEvalModal] = useState(null); // review
  const [managerEvalModal, setManagerEvalModal] = useState(null); // review
  const [viewScorecardModal, setViewScorecardModal] = useState(null); // review
  const [selectedTalentQuadrant, setSelectedTalentQuadrant] = useState(null);

  // Forms
  const [krCheckinValue, setKrCheckinValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Initial Load
  const fetchBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [cyclesRes, compRes, membersRes] = await Promise.all([
        pmsApi.getCycles(),
        pmsApi.getCompetencies(),
        membersApi.getAll({ per_page: 100 })
      ]);

      const cycleList = cyclesRes.data || [];
      setCycles(cycleList);
      const active = cycleList.find(c => c.status === 'Active') || cycleList[0];
      const cId = active ? active.id : 1;
      setSelectedCycleId(cId);

      setCompetencies(compRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error('Failed to load PMS base data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  // Load Tab Specific Data
  const loadActiveData = useCallback(async () => {
    if (!selectedCycleId) return;

    try {
      const params = { cycle_id: selectedCycleId };
      if (isEmployee && currentUser?.id) {
        params.user_id = currentUser.id;
      }

      const [statsRes, okrsRes, revsRes] = await Promise.all([
        pmsApi.getStats(params),
        pmsApi.getOkrs(params),
        pmsApi.getReviews(isEmployee && currentUser?.id ? { user_id: currentUser.id, cycle_id: selectedCycleId } : { cycle_id: selectedCycleId })
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (okrsRes.data) setOkrs(okrsRes.data);
      if (revsRes.data) setReviews(revsRes.data);

      if (activeTab === 'talent' || isAdmin || isManager) {
        const matrixRes = await pmsApi.getTalentMatrix(selectedCycleId);
        if (matrixRes.data) setTalentMatrix(matrixRes.data);
      }

      if (activeTab === 'payroll' || isAdmin) {
        const incRes = await pmsApi.getSalaryIncrements(isEmployee && currentUser?.id ? currentUser.id : null);
        if (incRes.data) setSalaryIncrements(incRes.data);
      }
    } catch (err) {
      console.error('Failed to load PMS tab data', err);
    }
  }, [selectedCycleId, activeTab, isEmployee, isManager, isAdmin, currentUser?.id]);

  useEffect(() => {
    loadActiveData();
  }, [loadActiveData]);

  // Filtered OKRs
  const filteredOkrs = useMemo(() => {
    return okrs.filter(okr => {
      if (quarterFilter !== 'All' && okr.quarter !== quarterFilter) return false;
      if (categoryFilter !== 'All' && okr.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = okr.objective_title.toLowerCase().includes(q);
        const matchName = okr.member_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchName) return false;
      }
      return true;
    });
  }, [okrs, quarterFilter, categoryFilter, searchQuery]);

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      if (reviewStatusFilter !== 'All' && rev.status !== reviewStatusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = rev.member_name?.toLowerCase().includes(q);
        const matchBox = rev.nine_box_quadrant?.toLowerCase().includes(q);
        if (!matchName && !matchBox) return false;
      }
      return true;
    });
  }, [reviews, reviewStatusFilter, searchQuery]);

  // Handle Key Result Check-in
  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    if (!checkinKrModal) return;
    setSaving(true);
    try {
      await pmsApi.updateKeyResultProgress(checkinKrModal.kr.id, {
        current_value: parseFloat(krCheckinValue)
      });
      showToast('Key result metric checked in successfully.');
      setCheckinKrModal(null);
      loadActiveData();
    } catch (err) {
      showToast(err.message || 'Check-in failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Self Evaluation Submit
  const handleSelfEvalSubmit = async (e) => {
    e.preventDefault();
    if (!selfEvalModal) return;
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const rating = parseFloat(formData.get('self_rating'));
      const comments = formData.get('self_comments');

      const competencyScores = {};
      competencies.forEach(c => {
        const score = formData.get(`comp_${c.id}`);
        if (score) competencyScores[c.id] = parseFloat(score);
      });

      await pmsApi.submitSelfEval(selfEvalModal.id, {
        self_rating: rating,
        self_comments: comments,
        competencies: competencyScores
      });

      showToast('Self-evaluation submitted to your manager.');
      setSelfEvalModal(null);
      loadActiveData();
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Manager Evaluation Submit
  const handleManagerEvalSubmit = async (e) => {
    e.preventDefault();
    if (!managerEvalModal) return;
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const rating = parseFloat(formData.get('manager_rating'));
      const potential = formData.get('manager_potential_rating');
      const performance = formData.get('manager_performance_rating');
      const comments = formData.get('manager_comments');
      const strengths = formData.get('strengths');
      const growthAreas = formData.get('growth_areas');
      const incrementPct = parseFloat(formData.get('recommended_increment_pct') || 0);

      const competencyScores = {};
      competencies.forEach(c => {
        const score = formData.get(`comp_mgr_${c.id}`);
        if (score) competencyScores[c.id] = parseFloat(score);
      });

      await pmsApi.submitManagerEval(managerEvalModal.id, {
        manager_rating: rating,
        manager_potential_rating: potential,
        manager_performance_rating: performance,
        manager_comments: comments,
        strengths,
        growth_areas: growthAreas,
        recommended_increment_pct: incrementPct,
        competencies: competencyScores
      });

      showToast('Manager appraisal submitted and 9-Box talent quadrant updated.');
      setManagerEvalModal(null);
      loadActiveData();
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Apply Increment to Payroll
  const handleApplyIncrement = async (review) => {
    if (!window.confirm(`Apply recommended +${review.recommended_increment_pct}% salary increment to ${review.member_name}'s active payroll structure?`)) {
      return;
    }
    setSaving(true);
    try {
      const res = await pmsApi.applyIncrementToPayroll(review.id, {
        processed_by: currentUser?.id || 1
      });
      showToast(`Increment applied! New base salary: $${Number(res.data.new_base_salary).toLocaleString('en-US')}`);
      loadActiveData();
    } catch (err) {
      showToast(err.message || 'Failed to apply increment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Achieved':
      case 'Finalized':
        return 'badge badge-success';
      case 'In Progress':
      case 'On Track':
      case 'Pending Manager Review':
        return 'badge badge-secondary';
      case 'Pending Self-Review':
      case 'Behind':
      case 'Calibrating':
        return 'badge badge-warning';
      case 'At Risk':
      case 'Underperformer / Risk':
        return 'badge badge-destructive';
      default:
        return 'badge badge-outline';
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {notification && (
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
          backgroundColor: notification.type === 'error' ? 'oklch(0.65 0.22 25 / 0.95)' : 'oklch(0.2 0.05 162.5 / 0.95)',
          color: '#ffffff',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.85rem',
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {notification.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)} 
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>{isEmployee ? 'My Performance & OKRs' : 'Performance Management & Appraisals (PMS)'}</h1>
            <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>ENTERPRISE PMS</span>
          </div>
          <p>
            {isEmployee 
              ? 'Track your quarterly OKRs, key result milestones, self-evaluation appraisals, and salary increments.'
              : 'Enterprise goal setting, 360 review cycles, 9-box talent matrix calibration, and automated payroll link.'}
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Cycle Dropdown */}
          <select 
            className="filter-select"
            style={{ height: '36px', fontSize: '0.82rem', fontWeight: 600, minWidth: '220px' }}
            value={selectedCycleId || ''}
            onChange={(e) => setSelectedCycleId(Number(e.target.value))}
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.year})</option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={loadActiveData} title="Refresh Live Metrics">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {!isEmployee && (
            <button className="btn btn-primary" onClick={() => setShowCreateOkrModal(true)}>
              <Plus size={15} />
              <span>Create OKR</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Gradient Cards */}
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">OKR Completion Pulse</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--primary))' }}>
              <Target size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.avg_okr_progress}%</div>
          <div className="stat-subtext">
            <span className="stat-trend-up">{stats.completed_okrs} of {stats.total_okrs}</span>
            <span>milestones delivered</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">360 Review Status</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--warning))' }}>
              <Clock size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: stats.pending_manager > 0 ? 'var(--warning)' : 'inherit' }}>
            {stats.pending_manager + stats.pending_self}
          </div>
          <div className="stat-subtext">
            <span>{stats.pending_self} self / {stats.pending_manager} manager queue</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Average Performance Score</span>
            <div className="stat-icon-wrapper">
              <Star size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span>{stats.avg_rating || '4.25'}</span>
            <span className="text-xs text-muted" style={{ fontSize: '0.85rem' }}>/ 5.0</span>
          </div>
          <div className="stat-subtext">
            <span>Evaluated team average</span>
          </div>
        </div>

        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Payroll Increments Synced</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))' }}>
              <DollarSign size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {stats.payroll_applied}
          </div>
          <div className="stat-subtext">
            <span className="stat-trend-up">Active</span>
            <span>salary structures updated</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <div className="tabs-list" style={{ height: '38px', padding: '4px' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            // Employees only see their own OKRs, Reviews, and Payroll link
            if (isEmployee && tab.id === 'talent') return null;
            return (
              <button
                key={tab.id}
                type="button"
                className={`tabs-trigger${activeTab === tab.id ? ' active' : ''}`}
                style={{ padding: '0.25rem 0.85rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.id === 'reviews' && (stats.pending_self > 0 || stats.pending_manager > 0) && (
                  <span className="tab-count" style={{ background: 'var(--warning)', color: '#000' }}>
                    {isEmployee ? stats.pending_self : stats.pending_manager}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Search Box */}
        <div className="search-input-wrapper" style={{ maxWidth: '280px' }}>
          <Search className="search-input-icon" size={13} />
          <input
            type="text"
            className="search-input"
            style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
            placeholder="Search objectives, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TAB 1: OKRs & Measurable Milestones */}
      {activeTab === 'okrs' && (
        <div>
          {/* Sub-Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Quarter:</span>
              <div className="tabs-list" style={{ height: '30px', padding: '2px' }}>
                {QUARTERS.map(q => (
                  <button
                    key={q}
                    type="button"
                    className={`tabs-trigger${quarterFilter === q ? ' active' : ''}`}
                    style={{ padding: '0.15rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => setQuarterFilter(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Category:</span>
              <select
                className="filter-select"
                style={{ height: '30px', fontSize: '0.78rem', minWidth: '170px' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {OKR_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* OKR Cards Grid */}
          {filteredOkrs.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <Target size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--foreground)' }}>No Objectives Found</h3>
              <p className="text-sm">Create quarterly milestones to track high-impact organizational goals.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: '1.25rem' }}>
              {filteredOkrs.map(okr => (
                <div key={okr.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Objective Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-secondary font-mono" style={{ fontSize: '0.68rem' }}>{okr.quarter}</span>
                        <span className="badge badge-outline" style={{ fontSize: '0.68rem' }}>{okr.category}</span>
                        <span className={getStatusBadge(okr.status)} style={{ fontSize: '0.68rem' }}>
                          <span className="badge-dot" />
                          {okr.status}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>
                        {okr.objective_title}
                      </h3>
                    </div>

                    {/* Overall Progress Gauge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: okr.progress_pct >= 80 ? 'var(--primary)' : 'inherit' }}>
                        {okr.progress_pct}%
                      </div>
                      <span className="text-xs text-muted">Weight: {okr.weight_pct}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ height: '6px', borderRadius: '9999px', background: 'var(--muted)', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${okr.progress_pct}%`, 
                        background: okr.progress_pct >= 80 ? 'var(--primary)' : 'oklch(0.65 0.18 240)',
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  </div>

                  {/* Assigned Owner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div className="cell-avatar" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                        {okr.member_name?.charAt(0) || 'U'}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{okr.member_name}</span>
                      <span>({okr.designation})</span>
                    </div>
                    <span className="font-mono text-xs">{okr.key_results?.length || 0} Key Results</span>
                  </div>

                  {/* Key Results List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'oklch(0.2 0.02 240 / 0.3)', padding: '0.75rem', borderRadius: 'calc(var(--radius) - 2px)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Key Results & Measurable Milestones
                    </div>
                    {okr.key_results?.map(kr => (
                      <div key={kr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8rem', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ color: kr.progress_pct >= 100 ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                              {kr.progress_pct >= 100 ? <CheckCircle2 size={13} /> : <Target size={13} />}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={kr.title}>
                              {kr.title}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                            <span>Target: {kr.target_value} {kr.metric_type === 'percentage' ? '%' : ''}</span>
                            <span>•</span>
                            <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Current: {kr.current_value}</span>
                            <span>•</span>
                            <span className={getStatusBadge(kr.status)} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>{kr.status}</span>
                          </div>
                        </div>

                        {/* Check-in trigger */}
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ height: '26px', padding: '0 0.55rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            setCheckinKrModal({ kr, okr });
                            setKrCheckinValue(kr.current_value);
                          }}
                        >
                          Check-in
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 360° Review Cycles & Appraisals */}
      {activeTab === 'reviews' && (
        <div>
          {/* Status Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div className="tabs-list" style={{ height: '32px', padding: '2px' }}>
              {['All Reviews', 'Pending Self-Review', 'Pending Manager Review', 'Finalized'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`tabs-trigger${reviewStatusFilter === (st === 'All Reviews' ? 'All' : st) ? ' active' : ''}`}
                  style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => setReviewStatusFilter(st === 'All Reviews' ? 'All' : st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted">
              Showing <strong>{filteredReviews.length}</strong> appraisals in cycle
            </span>
          </div>

          {/* Reviews Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee / Reviewee</th>
                  <th>Manager / Reviewer</th>
                  <th>Self Rating</th>
                  <th>Manager Score</th>
                  <th>9-Box Quadrant</th>
                  <th>Appraisal Status</th>
                  <th>Proposed Increment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map(rev => {
                  const canSelfReview = (isEmployee && rev.user_id == currentUser?.id) || isAdmin;
                  const canManagerReview = (isManager && rev.manager_id == currentUser?.id) || isAdmin;

                  return (
                    <tr key={rev.id}>
                      <td>
                        <div className="user-cell">
                          <div className="cell-avatar">
                            {rev.member_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="cell-title">{rev.member_name}</div>
                            <div className="cell-subtitle">{rev.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">{rev.manager_name}</span>
                      </td>
                      <td>
                        {rev.self_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--warning)', fontWeight: 600 }}>
                            <Star size={12} fill="currentColor" />
                            <span>{Number(rev.self_rating).toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>Pending</span>
                        )}
                      </td>
                      <td>
                        {rev.manager_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>
                            <Star size={12} fill="currentColor" />
                            <span>{Number(rev.manager_rating).toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>Pending</span>
                        )}
                      </td>
                      <td>
                        {rev.nine_box_quadrant ? (
                          <span className="badge badge-secondary" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            {rev.nine_box_quadrant}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={getStatusBadge(rev.status)}>
                          <span className="badge-dot" />
                          {rev.status}
                        </span>
                      </td>
                      <td>
                        {Number(rev.recommended_increment_pct) > 0 ? (
                          <span className="badge badge-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 700 }}>
                            +{rev.recommended_increment_pct}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted">0%</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* Self Review Button */}
                          {canSelfReview && rev.status === 'Pending Self-Review' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => setSelfEvalModal(rev)}
                            >
                              Self-Review
                            </button>
                          )}

                          {/* Manager Review Button */}
                          {canManagerReview && rev.status === 'Pending Manager Review' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.75rem', backgroundColor: 'var(--warning)', borderColor: 'var(--warning)', color: '#000' }}
                              onClick={() => setManagerEvalModal(rev)}
                            >
                              Appraise
                            </button>
                          )}

                          {/* View Scorecard */}
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.75rem' }}
                            title="View Full Appraisal Scorecard"
                            onClick={() => setViewScorecardModal(rev)}
                          >
                            Scorecard
                          </button>

                          {/* Quick Apply Increment to Payroll if admin */}
                          {!isEmployee && rev.status === 'Finalized' && !rev.payroll_increment_applied && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                              title="Sync approved increment directly to payroll"
                              onClick={() => handleApplyIncrement(rev)}
                            >
                              <DollarSign size={12} />
                              <span>Sync Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 9-Box Talent Matrix */}
      {activeTab === 'talent' && talentMatrix && (
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Enterprise 9-Box Talent Grid</h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  Calibrate leadership potential (Y-Axis) against sustained performance (X-Axis) across all {talentMatrix.total_evaluated} evaluated staff.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-success font-mono">High Impact: Star / Future Leader</span>
                <span className="badge badge-secondary font-mono">Core: High Performer & Contributor</span>
              </div>
            </div>

            {/* 3x3 Grid Layout */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '0.85rem',
              background: 'oklch(0.18 0.02 240 / 0.5)',
              padding: '1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              {Object.entries(talentMatrix.quadrants).map(([boxTitle, data]) => (
                <div 
                  key={boxTitle}
                  className="card"
                  style={{ 
                    padding: '1rem', 
                    minHeight: '130px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderColor: data.employees.length > 0 ? 'var(--border)' : 'oklch(0.3 0.02 240 / 0.3)',
                    cursor: data.employees.length > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedTalentQuadrant === boxTitle ? '0 0 0 2px var(--primary)' : 'none'
                  }}
                  onClick={() => setSelectedTalentQuadrant(selectedTalentQuadrant === boxTitle ? null : boxTitle)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                        {boxTitle}
                      </span>
                      <span className="badge badge-outline" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                        {data.employees.length}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>
                      Pot: <strong>{data.potential}</strong> • Perf: <strong>{data.performance}</strong>
                    </div>
                  </div>

                  {/* Avatars preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {data.employees.slice(0, 5).map(emp => (
                      <div 
                        key={emp.id} 
                        className="cell-avatar" 
                        style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}
                        title={`${emp.member_name} (${emp.designation}) - Rating: ${emp.final_rating || 'N/A'}`}
                      >
                        {emp.member_name?.charAt(0) || 'U'}
                      </div>
                    ))}
                    {data.employees.length > 5 && (
                      <span className="text-xs text-muted">+{data.employees.length - 5}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Drilldown details if selected */}
            {selectedTalentQuadrant && talentMatrix.quadrants[selectedTalentQuadrant] && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'oklch(0.2 0.02 240 / 0.4)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.65rem' }}>
                  Employees in quadrant: <span style={{ color: 'var(--primary)' }}>{selectedTalentQuadrant}</span> ({talentMatrix.quadrants[selectedTalentQuadrant].employees.length})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {talentMatrix.quadrants[selectedTalentQuadrant].employees.map(emp => (
                    <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: 'var(--card)', borderRadius: 'calc(var(--radius) - 2px)', border: '1px solid var(--border)' }}>
                      <div className="cell-avatar">{emp.member_name?.charAt(0)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.member_name}</div>
                        <div className="text-xs text-muted">{emp.designation}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                        ★ {emp.final_rating || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competency Matrix Legend */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Evaluated Competencies Matrix</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {competencies.map(c => (
                <div key={c.id} style={{ padding: '0.85rem', background: 'oklch(0.2 0.02 240 / 0.3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>{c.name}</span>
                    <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{c.weight_pct}% Weight</span>
                  </div>
                  <p className="text-xs text-muted" style={{ lineHeight: 1.4 }}>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Appraisal to Payroll Link */}
      {activeTab === 'payroll' && (
        <div>
          {/* Banner */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, oklch(0.25 0.08 162.5 / 0.25), oklch(0.2 0.03 240 / 0.5))', border: '1px solid oklch(0.65 0.16 162.5 / 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div className="stat-icon-wrapper" style={{ width: '40px', height: '40px', background: 'oklch(0.65 0.16 162.5 / 0.2)', color: 'var(--primary)' }}>
                <Zap size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                  Automated Compensation & Annual Increment Pipeline
                </h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>
                  Sync approved appraisal scores directly into employee salary structures. Clicking <strong>Apply Increment</strong> instantly updates the employee's base salary and takes effect in the next payroll register.
                </p>
              </div>
            </div>
          </div>

          {/* Increments Approval Queue */}
          <div className="table-container" style={{ marginBottom: '2rem' }}>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>
                Appraisal Increments Queue ({reviews.filter(r => r.status === 'Finalized').length})
              </span>
              <span className="text-xs text-muted">Eligible for salary structure update</span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Appraisal Score</th>
                  <th>9-Box Rating</th>
                  <th>Current Base Salary</th>
                  <th>Increment %</th>
                  <th>Proposed Base</th>
                  <th>Monthly Increase</th>
                  <th>Payroll Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.filter(r => r.status === 'Finalized' || Number(r.recommended_increment_pct) > 0).map(rev => {
                  const currentBase = Number(rev.current_base_salary || 5000);
                  const incPct = Number(rev.recommended_increment_pct || 0);
                  const incAmt = Math.round(currentBase * (incPct / 100));
                  const newBase = currentBase + incAmt;

                  return (
                    <tr key={rev.id}>
                      <td>
                        <div className="user-cell">
                          <div className="cell-avatar">{rev.member_name?.charAt(0)}</div>
                          <div>
                            <div className="cell-title">{rev.member_name}</div>
                            <div className="cell-subtitle">{rev.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>★ {Number(rev.final_rating || 0).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                          {rev.nine_box_quadrant || 'Evaluated'}
                        </span>
                      </td>
                      <td className="font-mono text-sm">
                        ${currentBase.toLocaleString('en-US')}
                      </td>
                      <td>
                        <span className="badge badge-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 700 }}>
                          +{incPct}%
                        </span>
                      </td>
                      <td className="font-mono text-sm" style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        ${newBase.toLocaleString('en-US')}
                      </td>
                      <td className="font-mono text-xs" style={{ color: 'var(--success)' }}>
                        +${incAmt.toLocaleString('en-US')}/mo
                      </td>
                      <td>
                        {rev.payroll_increment_applied ? (
                          <span className="badge badge-success">
                            <Check size={11} />
                            <span>Synced to Payroll</span>
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            Pending Sync
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isEmployee && !rev.payroll_increment_applied && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ height: '28px', padding: '0 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleApplyIncrement(rev)}
                          >
                            Apply Increment
                          </button>
                        )}
                        {rev.payroll_increment_applied && (
                          <span className="text-xs text-muted font-mono">Applied</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Increment History Audit Log */}
          <div className="table-container">
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground)' }}>
                Salary Increment Historical Audit Log
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Previous Base</th>
                  <th>Increment Rate</th>
                  <th>Gross Increase</th>
                  <th>New Base Salary</th>
                  <th>Effective Date</th>
                  <th>Processed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryIncrements.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
                      No salary increments recorded yet. Apply an appraisal increment above to log records.
                    </td>
                  </tr>
                ) : (
                  salaryIncrements.map(inc => (
                    <tr key={inc.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{inc.member_name}</span>
                      </td>
                      <td className="font-mono text-sm">${Number(inc.old_base_salary).toLocaleString('en-US')}</td>
                      <td>
                        <span className="badge badge-outline" style={{ color: 'var(--primary)' }}>+{inc.increment_pct}%</span>
                      </td>
                      <td className="font-mono text-sm" style={{ color: 'var(--success)' }}>+${Number(inc.increment_amount).toLocaleString('en-US')}</td>
                      <td className="font-mono text-sm" style={{ fontWeight: 700 }}>${Number(inc.new_base_salary).toLocaleString('en-US')}</td>
                      <td className="font-mono text-xs">{inc.effective_date}</td>
                      <td className="text-xs text-muted">{inc.processed_by_name}</td>
                      <td>
                        <span className="badge badge-success">{inc.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Check-in Key Result Progress */}
      {checkinKrModal && (
        <div className="dialog-overlay" onClick={() => setCheckinKrModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">Check-in Milestone Progress</h2>
              <p className="dialog-description">{checkinKrModal.kr.title}</p>
              <button className="dialog-close-btn" onClick={() => setCheckinKrModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit}>
              <div className="dialog-body">
                <div style={{ marginBottom: '1rem', background: 'oklch(0.2 0.02 240 / 0.3)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span className="text-muted">Target Metric:</span>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                      {checkinKrModal.kr.target_value} {checkinKrModal.kr.metric_type === 'percentage' ? '%' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span className="text-muted">Current Value:</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {checkinKrModal.kr.current_value}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Current Value</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    required
                    value={krCheckinValue}
                    onChange={(e) => setKrCheckinValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setCheckinKrModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Employee Self Evaluation */}
      {selfEvalModal && (
        <div className="dialog-overlay" onClick={() => setSelfEvalModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">Submit Self-Evaluation Appraisal</h2>
              <p className="dialog-description">Evaluate your performance, accomplishments, and competencies for the cycle.</p>
              <button className="dialog-close-btn" onClick={() => setSelfEvalModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSelfEvalSubmit}>
              <div className="dialog-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Overall Self Rating (1.0 to 5.0) <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    name="self_rating"
                    className="form-input"
                    defaultValue={selfEvalModal.self_rating || 4.0}
                    required
                  />
                  <span className="text-xs text-muted">1: Needs Improvement • 3: Meets Expectations • 5: Outstanding</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Deliverables & Accomplishments Summary <span className="required">*</span></label>
                  <textarea
                    name="self_comments"
                    className="form-textarea"
                    rows={3}
                    placeholder="Highlight milestone deliveries, challenges overcome, and major contributions..."
                    defaultValue={selfEvalModal.self_comments || ''}
                    required
                  />
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.65rem', display: 'block' }}>
                    Core Competencies Self-Rating
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {competencies.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'oklch(0.2 0.02 240 / 0.3)', borderRadius: 'calc(var(--radius) - 2px)' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{c.name}</span>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          name={`comp_${c.id}`}
                          defaultValue={4.0}
                          className="form-input"
                          style={{ width: '80px', height: '28px', fontSize: '0.8rem', textAlign: 'center' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSelfEvalModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Self Appraisal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manager Scoring Appraisal & 9-Box Placement */}
      {managerEvalModal && (
        <div className="dialog-overlay" onClick={() => setManagerEvalModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">Manager Appraisal & 9-Box Talent Calibration</h2>
              <p className="dialog-description">Reviewing: {managerEvalModal.member_name} ({managerEvalModal.designation})</p>
              <button className="dialog-close-btn" onClick={() => setManagerEvalModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleManagerEvalSubmit}>
              <div className="dialog-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Employee Self Comments Preview */}
                {managerEvalModal.self_comments && (
                  <div style={{ background: 'oklch(0.22 0.03 240 / 0.4)', padding: '0.75rem', borderRadius: 'var(--radius)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>
                      <span>Employee Self-Review</span>
                      <span>Rating: ★ {managerEvalModal.self_rating}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--foreground)' }}>
                      "{managerEvalModal.self_comments}"
                    </p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Sustained Performance Rating</label>
                    <select name="manager_performance_rating" className="form-select" defaultValue={managerEvalModal.manager_performance_rating || 'High'}>
                      <option value="High">High (Consistently Exceeds)</option>
                      <option value="Medium">Medium (Meets Expectations)</option>
                      <option value="Low">Low (Needs Improvement)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Leadership Potential Rating</label>
                    <select name="manager_potential_rating" className="form-select" defaultValue={managerEvalModal.manager_potential_rating || 'High'}>
                      <option value="High">High (Ready for Next Level)</option>
                      <option value="Medium">Medium (Growing in Role)</option>
                      <option value="Low">Low (Current Scope Fit)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manager Score (1.0 to 5.0) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      name="manager_rating"
                      className="form-input"
                      defaultValue={managerEvalModal.manager_rating || 4.5}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Recommended Salary Increment % <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.0"
                      max="30.0"
                      name="recommended_increment_pct"
                      className="form-input"
                      defaultValue={managerEvalModal.recommended_increment_pct || 10.0}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Strengths & Achievements</label>
                  <input
                    type="text"
                    name="strengths"
                    className="form-input"
                    defaultValue={managerEvalModal.strengths || ''}
                    placeholder="e.g. Architecture, initiative, mentorship..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Growth Areas & Development Plan</label>
                  <input
                    type="text"
                    name="growth_areas"
                    className="form-input"
                    defaultValue={managerEvalModal.growth_areas || ''}
                    placeholder="e.g. Executive presence, delegation..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Manager Review Comments</label>
                  <textarea
                    name="manager_comments"
                    className="form-textarea"
                    rows={2}
                    defaultValue={managerEvalModal.manager_comments || ''}
                    placeholder="Detailed performance summary and feedback..."
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setManagerEvalModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Finalize Manager Appraisal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Full Appraisal Scorecard */}
      {viewScorecardModal && (
        <div className="dialog-overlay" onClick={() => setViewScorecardModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Award size={20} style={{ color: 'var(--primary)' }} />
                <h2 className="dialog-title">Appraisal Scorecard & Certificate</h2>
              </div>
              <p className="dialog-description">{viewScorecardModal.cycle_title}</p>
              <button className="dialog-close-btn" onClick={() => setViewScorecardModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="dialog-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Employee Summary Card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'oklch(0.2 0.02 240 / 0.4)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="cell-avatar" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                    {viewScorecardModal.member_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{viewScorecardModal.member_name}</h3>
                    <p className="text-xs text-muted">{viewScorecardModal.designation}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                    ★ {Number(viewScorecardModal.final_rating || viewScorecardModal.manager_rating || 0).toFixed(2)}
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem', marginTop: '0.35rem' }}>
                    {viewScorecardModal.nine_box_quadrant || 'Evaluated'}
                  </span>
                </div>
              </div>

              {/* Ratings Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span className="text-xs text-muted">Self Rating</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {viewScorecardModal.self_rating ? `★ ${viewScorecardModal.self_rating}` : '—'}
                  </div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span className="text-xs text-muted">Manager Rating</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {viewScorecardModal.manager_rating ? `★ ${viewScorecardModal.manager_rating}` : '—'}
                  </div>
                </div>
                <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span className="text-xs text-muted">Approved Increment</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.2rem' }}>
                    +{viewScorecardModal.recommended_increment_pct}%
                  </div>
                </div>
              </div>

              {/* Competency Breakdown */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Competency Evaluation Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {viewScorecardModal.competency_scores?.map(cs => (
                    <div key={cs.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'oklch(0.2 0.02 240 / 0.25)', borderRadius: 'calc(var(--radius) - 2px)' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{cs.competency_name}</span>
                        {cs.comments && <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginTop: '0.1rem' }}>"{cs.comments}"</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                        <span className="text-xs text-muted">Self: {cs.self_score || '—'}</span>
                        <span className="badge badge-primary font-mono" style={{ fontSize: '0.72rem' }}>Mgr: {cs.manager_score || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitative Review Comments */}
              {viewScorecardModal.manager_comments && (
                <div style={{ padding: '0.75rem 1rem', background: 'oklch(0.2 0.02 240 / 0.3)', borderRadius: 'var(--radius)', borderLeft: '3px solid var(--primary)' }}>
                  <span className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Executive Review Summary:</span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--foreground)', lineHeight: 1.4 }}>
                    {viewScorecardModal.manager_comments}
                  </p>
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-outline" onClick={() => setViewScorecardModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create OKR */}
      {showCreateOkrModal && (
        <div className="dialog-overlay" onClick={() => setShowCreateOkrModal(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="dialog-header">
              <h2 className="dialog-title">Create Strategic Objective (OKR)</h2>
              <p className="dialog-description">Assign high-impact goals with measurable key result milestones.</p>
              <button className="dialog-close-btn" onClick={() => setShowCreateOkrModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const formData = new FormData(e.target);
                await pmsApi.createOkr({
                  cycle_id: selectedCycleId,
                  user_id: parseInt(formData.get('user_id')),
                  objective_title: formData.get('objective_title'),
                  category: formData.get('category'),
                  quarter: formData.get('quarter'),
                  weight_pct: parseInt(formData.get('weight_pct') || 100),
                  key_results: [
                    {
                      title: formData.get('kr1_title'),
                      metric_type: formData.get('kr1_metric_type'),
                      start_value: parseFloat(formData.get('kr1_start_val') || 0),
                      target_value: parseFloat(formData.get('kr1_target_val') || 100),
                      current_value: parseFloat(formData.get('kr1_start_val') || 0),
                      weight_pct: 50
                    },
                    {
                      title: formData.get('kr2_title'),
                      metric_type: formData.get('kr2_metric_type'),
                      start_value: parseFloat(formData.get('kr2_start_val') || 0),
                      target_value: parseFloat(formData.get('kr2_target_val') || 100),
                      current_value: parseFloat(formData.get('kr2_start_val') || 0),
                      weight_pct: 50
                    }
                  ]
                });
                showToast('Objective & Key Results established successfully.');
                setShowCreateOkrModal(false);
                loadActiveData();
              } catch (err) {
                showToast(err.message || 'Failed to create OKR', 'error');
              } finally {
                setSaving(false);
              }
            }}>
              <div className="dialog-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label className="form-label">Assignee / Owner <span className="required">*</span></label>
                  <select name="user_id" className="form-select" required defaultValue={currentUser?.id || ''}>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Objective Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="objective_title"
                    className="form-input"
                    placeholder="e.g. Build and launch automated microservice reporting engine"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-select" defaultValue="Department Milestone">
                      <option value="Company Strategic">Company Strategic</option>
                      <option value="Department Milestone">Department Milestone</option>
                      <option value="Individual Growth">Individual Growth</option>
                      <option value="Operational Excellence">Operational Excellence</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Quarter</label>
                    <select name="quarter" className="form-select" defaultValue="Q2">
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </div>
                </div>

                {/* Key Results */}
                <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'oklch(0.2 0.02 240 / 0.3)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
                    Key Result 1 (Measurable Milestone)
                  </span>
                  <input type="text" name="kr1_title" className="form-input" placeholder="e.g. Reduce response latency to sub-60ms" required style={{ marginBottom: '0.5rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <select name="kr1_metric_type" className="form-select" defaultValue="percentage" style={{ height: '30px', fontSize: '0.75rem' }}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="number">Numeric Count</option>
                      <option value="boolean">Boolean (0/1)</option>
                    </select>
                    <input type="number" name="kr1_start_val" className="form-input" placeholder="Start" defaultValue="0" style={{ height: '30px', fontSize: '0.75rem' }} />
                    <input type="number" name="kr1_target_val" className="form-input" placeholder="Target" defaultValue="100" style={{ height: '30px', fontSize: '0.75rem' }} />
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', padding: '0.85rem', background: 'oklch(0.2 0.02 240 / 0.3)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)', display: 'block', marginBottom: '0.5rem' }}>
                    Key Result 2 (Measurable Milestone)
                  </span>
                  <input type="text" name="kr2_title" className="form-input" placeholder="e.g. Implement 100% automated test coverage" required style={{ marginBottom: '0.5rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <select name="kr2_metric_type" className="form-select" defaultValue="percentage" style={{ height: '30px', fontSize: '0.75rem' }}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="number">Numeric Count</option>
                      <option value="boolean">Boolean (0/1)</option>
                    </select>
                    <input type="number" name="kr2_start_val" className="form-input" placeholder="Start" defaultValue="0" style={{ height: '30px', fontSize: '0.75rem' }} />
                    <input type="number" name="kr2_target_val" className="form-input" placeholder="Target" defaultValue="100" style={{ height: '30px', fontSize: '0.75rem' }} />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateOkrModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Establish Objective'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
