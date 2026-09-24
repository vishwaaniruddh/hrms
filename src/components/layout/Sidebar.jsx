import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  DollarSign, 
  LayoutDashboard, 
  Calendar, 
  CalendarDays, 
  FileText, 
  Briefcase, 
  Laptop, 
  BarChart3, 
  Settings, 
  Search, 
  ChevronDown, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  Receipt, 
  Sliders, 
  UserCheck, 
  Inbox,
  User,
  Target,
  Award,
  MessageSquare,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onOpenSearch }) {
  const { currentUser, isEmployee, isManager, isAdmin } = useAuth();

  // Dynamically compute nav sections tailored strictly to current role
  const navSections = React.useMemo(() => {
    if (isEmployee) {
      return [
        {
          group: 'Employee Portal',
          items: [
            { to: '/hrms/ess', icon: LayoutDashboard, label: 'My Dashboard', badge: 'Active', badgeType: 'emerald' },
            { to: '/hrms/attendance', icon: Clock, label: 'My Attendance' },
            { to: '/hrms/leaves', icon: Calendar, label: 'My Leave Requests' },
            { to: '/hrms/salary', icon: DollarSign, label: 'My Salary & Payslips' },
            { to: '/hrms/assets', icon: Laptop, label: 'My Issued Equipment' },
            { to: '/hrms/pms', icon: Target, label: 'My OKRs & Appraisals', badge: 'PMS', badgeType: 'emerald' },
            { to: '/hrms/shifts', icon: CalendarDays, label: 'My Shifts & Swaps', badge: 'Roster', badgeType: 'emerald' },
            { to: '/hrms/helpdesk', icon: LifeBuoy, label: 'HR Helpdesk & Support', badge: 'SLA', badgeType: 'emerald' },
            { to: `/hrms/memberProfile?id=${currentUser.id}`, icon: User, label: 'My Profile & Docs' },
          ]
        },
        {
          group: 'Company Info',
          items: [
            { to: '/hrms/holidays', icon: CalendarDays, label: 'Company Holidays' },
          ]
        }
      ];
    }

    if (isManager && !isAdmin) {
      return [
        {
          group: 'Team Management',
          items: [
            { to: '/hrms/approvals', icon: Inbox, label: 'Manager Approvals', badge: 'Queue', badgeType: 'amber' },
            { to: '/hrms/shifts', icon: CalendarDays, label: 'Team Shifts & Roster', badge: 'Roster', badgeType: 'emerald' },
            { to: '/hrms/pms', icon: Target, label: 'Team Appraisals & OKRs', badge: 'PMS', badgeType: 'emerald' },
            { to: '/hrms/attendance', icon: Clock, label: 'Team Attendance' },
            { to: '/hrms/leaves', icon: Calendar, label: 'Team Leave Requests' },
            { to: '/hrms/members', icon: Users, label: 'Direct Reports' },
          ]
        },
        {
          group: 'My Personal Workspace',
          items: [
            { to: '/hrms/ess', icon: LayoutDashboard, label: 'Personal Dashboard' },
            { to: '/hrms/helpdesk', icon: LifeBuoy, label: 'HR Helpdesk & Support', badge: 'SLA', badgeType: 'emerald' },
            { to: '/hrms/salary', icon: DollarSign, label: 'My Salary Slips' },
            { to: '/hrms/assets', icon: Laptop, label: 'My Equipment' },
            { to: '/hrms/holidays', icon: CalendarDays, label: 'Holidays & Calendar' },
          ]
        }
      ];
    }

    // Default: Admin (Full Enterprise Suite)
    return [
      {
        group: 'My Workspace',
        items: [
          { to: '/hrms/ess', icon: UserCheck, label: 'Self-Service (ESS)', badge: 'Active', badgeType: 'emerald' },
          { to: '/hrms/approvals', icon: Inbox, label: 'Manager Approvals', badge: 'Queue', badgeType: 'amber' },
        ]
      },
      {
        group: 'Overview',
        items: [
          { to: '/hrms/members', icon: Users, label: 'Employees', badge: 'Directory' },
        ]
      },
      {
        group: 'Time & Operations',
        items: [
          { to: '/hrms/attendance', icon: Clock, label: 'Attendance' },
          { to: '/hrms/leaves', icon: Calendar, label: 'Leave Requests', badge: '1', badgeType: 'primary' },
          { to: '/hrms/holidays', icon: CalendarDays, label: 'Holidays & Calendar' },
        ]
      },
      {
        group: 'Finance & Payroll',
        items: [
          { to: '/hrms/salary', icon: DollarSign, label: 'Payroll & Disbursements' },
          { to: '/hrms/payroll/structures', icon: Briefcase, label: 'Salary Structures & Tiers' },
          { to: '/hrms/payroll/masters', icon: Sliders, label: 'Component & Deductions' },
          { to: '/hrms/payroll/claims', icon: Receipt, label: 'Reimbursements & Claims', badge: 'New', badgeType: 'primary' },
          { to: '/hrms/payroll/tax', icon: ShieldCheck, label: 'Tax & Compliance' },
        ]
      },
      {
        group: 'Enterprise Modules',
        items: [
          { to: '/hrms/helpdesk', icon: LifeBuoy, label: 'Helpdesk & Grievance', badge: 'SLA', badgeType: 'emerald' },
          { to: '/hrms/shifts', icon: CalendarDays, label: 'Shift & Roster Planning', badge: 'Roster', badgeType: 'emerald' },
          { to: '/hrms/pms', icon: Target, label: 'Performance & Appraisals', badge: 'PMS', badgeType: 'emerald' },
          { to: '/hrms/notifications', icon: MessageSquare, label: 'WhatsApp & Notifications', badge: 'WA', badgeType: 'emerald' },
          { to: '/hrms/lifecycle', icon: UserCheck, label: 'Lifecycle & Exits', badge: 'New', badgeType: 'primary' },
          { to: '/hrms/assets', icon: Laptop, label: 'Asset Allocation', badge: 'New', badgeType: 'primary' },
          { to: '/hrms/reports', icon: BarChart3, label: 'Reports & Intelligence', badge: 'Pro', badgeType: 'primary' },
          { to: '/hrms/recruitment', icon: Briefcase, label: 'Hiring & ATS', badge: 'Live', badgeType: 'primary' },
        ]
      }
    ];
  }, [currentUser, isEmployee, isManager, isAdmin]);

  return (
    <aside className="app-sidebar">
      {/* Workspace / Brand Header */}
      <div className="sidebar-header">
        <a href={isEmployee ? "/hrms/ess" : "/hrms/members"} className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Building2 size={18} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Acme Global</span>
            <span className="sidebar-brand-badge">
              {isEmployee ? 'Employee Portal' : isManager && !isAdmin ? 'Manager Portal' : 'HRMS Enterprise'}
            </span>
          </div>
        </a>
        <ChevronDown size={14} style={{ color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }} />
      </div>

      {/* Quick Search Shortcut Button */}
      <button 
        type="button" 
        className="sidebar-search-btn"
        onClick={onOpenSearch}
        title="Search anything (Ctrl+K)"
       aria-label="Search anything (Ctrl+K)">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={14} />
          <span>Quick search...</span>
        </span>
        <kbd>⌘K</kbd>
      </button>

      {/* Categorized Nav Groups */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.group} className="sidebar-group">
            <div className="sidebar-group-label">{section.group}</div>
            {section.items.map((item) => (
              item.to.startsWith('#') ? (
                <div 
                  key={item.label}
                  className="sidebar-nav-item" 
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  title="Module in development"
                >
                  <div className="sidebar-nav-item-content">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <div className="sidebar-nav-item-content">
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`sidebar-badge ${item.badgeType || ''}`}>{item.badge}</span>
                  )}
                </NavLink>
              )
            ))}
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" title={`Logged in as ${currentUser.name} (${currentUser.role})`}>
          <div className="sidebar-user-info">
            <div className="user-avatar">
              {currentUser.avatar}
              <div className="avatar-online-dot"></div>
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentUser.title || currentUser.role}</span>
            </div>
          </div>
          <ShieldCheck 
            size={16} 
            style={{ 
              color: currentUser.role === 'Admin' ? '#10b981' : currentUser.role === 'Manager' ? '#f59e0b' : '#3b82f6', 
              flexShrink: 0 
            }} 
          />
        </div>
      </div>
    </aside>
  );
}
