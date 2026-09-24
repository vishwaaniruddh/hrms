import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  RefreshCw, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Briefcase,
  ChevronRight,
  Receipt,
  Building2,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { reportsApi } from '../../services/api';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('muster-roll'); // 'muster-roll' | 'payroll-register' | 'leave-liability'
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Common filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Report Data
  const [musterData, setMusterData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [liabilityData, setLiabilityData] = useState(null);

  // Fetch Report Data based on activeTab
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'muster-roll') {
        const params = {
          year: selectedYear,
          month: selectedMonth,
          ...(designationFilter && { designation: designationFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        const res = await reportsApi.getMusterRoll(params);
        if (res.success) {
          setMusterData(res.data);
        } else {
          setError(res.message || 'Failed to load Attendance Muster Roll');
        }
      } else if (activeTab === 'payroll-register') {
        const params = {
          year: selectedYear,
          month: selectedMonth,
          ...(tierFilter && { tier: tierFilter }),
          ...(statusFilter && { status: statusFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        const res = await reportsApi.getPayrollRegister(params);
        if (res.success) {
          setPayrollData(res.data);
        } else {
          setError(res.message || 'Failed to load Payroll Disbursal Register');
        }
      } else if (activeTab === 'leave-liability') {
        const params = {
          year: selectedYear,
          ...(designationFilter && { designation: designationFilter }),
          ...(searchTerm && { search: searchTerm })
        };
        const res = await reportsApi.getLeaveLiability(params);
        if (res.success) {
          setLiabilityData(res.data);
        } else {
          setError(res.message || 'Failed to load Leave Liability Report');
        }
      }
    } catch (err) {
      console.error('Report fetch error:', err);
      setError('An error occurred while fetching report intelligence data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedYear, selectedMonth, designationFilter, tierFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // One-click CSV Export Trigger
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = {
        type: activeTab,
        year: selectedYear,
        month: selectedMonth,
        ...(designationFilter && { designation: designationFilter }),
        ...(tierFilter && { tier: tierFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      const res = await reportsApi.exportCsv(params);
      if (res.success && res.data?.csv) {
        // Trigger direct browser file download
        const blob = new Blob([res.data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.data.filename || `report_${activeTab}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate CSV export.');
      }
    } catch (err) {
      console.error('CSV Export error:', err);
      alert('Error during export generation.');
    } finally {
      setExporting(false);
    }
  };

  // Helper for attendance badge rendering
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'P':
        return <span className="status-pill status-present" title="Present">P</span>;
      case 'HD':
        return <span className="status-pill status-half-day" title="Half Day (0.5)">HD</span>;
      case 'L':
        return <span className="status-pill status-leave" title="Approved Leave">L</span>;
      case 'A':
        return <span className="status-pill status-absent" title="Absent / Loss of Pay">A</span>;
      case 'WO':
        return <span className="status-pill status-weekend" title="Week Off">WO</span>;
      case 'H':
        return <span className="status-pill status-holiday" title="Company Holiday">H</span>;
      default:
        return <span className="status-pill status-empty">-</span>;
    }
  };

  return (
    <div className="reports-container">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 className="text-primary" size={24} />
            <span>Reports & Intelligence Suite</span>
          </h1>
          <p className="page-subtitle">
            Statutory attendance muster rolls, multi-tier payroll disbursal registers, and balance sheet leave liabilities with CSV exports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={fetchReport}
            disabled={loading}
            title="Refresh current report"
           aria-label="Refresh current report">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleExportCsv}
            disabled={exporting || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={15} />
            <span>{exporting ? 'Generating...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="reports-tabs-bar" style={{ marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'muster-roll' ? 'active' : ''}`}
          onClick={() => setActiveTab('muster-roll')}
        >
          <Clock size={16} />
          <span>Attendance Muster Roll (Form T)</span>
        </button>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'payroll-register' ? 'active' : ''}`}
          onClick={() => setActiveTab('payroll-register')}
        >
          <DollarSign size={16} />
          <span>Payroll Disbursal Register</span>
        </button>
        <button
          type="button"
          className={`reports-tab-btn ${activeTab === 'leave-liability' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave-liability')}
        >
          <ShieldCheck size={16} />
          <span>Leave Liability & Accruals</span>
        </button>
      </div>

      {/* KPI Cards (Compact Neon Gradients) */}
      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        {activeTab === 'muster-roll' && musterData && (
          <>
            <div className="stat-card gradient-blue">
              <div className="stat-header">
                <span className="stat-title">Active Personnel</span>
                <Users size={16} />
              </div>
              <div className="stat-value">{musterData.kpis.total_employees}</div>
              <div className="stat-desc">Staff enrolled in payroll cycle</div>
            </div>

            <div className="stat-card gradient-emerald">
              <div className="stat-header">
                <span className="stat-title">Avg Attendance Rate</span>
                <CheckCircle2 size={16} />
              </div>
              <div className="stat-value">{musterData.kpis.avg_attendance_rate}%</div>
              <div className="stat-desc">{musterData.kpis.total_mandays} total man-days logged</div>
            </div>

            <div className="stat-card gradient-purple">
              <div className="stat-header">
                <span className="stat-title">Leaves Taken</span>
                <Calendar size={16} />
              </div>
              <div className="stat-value">{musterData.kpis.total_leaves_taken} Days</div>
              <div className="stat-desc">Approved statutory & casual leaves</div>
            </div>

            <div className="stat-card gradient-amber">
              <div className="stat-header">
                <span className="stat-title">Absent / LOP Days</span>
                <AlertCircle size={16} />
              </div>
              <div className="stat-value">{musterData.kpis.total_absent_lop} Days</div>
              <div className="stat-desc">Loss of Pay deductions incurred</div>
            </div>
          </>
        )}

        {activeTab === 'payroll-register' && payrollData && (
          <>
            <div className="stat-card gradient-blue">
              <div className="stat-header">
                <span className="stat-title">Gross Payroll Payout</span>
                <DollarSign size={16} />
              </div>
              <div className="stat-value">${Number(payrollData.kpis.total_gross).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-desc">{payrollData.meta.records} employee disbursements</div>
            </div>

            <div className="stat-card gradient-purple">
              <div className="stat-header">
                <span className="stat-title">Statutory Deductions</span>
                <Receipt size={16} />
              </div>
              <div className="stat-value">${Number(payrollData.kpis.total_deductions).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-desc">EPF, TDS, and insurance remittances</div>
            </div>

            <div className="stat-card gradient-emerald">
              <div className="stat-header">
                <span className="stat-title">Net Disbursed</span>
                <CheckCircle2 size={16} />
              </div>
              <div className="stat-value">${Number(payrollData.kpis.net_disbursed).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-desc">Transferred to employee accounts</div>
            </div>

            <div className="stat-card gradient-amber">
              <div className="stat-header">
                <span className="stat-title">Pending Disbursal</span>
                <Clock size={16} />
              </div>
              <div className="stat-value">${Number(payrollData.kpis.pending_disbursal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-desc">Disbursal progress: {payrollData.kpis.progress_rate}%</div>
            </div>
          </>
        )}

        {activeTab === 'leave-liability' && liabilityData && (
          <>
            <div className="stat-card gradient-amber">
              <div className="stat-header">
                <span className="stat-title">Balance Sheet Liability</span>
                <DollarSign size={16} />
              </div>
              <div className="stat-value">${Number(liabilityData.kpis.total_financial_liability).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="stat-desc">Actuarial encashment provision (USD)</div>
            </div>

            <div className="stat-card gradient-purple">
              <div className="stat-header">
                <span className="stat-title">Encashable Days</span>
                <ShieldCheck size={16} />
              </div>
              <div className="stat-value">{liabilityData.kpis.total_encashable_days} Days</div>
              <div className="stat-desc">Statutory earned/paid leave reserve</div>
            </div>

            <div className="stat-card gradient-blue">
              <div className="stat-header">
                <span className="stat-title">Total Leave Reserve</span>
                <Calendar size={16} />
              </div>
              <div className="stat-value">{liabilityData.kpis.total_leave_reserve} Days</div>
              <div className="stat-desc">Combined CL + SL + PL available</div>
            </div>

            <div className="stat-card gradient-emerald">
              <div className="stat-header">
                <span className="stat-title">Days Consumed</span>
                <Users size={16} />
              </div>
              <div className="stat-value">{liabilityData.kpis.total_days_consumed} Days</div>
              <div className="stat-desc">Absences availed this financial year</div>
            </div>
          </>
        )}
      </div>

      {/* Single-Row Filter Toolbar */}
      <div className="reports-toolbar-card" style={{ marginBottom: '1.25rem' }}>
        <div className="reports-toolbar-row">
          {/* Search box */}
          <div className="search-input-wrapper" style={{ flex: '1 1 240px', minWidth: '180px' }}>
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search employee name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Month selector (for Muster Roll & Payroll) */}
          {(activeTab === 'muster-roll' || activeTab === 'payroll-register') && (
            <div style={{ width: '135px' }}>
              <select
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year selector */}
          <div style={{ width: '105px' }}>
            <select
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Tab-specific filters */}
          {activeTab === 'muster-roll' && (
            <div style={{ width: '145px' }}>
              <select
                className="form-control"
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Accountant">Accountant</option>
                <option value="Salesman">Salesman</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>
          )}

          {activeTab === 'payroll-register' && (
            <>
              <div style={{ width: '145px' }}>
                <select
                  className="form-control"
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                >
                  <option value="">All Tiers</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary / Contract</option>
                  <option value="Intern">Intern (Stipend)</option>
                </select>
              </div>

              <div style={{ width: '130px' }}>
                <select
                  className="form-control"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'leave-liability' && (
            <div style={{ width: '150px' }}>
              <select
                className="form-control"
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
              >
                <option value="">All Designations</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Accountant">Accountant</option>
                <option value="Salesman">Salesman</option>
              </select>
            </div>
          )}

          {/* Reset Filters */}
          {(searchTerm || designationFilter || tierFilter || statusFilter) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchTerm('');
                setDesignationFilter('');
                setTierFilter('');
                setStatusFilter('');
              }}
              title="Reset all filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="alert-card alert-danger" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: Attendance Muster Roll Matrix View */}
      {activeTab === 'muster-roll' && (
        <div className="card-custom">
          {/* Muster Roll Legend */}
          <div className="muster-legend-bar">
            <div className="muster-legend-title">Muster Key / Symbols:</div>
            <div className="muster-legend-items">
              <span className="legend-item"><span className="status-pill status-present">P</span> Present</span>
              <span className="legend-item"><span className="status-pill status-half-day">HD</span> Half Day (0.5)</span>
              <span className="legend-item"><span className="status-pill status-leave">L</span> Leave</span>
              <span className="legend-item"><span className="status-pill status-absent">A</span> Absent / LOP</span>
              <span className="legend-item"><span className="status-pill status-weekend">WO</span> Week Off</span>
              <span className="legend-item"><span className="status-pill status-holiday">H</span> Holiday</span>
            </div>
          </div>

          {loading ? (
            <div className="table-loading-state">
              <RefreshCw className="spin" size={24} />
              <span>Compiling muster roll matrix...</span>
            </div>
          ) : !musterData || musterData.rows.length === 0 ? (
            <div className="table-empty-state">
              <Users size={32} />
              <p>No employee attendance records found for the selected period.</p>
            </div>
          ) : (
            <div className="table-responsive muster-table-scroll">
              <table className="table custom-table muster-table">
                <thead>
                  <tr>
                    {/* Sticky Employee Columns */}
                    <th className="sticky-col sticky-col-1" style={{ minWidth: '95px' }}>Emp Code</th>
                    <th className="sticky-col sticky-col-2" style={{ minWidth: '180px' }}>Employee Name</th>
                    <th style={{ minWidth: '120px' }}>Role</th>

                    {/* Day-by-Day Columns (1 to N) */}
                    {musterData.meta.days_meta.map((dm) => (
                      <th 
                        key={dm.day} 
                        className={`day-col-header ${dm.is_weekend ? 'day-weekend' : ''} ${dm.holiday_name ? 'day-holiday' : ''} ${dm.is_today ? 'day-today' : ''}`}
                        title={dm.holiday_name ? `Holiday: ${dm.holiday_name}` : `${dm.date} (${dm.day_name})`}
                      >
                        <div className="day-num">{dm.day}</div>
                        <div className="day-name">{dm.day_name.slice(0, 2)}</div>
                      </th>
                    ))}

                    {/* Summary Totals */}
                    <th className="summary-col" title="Full present days">P</th>
                    <th className="summary-col" title="Half days">HD</th>
                    <th className="summary-col" title="Leaves taken">L</th>
                    <th className="summary-col" title="Loss of Pay / Absences">A</th>
                    <th className="summary-col" title="Week Offs">WO</th>
                    <th className="summary-col" title="Holidays">H</th>
                    <th className="summary-col" title="Total valid work days">Work</th>
                    <th className="summary-col-rate" style={{ minWidth: '120px' }}>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {musterData.rows.map((row) => (
                    <tr key={row.employee.id}>
                      {/* Sticky Employee Columns */}
                      <td className="sticky-col sticky-col-1">
                        <span className="code-badge">{row.employee.code}</span>
                      </td>
                      <td className="sticky-col sticky-col-2">
                        <div className="emp-cell">
                          <span className="emp-name">{row.employee.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="role-chip">{row.employee.designation}</span>
                      </td>

                      {/* Day Columns */}
                      {musterData.meta.days_meta.map((dm) => {
                        const punch = row.punches[dm.day];
                        const status = punch ? punch.status : '-';
                        return (
                          <td 
                            key={dm.day} 
                            className={`day-cell ${dm.is_weekend ? 'cell-weekend' : ''} ${dm.holiday_name ? 'cell-holiday' : ''}`}
                            title={punch ? punch.detail : ''}
                          >
                            {renderStatusBadge(status)}
                          </td>
                        );
                      })}

                      {/* Summary Cells */}
                      <td className="summary-cell font-bold text-success">{row.present_days}</td>
                      <td className="summary-cell text-warning">{row.half_days}</td>
                      <td className="summary-cell text-purple">{row.leave_days}</td>
                      <td className="summary-cell font-bold text-danger">{row.absent_days}</td>
                      <td className="summary-cell text-muted">{row.weekend_days}</td>
                      <td className="summary-cell text-cyan">{row.holiday_days}</td>
                      <td className="summary-cell font-medium">{row.working_days}</td>
                      <td className="summary-cell-rate">
                        <div className="rate-wrapper">
                          <span className={`rate-text ${row.attendance_rate >= 90 ? 'text-success' : row.attendance_rate >= 75 ? 'text-warning' : 'text-danger'}`}>
                            {row.attendance_rate}%
                          </span>
                          <div className="rate-track">
                            <div 
                              className={`rate-fill ${row.attendance_rate >= 90 ? 'fill-success' : row.attendance_rate >= 75 ? 'fill-warning' : 'fill-danger'}`}
                              style={{ width: `${Math.min(100, row.attendance_rate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Payroll Disbursal Register */}
      {activeTab === 'payroll-register' && (
        <div className="card-custom">
          {loading ? (
            <div className="table-loading-state">
              <RefreshCw className="spin" size={24} />
              <span>Compiling payroll ledger registers...</span>
            </div>
          ) : !payrollData || payrollData.rows.length === 0 ? (
            <div className="table-empty-state">
              <DollarSign size={32} />
              <p>No payroll records found for the selected pay period. Generate salaries in Finance & Payroll first.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table custom-table whitespace-nowrap">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Employee Name</th>
                    <th>Tier</th>
                    <th>Work Days</th>
                    <th>Basic / Stipend</th>
                    <th>HRA</th>
                    <th>Medical Allow.</th>
                    <th>Other Allow.</th>
                    <th className="col-highlight-gross">Gross Earnings</th>
                    <th>EPF / PF</th>
                    <th>TDS / Tax</th>
                    <th>Insurance</th>
                    <th>LOP Deduct.</th>
                    <th className="col-highlight-deduct">Total Deductions</th>
                    <th className="col-highlight-net">Net Disbursal</th>
                    <th>Status</th>
                    <th>Payment Mode</th>
                    <th>Reference / Ref #</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.rows.map((r) => (
                    <tr key={r.id}>
                      <td><span className="code-badge">{r.employee_code}</span></td>
                      <td>
                        <div className="emp-cell">
                          <span className="emp-name">{r.employee_name}</span>
                          <span className="emp-role">{r.designation}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tier-badge tier-${r.employment_type.toLowerCase()}`}>
                          {r.employment_type}
                        </span>
                      </td>
                      <td className="text-center font-medium">{r.working_days}</td>
                      <td>${Number(r.basic_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>${Number(r.hra_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>${Number(r.medical_allowance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>${Number(r.other_allowances).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="col-highlight-gross font-bold text-success">
                        ${Number(r.gross_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-danger">-${Number(r.pf_deduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-danger">-${Number(r.tax_deduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-danger">-${Number(r.insurance_deduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-danger">-${Number(r.lop_deduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="col-highlight-deduct font-bold text-danger">
                        -${Number(r.total_deductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="col-highlight-net font-extrabold text-primary">
                        ${Number(r.net_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`disbursal-status-badge status-${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-muted">{r.payment_method}</td>
                      <td>
                        <span className="ref-badge" title={r.transaction_ref}>
                          {r.transaction_ref !== 'N/A' ? r.transaction_ref : 'Pending Transfer'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Leave Liability & Accrual Balance Register */}
      {activeTab === 'leave-liability' && (
        <div className="card-custom">
          {loading ? (
            <div className="table-loading-state">
              <RefreshCw className="spin" size={24} />
              <span>Computing leave liabilities and actuarial provisions...</span>
            </div>
          ) : !liabilityData || liabilityData.rows.length === 0 ? (
            <div className="table-empty-state">
              <ShieldCheck size={32} />
              <p>No active employees found to evaluate leave liabilities.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table custom-table whitespace-nowrap">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Employee Name</th>
                    <th>Tier</th>
                    <th>Monthly Base</th>
                    <th>Daily Wage</th>
                    <th title="Casual Leave: Quota / Used / Available">CL (Q / U / Avail)</th>
                    <th title="Sick Leave: Quota / Used / Available">SL (Q / U / Avail)</th>
                    <th title="Paid Leave: Quota / Used / Available">PL (Q / U / Avail)</th>
                    <th>Total Reserve</th>
                    <th className="col-highlight-encashable">Encashable Days</th>
                    <th className="col-highlight-liability">Financial Liability ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {liabilityData.rows.map((r) => (
                    <tr key={r.user_id}>
                      <td><span className="code-badge">{r.employee_code}</span></td>
                      <td>
                        <div className="emp-cell">
                          <span className="emp-name">{r.employee_name}</span>
                          <span className="emp-role">{r.designation}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tier-badge tier-${r.employment_type.toLowerCase()}`}>
                          {r.employment_type}
                        </span>
                      </td>
                      <td className="font-medium">${Number(r.monthly_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="text-muted font-mono">${Number(r.daily_rate).toFixed(2)}/day</td>
                      <td>
                        <span className="balance-fraction">
                          <span className="quota">{r.cl_quota}</span> / 
                          <span className="used">{r.cl_used}</span> / 
                          <span className="avail font-bold text-success">{r.cl_available}</span>
                        </span>
                      </td>
                      <td>
                        <span className="balance-fraction">
                          <span className="quota">{r.sl_quota}</span> / 
                          <span className="used">{r.sl_used}</span> / 
                          <span className="avail font-bold text-success">{r.sl_available}</span>
                        </span>
                      </td>
                      <td>
                        <span className="balance-fraction">
                          <span className="quota">{r.pl_quota}</span> / 
                          <span className="used">{r.pl_used}</span> / 
                          <span className="avail font-bold text-success">{r.pl_available}</span>
                        </span>
                      </td>
                      <td className="font-semibold text-center">{r.total_available} Days</td>
                      <td className="col-highlight-encashable font-bold text-center text-purple">
                        {r.encashable_days} Days
                      </td>
                      <td className="col-highlight-liability font-extrabold text-amber">
                        ${Number(r.financial_liability).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
