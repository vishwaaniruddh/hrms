import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  Clock, 
  Users, 
  Building2, 
  Briefcase, 
  Pencil, 
  Trash2, 
  Download, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  PartyPopper,
  Sun,
  ShieldCheck,
  Coffee,
  CalendarCheck
} from 'lucide-react';
import { holidaysApi } from '../../services/api';

const HOLIDAY_TYPES = ['All Types', 'Statutory', 'Optional', 'Observance'];
const YEARS = [2025, 2026, 2027];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Holidays() {
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'schedule'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(9); // 1-12, default September (9)
  
  // Stats & Master Data
  const [stats, setStats] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calendarFeed, setCalendarFeed] = useState({ events_by_day: {}, holidays: [], leaves: [] });
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Filters for Schedule Tab
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null); // { date, events, dayOfWeek }
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    holiday_date: '2026-09-01',
    type: 'Statutory',
    is_mandatory_off: 1,
    description: ''
  });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await holidaysApi.getStats(selectedYear);
      setStats(res.data || {});
    } catch (err) {
      console.error('Failed to fetch holiday stats', err);
    }
  }, [selectedYear]);

  // Fetch Holidays Schedule
  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year: selectedYear, per_page: 50 };
      if (typeFilter !== 'All Types') params.type = typeFilter;
      if (search) params.search = search;
      const res = await holidaysApi.getAll(params);
      setHolidays(res.data || []);
    } catch (err) {
      console.error('Failed to fetch holidays schedule', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, typeFilter, search]);

  // Fetch Calendar Feed for (selectedYear, selectedMonth)
  const fetchCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const res = await holidaysApi.getCalendar(selectedYear, selectedMonth);
      setCalendarFeed(res.data || { events_by_day: {}, holidays: [], leaves: [] });
    } catch (err) {
      console.error('Failed to fetch calendar feed', err);
    } finally {
      setCalendarLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchHolidays();
    } else {
      fetchCalendar();
    }
  }, [activeTab, fetchHolidays, fetchCalendar]);

  // Calendar month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  };

  // Month date computations
  const monthName = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1, 1);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonth]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
    const totalDays = lastDayOfMonth.getDate();

    // Day of week for first day (0 = Sun, 1 = Mon ... 6 = Sat)
    // We want Mon as 0, Sun as 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Fill preceding empty padding days from previous month
    const prevMonthLastDate = new Date(selectedYear, selectedMonth - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDate - i,
        dateStr: null,
        isCurrentMonth: false
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dt = new Date(selectedYear, selectedMonth - 1, d);
      const dayOfWeekIdx = dt.getDay(); // 0 is Sun, 6 is Sat
      const isWeekend = (dayOfWeekIdx === 0 || dayOfWeekIdx === 6);
      const isToday = (dateStr === todayStr);

      days.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isWeekend,
        isToday,
        events: calendarFeed.events_by_day[dateStr] || []
      });
    }

    // Fill remaining days to complete 35 or 42 grid slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let r = 1; r <= remaining; r++) {
      days.push({
        dayNumber: r,
        dateStr: null,
        isCurrentMonth: false
      });
    }

    return days;
  }, [selectedYear, selectedMonth, calendarFeed]);

  // Form submit for new / edit holiday
  const handleSaveHoliday = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editHoliday) {
        await holidaysApi.update(editHoliday.id, formData);
      } else {
        await holidaysApi.create(formData);
      }
      setShowAddModal(false);
      setEditHoliday(null);
      setFormData({
        name: '',
        holiday_date: `${selectedYear}-09-01`,
        type: 'Statutory',
        is_mandatory_off: 1,
        description: ''
      });
      fetchStats();
      fetchHolidays();
      fetchCalendar();
    } catch (err) {
      alert(err.error || 'Failed to save holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Are you sure you want to remove this holiday from the company work calendar?')) return;
    try {
      await holidaysApi.delete(id);
      fetchStats();
      fetchHolidays();
      fetchCalendar();
    } catch (err) {
      alert(err.error || 'Failed to delete holiday');
    }
  };

  const formatDisplayDate = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportHolidaysCSV = () => {
    if (holidays.length === 0) return;
    const headers = ['ID', 'Holiday Name', 'Date', 'Day of Week', 'Classification', 'Mandatory Off', 'Description'];
    const rows = holidays.map(h => [
      h.id,
      `"${h.name}"`,
      h.holiday_date,
      h.day_name,
      h.type,
      h.is_mandatory_off ? 'Yes' : 'No',
      `"${h.description || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `company_holidays_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Company Holidays & Work Calendar</h1>
          <p>Annual statutory holiday schedule, floating observances, and interactive team leave calendar.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportHolidaysCSV} title="Export holiday schedule to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary" onClick={() => {
            setEditHoliday(null);
            setFormData({
              name: '',
              holiday_date: `${selectedYear}-09-01`,
              type: 'Statutory',
              is_mandatory_off: 1,
              description: ''
            });
            setShowAddModal(true);
          }}>
            <Plus size={15} />
            <span>Schedule Holiday</span>
          </button>
        </div>
      </div>

      {/* 4 Radiant KPI Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Statutory Holidays ({selectedYear})</span>
            <div className="stat-icon-wrapper">
              <CalendarCheck size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.statutory_count || 0} Days</div>
          <div className="stat-subtext">
            <span>{stats.optional_count || 0} Optional</span>
            <span style={{ opacity: 0.6 }}> • </span>
            <span>{stats.observance_count || 0} Observances</span>
          </div>
        </div>

        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">Next Upcoming Holiday</span>
            <div className="stat-icon-wrapper">
              <PartyPopper size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
            {stats.next_holiday?.name || 'Year Completed'}
          </div>
          <div className="stat-subtext">
            {stats.next_holiday ? (
              <>
                <span className="stat-trend-up">{formatDisplayDate(stats.next_holiday.holiday_date)}</span>
                <span style={{ marginLeft: '4px' }}>
                  ({stats.next_holiday.days_away === 0 ? 'Today!' : `in ${stats.next_holiday.days_away} days`})
                </span>
              </>
            ) : (
              <span>All statutory days passed</span>
            )}
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Working Days ({new Date().toLocaleString('en-US', { month: 'short' })})</span>
            <div className="stat-icon-wrapper">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.working_days_month || 21} Days</div>
          <div className="stat-subtext">
            <span>Excludes standard weekends & off-days</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Team Members On Leave</span>
            <div className="stat-icon-wrapper">
              <Users size={14} />
            </div>
          </div>
          <div className="stat-value">{stats.team_on_leave_month || 0} Staff</div>
          <div className="stat-subtext">
            <span className="stat-trend-down">Approved absences</span>
            <span>in current calendar month</span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.9rem', borderBottom: '1px solid hsl(var(--border))', paddingBottom: '0.5rem' }}>
        <button
          className={`tabs-trigger${activeTab === 'calendar' ? ' active' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem', fontWeight: 600, borderRadius: '6px' }}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarDays size={14} style={{ marginRight: '6px' }} />
          <span>Interactive Team Work Calendar</span>
        </button>
        <button
          className={`tabs-trigger${activeTab === 'schedule' ? ' active' : ''}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.84rem', fontWeight: 600, borderRadius: '6px' }}
          onClick={() => setActiveTab('schedule')}
        >
          <CalendarCheck size={14} style={{ marginRight: '6px' }} />
          <span>Statutory Holidays Master Schedule</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 1: INTERACTIVE TEAM WORK CALENDAR VIEW                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Calendar Navigation & Month Control Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.65rem 0.95rem',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button className="btn btn-outline btn-sm btn-icon" aria-label="Previous month" title="Previous month" onClick={handlePrevMonth} >
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, minWidth: '160px', textAlign: 'center' }}>
                {monthName}
              </h2>
              <button className="btn btn-outline btn-sm btn-icon" aria-label="Next month" title="Next month" onClick={handleNextMonth} >
                <ChevronRight size={16} />
              </button>

              <button className="btn btn-outline btn-sm" onClick={handleJumpToToday} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                Today
              </button>
            </div>

            {/* Calendar Legend Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'hsl(280, 85%, 65%)' }}></span>
                <span className="text-muted">Statutory Holiday</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'hsl(215, 90%, 55%)' }}></span>
                <span className="text-muted">Optional / Floating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'hsl(142, 70%, 45%)' }}></span>
                <span className="text-muted">Company Observance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: 'hsl(38, 92%, 50%)' }}></span>
                <span className="text-muted">Staff Out of Office</span>
              </div>
            </div>
          </div>

          {/* 7-Column Calendar Grid */}
          <div style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {/* Weekday Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid hsl(var(--border))',
              background: 'hsl(var(--muted)/0.5)'
            }}>
              {DAYS_OF_WEEK.map((d, i) => (
                <div key={d} style={{
                  padding: '0.55rem 0.5rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: (i === 5 || i === 6) ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))'
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              minHeight: '520px'
            }}>
              {calendarDays.map((slot, idx) => {
                const hasHoliday = slot.events?.some(e => e.type === 'holiday');
                const holidayEvent = slot.events?.find(e => e.type === 'holiday');
                const leaveEvents = slot.events?.filter(e => e.type === 'leave') || [];

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (slot.isCurrentMonth) {
                        setSelectedDayEvents({
                          dateStr: slot.dateStr,
                          dayNumber: slot.dayNumber,
                          events: slot.events || []
                        });
                      }
                    }}
                    style={{
                      minHeight: '100px',
                      padding: '0.45rem',
                      borderRight: (idx % 7 !== 6) ? '1px solid hsl(var(--border))' : 'none',
                      borderBottom: (idx < calendarDays.length - 7) ? '1px solid hsl(var(--border))' : 'none',
                      background: !slot.isCurrentMonth 
                        ? 'hsl(var(--muted) / 0.15)' 
                        : slot.isWeekend 
                          ? 'hsl(var(--muted) / 0.25)' 
                          : 'hsl(var(--card))',
                      cursor: slot.isCurrentMonth ? 'pointer' : 'default',
                      position: 'relative',
                      transition: 'background 0.15s ease'
                    }}
                    className={slot.isCurrentMonth ? 'calendar-day-cell' : ''}
                  >
                    {/* Day Number Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: slot.isToday ? 800 : 600,
                        color: !slot.isCurrentMonth 
                          ? 'hsl(var(--muted-foreground) / 0.4)' 
                          : slot.isToday 
                            ? 'hsl(var(--primary))' 
                            : 'hsl(var(--foreground))',
                        width: slot.isToday ? '22px' : 'auto',
                        height: slot.isToday ? '22px' : 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: slot.isToday ? 'hsl(var(--primary)/0.15)' : 'transparent',
                        border: slot.isToday ? '1px solid hsl(var(--primary))' : 'none'
                      }}>
                        {slot.dayNumber}
                      </span>

                      {hasHoliday && (
                        <span style={{
                          fontSize: '0.65rem',
                          background: holidayEvent?.category === 'Statutory' ? 'hsl(280, 85%, 65% / 0.2)' : 'hsl(142, 70%, 45% / 0.2)',
                          color: holidayEvent?.category === 'Statutory' ? 'hsl(280, 95%, 75%)' : 'hsl(142, 80%, 65%)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}>
                          OFF
                        </span>
                      )}
                    </div>

                    {/* Day Event Chips */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                      {/* Holiday Badge */}
                      {holidayEvent && (
                        <div style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: holidayEvent.category === 'Statutory'
                            ? 'linear-gradient(135deg, hsl(280, 75%, 30%), hsl(280, 85%, 20%))'
                            : holidayEvent.category === 'Optional'
                              ? 'linear-gradient(135deg, hsl(215, 80%, 30%), hsl(215, 90%, 20%))'
                              : 'linear-gradient(135deg, hsl(142, 60%, 25%), hsl(142, 70%, 15%))',
                          border: `1px solid ${
                            holidayEvent.category === 'Statutory' ? 'hsl(280, 85%, 65%/0.4)' :
                            holidayEvent.category === 'Optional' ? 'hsl(215, 90%, 55%/0.4)' : 'hsl(142, 70%, 45%/0.4)'
                          }`,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }} title={holidayEvent.title}>
                          🎉 {holidayEvent.title}
                        </div>
                      )}

                      {/* Team Leave Badges */}
                      {leaveEvents.slice(0, 2).map((le, lIdx) => (
                        <div key={lIdx} style={{
                          fontSize: '0.68rem',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          background: 'hsl(var(--muted)/0.8)',
                          borderLeft: '2px solid hsl(38, 92%, 50%)',
                          color: 'hsl(var(--foreground))',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }} title={`${le.member_name} - ${le.leave_type_name} (${le.reason || 'No reason provided'})`}>
                          <span>🏖️</span>
                          <span>{le.member_name.split(' ')[0]}</span>
                          <span className="text-muted" style={{ fontSize: '0.62rem' }}>({le.leave_type_code})</span>
                        </div>
                      ))}

                      {leaveEvents.length > 2 && (
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', paddingLeft: '4px' }}>
                          +{leaveEvents.length - 2} more out
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* TAB 2: STATUTORY HOLIDAYS MASTER SCHEDULE                  */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <>
          {/* Unified Filter Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap'
          }}>
            {/* Year & Classification Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ height: '34px', fontSize: '0.8rem', width: '95px' }}
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <div className="tabs-list" style={{ height: '34px', padding: '3px' }}>
                {HOLIDAY_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`tabs-trigger${typeFilter === t ? ' active' : ''}`}
                    style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={() => setTypeFilter(t)}
                  >
                    <span>{t}</span>
                    <span className="tab-count">
                      {t === 'All Types' ? holidays.length : holidays.filter(h => h.type === t).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '240px' }}>
              <div className="search-input-wrapper" style={{ maxWidth: '240px', minWidth: '180px' }}>
                <Search className="search-input-icon" size={13} />
                <input
                  type="text"
                  className="search-input"
                  style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
                  placeholder="Search holiday name..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>

              <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                <strong>{holidays.length}</strong> holidays
              </span>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="table-container">
            {loading ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : holidays.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                <CalendarCheck size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <h3>No company holidays scheduled</h3>
                <p className="text-sm text-muted">Use the "Schedule Holiday" button to configure official days off.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Holiday Name</th>
                    <th>Official Date</th>
                    <th>Day of Week</th>
                    <th>Classification</th>
                    <th>Mandatory Off</th>
                    <th>Policy Note / Description</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => {
                    const isStatutory = h.type === 'Statutory';
                    const isOptional = h.type === 'Optional';

                    return (
                      <tr key={h.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1rem' }}>🎉</span>
                            <div>
                              <div style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{h.name}</div>
                              <div className="text-xs text-muted">Ref: HOL-{h.id.toString().padStart(4, '0')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-sm" style={{ fontWeight: 600 }}>
                          {formatDisplayDate(h.holiday_date)}
                        </td>
                        <td className="font-mono text-sm text-muted">{h.day_name}</td>
                        <td>
                          <span className={`badge ${
                            isStatutory ? 'badge-primary' : isOptional ? 'badge-info' : 'badge-success'
                          }`} style={{
                            borderColor: isStatutory ? 'hsl(280, 85%, 65%)' : undefined,
                            color: isStatutory ? 'hsl(280, 95%, 75%)' : undefined
                          }}>
                            {h.type}
                          </span>
                        </td>
                        <td>
                          {h.is_mandatory_off ? (
                            <span className="badge badge-success">
                              <span className="badge-dot"></span>
                              Mandatory Off
                            </span>
                          ) : (
                            <span className="badge badge-outline">
                              Floating Choice
                            </span>
                          )}
                        </td>
                        <td className="text-xs text-muted" style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                          {h.description || 'Corporate recognized public observance.'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0 0.55rem', fontSize: '0.74rem' }}
                              onClick={() => {
                                setEditHoliday(h);
                                setFormData({
                                  name: h.name,
                                  holiday_date: h.holiday_date,
                                  type: h.type,
                                  is_mandatory_off: h.is_mandatory_off,
                                  description: h.description || ''
                                });
                                setShowAddModal(true);
                              }}
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="btn btn-ghost btn-sm btn-icon" aria-label="Delete holiday" title="Delete holiday"
                              style={{ color: 'hsl(var(--destructive))' }}

                              onClick={() => handleDeleteHoliday(h.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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
      {/* MODAL 1: SCHEDULE / EDIT HOLIDAY MODAL                    */}
      {/* ────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="dialog-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div>
                <h2 className="dialog-title">{editHoliday ? 'Edit Company Holiday' : 'Schedule Company Holiday'}</h2>
                <p className="dialog-description">Configure official statutory holidays, optional leaves, or team observances.</p>
              </div>
              <button type="button" className="dialog-close-btn" aria-label="Close dialog" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday}>
              <div className="dialog-body">
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Holiday Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Independence Day"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Holiday Date <span className="required">*</span></label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.holiday_date}
                      onChange={e => setFormData({ ...formData, holiday_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Classification <span className="required">*</span></label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="Statutory">Statutory (Public)</option>
                      <option value="Optional">Optional / Floating</option>
                      <option value="Observance">Company Observance</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.is_mandatory_off)}
                      onChange={e => setFormData({ ...formData, is_mandatory_off: e.target.checked ? 1 : 0 })}
                    />
                    <span>Full Paid Day Off for Entire Organization</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Policy Context</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Short holiday description or celebration guidelines"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editHoliday ? 'Update Holiday' : 'Add to Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* DRAWER / MODAL: DAY INSPECTOR                             */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedDayEvents && (
        <div className="dialog-overlay" onClick={() => setSelectedDayEvents(null)}>
          <div className="dialog-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <h2 className="dialog-title">
                    📅 {formatDisplayDate(selectedDayEvents.dateStr)}
                  </h2>
                  <p className="dialog-description">Day schedule, holidays, and team out-of-office roster.</p>
                </div>
                <button type="button" className="dialog-close-btn" aria-label="Close dialog" onClick={() => setSelectedDayEvents(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="dialog-body">
              {selectedDayEvents.events.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
                  <Coffee size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Standard Working Day</h3>
                  <p className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>No public holidays or scheduled team absences for this date.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Holidays */}
                  {selectedDayEvents.events.filter(e => e.type === 'holiday').map((h, i) => (
                    <div key={i} style={{
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, hsl(280, 50%, 15%), hsl(280, 60%, 10%))',
                      border: '1px solid hsl(280, 85%, 65% / 0.3)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'hsl(280, 95%, 75%)' }}>
                          🎉 {h.title}
                        </span>
                        <span className="badge badge-primary">{h.category}</span>
                      </div>
                      <p className="text-xs text-muted">
                        {h.description || 'Statutory company-wide recognized holiday.'}
                      </p>
                      <div style={{ marginTop: '0.45rem', fontSize: '0.72rem', color: 'hsl(var(--primary))' }}>
                        {h.is_mandatory_off ? '✓ Company Offices Closed' : '• Optional / Floating Attendance'}
                      </div>
                    </div>
                  ))}

                  {/* Team Absences */}
                  {selectedDayEvents.events.filter(e => e.type === 'leave').length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Team Members Out of Office
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selectedDayEvents.events.filter(e => e.type === 'leave').map((le, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.85rem',
                            background: 'hsl(var(--muted)/0.3)',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{le.member_name}</div>
                              <div className="text-xs text-muted">{le.designation} • Reason: {le.reason}</div>
                            </div>
                            <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                              {le.leave_type_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-primary" onClick={() => setSelectedDayEvents(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
