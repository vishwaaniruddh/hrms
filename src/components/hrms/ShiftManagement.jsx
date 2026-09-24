import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Sliders, 
  Plus, 
  RefreshCw, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRightLeft, 
  DollarSign, 
  Zap, 
  Moon, 
  Sun, 
  Coffee, 
  ShieldCheck, 
  CheckCircle2, 
  Search,
  CheckCheck,
  Edit2
} from 'lucide-react';
import { shiftsApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ShiftManagement() {
  const { currentUser, isManager, isAdmin } = useAuth();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'master' | 'swaps' | 'overtime'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rosterViewMode, setRosterViewMode] = useState('month'); // 'month' | 'week'
  const [selectedWeek, setSelectedWeek] = useState(1); // week 1 to 5

  // Core Data States
  const [rosterData, setRosterData] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [overtimeRecords, setOvertimeRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);

  // Modals & Popovers
  const [toastMessage, setToastMessage] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [cellEditPopover, setCellEditPopover] = useState(null); // { userId, empName, date, currentShiftId, currentIsOff }

  // Form States
  const [shiftForm, setShiftForm] = useState({
    shift_code: '',
    name: '',
    description: '',
    start_time: '08:30:00',
    end_time: '17:00:00',
    grace_period_mins: 15,
    break_duration_mins: 60,
    color: '#10b981',
    is_night_shift: 0,
    night_allowance_amt: 0,
    overtime_multiplier: 1.50
  });

  const [bulkForm, setBulkForm] = useState({
    user_ids: [],
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    shift_id: '',
    include_weekends: false
  });

  const [swapForm, setSwapForm] = useState({
    requester_id: currentUser?.id || 1,
    receiver_id: '',
    roster_id: 1,
    date: '2026-09-25',
    reason: '',
    target_shift_id: ''
  });

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Roster Grid Data
  const fetchRoster = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [rosterRes, shiftsRes, statsRes] = await Promise.all([
        shiftsApi.getRoster({ year: selectedYear, month: selectedMonth, department: selectedDepartment }),
        shiftsApi.getShifts(),
        shiftsApi.getStats()
      ]);

      if (rosterRes && rosterRes.data) setRosterData(rosterRes.data);
      if (shiftsRes && shiftsRes.data) setShifts(shiftsRes.data);
      if (statsRes && statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load roster:', err);
      showToast('Failed to load roster data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, selectedMonth, selectedDepartment]);

  // Load Shift Swaps
  const fetchSwaps = useCallback(async () => {
    try {
      const res = await shiftsApi.getSwaps();
      if (res && res.data) setSwaps(res.data);
    } catch (err) {
      console.error('Failed to load swaps:', err);
    }
  }, []);

  // Load Overtime Records
  const fetchOvertime = useCallback(async () => {
    try {
      const res = await shiftsApi.getOvertime({ month: selectedMonth, year: selectedYear });
      if (res && res.data) setOvertimeRecords(res.data);
    } catch (err) {
      console.error('Failed to load overtime:', err);
    }
  }, [selectedMonth, selectedYear]);

  // Load Members directory
  useEffect(() => {
    membersApi.getAll({ per_page: 50 }).then((res) => {
      if (res && res.data) setMembers(res.data);
    }).catch(() => {});
  }, []);

  // Fetch data on tab / filter change
  useEffect(() => {
    if (activeTab === 'roster') fetchRoster();
    else if (activeTab === 'swaps') fetchSwaps();
    else if (activeTab === 'overtime') fetchOvertime();
  }, [activeTab, fetchRoster, fetchSwaps, fetchOvertime]);

  // Quick Cell Shift Assign
  const handleAssignCell = async (shiftId, isOffDay = false) => {
    if (!cellEditPopover) return;

    try {
      await shiftsApi.assignRoster({
        user_id: cellEditPopover.userId,
        date: cellEditPopover.date,
        shift_id: isOffDay ? null : shiftId,
        is_off_day: isOffDay ? 1 : 0
      });

      showToast(`Shift updated for ${cellEditPopover.date}`);
      setCellEditPopover(null);
      fetchRoster(true);
    } catch (err) {
      console.error('Failed to assign cell:', err);
      showToast('Could not update roster cell', 'error');
    }
  };

  // Create Shift Master
  const handleSaveShiftMaster = async (e) => {
    e.preventDefault();
    try {
      const res = await shiftsApi.createShift(shiftForm);
      if (res && res.success) {
        showToast(`Shift "${shiftForm.name}" created successfully`);
        setIsShiftModalOpen(false);
        setShiftForm({
          shift_code: '',
          name: '',
          description: '',
          start_time: '08:30:00',
          end_time: '17:00:00',
          grace_period_mins: 15,
          break_duration_mins: 60,
          color: '#10b981',
          is_night_shift: 0,
          night_allowance_amt: 0,
          overtime_multiplier: 1.50
        });
        fetchRoster(true);
      }
    } catch (err) {
      console.error('Failed to create shift:', err);
      showToast('Could not create shift', 'error');
    }
  };

  // Bulk Pattern Assign
  const handleBulkAssignSubmit = async (e) => {
    e.preventDefault();
    if (bulkForm.user_ids.length === 0 || !bulkForm.shift_id) {
      showToast('Please select at least one employee and a shift', 'error');
      return;
    }

    try {
      const res = await shiftsApi.bulkAssign(bulkForm);
      if (res && res.success) {
        showToast(`Bulk schedule applied: ${res.data.assigned_slots} slots allocated`);
        setIsBulkModalOpen(false);
        fetchRoster(true);
      }
    } catch (err) {
      console.error('Bulk assign failed:', err);
      showToast('Could not apply bulk pattern', 'error');
    }
  };

  // Colleague Response to Swap
  const handlePeerRespondSwap = async (swapId, action) => {
    try {
      const res = await shiftsApi.respondToSwap(swapId, {
        receiver_id: currentUser?.id || 1,
        action: action
      });
      if (res && res.success) {
        showToast(`Swap request ${action}ed`);
        fetchSwaps();
        if (activeTab === 'roster') fetchRoster(true);
      }
    } catch (err) {
      showToast('Failed to respond to swap', 'error');
    }
  };

  // Manager Review Shift Swap
  const handleReviewSwap = async (swapId, action) => {
    try {
      const res = await shiftsApi.reviewSwap(swapId, {
        manager_id: currentUser?.id || 1,
        action: action,
        remarks: `Review completed via HRMS Roster Portal (${action})`
      });

      if (res && res.success) {
        showToast(`Swap request ${action}ed by manager`);
        fetchSwaps();
        if (activeTab === 'roster') fetchRoster(true);
      }
    } catch (err) {
      console.error('Swap review failed:', err);
      showToast('Failed to review shift swap', 'error');
    }
  };

  // Overtime Calculation
  const handleCalculateOvertime = async () => {
    try {
      const res = await shiftsApi.calculateOvertime({
        date_from: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
        date_to: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-30`
      });

      if (res && res.success) {
        showToast(`Calculated overtime for ${res.data.processed_records} attendance records`);
        fetchOvertime();
        fetchRoster(true);
      }
    } catch (err) {
      console.error('OT calculation failed:', err);
      showToast('Could not calculate overtime', 'error');
    }
  };

  // Sync Overtime to Payroll
  const handleSyncToPayroll = async (recordIds) => {
    try {
      const res = await shiftsApi.syncOvertime({
        record_ids: recordIds,
        salary_id: 1
      });

      if (res && res.success) {
        showToast(`Synced ${res.data.synced_count} records to payroll! Allowances: ₹${res.data.total_night_pay}, OT: ₹${res.data.total_ot_pay}`);
        fetchOvertime();
      }
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Failed to sync overtime into payroll', 'error');
    }
  };

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filtered Roster Employees
  const filteredEmployees = useMemo(() => {
    if (!rosterData || !rosterData.employees) return [];
    return rosterData.employees.filter(emp => {
      const matchesSearch = !searchQuery || 
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [rosterData, searchQuery]);

  // Filtered Daily Coverage Days (for Month vs Week view)
  const visibleDays = useMemo(() => {
    if (!rosterData || !rosterData.daily_coverage) return [];
    if (rosterViewMode === 'month') return rosterData.daily_coverage;
    
    // 7 days per week
    const startIdx = (selectedWeek - 1) * 7;
    return rosterData.daily_coverage.slice(startIdx, startIdx + 7);
  }, [rosterData, rosterViewMode, selectedWeek]);

  return (
    <div>
      {/* ── Fixed Toast Notification (Shadcn Style) ── */}
      {toastMessage && (
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
            backgroundColor: toastMessage.type === 'error' ? 'oklch(0.65 0.22 25 / 0.95)' : 'oklch(0.2 0.05 162.5 / 0.95)',
            color: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.85rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage.type === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} style={{ color: 'var(--primary)' }} />}
          <span>{toastMessage.message}</span>
          <button 
            type="button"
            onClick={() => setToastMessage(null)} 
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Official Shadcn Page Header ── */}
      <div className="page-header">
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Shift Scheduling & Team Roster</h1>
            <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>ENTERPRISE ROSTER</span>
          </div>
          <p>
            Visual multi-department assignment matrix, overnight night differentials, colleague shift swapping, and automated payroll overtime sync.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => fetchRoster(true)} 
            disabled={refreshing}
            title="Refresh live roster metrics"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => setIsBulkModalOpen(true)}
            title="Assign recurring shift pattern to staff"
          >
            <Zap size={14} />
            <span>Bulk Assign</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsShiftModalOpen(true)}
            title="Define new shift timing master"
          >
            <Plus size={14} />
            <span>New Shift Master</span>
          </button>
        </div>
      </div>

      {/* ── Balanced 4-Card Shadcn Stats Grid ── */}
      <div className="stats-grid">
        
        {/* Card 1: Shift Masters */}
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Shift Master Types</span>
            <div className="stat-icon-wrapper">
              <Clock size={14} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? stats.active_shifts : shifts.length}
          </div>
          <div className="stat-subtext">
            <span>Morning, Swing, Night & 12h Rotational</span>
          </div>
        </div>

        {/* Card 2: Scheduled Hours */}
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Scheduled Staff-Hours</span>
            <div className="stat-icon-wrapper">
              <Users size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {rosterData ? `${rosterData.kpis.total_scheduled_hours}h` : '528h'}
          </div>
          <div className="stat-subtext">
            <span className="stat-trend-up">Active</span>
            <span>{rosterData ? `${rosterData.kpis.total_working_slots} slots allocated` : '66 slots'}</span>
          </div>
        </div>

        {/* Card 3: Coverage Health */}
        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Staffing Coverage Health</span>
            <div className="stat-icon-wrapper">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? `${stats.coverage_rate}%` : '98.4%'}
          </div>
          <div className="stat-subtext">
            <span>All departments meet target threshold</span>
          </div>
        </div>

        {/* Card 4: Swaps & Overtime Pool */}
        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Pending Swaps & Differentials</span>
            <div className="stat-icon-wrapper">
              <ArrowRightLeft size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span>{stats ? stats.pending_swaps : swaps.length}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
              · ₹{stats?.total_night_allowances || '912.5'} OT
            </span>
          </div>
          <div className="stat-subtext">
            <span>Awaiting peer & manager sign-off</span>
          </div>
        </div>

      </div>

      {/* ── Official Shadcn Tabs Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        
        <div className="tabs-list">
          <button
            type="button"
            className={`tabs-trigger${activeTab === 'roster' ? ' active' : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            <Calendar size={14} />
            <span>Visual Roster Grid</span>
          </button>

          <button
            type="button"
            className={`tabs-trigger${activeTab === 'master' ? ' active' : ''}`}
            onClick={() => setActiveTab('master')}
          >
            <Clock size={14} />
            <span>Shift Masters</span>
            <span className="tab-count">{shifts.length}</span>
          </button>

          <button
            type="button"
            className={`tabs-trigger${activeTab === 'swaps' ? ' active' : ''}`}
            onClick={() => setActiveTab('swaps')}
          >
            <ArrowRightLeft size={14} />
            <span>Shift Swapping</span>
            {stats && stats.pending_swaps > 0 && (
              <span className="tab-count" style={{ background: 'var(--warning)', color: '#000' }}>
                {stats.pending_swaps}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`tabs-trigger${activeTab === 'overtime' ? ' active' : ''}`}
            onClick={() => setActiveTab('overtime')}
          >
            <DollarSign size={14} />
            <span>Overtime & Differentials</span>
          </button>
        </div>

        {/* Global Search Filter in Tab Header */}
        {activeTab === 'roster' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="search-input-wrapper" style={{ width: '220px', minWidth: 'auto' }}>
              <Search className="search-input-icon" size={13} />
              <input
                type="text"
                className="search-input"
                style={{ height: '34px', fontSize: '0.8rem' }}
                placeholder="Filter employee..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="tabs-list" style={{ height: '34px', padding: '2px' }}>
              <button
                type="button"
                className={`tabs-trigger${rosterViewMode === 'month' ? ' active' : ''}`}
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                onClick={() => setRosterViewMode('month')}
              >
                Month
              </button>
              <button
                type="button"
                className={`tabs-trigger${rosterViewMode === 'week' ? ' active' : ''}`}
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                onClick={() => setRosterViewMode('week')}
              >
                Week
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 1: VISUAL ROSTER GRID                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div>
          
          {/* Roster Controls & Legend Toolbar */}
          <div className="table-toolbar" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            
            <div className="toolbar-left" style={{ gap: '0.75rem' }}>
              
              {/* Month Navigator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--muted)', borderRadius: 'calc(var(--radius) - 2px)', padding: '0.2rem 0.4rem', border: '1px solid var(--border)' }}>
                <button aria-label="Previous month"
                  type="button"
                  className="btn btn-icon btn-sm"
                  style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', color: 'var(--foreground)' }}
                  onClick={() => {
                    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
                    else setSelectedMonth(m => m - 1);
                  }}
                  title="Previous Month"
                >
                  <ChevronLeft size={15} />
                </button>
                <span style={{ fontWeight: 600, fontSize: '0.825rem', minWidth: '130px', textAlign: 'center', color: 'var(--foreground)' }}>
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </span>
                <button aria-label="Next month"
                  type="button"
                  className="btn btn-icon btn-sm"
                  style={{ width: '28px', height: '28px', background: 'transparent', border: 'none', color: 'var(--foreground)' }}
                  onClick={() => {
                    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
                    else setSelectedMonth(m => m + 1);
                  }}
                  title="Next Month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Week Selector (if week mode) */}
              {rosterViewMode === 'week' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {[1, 2, 3, 4, 5].map(w => (
                    <button
                      key={w}
                      type="button"
                      className={`btn btn-sm ${selectedWeek === w ? 'btn-primary' : 'btn-outline'}`}
                      style={{ height: '30px', padding: '0 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedWeek(w)}
                    >
                      W{w}
                    </button>
                  ))}
                </div>
              )}

              {/* Department Filter */}
              <select
                className="filter-select"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{ height: '34px', fontSize: '0.825rem' }}
              >
                <option value="All">All Departments</option>
                <option value="Clinical">Clinical Pharmacy</option>
                <option value="Admin">Administration</option>
                <option value="Operations">Operations</option>
                <option value="Engineering">Engineering</option>
              </select>

            </div>

            {/* Shift Legend */}
            <div className="toolbar-right" style={{ gap: '0.85rem' }}>
              <span className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Legend:</span>
              {shifts.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--foreground)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}60` }}></span>
                  <span style={{ fontWeight: 600 }}>{s.shift_code}</span>
                  <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>({s.start_time.slice(0, 5)})</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }}></span>
                <span>OFF</span>
              </div>
            </div>

          </div>

          {/* Roster Table Container */}
          <div className="table-container" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            <table className="data-table" style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: rosterViewMode === 'month' ? '1480px' : '960px' }}>
              
              {/* Table Header */}
              <thead>
                <tr>
                  {/* Sticky Employee Header */}
                  <th 
                    style={{ 
                      position: 'sticky', 
                      left: 0, 
                      zIndex: 20, 
                      background: 'var(--muted)', 
                      width: '230px', 
                      minWidth: '230px',
                      borderRight: '1px solid var(--border)',
                      padding: '0.65rem 0.95rem'
                    }}
                  >
                    Staff Member
                  </th>

                  {/* Day Column Headers */}
                  {visibleDays.map((day) => {
                    const isWeekend = day.day_name === 'Sat' || day.day_name === 'Sun';
                    const isToday = day.date === new Date().toISOString().slice(0, 10);

                    return (
                      <th
                        key={day.date}
                        style={{
                          textAlign: 'center',
                          padding: '0.45rem 0.2rem',
                          width: rosterViewMode === 'month' ? '46px' : 'auto',
                          minWidth: rosterViewMode === 'month' ? '46px' : '90px',
                          background: isToday 
                            ? 'rgba(16, 185, 129, 0.15)' 
                            : isWeekend 
                              ? 'oklch(0.22 0.006 216.9 / 0.5)' 
                              : 'var(--muted)',
                          borderRight: '1px solid var(--border)',
                          borderBottom: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isToday ? 'var(--primary)' : 'var(--foreground)' }}>
                          {day.date.split('-')[2]}
                        </div>
                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isWeekend ? '#f59e0b' : 'var(--muted-foreground)', fontWeight: 600 }}>
                          {day.day_name}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleDays.length + 1} style={{ textAlign: 'center', padding: '3.5rem' }}>
                      <div className="spinner" style={{ margin: '0 auto 0.75rem' }}></div>
                      <span className="text-xs text-muted">Loading department shift roster...</span>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={visibleDays.length + 1} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                      No staff roster assignments match the selected filters. Click "Bulk Assign" to generate schedules.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      
                      {/* Sticky Employee Row Header */}
                      <td 
                        style={{ 
                          position: 'sticky', 
                          left: 0, 
                          background: 'var(--card)', 
                          zIndex: 10,
                          borderRight: '1px solid var(--border)',
                          padding: '0.6rem 0.95rem'
                        }}
                      >
                        <div className="user-cell">
                          <div 
                            className="cell-avatar"
                            style={{
                              width: '32px',
                              height: '32px',
                              background: 'var(--secondary)',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {emp.full_name.charAt(0)}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <div className="cell-title" style={{ fontSize: '0.825rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '145px' }}>
                              {emp.full_name}
                            </div>
                            <div className="cell-subtitle" style={{ fontSize: '0.7rem' }}>
                              {emp.designation}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Day Assignment Cells */}
                      {visibleDays.map((day) => {
                        const assign = emp.assignments[day.date];
                        const isOff = assign ? assign.is_off_day : false;
                        const shiftCode = assign ? assign.shift_code : null;
                        const isWeekend = day.day_name === 'Sat' || day.day_name === 'Sun';
                        const shiftColor = assign?.color || '#10b981';

                        return (
                          <td 
                            key={day.date}
                            style={{ 
                              textAlign: 'center', 
                              padding: '0.3rem 0.15rem',
                              cursor: 'pointer',
                              position: 'relative',
                              borderRight: '1px solid var(--border)',
                              background: isWeekend ? 'oklch(0.20 0.005 216.9 / 0.3)' : 'transparent'
                            }}
                            onClick={() => setCellEditPopover({
                              userId: emp.id,
                              empName: emp.full_name,
                              date: day.date,
                              currentShiftId: assign?.shift_id,
                              currentIsOff: isOff
                            })}
                            title={`${emp.full_name} · ${day.date}: ${assign ? assign.shift_name : 'Click to schedule shift'}`}
                          >
                            {assign ? (
                              isOff ? (
                                <div 
                                  style={{
                                    borderRadius: 'calc(var(--radius) - 3px)',
                                    padding: '0.25rem 0.15rem',
                                    fontSize: '0.675rem',
                                    fontWeight: 600,
                                    background: 'var(--muted)',
                                    color: 'var(--muted-foreground)',
                                    border: '1px solid var(--border)',
                                    minHeight: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  OFF
                                </div>
                              ) : (
                                <div 
                                  style={{
                                    borderRadius: 'calc(var(--radius) - 3px)',
                                    padding: '0.25rem 0.15rem',
                                    fontSize: '0.675rem',
                                    fontWeight: 700,
                                    background: `${shiftColor}18`,
                                    color: shiftColor,
                                    border: `1px solid ${shiftColor}50`,
                                    minHeight: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.2rem',
                                    boxShadow: `0 1px 4px ${shiftColor}15`,
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: shiftColor }}></span>
                                  <span>{shiftCode}</span>
                                </div>
                              )
                            ) : (
                              <div 
                                style={{
                                  borderRadius: 'calc(var(--radius) - 3px)',
                                  minHeight: '26px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--muted-foreground)',
                                  fontSize: '0.7rem',
                                  opacity: 0.35,
                                  border: '1px dashed transparent'
                                }}
                                className="empty-cell-hover"
                              >
                                +
                              </div>
                            )}
                          </td>
                        );
                      })}

                    </tr>
                  ))
                )}
              </tbody>

              {/* Bottom Daily Coverage Row */}
              {rosterData && (
                <tfoot>
                  <tr style={{ background: 'var(--muted)', fontWeight: 600 }}>
                    <td 
                      style={{ 
                        position: 'sticky', 
                        left: 0, 
                        background: 'var(--muted)', 
                        zIndex: 10,
                        borderRight: '1px solid var(--border)',
                        padding: '0.6rem 0.95rem',
                        fontSize: '0.75rem',
                        color: 'var(--muted-foreground)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      Staff on Duty
                    </td>
                    {visibleDays.map((day) => {
                      const onDuty = day.working_count;
                      const total = day.total_staff;
                      const isLow = onDuty < 2 && total > 0;

                      return (
                        <td 
                          key={`cov-${day.date}`} 
                          style={{ 
                            textAlign: 'center', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            padding: '0.4rem 0.2rem',
                            borderRight: '1px solid var(--border)',
                            color: isLow ? 'var(--destructive)' : 'var(--primary)'
                          }}
                        >
                          {onDuty}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}

            </table>
          </div>

          {/* ── Quick Assign Popover Modal (Shadcn Dialog) ── */}
          {cellEditPopover && (
            <div className="dialog-overlay" onClick={() => setCellEditPopover(null)}>
              <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
                <div className="dialog-header">
                  <h3 className="dialog-title">Assign Shift Slot</h3>
                  <p className="dialog-description">
                    {cellEditPopover.empName} · {cellEditPopover.date}
                  </p>
                  <button className="dialog-close-btn" aria-label="Close dialog" onClick={() => setCellEditPopover(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {shifts.map((s) => {
                    const isSelected = cellEditPopover.currentShiftId === s.id && !cellEditPopover.currentIsOff;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleAssignCell(s.id, false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius)',
                          border: isSelected ? `1.5px solid ${s.color}` : '1px solid var(--border)',
                          background: isSelected ? `${s.color}18` : 'var(--card)',
                          color: 'var(--foreground)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}60` }}></span>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{s.name}</div>
                            <div className="text-xs text-muted font-mono" style={{ fontSize: '0.7rem' }}>{s.shift_code}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)' }}>
                            {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                          </div>
                          {Boolean(s.is_night_shift) && (
                            <span className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.05rem 0.35rem' }}>
                              🌙 Night Diff
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleAssignCell(null, true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius)',
                      border: cellEditPopover.currentIsOff ? '1.5px solid #64748b' : '1px solid var(--border)',
                      background: cellEditPopover.currentIsOff ? 'rgba(100, 116, 139, 0.2)' : 'var(--card)',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b' }}></span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>Scheduled Off (Weekly Rest)</div>
                        <div className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>Rest Day / Non-working</div>
                      </div>
                    </div>
                    <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>OFF</span>
                  </button>
                </div>

                <div className="dialog-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setCellEditPopover(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 2: SHIFT MASTER DEFINITIONS                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'master' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Shift Timing Master Roster
              </h3>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Pre-configured working hours, overnight night shift allowances, and statutory overtime multipliers.
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setIsShiftModalOpen(true)}>
              <Plus size={14} />
              <span>Create Shift Master</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {shifts.map((s) => (
              <div 
                key={s.id}
                className="stat-card"
                style={{
                  border: `1px solid ${s.color}45`,
                  padding: '1.25rem',
                  gap: '0.85rem'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div 
                      style={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 'var(--radius)', 
                        background: `${s.color}20`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: s.color 
                      }}
                    >
                      {Boolean(s.is_night_shift) ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--foreground)' }}>
                        {s.name}
                      </div>
                      <div className="font-mono text-xs" style={{ color: s.color, fontWeight: 600 }}>
                        {s.shift_code}
                      </div>
                    </div>
                  </div>

                  <span 
                    className={`badge ${Boolean(s.is_night_shift) ? 'badge-secondary' : 'badge-default'}`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {Boolean(s.is_night_shift) ? '🌙 Night Shift' : '☀️ Day Shift'}
                  </span>
                </div>

                {/* Timing Badge */}
                <div 
                  style={{ 
                    background: 'var(--muted)', 
                    border: '1px solid var(--border)', 
                    borderRadius: 'calc(var(--radius) - 2px)', 
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600 }}>
                    <Clock size={14} style={{ color: 'var(--primary)' }} />
                    <span>{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</span>
                  </div>
                  <span className="text-xs text-muted">
                    Break: {s.break_duration_mins}m
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted" style={{ lineHeight: 1.4, margin: 0, minHeight: '38px' }}>
                  {s.description || 'Standard working roster shift.'}
                </p>

                {/* Parameters Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <span className="text-xs text-muted" style={{ fontSize: '0.7rem', display: 'block' }}>Grace Period</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>{s.grace_period_mins} mins</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ fontSize: '0.7rem', display: 'block' }}>Overtime Multiplier</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{s.overtime_multiplier}x</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ fontSize: '0.7rem', display: 'block' }}>Night Allowance</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#8b5cf6' }}>₹{s.night_allowance_amt} / shift</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted" style={{ fontSize: '0.7rem', display: 'block' }}>Status</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm w-100"
                    onClick={() => {
                      setBulkForm(b => ({ ...b, shift_id: s.id }));
                      setIsBulkModalOpen(true);
                    }}
                  >
                    <Zap size={13} />
                    <span>Apply to Staff</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 3: SHIFT SWAPPING HUB                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'swaps' && (
        <div>
          <div className="table-toolbar" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Shift Exchange & Swapping Requests
              </h3>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Peer-to-peer shift swaps require colleague confirmation followed by manager authorization.
              </p>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setIsSwapModalOpen(true)}>
              <Plus size={14} />
              <span>Request Shift Swap</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Swap ID</th>
                  <th>Requester</th>
                  <th>Colleague Exchange</th>
                  <th>Target Date</th>
                  <th>Reason</th>
                  <th>Peer Status</th>
                  <th>Manager Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {swaps.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                      No active shift swap requests found in the ledger.
                    </td>
                  </tr>
                ) : (
                  swaps.map((sw) => {
                    const isColleague = currentUser?.id === sw.receiver_id;
                    const canManagerReview = (isAdmin || isManager) && sw.status === 'Accepted' && sw.manager_status === 'Pending';

                    return (
                      <tr key={sw.id}>
                        <td className="font-mono text-xs" style={{ fontWeight: 600 }}>
                          SWAP-{String(sw.id).padStart(4, '0')}
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="cell-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                              {sw.requester_name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontWeight: 600 }}>{sw.requester_name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="cell-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                              {sw.receiver_name?.charAt(0) || 'U'}
                            </div>
                            <span style={{ fontWeight: 600 }}>{sw.receiver_name}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {sw.date}
                        </td>
                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sw.reason}>
                          <span className="text-xs text-muted">"{sw.reason}"</span>
                        </td>
                        <td>
                          <span 
                            className={`badge ${
                              sw.status === 'Accepted' ? 'badge-success' : 
                              sw.status === 'Declined' ? 'badge-destructive' : 'badge-warning'
                            }`}
                          >
                            {sw.status}
                          </span>
                        </td>
                        <td>
                          <span 
                            className={`badge ${
                              sw.manager_status === 'Approved' ? 'badge-success' : 
                              sw.manager_status === 'Rejected' ? 'badge-destructive' : 'badge-secondary'
                            }`}
                          >
                            {sw.manager_status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {/* Colleague actions */}
                            {isColleague && sw.status === 'Pending' && (
                              <>
                                <button 
                                  type="button" 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handlePeerRespondSwap(sw.id, 'accept')}
                                >
                                  Accept
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handlePeerRespondSwap(sw.id, 'decline')}
                                >
                                  Decline
                                </button>
                              </>
                            )}

                            {/* Manager actions */}
                            {canManagerReview && (
                              <>
                                <button 
                                  type="button" 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReviewSwap(sw.id, 'approve')}
                                >
                                  Sign-off
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-destructive btn-sm"
                                  onClick={() => handleReviewSwap(sw.id, 'reject')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {!isColleague && !canManagerReview && (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TAB 4: OVERTIME & NIGHT DIFFERENTIALS                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'overtime' && (
        <div>
          <div className="table-toolbar" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                Overtime Hours & Night Differential Ledger
              </h3>
              <p className="text-xs text-muted" style={{ margin: '0.2rem 0 0 0' }}>
                Auto-audited overtime calculations linked to monthly payroll disbursements.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleCalculateOvertime}
                title="Recalculate attendance overtime logs"
               aria-label="Recalculate attendance overtime logs">
                <RefreshCw size={14} />
                <span>Audit Attendance</span>
              </button>

              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  const unsyncedIds = overtimeRecords.filter(r => !r.is_payroll_synced).map(r => r.id);
                  if (unsyncedIds.length === 0) {
                    showToast('All overtime records are already synced to payroll');
                    return;
                  }
                  handleSyncToPayroll(unsyncedIds);
                }}
              >
                <DollarSign size={14} />
                <span>Sync with Payroll</span>
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Shift Date</th>
                  <th>Scheduled Shift</th>
                  <th>Actual Clock In/Out</th>
                  <th>OT Hours</th>
                  <th>Night Allowance</th>
                  <th>Total Differential Pay</th>
                  <th>Payroll Status</th>
                </tr>
              </thead>
              <tbody>
                {overtimeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--muted-foreground)' }}>
                      No overtime or night differential records found for this period. Click "Audit Attendance" to compute.
                    </td>
                  </tr>
                ) : (
                  overtimeRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="user-cell">
                          <div className="cell-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                            {r.employee_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="cell-title" style={{ fontSize: '0.825rem' }}>{r.employee_name}</div>
                            <div className="cell-subtitle" style={{ fontSize: '0.7rem' }}>{r.department}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.shift_color || '#10b981' }}></span>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.shift_name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-xs">
                        {r.actual_check_in?.slice(0, 5)} → {r.actual_check_out?.slice(0, 5)}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        +{parseFloat(r.overtime_hours).toFixed(1)} hrs
                      </td>
                      <td style={{ color: '#8b5cf6', fontWeight: 600 }}>
                        {Boolean(r.is_night_shift) ? `₹${parseFloat(r.night_allowance_amt).toFixed(2)}` : '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        ₹{parseFloat(r.total_differential_pay).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${r.is_payroll_synced ? 'badge-success' : 'badge-warning'}`}>
                          {r.is_payroll_synced ? 'Synced to Payroll' : 'Pending Sync'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 1: CREATE SHIFT MASTER (SHADCN DIALOG)                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isShiftModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsShiftModalOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="dialog-header">
              <h3 className="dialog-title">Create New Shift Master</h3>
              <p className="dialog-description">
                Configure timing rules, break deductions, and night differential allowances.
              </p>
              <button className="dialog-close-btn" aria-label="Close dialog" onClick={() => setIsShiftModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveShiftMaster}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Shift Code *</label>
                    <input 
                      type="text" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      placeholder="e.g. ROT-05" 
                      value={shiftForm.shift_code} 
                      onChange={e => setShiftForm({...shiftForm, shift_code: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Shift Name *</label>
                    <input 
                      type="text" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      placeholder="e.g. Critical Care Night Roster" 
                      value={shiftForm.name} 
                      onChange={e => setShiftForm({...shiftForm, name: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Start Time *</label>
                    <input 
                      type="time" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={shiftForm.start_time} 
                      onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>End Time *</label>
                    <input 
                      type="time" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={shiftForm.end_time} 
                      onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Grace Period (Mins)</label>
                    <input 
                      type="number" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={shiftForm.grace_period_mins} 
                      onChange={e => setShiftForm({...shiftForm, grace_period_mins: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Break Duration (Mins)</label>
                    <input 
                      type="number" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={shiftForm.break_duration_mins} 
                      onChange={e => setShiftForm({...shiftForm, break_duration_mins: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Accent Color</label>
                    <input 
                      type="color" 
                      className="search-input" 
                      style={{ padding: '0.2rem', height: '38px', cursor: 'pointer' }} 
                      value={shiftForm.color} 
                      onChange={e => setShiftForm({...shiftForm, color: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Night Allowance (₹)</label>
                    <input 
                      type="number" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={shiftForm.night_allowance_amt} 
                      onChange={e => setShiftForm({...shiftForm, night_allowance_amt: e.target.value})} 
                    />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                  <input 
                    type="checkbox" 
                    checked={Boolean(shiftForm.is_night_shift)} 
                    onChange={e => setShiftForm({...shiftForm, is_night_shift: e.target.checked ? 1 : 0})} 
                    style={{ accentColor: '#8b5cf6', width: 16, height: 16 }} 
                  />
                  <span>Flag as Overnight / Night Shift (applies night differential rules)</span>
                </label>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsShiftModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Shift Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 2: BULK PATTERN ASSIGN (SHADCN DIALOG)                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isBulkModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsBulkModalOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="dialog-header">
              <h3 className="dialog-title">Bulk Shift Pattern Allocator</h3>
              <p className="dialog-description">
                Assign recurring shift schedules across staff members for an entire date range.
              </p>
              <button className="dialog-close-btn" aria-label="Close dialog" onClick={() => setIsBulkModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBulkAssignSubmit}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Shift Definition *</label>
                  <select 
                    className="filter-select w-100" 
                    value={bulkForm.shift_id} 
                    onChange={e => setBulkForm({...bulkForm, shift_id: e.target.value})} 
                    required
                  >
                    <option value="">-- Choose shift master --</option>
                    {shifts.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
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
                      value={bulkForm.start_date} 
                      onChange={e => setBulkForm({...bulkForm, start_date: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>End Date *</label>
                    <input 
                      type="date" 
                      className="search-input" 
                      style={{ paddingLeft: '0.85rem' }} 
                      value={bulkForm.end_date} 
                      onChange={e => setBulkForm({...bulkForm, end_date: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="text-xs text-muted" style={{ fontWeight: 600 }}>Target Staff Members ({bulkForm.user_ids.length} selected)</label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }} 
                      onClick={() => setBulkForm({...bulkForm, user_ids: members.map(m => m.id)})}
                    >
                      Select All
                    </button>
                  </div>
                  <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', background: 'var(--card)' }}>
                    {members.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.35rem', cursor: 'pointer', borderRadius: '4px' }}>
                        <input 
                          type="checkbox" 
                          checked={bulkForm.user_ids.includes(m.id)} 
                          onChange={e => {
                            if (e.target.checked) setBulkForm({...bulkForm, user_ids: [...bulkForm.user_ids, m.id]});
                            else setBulkForm({...bulkForm, user_ids: bulkForm.user_ids.filter(id => id !== m.id)});
                          }} 
                          style={{ accentColor: 'var(--primary)' }} 
                        />
                        <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{m.full_name}</span>
                        <span className="text-xs text-muted">({m.designation})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.825rem', color: 'var(--foreground)' }}>
                  <input 
                    type="checkbox" 
                    checked={bulkForm.include_weekends} 
                    onChange={e => setBulkForm({...bulkForm, include_weekends: e.target.checked})} 
                    style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} 
                  />
                  <span>Include weekends (if unchecked, Sat & Sun will be scheduled OFF)</span>
                </label>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsBulkModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Bulk Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL 3: REQUEST SHIFT SWAP (SHADCN DIALOG)                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isSwapModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsSwapModalOpen(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="dialog-header">
              <h3 className="dialog-title">Request Shift Exchange</h3>
              <p className="dialog-description">
                Propose a shift swap with a colleague for manager sign-off.
              </p>
              <button className="dialog-close-btn" aria-label="Close dialog" onClick={() => setIsSwapModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await shiftsApi.createSwap({
                  requester_id: swapForm.requester_id,
                  receiver_id: swapForm.receiver_id,
                  roster_id: 1,
                  date: swapForm.date,
                  reason: swapForm.reason
                });
                if (res && res.success) {
                  showToast('Shift swap request sent to colleague & manager');
                  setIsSwapModalOpen(false);
                  fetchSwaps();
                }
              } catch (err) {
                showToast('Failed to submit swap', 'error');
              }
            }}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Exchange with Colleague *</label>
                  <select 
                    className="filter-select w-100" 
                    value={swapForm.receiver_id} 
                    onChange={e => setSwapForm({...swapForm, receiver_id: e.target.value})} 
                    required
                  >
                    <option value="">-- Choose colleague --</option>
                    {members.filter(m => m.id !== (currentUser?.id || 1)).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Target Date *</label>
                  <input 
                    type="date" 
                    className="search-input" 
                    style={{ paddingLeft: '0.85rem' }} 
                    value={swapForm.date} 
                    onChange={e => setSwapForm({...swapForm, date: e.target.value})} 
                    required 
                  />
                </div>

                <div>
                  <label className="text-xs text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Reason for Shift Exchange *</label>
                  <textarea 
                    className="search-input" 
                    style={{ padding: '0.65rem 0.85rem', height: 'auto', minHeight: '80px' }} 
                    rows={3} 
                    placeholder="Provide reason for shift exchange request..." 
                    value={swapForm.reason} 
                    onChange={e => setSwapForm({...swapForm, reason: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsSwapModalOpen(false)}>
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

    </div>
  );
}
