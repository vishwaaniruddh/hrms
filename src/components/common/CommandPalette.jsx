import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock, DollarSign, UserPlus, FileSpreadsheet, X, ArrowRight, Calendar, UserMinus, Laptop, Target, Award, MessageSquare, LifeBuoy } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export default function CommandPalette({ isOpen, onClose }) {
  const { currentUser, isEmployee, isManager, isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const allCommands = [
    { id: 'ess', title: 'My Self-Service Workspace (ESS)', category: 'Employee Portal', icon: Users, path: '/hrms/ess', roles: ['admin', 'manager', 'employee'] },
    { id: 'punch-now', title: 'Punch In / Clock Out (Web Attendance Terminal)', category: 'Employee Actions', icon: Clock, path: '/hrms/ess', roles: ['admin', 'manager', 'employee'] },
    { id: 'helpdesk', title: isEmployee ? 'HR Helpdesk & Support Desk' : 'Internal HR Helpdesk & Grievance Desk', category: 'Support & Helpdesk', icon: LifeBuoy, path: '/hrms/helpdesk', roles: ['admin', 'manager', 'employee'] },
    { id: 'create-ticket', title: 'Submit Support Ticket / Workplace Grievance', category: 'Employee Actions', icon: LifeBuoy, path: '/hrms/helpdesk?tab=my-tickets', roles: ['admin', 'manager', 'employee'] },
    { id: 'pms-okrs', title: isEmployee ? 'My OKRs & Key Results' : 'OKRs & Measurable Milestones', category: 'Performance', icon: Target, path: '/hrms/pms', roles: ['admin', 'manager', 'employee'] },
    { id: 'pms-reviews', title: isEmployee ? 'My Self-Evaluation & Appraisal' : '360° Review Cycles & Appraisals', category: 'Performance', icon: Award, path: '/hrms/pms', roles: ['admin', 'manager', 'employee'] },
    { id: 'attendance', title: isEmployee ? 'My Attendance Record' : 'Daily Attendance & Shifts', category: 'Navigation', icon: Clock, path: '/hrms/attendance', roles: ['admin', 'manager', 'employee'] },
    { id: 'leaves', title: isEmployee ? 'My Leave Requests' : 'Leave Requests & Approvals', category: 'Navigation', icon: Calendar, path: '/hrms/leaves', roles: ['admin', 'manager', 'employee'] },
    { id: 'apply-leave', title: 'Apply for Leave', category: 'Employee Actions', icon: UserMinus, path: '/hrms/leaves', roles: ['admin', 'manager', 'employee'] },
    { id: 'salary', title: isEmployee ? 'My Salary & Itemized Payslips' : 'Payroll & Salary Management', category: 'Navigation', icon: DollarSign, path: '/hrms/salary', roles: ['admin', 'manager', 'employee'] },
    { id: 'assets', title: isEmployee ? 'My Issued Hardware & Equipment' : 'Asset Allocation & IT Inventory', category: 'Navigation', icon: Laptop, path: '/hrms/assets', roles: ['admin', 'manager', 'employee'] },
    { id: 'shifts', title: isEmployee ? 'My Shift Schedule & Swaps' : 'Shift Scheduling & Team Roster', category: 'Time & Operations', icon: Calendar, path: '/hrms/shifts', roles: ['admin', 'manager', 'employee'] },
    { id: 'shift-swap', title: 'Request Shift Swap / Exchange', category: 'Employee Actions', icon: Users, path: '/hrms/shifts?tab=swaps', roles: ['admin', 'manager', 'employee'] },
    { id: 'profile', title: 'My Profile & Documents', category: 'Navigation', icon: Users, path: `/hrms/memberProfile?id=${currentUser?.id || 1}`, roles: ['admin', 'manager', 'employee'] },
    
    // Manager & Admin Only
    { id: 'pms-talent', title: '9-Box Talent Matrix & Competency Calibration', category: 'Talent Management', icon: Target, path: '/hrms/pms', roles: ['admin', 'manager'] },
    { id: 'approvals', title: 'Manager Approvals Inbox (Leaves, Claims & Clearances)', category: 'Team Approvals', icon: Users, path: '/hrms/approvals', roles: ['admin', 'manager'] },
    
    // Admin Only
    { id: 'pms-payroll', title: 'Appraisal to Payroll Increment Sync', category: 'Compensation', icon: DollarSign, path: '/hrms/pms', roles: ['admin'] },
    { id: 'members', title: 'Employee Directory & Staff Records', category: 'Administration', icon: Users, path: '/hrms/members', roles: ['admin', 'manager'] },
    { id: 'add-member', title: 'Add New Employee to Organization', category: 'HR Actions', icon: UserPlus, path: '/hrms/members?action=create', roles: ['admin'] },
    { id: 'clock-in', title: 'Clock-In Member (Admin Override)', category: 'HR Actions', icon: Clock, path: '/hrms/attendance?action=signin', roles: ['admin'] },
    { id: 'lifecycle', title: 'Lifecycle & Exit Management (Onboarding & Offboarding)', category: 'Administration', icon: Users, path: '/hrms/lifecycle', roles: ['admin', 'manager'] },
    { id: 'initiate-onboarding', title: 'Initiate Employee Onboarding Journey', category: 'HR Actions', icon: UserPlus, path: '/hrms/lifecycle?action=onboard', roles: ['admin'] },
    { id: 'submit-resignation', title: 'Submit Employee Resignation & Exit', category: 'HR Actions', icon: UserMinus, path: '/hrms/lifecycle?action=exit', roles: ['admin'] },
    { id: 'generate-salary', title: 'Process Monthly Payroll Register', category: 'HR Actions', icon: FileSpreadsheet, path: '/hrms/salary?action=generate', roles: ['admin'] },
    { id: 'notifications', title: 'Automated WhatsApp & SMS Notification Engine', category: 'Communications', icon: MessageSquare, path: '/hrms/notifications', roles: ['admin', 'manager'] },
    { id: 'send-notif', title: 'Send WhatsApp / SMS Broadcast to Staff', category: 'Communications', icon: MessageSquare, path: '/hrms/notifications?action=send', roles: ['admin', 'manager'] },
  ];

  const currentRole = isEmployee ? 'employee' : (isManager && !isAdmin ? 'manager' : 'admin');
  const commands = allCommands.filter(cmd => cmd.roles.includes(currentRole));

  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const executeCommand = (cmd) => {
    navigate(cmd.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-box" onClick={e => e.stopPropagation()}>
        <div className="command-search-header">
          <Search size={18} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <kbd onClick={onClose} style={{ cursor: 'pointer' }}>ESC</kbd>
        </div>

        <div className="command-results-list">
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
              No commands found matching "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`command-item${idx === selectedIndex ? ' selected' : ''}`}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="command-item-left">
                  <cmd.icon size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
                  <span>{cmd.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                    {cmd.category}
                  </span>
                  <ArrowRight size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
