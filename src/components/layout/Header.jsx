import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Moon, Sun, ChevronRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onOpenSearch }) {
  const location = useLocation();
  const { currentUser, personas, switchPersona } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('hrms_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hrms_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hrms_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('ess')) {
      return ['My Workspace', 'Employee Self-Service (ESS)'];
    }
    if (path.includes('approvals')) {
      return ['Management', 'Manager Approvals Portal'];
    }
    if (path.includes('memberProfile')) {
      return ['People', 'Employees', 'Profile'];
    }
    if (path.includes('attendance')) {
      return ['Time & Operations', 'Attendance & Shifts'];
    }
    if (path.includes('leaves')) {
      return ['Time & Operations', 'Leave Management & Approvals'];
    }
    if (path.includes('assets')) {
      return ['Enterprise', 'Asset Allocation & IT Inventory'];
    }
    if (path.includes('salary')) {
      return ['Finance', 'Payroll & Salaries'];
    }
    if (path.includes('lifecycle')) {
      return ['Enterprise', 'Employee Lifecycle & Exits'];
    }
    if (path.includes('reports')) {
      return ['Enterprise', 'Reports & Intelligence'];
    }
    if (path.includes('recruitment')) {
      return ['Enterprise', 'Hiring & ATS'];
    }

    return ['People', 'Employees', 'Directory'];
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="app-header">
      {/* Breadcrumb Trail */}
      <div className="header-breadcrumbs">
        <span className="breadcrumb-item">HRMS</span>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <span className={`breadcrumb-item${idx === crumbs.length - 1 ? ' active' : ''}`}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* System Status Pill */}
        <div className="system-status-pill" title="PHP 8.5 & Apache Active">
          <span className="status-dot"></span>
          <span>Live API</span>
        </div>

        {/* Search trigger */}
        <button 
          type="button" 
          className="header-search-bar" 
          onClick={onOpenSearch}
          title="Search (Ctrl+K)"
         aria-label="Search (Ctrl+K)">
          <Search size={14} />
          <span>Search anything...</span>
          <kbd style={{ marginLeft: 'auto' }}>⌘K</kbd>
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button 
          type="button" 
          className="header-icon-btn" 
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Role & Persona Switcher */}
        <div 
          className="persona-switcher"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            background: 'hsl(var(--secondary) / 0.7)', 
            border: '1px solid hsl(var(--border))', 
            borderRadius: 'var(--radius)', 
            padding: '0.25rem 0.6rem', 
            fontSize: '0.75rem' 
          }}
        >
          <UserCheck size={13} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>Persona:</span>
          <select 
            value={currentUser.key}
            onChange={(e) => switchPersona(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'hsl(var(--foreground))', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              outline: 'none'
            }}
            title="Switch active user role"
          >
            {personas.map(p => (
              <option key={p.key} value={p.key} style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                {p.name} ({p.role})
              </option>
            ))}
          </select>
        </div>

        {/* Quick User Avatar */}
        <div 
          className="user-avatar" 
          style={{ width: '32px', height: '32px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }} 
          title={`Active Persona: ${currentUser.name} (${currentUser.role})`}
        >
          {currentUser.avatar}
        </div>
      </div>
    </header>
  );
}
