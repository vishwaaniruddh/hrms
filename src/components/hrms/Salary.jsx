import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  Search, 
  Trash2, 
  X, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Banknote,
  Download,
  Printer,
  Plus,
  FileText,
  Building2,
  Settings,
  ShieldCheck,
  Briefcase,
  Sliders,
  Receipt,
  Sparkles,
  Calculator,
  CheckCircle2,
  Pencil,
  Info,
  Users,
  Eye,
  FileCheck,
  FileSpreadsheet,
  AlertCircle,
  Tag
} from 'lucide-react';
import { salariesApi, payrollMastersApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Paid', 'Unpaid', 'Pending'];
const EMPLOYMENT_TIERS = ['All Tiers', 'Permanent', 'Temporary', 'Intern'];

const TAB_CONFIG = [
  { id: 'salaries', label: 'Payroll & Disbursements', icon: DollarSign, path: '/hrms/salary' },
  { id: 'structures', label: 'Salary Structures & Tiers', icon: Briefcase, path: '/hrms/payroll/structures' },
  { id: 'masters', label: 'Component & Deductions', icon: Sliders, path: '/hrms/payroll/masters' },
  { id: 'claims', label: 'Reimbursements & Claims', icon: Receipt, path: '/hrms/payroll/claims', badge: 'New' },
  { id: 'tax', label: 'Tax & Compliance', icon: ShieldCheck, path: '/hrms/payroll/tax' },
];

export default function Salary({ defaultTab = 'salaries' }) {
  const { currentUser, isEmployee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine active tab from URL path, query param, or props
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/payroll/structures')) return 'structures';
    if (path.includes('/payroll/masters')) return 'masters';
    if (path.includes('/payroll/claims')) return 'claims';
    if (path.includes('/payroll/tax')) return 'tax';
    const queryTab = searchParams.get('tab');
    if (queryTab && ['salaries', 'structures', 'masters', 'claims', 'tax'].includes(queryTab)) {
      return queryTab;
    }
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync state when location or query params change
  useEffect(() => {
    const current = getInitialTab();
    if (current !== activeTab) {
      setActiveTab(current);
    }
  }, [location.pathname, searchParams]);

  const handleTabSwitch = (tabId) => {
    setActiveTab(tabId);
    const target = TAB_CONFIG.find(t => t.id === tabId);
    if (target && target.path) {
      navigate(target.path);
    }
  };

  // ──────────────────────────────────────────
  // Salaries State
  // ──────────────────────────────────────────
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [tierFilter, setTierFilter] = useState('All Tiers');
  const [summary, setSummary] = useState({});
  const [members, setMembers] = useState([]);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  // ──────────────────────────────────────────
  // Structures State
  // ──────────────────────────────────────────
  const [structures, setStructures] = useState([]);
  const [structuresLoading, setStructuresLoading] = useState(false);
  const [structSearch, setStructSearch] = useState('');
  const [structTierFilter, setStructTierFilter] = useState('All Tiers');
  const [showStructModal, setShowStructModal] = useState(false);
  const [structFormData, setStructFormData] = useState({
    user_id: '',
    employment_type: 'Permanent',
    base_salary: 3500,
    currency: 'USD',
    effective_date: new Date().toISOString().split('T')[0],
    bank_name: 'JPMorgan Chase / Silicon Valley Bank',
    account_number: '',
    routing_code: '',
    payment_method: 'Bank Transfer',
    status: 'Active'
  });

  // ──────────────────────────────────────────
  // Components Master State
  // ──────────────────────────────────────────
  const [components, setComponents] = useState([]);
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [compTypeFilter, setCompTypeFilter] = useState('All');
  const [showCompModal, setShowCompModal] = useState(false);
  const [compFormData, setCompFormData] = useState({
    name: '',
    code: '',
    type: 'Earning',
    category: 'Allowance',
    calculation_type: 'Flat',
    default_value: 0,
    applies_to: 'All',
    is_taxable: 1,
    is_mandatory: 0,
    description: ''
  });

  // ──────────────────────────────────────────
  // Claims & Reimbursements State
  // ──────────────────────────────────────────
  const [claims, setClaims] = useState([
    {
      id: 1,
      member_name: 'John Doe',
      designation: 'Pharmacist',
      title: 'Outpatient Medical Consultation & Prescriptions',
      category: 'Medical',
      amount: 185.00,
      bill_date: '2026-09-14',
      merchant: 'City Care Hospital & Rx',
      receipt_ref: 'RX-90214.pdf',
      status: 'Approved',
      notes: 'Quarterly health policy allowance claim'
    },
    {
      id: 2,
      member_name: 'Sarah Jenkins',
      designation: 'Manager',
      title: 'Client Strategy Dinner & Venue Catering',
      category: 'Entertainment',
      amount: 240.50,
      bill_date: '2026-09-18',
      merchant: 'The Capital Grille',
      receipt_ref: 'INV-8821.png',
      status: 'Pending',
      notes: 'Meeting with regional healthcare partners'
    },
    {
      id: 3,
      member_name: 'Michael Chang',
      designation: 'Accountant',
      title: 'Audit Conference Travel & Taxi Fare',
      category: 'Travel',
      amount: 310.00,
      bill_date: '2026-09-12',
      merchant: 'Airport Express Cabs',
      receipt_ref: 'UBER-992.pdf',
      status: 'Settled',
      notes: 'Intercity corporate finance summit'
    },
    {
      id: 4,
      member_name: 'Emma Watson',
      designation: 'Intern',
      title: 'Ergonomic Desk Keyboard & Dual Monitor Cable',
      category: 'Equipment',
      amount: 48.00,
      bill_date: '2026-09-20',
      merchant: 'Amazon Commercial',
      receipt_ref: 'AMZ-4921.png',
      status: 'Pending',
      notes: 'Intern workspace setup perk'
    },
    {
      id: 5,
      member_name: 'David Miller',
      designation: 'Salesman',
      title: 'Pharmacy Client Fuel & Highway Tolls',
      category: 'Travel',
      amount: 92.50,
      bill_date: '2026-09-19',
      merchant: 'Shell & Turnpike Authority',
      receipt_ref: 'TOLL-301.pdf',
      status: 'Pending',
      notes: 'On-site regional sales route'
    }
  ]);
  const [claimCategoryFilter, setClaimCategoryFilter] = useState('All');
  const [claimStatusFilter, setClaimStatusFilter] = useState('All');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimFormData, setClaimFormData] = useState({
    user_id: '',
    title: '',
    category: 'Medical',
    amount: '',
    bill_date: new Date().toISOString().split('T')[0],
    merchant: '',
    notes: '',
    receipt_ref: 'receipt_upload.pdf'
  });

  // ──────────────────────────────────────────
  // Generator & Live Preview State
  // ──────────────────────────────────────────
  const [calcParams, setCalcParams] = useState({
    user_id: '',
    salary_date: new Date().toISOString().split('T')[0],
    working_days: 22,
    unpaid_days: 0,
    overrides: {}
  });
  const [previewData, setPreviewData] = useState(null);
  const [calculatingPreview, setCalculatingPreview] = useState(false);
  const [genErrors, setGenErrors] = useState({});

  // Payment Form State
  const [payData, setPayData] = useState({
    payment_method: 'Bank Transfer',
    transaction_ref: '',
    notes: ''
  });

  // ──────────────────────────────────────────
  // Data Fetching
  // ──────────────────────────────────────────
  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (isEmployee) {
        params.user_id = currentUser.id;
      }
      if (search) params.search = search;
      if (statusTab !== 'All') params.status = statusTab;
      if (tierFilter !== 'All Tiers') params.employment_type = tierFilter;

      const res = await salariesApi.getAll(params);
      setSalaries(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch salaries', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab, tierFilter, isEmployee, currentUser.id]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await salariesApi.getSummary();
      setSummary(res.data || {});
    } catch (err) {
      console.error('Failed to fetch salary summary', err);
    }
  }, []);

  const fetchStructures = useCallback(async () => {
    setStructuresLoading(true);
    try {
      const params = { per_page: 50 };
      if (structSearch) params.search = structSearch;
      if (structTierFilter !== 'All Tiers') params.employment_type = structTierFilter;
      const res = await payrollMastersApi.getStructures(params);
      setStructures(res.data || []);
    } catch (err) {
      console.error('Failed to fetch structures', err);
    } finally {
      setStructuresLoading(false);
    }
  }, [structSearch, structTierFilter]);

  const fetchComponents = useCallback(async () => {
    setComponentsLoading(true);
    try {
      const params = {};
      if (compTypeFilter !== 'All') params.type = compTypeFilter;
      const res = await payrollMastersApi.getComponents(params);
      setComponents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch components', err);
    } finally {
      setComponentsLoading(false);
    }
  }, [compTypeFilter]);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  useEffect(() => {
    fetchSummary();
    membersApi.getAll({ per_page: 100 }).then(res => setMembers(res.data || [])).catch(() => {});
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === 'structures') fetchStructures();
    if (activeTab === 'masters') fetchComponents();
  }, [activeTab, fetchStructures, fetchComponents]);

  // Search Debounce for Salaries
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ──────────────────────────────────────────
  // Live Calculation Trigger
  // ──────────────────────────────────────────
  useEffect(() => {
    if (!calcParams.user_id) {
      setPreviewData(null);
      return;
    }

    let isMounted = true;
    const fetchCalc = async () => {
      setCalculatingPreview(true);
      try {
        const res = await payrollMastersApi.calculatePreview({
          user_id: calcParams.user_id,
          working_days: Number(calcParams.working_days) || 22,
          unpaid_days: Number(calcParams.unpaid_days) || 0,
          overrides: calcParams.overrides
        });
        if (isMounted) {
          setPreviewData(res.data);
        }
      } catch (err) {
        console.error('Calculation preview failed', err);
      } finally {
        if (isMounted) setCalculatingPreview(false);
      }
    };

    fetchCalc();
    return () => { isMounted = false; };
  }, [calcParams.user_id, calcParams.working_days, calcParams.unpaid_days, calcParams.overrides]);

  // ──────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────
  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setGenErrors({});
    if (!calcParams.user_id) {
      setGenErrors({ user_id: 'Please select an employee' });
      return;
    }
    if (!previewData) return;

    setSaving(true);
    try {
      const payload = {
        user_id: calcParams.user_id,
        employment_type: previewData.employment_type,
        salary_date: calcParams.salary_date,
        working_days: calcParams.working_days,
        gross_salary: previewData.gross_salary,
        total_deductions: previewData.total_deductions,
        net_salary: previewData.net_salary,
        currency: previewData.currency || 'USD',
        status: 'Unpaid',
        items: [
          ...previewData.earnings.map(e => ({
            component_id: e.component_id,
            component_name: e.component_name,
            type: 'Earning',
            category: e.category,
            amount: e.amount
          })),
          ...previewData.deductions.map(d => ({
            component_id: d.component_id,
            component_name: d.component_name,
            type: 'Deduction',
            category: d.category,
            amount: d.amount
          }))
        ]
      };

      await salariesApi.create(payload);
      setShowGenerateModal(false);
      setCalcParams({
        user_id: '',
        salary_date: new Date().toISOString().split('T')[0],
        working_days: 22,
        unpaid_days: 0,
        overrides: {}
      });
      setPreviewData(null);
      fetchSalaries();
      fetchSummary();
    } catch (err) {
      if (err.errors) setGenErrors(err.errors);
      else alert(err.error || 'Failed to generate payroll slip');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await salariesApi.pay(showPayModal.id, payData);
      setShowPayModal(null);
      setPayData({ payment_method: 'Bank Transfer', transaction_ref: '', notes: '' });
      fetchSalaries();
      fetchSummary();
    } catch (err) {
      alert(err.error || 'Payment processing failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await salariesApi.delete(id);
      setShowDeleteConfirm(null);
      fetchSalaries();
      fetchSummary();
    } catch (err) {
      console.error('Failed to delete salary', err);
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payrollMastersApi.saveStructure(structFormData);
      setShowStructModal(false);
      fetchStructures();
      fetchSummary();
    } catch (err) {
      alert(err.error || 'Failed to save salary profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComponent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payrollMastersApi.createComponent(compFormData);
      setShowCompModal(false);
      setCompFormData({
        name: '',
        code: '',
        type: 'Earning',
        category: 'Allowance',
        calculation_type: 'Flat',
        default_value: 0,
        applies_to: 'All',
        is_taxable: 1,
        is_mandatory: 0,
        description: ''
      });
      fetchComponents();
    } catch (err) {
      alert(err.error || 'Failed to create pay component');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteComponent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom component?')) return;
    try {
      await payrollMastersApi.deleteComponent(id);
      fetchComponents();
    } catch (err) {
      alert(err.error || 'Failed to delete component');
    }
  };

  // Claim actions
  const handleApproveClaim = (id) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  };

  const handleSettleClaim = (id) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Settled' } : c));
  };

  const handleRejectClaim = (id) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  };

  const handleSaveClaim = (e) => {
    e.preventDefault();
    const selectedMember = members.find(m => String(m.id) === String(claimFormData.user_id));
    const newClaim = {
      id: Date.now(),
      member_name: selectedMember?.full_name || 'Staff Member',
      designation: selectedMember?.designation || 'Specialist',
      title: claimFormData.title,
      category: claimFormData.category,
      amount: parseFloat(claimFormData.amount) || 0,
      bill_date: claimFormData.bill_date,
      merchant: claimFormData.merchant || 'Commercial Merchant',
      receipt_ref: claimFormData.receipt_ref,
      status: 'Pending',
      notes: claimFormData.notes
    };
    setClaims(prev => [newClaim, ...prev]);
    setShowClaimModal(false);
    setClaimFormData({
      user_id: '',
      title: '',
      category: 'Medical',
      amount: '',
      bill_date: new Date().toISOString().split('T')[0],
      merchant: '',
      notes: '',
      receipt_ref: 'receipt_upload.pdf'
    });
  };

  const formatCurrency = (amount, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amount || 0);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const exportCSV = () => {
    if (salaries.length === 0) return;
    const headers = ['ID', 'Employee', 'Employment Tier', 'Salary Date', 'Working Days', 'Gross Salary', 'Total Deductions', 'Net Salary', 'Currency', 'Status'];
    const rows = salaries.map(s => [
      s.id, 
      `"${s.member_name}"`, 
      s.employment_type || 'Permanent',
      s.salary_date, 
      s.working_days, 
      s.gross_salary || s.total_salary,
      s.total_deductions || 0,
      s.net_salary || s.total_salary, 
      s.currency, 
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payroll_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered claims calculation
  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchCat = claimCategoryFilter === 'All' || c.category === claimCategoryFilter;
      const matchStatus = claimStatusFilter === 'All' || c.status === claimStatusFilter;
      return matchCat && matchStatus;
    });
  }, [claims, claimCategoryFilter, claimStatusFilter]);

  const totalClaimsAmount = useMemo(() => claims.reduce((acc, c) => acc + c.amount, 0), [claims]);
  const pendingClaimsAmount = useMemo(() => claims.filter(c => c.status === 'Pending').reduce((acc, c) => acc + c.amount, 0), [claims]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1>{isEmployee ? 'My Salary & Payslips' : 'Finance & Enterprise Payroll'}</h1>
            {isEmployee && <span className="badge badge-emerald">Personal View</span>}
          </div>
          <p>
            {isEmployee 
              ? `Monthly salary disbursals, itemized pay statements, and earnings history for ${currentUser.name}.`
              : 'Disbursements, salary structures, deductions master, medical claims, and tax compliance.'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportCSV} title="Export payroll to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {!isEmployee && (
            activeTab === 'claims' ? (
              <button className="btn btn-primary" onClick={() => setShowClaimModal(true)}>
                <Plus size={15} />
                <span>Submit Expense Claim</span>
              </button>
            ) : activeTab === 'masters' ? (
              <button className="btn btn-primary" onClick={() => setShowCompModal(true)}>
                <Plus size={15} />
                <span>New Component</span>
              </button>
            ) : activeTab === 'structures' ? (
              <button className="btn btn-primary" onClick={() => setShowStructModal(true)}>
                <Plus size={15} />
                <span>Configure Structure</span>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)}>
                <Plus size={15} />
                <span>Generate Payroll</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Top Financial KPI Metric Cards with Radiant Multi-Stop SaaS Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Total Net Payroll</span>
            <div className="stat-icon-wrapper">
              <Banknote size={14} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(summary.total_payroll)}</div>
          <div className="stat-subtext">
            <span>Gross: {formatCurrency(summary.total_gross)}</span>
            <span style={{ opacity: 0.7 }}>• Ded: {formatCurrency(summary.total_deductions)}</span>
          </div>
        </div>

        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Disbursed (Paid)</span>
            <div className="stat-icon-wrapper">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'hsl(var(--primary))' }}>{formatCurrency(summary.total_paid)}</div>
          <div className="stat-subtext">
            <span className="stat-trend-up">{summary.paid_count || 0}</span>
            <span>slips completed</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Claims & Pending</span>
            <div className="stat-icon-wrapper">
              <Receipt size={14} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(pendingClaimsAmount)}</div>
          <div className="stat-subtext">
            <span className="stat-trend-down">{claims.filter(c => c.status === 'Pending').length} pending</span>
            <span>claims awaiting approval</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Staff Compensation Tiers</span>
            <div className="stat-icon-wrapper">
              <Users size={14} />
            </div>
          </div>
          <div className="stat-value">{summary.total_structures || 0} Profiles</div>
          <div className="stat-subtext">
            <span>{summary.permanent_profiles || 0} Perm</span>
            <span style={{ opacity: 0.6 }}> • </span>
            <span>{summary.temporary_profiles || 0} Temp</span>
            <span style={{ opacity: 0.6 }}> • </span>
            <span style={{ color: 'hsl(280, 85%, 65%)' }}>{summary.intern_profiles || 0} Interns</span>
          </div>
        </div>
      </div>

      {/* Main Module Segmented View Switcher (5 Dedicated Sub-Sections) */}
      {!isEmployee && (
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.9rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              className={`tabs-trigger${activeTab === tab.id ? ' active' : ''}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, borderRadius: '6px', whiteSpace: 'nowrap' }}
              onClick={() => handleTabSwitch(tab.id)}
            >
              <tab.icon size={14} style={{ marginRight: '6px' }} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="sidebar-badge primary" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: PAYROLL RUNS & PAYSLIPS                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'salaries' && (
        <>
          {/* Unified Filter & Action Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}>
            {/* Status Tabs */}
            <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  type="button"
                  className={`tabs-trigger${statusTab === tab ? ' active' : ''}`}
                  style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => { setStatusTab(tab); setPage(1); }}
                >
                  <span>{tab === 'All' ? 'All Slips' : tab}</span>
                  <span className="tab-count">
                    {tab === 'All' ? (summary.total_records || total) :
                     tab === 'Paid' ? (summary.paid_count || 0) :
                     tab === 'Unpaid' ? (summary.unpaid_count || 0) : (summary.pending_count || 0)}
                  </span>
                </button>
              ))}
            </div>

            {/* Employment Tier Dropdown & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
              <select
                className="form-select"
                style={{ height: '34px', fontSize: '0.8rem', width: '135px', padding: '0 0.5rem' }}
                value={tierFilter}
                onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
              >
                {EMPLOYMENT_TIERS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="search-input-wrapper" style={{ maxWidth: '240px', minWidth: '180px' }}>
                <Search className="search-input-icon" size={13} />
                <input
                  type="text"
                  className="search-input"
                  style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
                  placeholder="Search employee..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <strong>{salaries.length}</strong> of <strong>{total}</strong>
              </span>
            </div>
          </div>

          {/* Salaries Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : salaries.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                <DollarSign size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>No payroll records found</h3>
                <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Generate an itemized payroll slip to get started.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Tier / Contract</th>
                    <th>Pay Period</th>
                    <th>Days</th>
                    <th>Gross Pay</th>
                    <th>Deductions</th>
                    <th>Net Take-Home</th>
                    <th>Disbursement Account</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((s) => {
                    const tier = s.employment_type || 'Permanent';
                    const isIntern = tier === 'Intern';
                    const isTemp = tier === 'Temporary';

                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="user-cell">
                            <div className="cell-avatar">
                              {getInitials(s.member_name)}
                            </div>
                            <div>
                              <div className="cell-title">{s.member_name}</div>
                              <div className="cell-subtitle">{s.designation}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            isIntern ? 'badge-primary' : isTemp ? 'badge-info' : 'badge-outline'
                          }`} style={{
                            borderColor: isIntern ? 'hsl(280, 85%, 65%)' : undefined,
                            color: isIntern ? 'hsl(280, 95%, 75%)' : undefined
                          }}>
                            {isIntern ? '🎓 Intern Stipend' : isTemp ? '⚡ Temporary' : '🏢 Permanent'}
                          </span>
                        </td>
                        <td className="text-sm text-muted font-mono">{s.salary_date}</td>
                        <td className="text-sm font-mono">{s.working_days}d</td>
                        <td className="font-mono text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                          {formatCurrency(s.gross_salary || s.total_salary, s.currency)}
                        </td>
                        <td className="font-mono text-sm" style={{ color: 'hsl(var(--destructive))' }}>
                          -{formatCurrency(s.total_deductions || 0, s.currency)}
                        </td>
                        <td className="font-mono" style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(var(--primary))' }}>
                          {formatCurrency(s.net_salary || s.total_salary, s.currency)}
                        </td>
                        <td className="text-xs text-muted">
                          {s.bank_name ? (
                            <div>
                              <div style={{ fontWeight: 500, color: 'hsl(var(--foreground))' }}>{s.bank_name.split('/')[0]}</div>
                              <div className="font-mono">{s.account_number || 'ACH'}</div>
                            </div>
                          ) : 'Direct Transfer'}
                        </td>
                        <td>
                          <span className={`badge ${
                            s.status === 'Paid' ? 'badge-success' :
                            s.status === 'Pending' ? 'badge-warning' : 'badge-destructive'
                          }`}>
                            <span className="badge-dot"></span>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0 0.55rem', fontSize: '0.74rem' }}
                              title="View itemized payslip"
                              onClick={() => {
                                salariesApi.getById(s.id).then(res => setShowSlipModal(res.data)).catch(() => setShowSlipModal(s));
                              }}
                            >
                              <FileText size={13} />
                              <span>Slip</span>
                            </button>

                            {s.status !== 'Paid' && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0 0.55rem', fontSize: '0.74rem' }}
                                title="Process payment"
                                onClick={() => setShowPayModal(s)}
                              >
                                <CreditCard size={13} />
                                <span>Pay</span>
                              </button>
                            )}

                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: 'hsl(var(--destructive))' }}
                              title="Delete record"
                              onClick={() => setShowDeleteConfirm(s.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: SALARY STRUCTURES & TIERS                           */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'structures' && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ height: '34px', fontSize: '0.8rem', width: '150px' }}
                value={structTierFilter}
                onChange={(e) => setStructTierFilter(e.target.value)}
              >
                {EMPLOYMENT_TIERS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <div className="search-input-wrapper" style={{ maxWidth: '260px' }}>
                <Search className="search-input-icon" size={13} />
                <input
                  type="text"
                  className="search-input"
                  style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
                  placeholder="Search staff profile..."
                  value={structSearch}
                  onChange={(e) => setStructSearch(e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowStructModal(true)}>
              <Plus size={14} />
              <span>Assign / Configure Structure</span>
            </button>
          </div>

          <div className="table-container">
            {structuresLoading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : structures.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                <Briefcase size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <h3>No employee salary structures found</h3>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Tier / Scheme</th>
                    <th>Base Pay / Stipend</th>
                    <th>Effective Since</th>
                    <th>Bank & Account</th>
                    <th>Disbursement Mode</th>
                    <th>Profile Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div className="user-cell">
                          <div className="cell-avatar">{getInitials(st.member_name)}</div>
                          <div>
                            <div className="cell-title">{st.member_name}</div>
                            <div className="cell-subtitle">{st.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          st.employment_type === 'Intern' ? 'badge-primary' :
                          st.employment_type === 'Temporary' ? 'badge-info' : 'badge-outline'
                        }`}>
                          {st.employment_type === 'Intern' ? '🎓 Intern (Stipend)' :
                           st.employment_type === 'Temporary' ? '⚡ Temporary' : '🏢 Permanent Staff'}
                        </span>
                      </td>
                      <td className="font-mono text-sm" style={{ fontWeight: 600 }}>
                        {formatCurrency(st.base_salary, st.currency)}
                        <span className="text-xs text-muted" style={{ fontWeight: 400, marginLeft: '4px' }}>/mo</span>
                      </td>
                      <td className="font-mono text-sm text-muted">{st.effective_date}</td>
                      <td>
                        <div style={{ fontSize: '0.82rem' }}>{st.bank_name || 'Not Configured'}</div>
                        <div className="font-mono text-xs text-muted">{st.account_number || '—'}</div>
                      </td>
                      <td className="text-sm font-mono">{st.payment_method}</td>
                      <td>
                        <span className="badge badge-success">
                          <span className="badge-dot"></span>
                          {st.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0 0.5rem', fontSize: '0.74rem' }}
                          onClick={() => {
                            setStructFormData({
                              user_id: st.user_id,
                              employment_type: st.employment_type,
                              base_salary: st.base_salary,
                              currency: st.currency || 'USD',
                              effective_date: st.effective_date,
                              bank_name: st.bank_name || '',
                              account_number: st.account_number || '',
                              routing_code: st.routing_code || '',
                              payment_method: st.payment_method || 'Bank Transfer',
                              status: st.status || 'Active'
                            });
                            setShowStructModal(true);
                          }}
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 3: PAY COMPONENTS & DEDUCTIONS MASTER                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'masters' && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-xs text-muted uppercase font-mono">Filter Type:</span>
              {['All', 'Earning', 'Deduction'].map(t => (
                <button
                  key={t}
                  className={`tabs-trigger${compTypeFilter === t ? ' active' : ''}`}
                  style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                  onClick={() => setCompTypeFilter(t)}
                >
                  {t === 'All' ? 'All Master Components' : t === 'Earning' ? '💰 Earnings & Allowances' : '📉 Deductions & Taxes'}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-sm" onClick={() => setShowCompModal(true)}>
              <Plus size={14} />
              <span>New Master Component</span>
            </button>
          </div>

          <div className="table-container">
            {componentsLoading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Component Name</th>
                    <th>Code</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th>Calculation Rule</th>
                    <th>Default Factor</th>
                    <th>Applies To</th>
                    <th>Taxable</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((comp) => {
                    const isEarning = comp.type === 'Earning';

                    return (
                      <tr key={comp.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{comp.name}</div>
                          <div className="text-xs text-muted">{comp.description || 'No description provided'}</div>
                        </td>
                        <td>
                          <span className="font-mono text-xs" style={{ background: 'hsl(var(--muted))', padding: '2px 6px', borderRadius: '4px' }}>
                            {comp.code}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isEarning ? 'badge-success' : 'badge-destructive'}`}>
                            {isEarning ? '+ Earning' : '- Deduction'}
                          </span>
                        </td>
                        <td className="text-sm font-mono">{comp.category}</td>
                        <td className="text-sm">
                          {comp.calculation_type === 'Percentage' ? '% of Basic' : 'Flat Amount'}
                        </td>
                        <td className="font-mono text-sm" style={{ fontWeight: 600 }}>
                          {comp.calculation_type === 'Percentage' 
                            ? `${comp.default_value}%` 
                            : formatCurrency(comp.default_value)}
                        </td>
                        <td>
                          <span className={`badge ${
                            comp.applies_to === 'Intern' ? 'badge-primary' :
                            comp.applies_to === 'Permanent' ? 'badge-outline' : 'badge-info'
                          }`}>
                            {comp.applies_to}
                          </span>
                        </td>
                        <td>
                          {comp.is_taxable ? (
                            <span className="text-xs text-muted" style={{ color: 'hsl(var(--primary))' }}>Yes (Taxable)</span>
                          ) : (
                            <span className="text-xs text-muted">Exempt</span>
                          )}
                        </td>
                        <td>
                          {comp.is_mandatory ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Mandatory Master</span>
                          ) : (
                            <span className="text-xs text-muted">Custom</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!comp.is_mandatory && (
                            <button
                              className="btn btn-ghost btn-sm btn-icon"
                              style={{ color: 'hsl(var(--destructive))' }}
                              title="Delete component"
                              onClick={() => handleDeleteComponent(comp.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 4: REIMBURSEMENTS & EXPENSE CLAIMS                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'claims' && (
        <>
          {/* Claims Filters & Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="tabs-list" style={{ height: '34px', padding: '3px' }}>
                {['All', 'Approved', 'Pending', 'Settled'].map(status => (
                  <button
                    key={status}
                    className={`tabs-trigger${claimStatusFilter === status ? ' active' : ''}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={() => setClaimStatusFilter(status)}
                  >
                    <span>{status}</span>
                    <span className="tab-count">
                      {status === 'All' ? claims.length : claims.filter(c => c.status === status).length}
                    </span>
                  </button>
                ))}
              </div>

              <select
                className="form-select"
                style={{ height: '34px', fontSize: '0.8rem', width: '135px' }}
                value={claimCategoryFilter}
                onChange={e => setClaimCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Medical">Medical / Health</option>
                <option value="Travel">Travel & Transit</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Equipment">Equipment / WFH</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="text-xs text-muted">
                Total Claims: <strong>{formatCurrency(totalClaimsAmount)}</strong>
              </span>
              <button className="btn btn-primary btn-sm" onClick={() => setShowClaimModal(true)}>
                <Plus size={14} />
                <span>Submit Expense Claim</span>
              </button>
            </div>
          </div>

          <div className="table-container">
            {filteredClaims.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                <Receipt size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <h3>No reimbursement claims found</h3>
                <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>Submit medical bills, travel receipts, or office perks.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Expense Description</th>
                    <th>Category</th>
                    <th>Bill Date</th>
                    <th>Merchant / Vendor</th>
                    <th>Receipt Proof</th>
                    <th>Claim Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <div className="user-cell">
                          <div className="cell-avatar">{getInitials(claim.member_name)}</div>
                          <div>
                            <div className="cell-title">{claim.member_name}</div>
                            <div className="cell-subtitle">{claim.designation}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{claim.title}</div>
                        <div className="text-xs text-muted">{claim.notes}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          claim.category === 'Medical' ? 'badge-primary' :
                          claim.category === 'Travel' ? 'badge-info' : 'badge-outline'
                        }`}>
                          {claim.category}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-muted">{claim.bill_date}</td>
                      <td className="text-sm">{claim.merchant}</td>
                      <td>
                        <span className="font-mono text-xs" style={{ background: 'hsl(var(--muted))', padding: '2px 6px', borderRadius: '4px' }}>
                          📄 {claim.receipt_ref}
                        </span>
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(var(--primary))' }}>
                        {formatCurrency(claim.amount)}
                      </td>
                      <td>
                        <span className={`badge ${
                          claim.status === 'Approved' ? 'badge-success' :
                          claim.status === 'Settled' ? 'badge-info' :
                          claim.status === 'Rejected' ? 'badge-destructive' : 'badge-warning'
                        }`}>
                          <span className="badge-dot"></span>
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                          {claim.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0 0.55rem', fontSize: '0.74rem', color: 'hsl(var(--success))' }}
                                onClick={() => handleApproveClaim(claim.id)}
                                title="Approve Claim"
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-ghost btn-sm btn-icon"
                                style={{ color: 'hsl(var(--destructive))' }}
                                onClick={() => handleRejectClaim(claim.id)}
                                title="Reject Claim"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {claim.status === 'Approved' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0 0.55rem', fontSize: '0.74rem' }}
                              onClick={() => handleSettleClaim(claim.id)}
                              title="Settle Reimbursement"
                            >
                              Settle Payout
                            </button>
                          )}
                          {claim.status === 'Settled' && (
                            <span className="text-xs text-muted" style={{ color: 'hsl(var(--success))' }}>✓ Cleared</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 5: TAX & STATUTORY COMPLIANCE                          */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'tax' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            {/* Provident Fund (EPF) Compliance Summary */}
            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.15rem', background: 'hsl(var(--card))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'hsl(var(--success))' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Provident Fund (EPF) Ledger</span>
                </div>
                <span className="badge badge-success">Statutory 12%</span>
              </div>
              <p className="text-xs text-muted" style={{ marginBottom: '0.85rem' }}>
                Mandatory retirement fund contribution matching: 12% employee salary deduction and 12% company contribution.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'hsl(var(--muted)/0.4)', padding: '0.75rem', borderRadius: '6px' }}>
                <div>
                  <div className="text-xs text-muted uppercase">Employee Deduction</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>{formatCurrency(1840.00)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase">Employer Match Pool</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'hsl(var(--primary))', marginTop: '0.2rem' }}>{formatCurrency(1840.00)}</div>
                </div>
              </div>
            </div>

            {/* Income Tax (TDS) Withholding & Form 16 */}
            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.15rem', background: 'hsl(var(--card))' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.6rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={18} style={{ color: 'hsl(var(--primary))' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>TDS Withholding & Tax Certificates</span>
                </div>
                <span className="badge badge-outline">Annual Form-16</span>
              </div>
              <p className="text-xs text-muted" style={{ marginBottom: '0.85rem' }}>
                Tax deducted at source based on annual projected employee income brackets and standard exemption deductions.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'hsl(var(--muted)/0.4)', padding: '0.75rem', borderRadius: '6px' }}>
                <div>
                  <div className="text-xs text-muted uppercase">Total TDS Remitted</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>{formatCurrency(2650.00)}</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => alert('Exporting Statutory Annual Tax Report & Form-16...')}>
                  <Download size={13} />
                  <span>Download Form-16 Summary</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statutory Tax Deductions Staff Table */}
          <div className="table-container">
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600, fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Staff Statutory Deductions & Filings Status</span>
              <span className="text-xs text-muted font-mono">FY 2026-27 Active Slabs</span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Contract Tier</th>
                  <th>Monthly Basic Pay</th>
                  <th>EPF Contribution (12%)</th>
                  <th>Employer Matching</th>
                  <th>TDS Tax Withholding</th>
                  <th>Health Insurance Deduct</th>
                  <th>Statutory Filing</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar">JD</div>
                      <div>
                        <div className="cell-title">John Doe</div>
                        <div className="cell-subtitle">Pharmacist</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-outline">Permanent</span></td>
                  <td className="font-mono text-sm">{formatCurrency(3500.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(420.00)}</td>
                  <td className="font-mono text-sm" style={{ color: 'hsl(var(--primary))' }}>+{formatCurrency(420.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(140.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(75.00)}</td>
                  <td><span className="badge badge-success">✓ Compliant</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar">SJ</div>
                      <div>
                        <div className="cell-title">Sarah Jenkins</div>
                        <div className="cell-subtitle">Manager</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-outline">Permanent</span></td>
                  <td className="font-mono text-sm">{formatCurrency(5500.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(660.00)}</td>
                  <td className="font-mono text-sm" style={{ color: 'hsl(var(--primary))' }}>+{formatCurrency(660.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(380.00)}</td>
                  <td className="font-mono text-sm text-destructive">-{formatCurrency(75.00)}</td>
                  <td><span className="badge badge-success">✓ Compliant</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="user-cell">
                      <div className="cell-avatar">EW</div>
                      <div>
                        <div className="cell-title">Emma Watson</div>
                        <div className="cell-subtitle">Intern</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">🎓 Intern Stipend</span></td>
                  <td className="font-mono text-sm">{formatCurrency(950.00)}</td>
                  <td className="font-mono text-sm text-muted">Exempt</td>
                  <td className="font-mono text-sm text-muted">Exempt</td>
                  <td className="font-mono text-sm text-muted">Below Slab</td>
                  <td className="font-mono text-sm text-muted">Company Paid</td>
                  <td><span className="badge badge-info">Stipend Exempt</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ITEMIZE PAYROLL GENERATOR WITH LIVE BREAKDOWN     */}
      {/* ────────────────────────────────────────────────────────── */}
      {showGenerateModal && (
        <div className="dialog-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">Generate Itemized Payroll Slip</h2>
                <p className="dialog-description">Live multi-tier calculation for Permanent staff, Contractors, and Intern Stipends.</p>
              </div>
              <button type="button" className="dialog-close-btn" onClick={() => setShowGenerateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit}>
              <div className="dialog-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.9fr 0.9fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Employee <span className="required">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={calcParams.user_id}
                      onChange={e => setCalcParams({ ...calcParams, user_id: e.target.value })}
                    >
                      <option value="">Select Employee to Calculate...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                      ))}
                    </select>
                    {genErrors.user_id && <span className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{genErrors.user_id}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payroll Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={calcParams.salary_date}
                      onChange={e => setCalcParams({ ...calcParams, salary_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Standard Working Days</label>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max="31"
                      value={calcParams.working_days}
                      onChange={e => setCalcParams({ ...calcParams, working_days: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', background: 'hsl(var(--muted)/0.4)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Unpaid Days / LOP</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      max="31"
                      value={calcParams.unpaid_days}
                      onChange={e => setCalcParams({ ...calcParams, unpaid_days: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Performance Bonus / Variable ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={calcParams.overrides.VARIABLE_BONUS || ''}
                      onChange={e => setCalcParams({
                        ...calcParams,
                        overrides: { ...calcParams.overrides, VARIABLE_BONUS: e.target.value }
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.76rem' }}>Medical / Health Override ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="Default"
                      value={calcParams.overrides.MEDICAL || ''}
                      onChange={e => setCalcParams({
                        ...calcParams,
                        overrides: { ...calcParams.overrides, MEDICAL: e.target.value }
                      })}
                    />
                  </div>
                </div>

                {previewData ? (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: previewData.employment_type === 'Intern' 
                        ? 'hsl(280, 50%, 15%)' 
                        : 'hsl(var(--muted) / 0.5)',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      border: '1px solid hsl(var(--border))'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={16} style={{ color: 'hsl(var(--primary))' }} />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                          Applicable Scheme: {previewData.employment_type === 'Intern' ? '🎓 Intern Stipend Structure' : `🏢 ${previewData.employment_type} Staff Compensation`}
                        </span>
                      </div>
                      <span className="text-xs text-muted">
                        Bank: {previewData.structure?.bank_name ? previewData.structure.bank_name.split('/')[0] : 'ACH Wire'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '6px', padding: '0.85rem', background: 'hsl(var(--card))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'hsl(var(--primary))' }}>EARNINGS & ALLOWANCES</span>
                          <span style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>AMOUNT</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {previewData.earnings.map((e, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                              <span>{e.component_name}</span>
                              <span className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(e.amount, previewData.currency)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.6rem', marginTop: '0.75rem', fontWeight: 700, fontSize: '0.88rem' }}>
                          <span>Total Gross Pay</span>
                          <span className="font-mono">{formatCurrency(previewData.gross_salary, previewData.currency)}</span>
                        </div>
                      </div>

                      <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '6px', padding: '0.85rem', background: 'hsl(var(--card))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.4rem', marginBottom: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'hsl(var(--destructive))' }}>DEDUCTIONS & STATUTORY</span>
                          <span style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>AMOUNT</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {previewData.deductions.length === 0 ? (
                            <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>No deductions applicable for this tier</span>
                          ) : (
                            previewData.deductions.map((d, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                <span>{d.component_name}</span>
                                <span className="font-mono text-destructive" style={{ fontWeight: 600 }}>
                                  -{formatCurrency(d.amount, previewData.currency)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--border))', paddingTop: '0.6rem', marginTop: '0.75rem', fontWeight: 700, fontSize: '0.88rem' }}>
                          <span>Total Deductions</span>
                          <span className="font-mono text-destructive">
                            -{formatCurrency(previewData.total_deductions, previewData.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      padding: '0.85rem 1.15rem',
                      background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))',
                      border: '1px solid hsl(var(--primary) / 0.3)',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <span className="text-xs uppercase text-muted" style={{ fontWeight: 700 }}>Calculated Net Take-Home Pay</span>
                        <div style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))' }}>
                          Gross ({formatCurrency(previewData.gross_salary)}) - Deductions ({formatCurrency(previewData.total_deductions)})
                        </div>
                      </div>
                      <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>
                        {formatCurrency(previewData.net_salary, previewData.currency)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed hsl(var(--border))', borderRadius: '6px' }}>
                    <Calculator size={30} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p className="text-sm text-muted">Select an employee above to preview automated earnings, medical, and deductions.</p>
                  </div>
                )}
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !previewData || calculatingPreview}
                >
                  {saving ? 'Recording Slip...' : 'Confirm & Generate Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ITEMIZE OFFICIAL PRINTABLE PAYSLIP                */}
      {/* ────────────────────────────────────────────────────────── */}
      {showSlipModal && (
        <div className="dialog-overlay" onClick={() => setShowSlipModal(null)}>
          <div className="dialog-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <h2 className="dialog-title">Official Itemized Payslip</h2>
                  <p className="dialog-description">Ref: PAY-{showSlipModal.id.toString().padStart(5, '0')} • {showSlipModal.salary_date}</p>
                </div>
                <button type="button" className="dialog-close-btn" onClick={() => setShowSlipModal(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="dialog-body" style={{ background: 'hsl(var(--background))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
                    <Building2 size={18} />
                    <span>Global Corporate HRMS</span>
                  </div>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>Financial Operations & Payroll Division</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${showSlipModal.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    <span className="badge-dot"></span>
                    {showSlipModal.status}
                  </span>
                  <p className="text-xs text-muted" style={{ marginTop: '0.35rem' }}>Date: {showSlipModal.salary_date}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <div>
                  <span className="text-xs text-muted uppercase">Employee & Contract</span>
                  <p style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '0.15rem' }}>{showSlipModal.member_name}</p>
                  <p className="text-xs text-muted">{showSlipModal.designation} • {showSlipModal.employment_type || 'Permanent'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-xs text-muted uppercase">Disbursement Account</span>
                  <p style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '0.15rem' }}>{showSlipModal.bank_name || 'Standard Bank Wire'}</p>
                  <p className="text-xs text-muted font-mono">{showSlipModal.account_number ? `Acc: ${showSlipModal.account_number}` : 'ACH Direct Deposit'}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.85rem 0' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'hsl(var(--primary))', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
                    EARNINGS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                    {showSlipModal.items && showSlipModal.items.filter(i => i.type === 'Earning').length > 0 ? (
                      showSlipModal.items.filter(i => i.type === 'Earning').map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.component_name}</span>
                          <span className="font-mono">{formatCurrency(item.amount, showSlipModal.currency)}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Base Salary / Stipend</span>
                          <span className="font-mono">{formatCurrency((showSlipModal.gross_salary || showSlipModal.total_salary) * 0.7, showSlipModal.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Medical Allowance</span>
                          <span className="font-mono">{formatCurrency((showSlipModal.gross_salary || showSlipModal.total_salary) * 0.15, showSlipModal.currency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Special & Transport</span>
                          <span className="font-mono">{formatCurrency((showSlipModal.gross_salary || showSlipModal.total_salary) * 0.15, showSlipModal.currency)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'hsl(var(--destructive))', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
                    DEDUCTIONS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                    {showSlipModal.items && showSlipModal.items.filter(i => i.type === 'Deduction').length > 0 ? (
                      showSlipModal.items.filter(i => i.type === 'Deduction').map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.component_name}</span>
                          <span className="font-mono text-destructive">-{formatCurrency(item.amount, showSlipModal.currency)}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Statutory Deductions & Tax</span>
                        <span className="font-mono text-destructive">-{formatCurrency(showSlipModal.total_deductions || 0, showSlipModal.currency)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '2px solid hsl(var(--border))', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span className="text-muted">Total Gross Earnings</span>
                  <span className="font-mono" style={{ fontWeight: 600 }}>{formatCurrency(showSlipModal.gross_salary || showSlipModal.total_salary, showSlipModal.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.65rem' }}>
                  <span className="text-muted">Total Statutory & Tax Deductions</span>
                  <span className="font-mono text-destructive" style={{ fontWeight: 600 }}>-{formatCurrency(showSlipModal.total_deductions || 0, showSlipModal.currency)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'hsl(var(--primary) / 0.1)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--primary) / 0.25)'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Net Take-Home Disbursed</span>
                  <span className="font-mono" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'hsl(var(--primary))' }}>
                    {formatCurrency(showSlipModal.net_salary || showSlipModal.total_salary, showSlipModal.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={15} />
                <span>Print Payslip</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setShowSlipModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: CONFIGURE EMPLOYEE SALARY PROFILE                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {showStructModal && (
        <div className="dialog-overlay" onClick={() => setShowStructModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">Configure Salary Profile</h2>
                <p className="dialog-description">Set employment tier, base salary / intern stipend, and bank transfer credentials.</p>
              </div>
              <button type="button" className="dialog-close-btn" onClick={() => setShowStructModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStructure}>
              <div className="dialog-body">
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Employee <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={structFormData.user_id}
                    onChange={e => setStructFormData({ ...structFormData, user_id: e.target.value })}
                  >
                    <option value="">Select Employee...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Employment Tier <span className="required">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={structFormData.employment_type}
                      onChange={e => setStructFormData({ ...structFormData, employment_type: e.target.value })}
                    >
                      <option value="Permanent">Permanent Employee</option>
                      <option value="Temporary">Temporary / Contractor</option>
                      <option value="Intern">Intern (Stipend Scheme)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {structFormData.employment_type === 'Intern' ? 'Monthly Stipend ($)' : 'Monthly Base Salary ($)'} <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      required
                      value={structFormData.base_salary}
                      onChange={e => setStructFormData({ ...structFormData, base_salary: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Disbursement Mode</label>
                    <select
                      className="form-select"
                      value={structFormData.payment_method}
                      onChange={e => setStructFormData({ ...structFormData, payment_method: e.target.value })}
                    >
                      <option value="Bank Transfer">Bank Transfer (Direct Deposit)</option>
                      <option value="Cheque">Physical Cheque</option>
                      <option value="Cash">Cash Handout</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Effective Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={structFormData.effective_date}
                      onChange={e => setStructFormData({ ...structFormData, effective_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Bank Institution Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. JPMorgan Chase Bank"
                    value={structFormData.bank_name}
                    onChange={e => setStructFormData({ ...structFormData, bank_name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Account Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 1234567890"
                      value={structFormData.account_number}
                      onChange={e => setStructFormData({ ...structFormData, account_number: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Routing / SWIFT / IFSC Code</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ACH-021000021"
                      value={structFormData.routing_code}
                      onChange={e => setStructFormData({ ...structFormData, routing_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowStructModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: CREATE MASTER COMPONENT                           */}
      {/* ────────────────────────────────────────────────────────── */}
      {showCompModal && (
        <div className="dialog-overlay" onClick={() => setShowCompModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">New Pay Master Component</h2>
                <p className="dialog-description">Add an allowance, statutory deduction, variable perk, or intern stipend component.</p>
              </div>
              <button type="button" className="dialog-close-btn" onClick={() => setShowCompModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveComponent}>
              <div className="dialog-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Component Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Wellness & Gym Allowance"
                      value={compFormData.name}
                      onChange={e => setCompFormData({ ...compFormData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Code (Unique) <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      required
                      placeholder="e.g. WELLNESS"
                      value={compFormData.code}
                      onChange={e => setCompFormData({ ...compFormData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Type <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={compFormData.type}
                      onChange={e => setCompFormData({ ...compFormData, type: e.target.value })}
                    >
                      <option value="Earning">Earning (+)</option>
                      <option value="Deduction">Deduction (-)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={compFormData.category}
                      onChange={e => setCompFormData({ ...compFormData, category: e.target.value })}
                    >
                      <option value="Allowance">Allowance</option>
                      <option value="Variable">Variable / Bonus</option>
                      <option value="Statutory">Statutory (PF / Tax)</option>
                      <option value="Insurance">Health / Mediclaim</option>
                      <option value="Stipend">Intern Stipend</option>
                      <option value="Deduction">Other Deduction</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Calculation Type</label>
                    <select
                      className="form-select"
                      value={compFormData.calculation_type}
                      onChange={e => setCompFormData({ ...compFormData, calculation_type: e.target.value })}
                    >
                      <option value="Flat">Flat Fixed Amount ($)</option>
                      <option value="Percentage">Percentage of Basic (%)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Value</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={compFormData.default_value}
                      onChange={e => setCompFormData({ ...compFormData, default_value: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Applies To</label>
                    <select
                      className="form-select"
                      value={compFormData.applies_to}
                      onChange={e => setCompFormData({ ...compFormData, applies_to: e.target.value })}
                    >
                      <option value="All">All Personnel</option>
                      <option value="Permanent">Permanent Staff Only</option>
                      <option value="Temporary">Temporary Only</option>
                      <option value="Intern">Interns Only</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(compFormData.is_taxable)}
                        onChange={e => setCompFormData({ ...compFormData, is_taxable: e.target.checked ? 1 : 0 })}
                      />
                      <span>Subject to Income Tax (TDS)</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Policy Note</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short description of this compensation rule"
                    value={compFormData.description}
                    onChange={e => setCompFormData({ ...compFormData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCompModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 5: SUBMIT REIMBURSEMENT / EXPENSE CLAIM             */}
      {/* ────────────────────────────────────────────────────────── */}
      {showClaimModal && (
        <div className="dialog-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">Submit Reimbursement Claim</h2>
                <p className="dialog-description">Submit medical expenses, travel fare, client bills, or work perks for approval.</p>
              </div>
              <button type="button" className="dialog-close-btn" onClick={() => setShowClaimModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClaim}>
              <div className="dialog-body">
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Employee <span className="required">*</span></label>
                  <select
                    className="form-select"
                    required
                    value={claimFormData.user_id}
                    onChange={e => setClaimFormData({ ...claimFormData, user_id: e.target.value })}
                  >
                    <option value="">Select Employee...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.designation})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Claim Purpose / Title <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Prescription Pharmacy Bills & Specialist Fee"
                    value={claimFormData.title}
                    onChange={e => setClaimFormData({ ...claimFormData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={claimFormData.category}
                      onChange={e => setClaimFormData({ ...claimFormData, category: e.target.value })}
                    >
                      <option value="Medical">Medical / Healthcare</option>
                      <option value="Travel">Travel & Transit</option>
                      <option value="Entertainment">Client & Entertainment</option>
                      <option value="Equipment">Office Equipment / WFH</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Claim Amount ($) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      required
                      placeholder="0.00"
                      value={claimFormData.amount}
                      onChange={e => setClaimFormData({ ...claimFormData, amount: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Invoice / Receipt Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={claimFormData.bill_date}
                      onChange={e => setClaimFormData({ ...claimFormData, bill_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Merchant / Vendor</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Walgreens / Uber"
                      value={claimFormData.merchant}
                      onChange={e => setClaimFormData({ ...claimFormData, merchant: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Business Justification</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short description or business reason"
                    value={claimFormData.notes}
                    onChange={e => setClaimFormData({ ...claimFormData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowClaimModal(false)}>
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

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 6: DISBURSEMENT PAY MODAL                            */}
      {/* ────────────────────────────────────────────────────────── */}
      {showPayModal && (
        <div className="dialog-overlay" onClick={() => setShowPayModal(null)}>
          <div className="dialog-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">Execute Salary Disbursement</h2>
                <p className="dialog-description">Settle {formatCurrency(showPayModal.net_salary || showPayModal.total_salary, showPayModal.currency)} to {showPayModal.member_name}.</p>
              </div>
              <button type="button" className="dialog-close-btn" onClick={() => setShowPayModal(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePay}>
              <div className="dialog-body">
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Disbursement Channel <span className="required">*</span></label>
                  <select
                    className="form-select"
                    value={payData.payment_method}
                    onChange={e => setPayData({ ...payData, payment_method: e.target.value })}
                  >
                    <option value="Bank Transfer">Bank Transfer (ACH / Wire)</option>
                    <option value="Cheque">Physical Cheque</option>
                    <option value="Cash">Cash Handout</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Transaction Reference / UTR Number</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    placeholder="e.g. TXN-948291038"
                    value={payData.transaction_ref}
                    onChange={e => setPayData({ ...payData, transaction_ref: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Notes / Remark</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Monthly salary cleared successfully"
                    value={payData.notes}
                    onChange={e => setPayData({ ...payData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPayModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Processing...' : 'Mark as Settled (Paid)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 7: DELETE CONFIRMATION MODAL                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="dialog-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Delete Payroll Slip</h2>
              <button type="button" className="dialog-close-btn" onClick={() => setShowDeleteConfirm(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="dialog-body">
              <p className="text-sm">Are you sure you want to delete this payroll record? This action will remove the slip and its itemized line items.</p>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
