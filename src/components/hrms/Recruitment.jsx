import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Briefcase, 
  Users, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Building2, 
  MapPin, 
  DollarSign, 
  Star, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink, 
  X, 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  MoreHorizontal,
  FileText,
  Trash2,
  Edit,
  Award,
  SlidersHorizontal,
  History,
  Send,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Flame,
  UserPlus
} from 'lucide-react';
import { recruitmentApi } from '../../services/api';

const STAGES = [
  { id: 'Applied', label: 'Applied', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', bg: 'rgba(56, 189, 248, 0.08)' },
  { id: 'Screening', label: 'Screening', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', bg: 'rgba(168, 85, 247, 0.08)' },
  { id: 'Interview', label: 'Interview', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'Offer', label: 'Offer', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.08)' },
  { id: 'Hired', label: 'Hired', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.08)' },
  { id: 'Rejected', label: 'Rejected', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', bg: 'rgba(239, 68, 68, 0.08)' }
];

export default function Recruitment() {
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' | 'openings' | 'candidates'
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Filters
  const [selectedJobId, setSelectedJobId] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Data
  const [openings, setOpenings] = useState([]);
  const [kanbanData, setKanbanData] = useState({ stages: {}, total: 0 });
  const [candidateList, setCandidateList] = useState([]);

  // Modals & Drawer States
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isNewCandOpen, setIsNewCandOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [stageNote, setStageNote] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // Form States
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'Hybrid',
    employment_type: 'Full-time',
    experience_level: 'Mid',
    salary_min: '',
    salary_max: '',
    positions_count: 1,
    status: 'Published',
    description: '',
    requirements: ''
  });

  const [candForm, setCandForm] = useState({
    job_id: '',
    full_name: '',
    email: '',
    phone: '',
    current_company: '',
    experience_years: '',
    expected_salary: '',
    source: 'LinkedIn',
    stage: 'Applied',
    rating: 4,
    notes: ''
  });

  // Fetch initial recruitment statistics
  const fetchStats = useCallback(async () => {
    try {
      const res = await recruitmentApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load recruitment stats:', err);
    }
  }, []);

  // Fetch Openings
  const fetchOpenings = useCallback(async () => {
    try {
      const params = {
        ...(departmentFilter && { department: departmentFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      const res = await recruitmentApi.getOpenings(params);
      if (res.success) {
        setOpenings(res.data);
      }
    } catch (err) {
      console.error('Failed to load job openings:', err);
    }
  }, [departmentFilter, searchTerm]);

  // Fetch Candidates (Kanban or flat list)
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      if (activeView === 'kanban') {
        const params = {
          format: 'kanban',
          ...(selectedJobId && { job_id: selectedJobId }),
          ...(departmentFilter && { department: departmentFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        const res = await recruitmentApi.getCandidates(params);
        if (res.success) {
          setKanbanData(res.data);
        }
      } else if (activeView === 'candidates') {
        const params = {
          ...(selectedJobId && { job_id: selectedJobId }),
          ...(departmentFilter && { department: departmentFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        const res = await recruitmentApi.getCandidates(params);
        if (res.success) {
          setCandidateList(res.data.data || []);
        }
      }
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [activeView, selectedJobId, departmentFilter, searchTerm]);

  useEffect(() => {
    fetchStats();
    fetchOpenings();
  }, [fetchStats, fetchOpenings]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Open Candidate Detail Drawer
  const handleOpenCandidate = async (candId) => {
    try {
      const res = await recruitmentApi.getCandidate(candId);
      if (res.success) {
        setSelectedCandidate(res.data);
        setIsDetailDrawerOpen(true);
        setStageNote('');
      }
    } catch (err) {
      console.error('Failed to load candidate details:', err);
      showAlert('Failed to load candidate details', 'error');
    }
  };

  // Move candidate to target stage
  const handleTransitionStage = async (candId, targetStage, note = null) => {
    try {
      const res = await recruitmentApi.updateCandidateStage(candId, targetStage, note);
      if (res.success) {
        showAlert(`Candidate moved to ${targetStage}`);
        fetchCandidates();
        fetchStats();
        if (selectedCandidate && selectedCandidate.id === candId) {
          handleOpenCandidate(candId);
        }
      }
    } catch (err) {
      console.error('Stage transition error:', err);
      showAlert('Failed to transition candidate stage.', 'error');
    }
  };

  // Submit New Job Opening
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await recruitmentApi.createOpening(jobForm);
      if (res.success) {
        setIsNewJobOpen(false);
        setJobForm({
          title: '', department: 'Engineering', location: 'Hybrid',
          employment_type: 'Full-time', experience_level: 'Mid',
          salary_min: '', salary_max: '', positions_count: 1,
          status: 'Published', description: '', requirements: ''
        });
        showAlert('Job requisition published successfully!');
        fetchOpenings();
        fetchStats();
      } else {
        showAlert(res.message || 'Failed to create job opening.', 'error');
      }
    } catch (err) {
      console.error('Create job error:', err);
      showAlert('Error creating job opening.', 'error');
    }
  };

  // Submit New Candidate
  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await recruitmentApi.createCandidate(candForm);
      if (res.success) {
        setIsNewCandOpen(false);
        setCandForm({
          job_id: '', full_name: '', email: '', phone: '',
          current_company: '', experience_years: '', expected_salary: '',
          source: 'LinkedIn', stage: 'Applied', rating: 4, notes: ''
        });
        showAlert('Candidate application registered!');
        fetchCandidates();
        fetchStats();
      } else {
        showAlert(res.message || 'Failed to create candidate application.', 'error');
      }
    } catch (err) {
      console.error('Create candidate error:', err);
      showAlert('Error submitting candidate application.', 'error');
    }
  };

  // Next stage recommendation
  const getNextStage = (curr) => {
    switch (curr) {
      case 'Applied': return 'Screening';
      case 'Screening': return 'Interview';
      case 'Interview': return 'Offer';
      case 'Offer': return 'Hired';
      default: return null;
    }
  };

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'CD';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Generate subtle avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #06b6d4, #0e7490)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
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
          <h1>Recruitment & Hiring Pipeline (ATS)</h1>
          <p>Manage job requisitions, track applicant progression across stages, and review candidate dossiers.</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-outline" 
            onClick={() => { fetchStats(); fetchCandidates(); fetchOpenings(); }}
            title="Refresh pipeline"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsNewJobOpen(true)}
          >
            <Plus size={14} />
            <span>New Requisition</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (openings.length > 0 && !candForm.job_id) {
                setCandForm(prev => ({ ...prev, job_id: openings[0].id }));
              }
              setIsNewCandOpen(true);
            }}
          >
            <UserPlus size={14} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* 4 Sleek Compact KPI Metric Cards with Subtle Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Active Requisitions</span>
            <div className="stat-icon-wrapper">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? stats.active_openings : 0}</div>
          <div className="stat-subtext">
            <span>{openings.length} total requisitions</span>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Pipeline Volume</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--primary))' }}>
              <Users size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'hsl(var(--primary))' }}>{stats ? stats.in_pipeline : 0}</div>
          <div className="stat-subtext">
            <span>{stats ? stats.total_candidates : 0} cumulative applicants</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Interviews Booked</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))' }}>
              <Calendar size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? stats.interviews_active : 0}</div>
          <div className="stat-subtext">
            <span>Technical & manager rounds</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Hired / Closed</span>
            <div className="stat-icon-wrapper">
              <Award size={14} />
            </div>
          </div>
          <div className="stat-value">{stats ? `${stats.hired_count} Hired` : '0 Hired'}</div>
          <div className="stat-subtext">
            <span>{stats ? `${stats.conversion_rate}% hire conversion` : '0%'}</span>
          </div>
        </div>
      </div>

      {/* Unified Filter & View Toolbar in Single Horizontal Row */}
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
            className={`tabs-trigger${activeView === 'kanban' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveView('kanban')}
          >
            <SlidersHorizontal size={13} />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            className={`tabs-trigger${activeView === 'openings' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveView('openings')}
          >
            <Briefcase size={13} />
            <span>Job Openings</span>
            <span className="tab-count">{openings.length}</span>
          </button>
          <button
            type="button"
            className={`tabs-trigger${activeView === 'candidates' ? ' active' : ''}`}
            style={{ padding: '0.2rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => setActiveView('candidates')}
          >
            <Users size={13} />
            <span>Candidate Directory</span>
            <span className="tab-count">{candidateList.length || stats?.total_candidates || 0}</span>
          </button>
        </div>

        {/* Right: Search + Requisition Filter + Department Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
          <div className="search-input-wrapper" style={{ maxWidth: '240px', minWidth: '170px' }}>
            <Search className="search-input-icon" size={13} />
            <input
              type="text"
              className="search-input"
              style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
              placeholder="Search candidate, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.65rem' }}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">All Requisitions</option>
            {openings.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.65rem' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Pharmacy Operations">Pharmacy Operations</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Product Design">Product Design</option>
            <option value="Finance & Accounting">Finance & Accounting</option>
            <option value="Sales & Business">Sales & Business</option>
          </select>

          {(searchTerm || selectedJobId || departmentFilter) && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ height: '34px', padding: '0 0.65rem', fontSize: '0.76rem' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedJobId('');
                setDepartmentFilter('');
              }}
            >
              <X size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ── VIEW 1: MODERN GLASS KANBAN BOARD ── */}
      {activeView === 'kanban' && (
        <div className="ats-kanban-viewport">
          <div className="ats-kanban-track">
            {STAGES.map((stage) => {
              const candidatesInStage = kanbanData.stages?.[stage.id] || [];
              return (
                <div key={stage.id} className="ats-column">
                  {/* Stage Header */}
                  <div className="ats-col-head">
                    <div className="ats-head-left">
                      <span 
                        className="ats-stage-glow-dot" 
                        style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.glow}` }} 
                      />
                      <span className="ats-stage-title">{stage.label}</span>
                      <span className="ats-badge-count">{candidatesInStage.length}</span>
                    </div>

                    <button
                      type="button"
                      className="ats-col-add-btn"
                      title={`Add candidate to ${stage.label}`}
                      onClick={() => {
                        setCandForm(prev => ({ ...prev, stage: stage.id }));
                        setIsNewCandOpen(true);
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Cards Container */}
                  <div className="ats-cards-scroll">
                    {candidatesInStage.length === 0 ? (
                      <div className="ats-empty-dropzone">
                        <span>No candidates in {stage.label}</span>
                      </div>
                    ) : (
                      candidatesInStage.map((cand) => {
                        const next = getNextStage(cand.stage);
                        return (
                          <div 
                            key={cand.id} 
                            className="ats-card"
                            onClick={() => handleOpenCandidate(cand.id)}
                          >
                            {/* Card Header: Avatar + Candidate Name + Star Rating */}
                            <div className="ats-card-header">
                              <div className="ats-card-identity">
                                <div 
                                  className="ats-avatar" 
                                  style={{ background: getAvatarColor(cand.full_name) }}
                                >
                                  {getInitials(cand.full_name)}
                                </div>
                                <div className="ats-name-group">
                                  <span className="ats-candidate-name">{cand.full_name}</span>
                                  <span className="ats-candidate-code">{cand.candidate_code}</span>
                                </div>
                              </div>

                              <div className="ats-rating-chip" title={`${cand.rating} out of 5 stars`}>
                                <Star size={11} className="star-icon" />
                                <span>{cand.rating}.0</span>
                              </div>
                            </div>

                            {/* Job Target Tag */}
                            <div className="ats-job-tag" title={cand.job_title}>
                              <Briefcase size={11} className="job-icon" />
                              <span className="job-title-text">{cand.job_title}</span>
                            </div>

                            {/* Metadata Chips */}
                            <div className="ats-chips-row">
                              <span className="ats-chip">
                                <Clock size={10} /> {cand.experience_years}y
                              </span>
                              {cand.expected_salary && (
                                <span className="ats-chip ats-salary-chip">
                                  ${Number(cand.expected_salary).toLocaleString()}
                                </span>
                              )}
                              <span className="ats-chip ats-source-chip">
                                {cand.source}
                              </span>
                            </div>

                            {/* Card Footer: Date & Quick Advance Button */}
                            <div className="ats-card-footer">
                              <span className="ats-applied-date">{cand.applied_at}</span>
                              
                              <div className="ats-footer-actions">
                                {next && (
                                  <button
                                    type="button"
                                    className="ats-advance-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTransitionStage(cand.id, next, `Advanced to ${next}`);
                                    }}
                                    title={`Move to ${next}`}
                                  >
                                    <span>{next}</span>
                                    <ChevronRight size={12} />
                                  </button>
                                )}
                                {cand.stage === 'Offer' && (
                                  <button
                                    type="button"
                                    className="ats-hire-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTransitionStage(cand.id, 'Hired', 'Offer accepted! Candidate officially hired.');
                                    }}
                                    title="Hire candidate"
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>Hire</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 2: JOB OPENINGS GRID ── */}
      {activeView === 'openings' && (
        <div className="ats-openings-grid">
          {openings.map((job) => (
            <div key={job.id} className="ats-opening-card">
              <div className="opening-card-head">
                <div className="opening-code-badge">{job.job_code}</div>
                <span className={`ats-status-pill ${job.status === 'Published' ? 'active' : 'draft'}`}>
                  {job.status}
                </span>
              </div>

              <h3 className="opening-title">{job.title}</h3>

              <div className="opening-tags-row">
                <span className="opening-tag"><Building2 size={12} /> {job.department}</span>
                <span className="opening-tag"><MapPin size={12} /> {job.location}</span>
                <span className="opening-tag"><Clock size={12} /> {job.employment_type}</span>
              </div>

              <p className="opening-description">
                {job.description || 'Enterprise role requisition active. Screening candidates.'}
              </p>

              <div className="opening-stats-strip">
                <div className="stat-item">
                  <span className="stat-num">{job.total_candidates || 0}</span>
                  <span className="stat-lbl">Applicants</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num text-amber">{job.count_interview || 0}</span>
                  <span className="stat-lbl">Interviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num text-success">{job.count_hired || 0}</span>
                  <span className="stat-lbl">Hired</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num font-mono">
                    {job.salary_min ? `$${Math.round(job.salary_min / 1000)}k+` : 'Comp'}
                  </span>
                  <span className="stat-lbl">Target Pay</span>
                </div>
              </div>

              <div className="opening-card-footer">
                <span className="opening-positions-count">{job.positions_count} open {job.positions_count > 1 ? 'seats' : 'seat'}</span>
                <button
                  type="button"
                  className="ats-btn-view-pipeline"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setActiveView('kanban');
                  }}
                >
                  <span>Open Pipeline</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VIEW 3: CANDIDATE DIRECTORY TABLE ── */}
      {activeView === 'candidates' && (
        <div className="table-container">
          {candidateList.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>No candidates found</h3>
              <p className="text-sm">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Candidate</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Target Position</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Department</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Experience</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Expected Pay</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Source</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Stage</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Rating</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Applied Date</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidateList.map((c) => (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="user-cell">
                        <div 
                          className="cell-avatar" 
                          style={{ 
                            background: getAvatarColor(c.full_name),
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}
                        >
                          {getInitials(c.full_name)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="cell-title" style={{ fontSize: '0.84rem' }}>{c.full_name}</span>
                          <span className="cell-subtitle" style={{ fontSize: '0.72rem' }}>{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Briefcase size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{c.job_title}</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{c.job_department}</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {c.experience_years} yrs exp
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--foreground)', fontSize: '0.82rem' }}>
                        {c.expected_salary ? `$${Number(c.expected_salary).toLocaleString()}/mo` : '-'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-outline" style={{ fontSize: '0.72rem' }}>
                        {c.source}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: STAGES.find(s => s.id === c.stage)?.bg,
                          color: STAGES.find(s => s.id === c.stage)?.color,
                          border: `1px solid ${STAGES.find(s => s.id === c.stage)?.color}44`,
                          fontSize: '0.72rem',
                          fontWeight: 600
                        }}
                      >
                        ● {c.stage}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                        <span>{c.rating}.0</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                      {c.applied_at}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ height: '28px', padding: '0 0.65rem', fontSize: '0.74rem', gap: '0.25rem' }}
                        onClick={() => handleOpenCandidate(c.id)}
                      >
                        <span>Review</span>
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

      {/* ── CANDIDATE DOSSIER & AUDIT TIMELINE DRAWER ── */}
      {isDetailDrawerOpen && selectedCandidate && (
        <div className="dialog-overlay" onClick={() => setIsDetailDrawerOpen(false)}>
          <div className="dialog-content" style={{ maxWidth: '680px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-header-info">
                <div 
                  className="ats-avatar-lg"
                  style={{ background: getAvatarColor(selectedCandidate.full_name) }}
                >
                  {getInitials(selectedCandidate.full_name)}
                </div>
                <div>
                  <div className="drawer-title-row">
                    <h2 className="drawer-candidate-name">{selectedCandidate.full_name}</h2>
                    <span className="opening-code-badge">{selectedCandidate.candidate_code}</span>
                  </div>
                  <p className="drawer-job-title">{selectedCandidate.job_title} • {selectedCandidate.job_department}</p>
                </div>
              </div>

              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsDetailDrawerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Quick Contact & Profile Grid */}
              <div className="drawer-info-grid">
                <div className="drawer-info-item">
                  <span className="item-label"><Mail size={12} /> Email</span>
                  <span className="item-value">{selectedCandidate.email}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="item-label"><Phone size={12} /> Phone</span>
                  <span className="item-value">{selectedCandidate.phone || 'N/A'}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="item-label"><Building2 size={12} /> Current Company</span>
                  <span className="item-value">{selectedCandidate.current_company || 'Independent'}</span>
                </div>
                <div className="drawer-info-item">
                  <span className="item-label"><Clock size={12} /> Experience</span>
                  <span className="item-value">{selectedCandidate.experience_years} Years</span>
                </div>
                <div className="drawer-info-item">
                  <span className="item-label"><DollarSign size={12} /> Expected Compensation</span>
                  <span className="item-value font-mono text-success font-bold">
                    {selectedCandidate.expected_salary ? `$${Number(selectedCandidate.expected_salary).toLocaleString()}/month` : 'Flexible'}
                  </span>
                </div>
                <div className="drawer-info-item">
                  <span className="item-label"><Sparkles size={12} /> Sourcing Channel</span>
                  <span className="item-value">{selectedCandidate.source}</span>
                </div>
              </div>

              {/* Assessment Notes */}
              <div className="drawer-notes-card">
                <div className="notes-card-head">
                  <span className="notes-title">Screening Assessment</span>
                  <div className="ats-rating-chip">
                    <Star size={12} className="star-icon" />
                    <span>{selectedCandidate.rating}.0 / 5.0 Rating</span>
                  </div>
                </div>
                <p className="notes-text">
                  {selectedCandidate.notes || 'No screening notes entered for this applicant.'}
                </p>
              </div>

              {/* Stage Transition Stepper */}
              <div className="drawer-stage-card">
                <span className="stage-card-title">Advance Pipeline Stage</span>
                <div className="stage-pill-selector">
                  {STAGES.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      className={`stage-pill-btn ${selectedCandidate.stage === st.id ? 'active' : ''}`}
                      disabled={selectedCandidate.stage === st.id}
                      onClick={() => handleTransitionStage(selectedCandidate.id, st.id, stageNote || `Candidate advanced to ${st.id}`)}
                    >
                      <span className="pill-dot" style={{ backgroundColor: st.color }} />
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>

                <div className="stage-note-row" style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter audit note (e.g. 'Passed technical round with 9/10')..."
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Progression Audit Timeline */}
              <div className="drawer-timeline-card">
                <div className="timeline-title-row">
                  <History size={14} />
                  <span>Progression Timeline & Audit Log</span>
                </div>

                <div className="timeline-stream">
                  {selectedCandidate.activity_logs && selectedCandidate.activity_logs.length > 0 ? (
                    selectedCandidate.activity_logs.map((log) => (
                      <div key={log.id} className="timeline-entry">
                        <div className="entry-bullet" />
                        <div className="entry-body">
                          <div className="entry-head">
                            <span className="entry-stage">{log.to_stage}</span>
                            <span className="entry-time">{log.created_at}</span>
                          </div>
                          <p className="entry-note">{log.note}</p>
                          {log.performed_by_name && (
                            <span className="entry-author">By {log.performed_by_name}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-sm">No activity history recorded.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setIsDetailDrawerOpen(false)}
              >
                Close Review
              </button>
              {selectedCandidate.stage !== 'Hired' && (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleTransitionStage(selectedCandidate.id, 'Hired', 'Offer accepted! Successfully hired.')}
                >
                  <Award size={14} />
                  <span>Hire Candidate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE JOB REQUISITION MODAL ── */}
      {isNewJobOpen && (
        <div className="dialog-overlay" onClick={() => setIsNewJobOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Create Job Requisition</h2>
              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsNewJobOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Position Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Senior Full Stack Engineer"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-control"
                      value={jobForm.department}
                      onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Pharmacy Operations">Pharmacy Operations</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Product Design">Product Design</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Sales & Business">Sales & Business</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location Type</label>
                    <select
                      className="form-control"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employment Mode</label>
                    <select
                      className="form-control"
                      value={jobForm.employment_type}
                      onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience Bracket</label>
                    <select
                      className="form-control"
                      value={jobForm.experience_level}
                      onChange={(e) => setJobForm({ ...jobForm, experience_level: e.target.value })}
                    >
                      <option value="Entry">Entry (0-2 yrs)</option>
                      <option value="Mid">Mid (2-5 yrs)</option>
                      <option value="Senior">Senior (5-8 yrs)</option>
                      <option value="Lead">Lead / Staff (8+ yrs)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min Monthly Salary ($)</label>
                    <input
                      type="number"
                      step="50"
                      className="form-control"
                      placeholder="e.g. 4000"
                      value={jobForm.salary_min}
                      onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Monthly Salary ($)</label>
                    <input
                      type="number"
                      step="50"
                      className="form-control"
                      placeholder="e.g. 5500"
                      value={jobForm.salary_max}
                      onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Open Headcount</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={jobForm.positions_count}
                      onChange={(e) => setJobForm({ ...jobForm, positions_count: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requisition Status</label>
                    <select
                      className="form-control"
                      value={jobForm.status}
                      onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    >
                      <option value="Published">Published (Active)</option>
                      <option value="Draft">Draft</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description & Scope</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Primary responsibilities and goals..."
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsNewJobOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REGISTER CANDIDATE MODAL ── */}
      {isNewCandOpen && (
        <div className="dialog-overlay" onClick={() => setIsNewCandOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Register Candidate Application</h2>
              <button 
                type="button" 
                className="dialog-close-btn" 
                onClick={() => setIsNewCandOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCandidate}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Target Requisition *</label>
                    <select
                      className="form-control"
                      value={candForm.job_id}
                      onChange={(e) => setCandForm({ ...candForm, job_id: e.target.value })}
                      required
                    >
                      <option value="">Select target opening...</option>
                      {openings.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Candidate name"
                      value={candForm.full_name}
                      onChange={(e) => setCandForm({ ...candForm, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={candForm.email}
                      onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={candForm.phone}
                      onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Company</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Current organization"
                      value={candForm.current_company}
                      onChange={(e) => setCandForm({ ...candForm, current_company: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-control"
                      placeholder="e.g. 5"
                      value={candForm.experience_years}
                      onChange={(e) => setCandForm({ ...candForm, experience_years: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Salary ($/mo)</label>
                    <input
                      type="number"
                      step="50"
                      className="form-control"
                      placeholder="e.g. 4500"
                      value={candForm.expected_salary}
                      onChange={(e) => setCandForm({ ...candForm, expected_salary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sourcing Channel</label>
                    <select
                      className="form-control"
                      value={candForm.source}
                      onChange={(e) => setCandForm({ ...candForm, source: e.target.value })}
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Career Page">Career Page</option>
                      <option value="Referral">Employee Referral</option>
                      <option value="Indeed">Indeed</option>
                      <option value="Agency">Recruiting Agency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Stage</label>
                    <select
                      className="form-control"
                      value={candForm.stage}
                      onChange={(e) => setCandForm({ ...candForm, stage: e.target.value })}
                    >
                      {STAGES.map((st) => (
                        <option key={st.id} value={st.id}>{st.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Preliminary Assessment Notes</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Recruiter impression, initial fit..."
                      value={candForm.notes}
                      onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsNewCandOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
