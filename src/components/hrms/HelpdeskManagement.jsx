import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LifeBuoy, 
  HelpCircle, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Send, 
  Lock, 
  Star, 
  ChevronRight, 
  User, 
  Tag, 
  Laptop, 
  DollarSign, 
  Briefcase, 
  Building2, 
  EyeOff, 
  Check,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { helpdeskApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HelpdeskManagement() {
  const { currentUser, isManager, isAdmin } = useAuth();

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'my-tickets' | 'grievances' | 'categories'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Core Data States
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);

  // Message Reply & Internal Note State
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Resolution Notes Modal State
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // CSAT Modal State
  const [csatRating, setCsatRating] = useState(5);
  const [csatFeedback, setCsatFeedback] = useState('');
  const [isCsatModalOpen, setIsCsatModalOpen] = useState(false);
  const [submittingCsat, setSubmittingCsat] = useState(false);

  // Create Ticket Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    category_id: '',
    subject: '',
    description: '',
    priority: 'Medium',
    is_confidential: false
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Master Data & Tickets
  const fetchTicketsAndStats = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [catRes, ticketsRes, statsRes, membersRes] = await Promise.all([
        helpdeskApi.getCategories(),
        helpdeskApi.getTickets({
          role: isAdmin ? 'Admin' : (isManager ? 'Manager' : 'Employee'),
          viewer_user_id: currentUser?.id
        }),
        helpdeskApi.getStats({
          role: isAdmin ? 'Admin' : (isManager ? 'Manager' : 'Employee'),
          user_id: currentUser?.id
        }),
        membersApi.getAll ? membersApi.getAll() : Promise.resolve({ data: [] })
      ]);

      if (catRes && catRes.data) {
        setCategories(catRes.data);
        if (!newTicketForm.category_id && catRes.data.length > 0) {
          setNewTicketForm(prev => ({ ...prev, category_id: catRes.data[0].id }));
        }
      }
      if (ticketsRes && ticketsRes.data) {
        setTickets(ticketsRes.data);
      }
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      if (membersRes && membersRes.data) {
        setMembers(membersRes.data);
      }
    } catch (err) {
      console.error('Failed to load helpdesk data:', err);
      showToast('Error loading helpdesk tickets', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, isManager, currentUser?.id]);

  useEffect(() => {
    fetchTicketsAndStats();
  }, [fetchTicketsAndStats]);

  // Load Single Ticket Details
  const loadTicketDetails = async (ticketId) => {
    setTicketDetailsLoading(true);
    try {
      const res = await helpdeskApi.getTicket(ticketId, {
        role: isAdmin ? 'Admin' : (isManager ? 'Manager' : 'Employee'),
        viewer_user_id: currentUser?.id
      });
      if (res && res.data) {
        setSelectedTicket(res.data);
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
      showToast('Could not load ticket conversation', 'error');
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  // Submit Reply or Internal Note
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setSubmittingReply(true);
    try {
      const res = await helpdeskApi.addMessage(selectedTicket.id, {
        user_id: currentUser?.id || 1,
        message: replyMessage.trim(),
        is_internal_note: isInternalNote ? 1 : 0
      });

      if (res && res.success) {
        showToast(isInternalNote ? 'Internal note added to case' : 'Reply sent to employee');
        setReplyMessage('');
        setIsInternalNote(false);
        // Refresh ticket thread and listing
        loadTicketDetails(selectedTicket.id);
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
      showToast('Error sending message', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Change Ticket Status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;

    if (newStatus === 'Resolved') {
      setIsResolveModalOpen(true);
      return;
    }

    try {
      const res = await helpdeskApi.updateStatus(selectedTicket.id, {
        status: newStatus,
        user_id: currentUser?.id || 1
      });

      if (res && res.success) {
        showToast(`Ticket status updated to "${newStatus}"`);
        loadTicketDetails(selectedTicket.id);
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update ticket status', 'error');
    }
  };

  // Confirm Resolve with Notes
  const handleConfirmResolve = async () => {
    if (!selectedTicket) return;

    try {
      // If resolution notes were entered, save as message
      if (resolutionNotes.trim()) {
        await helpdeskApi.addMessage(selectedTicket.id, {
          user_id: currentUser?.id || 1,
          message: `Resolution Summary: ${resolutionNotes.trim()}`,
          is_internal_note: 0
        });
      }

      const res = await helpdeskApi.updateStatus(selectedTicket.id, {
        status: 'Resolved',
        user_id: currentUser?.id || 1
      });

      if (res && res.success) {
        showToast('Ticket marked as Resolved. Requester notified.');
        setIsResolveModalOpen(false);
        setResolutionNotes('');
        loadTicketDetails(selectedTicket.id);
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      showToast('Could not resolve ticket', 'error');
    }
  };

  // Assign Ticket to Support Agent
  const handleAssignAgent = async (agentId) => {
    if (!selectedTicket) return;
    try {
      const res = await helpdeskApi.assignTicket(selectedTicket.id, {
        assigned_to: agentId,
        user_id: currentUser?.id || 1
      });

      if (res && res.success) {
        showToast('Ticket assigned to agent');
        loadTicketDetails(selectedTicket.id);
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      showToast('Failed to assign ticket', 'error');
    }
  };

  // Create New Ticket Submit
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      showToast('Please fill in both subject and description', 'error');
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await helpdeskApi.createTicket({
        ...newTicketForm,
        user_id: currentUser?.id || 1,
        is_confidential: newTicketForm.is_confidential ? 1 : 0
      });

      if (res && res.success) {
        showToast(`Ticket #${res.data.ticket_number} created successfully! WhatsApp alert sent.`);
        setIsCreateModalOpen(false);
        setNewTicketForm({
          category_id: categories[0]?.id || '',
          subject: '',
          description: '',
          priority: 'Medium',
          is_confidential: false
        });
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      showToast('Error creating support ticket', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Submit CSAT Rating
  const handleSubmitCsat = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setSubmittingCsat(true);
    try {
      const res = await helpdeskApi.submitCsat(selectedTicket.id, {
        user_id: currentUser?.id || 1,
        rating: csatRating,
        feedback: csatFeedback.trim()
      });

      if (res && res.success) {
        showToast('Thank you for rating our support!');
        setIsCsatModalOpen(false);
        setCsatFeedback('');
        loadTicketDetails(selectedTicket.id);
        fetchTicketsAndStats(true);
      }
    } catch (err) {
      console.error('CSAT submission failed:', err);
      showToast('Could not submit feedback rating', 'error');
    } finally {
      setSubmittingCsat(false);
    }
  };

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Tab based segregation
      if (activeTab === 'my-tickets') {
        if (ticket.user_id !== currentUser?.id) return false;
      } else if (activeTab === 'grievances') {
        if (ticket.category_code !== 'GRIEVANCE' && !ticket.is_confidential) return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && ticket.status !== statusFilter) return false;

      // Priority Filter
      if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) return false;

      // Category Filter
      if (categoryFilter !== 'All' && String(ticket.category_id) !== String(categoryFilter)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = ticket.subject?.toLowerCase().includes(q);
        const matchesNumber = ticket.ticket_number?.toLowerCase().includes(q);
        const matchesRequester = ticket.requester_name?.toLowerCase().includes(q);
        if (!matchesSubject && !matchesNumber && !matchesRequester) return false;
      }

      return true;
    });
  }, [tickets, activeTab, statusFilter, priorityFilter, categoryFilter, searchQuery, currentUser?.id]);

  // SLA Time Remaining Helper
  const formatSlaCountdown = (ticket) => {
    if (['Resolved', 'Closed'].includes(ticket.status)) {
      return { text: 'Resolved', isBreached: false, color: '#10b981' };
    }
    const mins = ticket.time_remaining_mins;
    if (mins <= 0) {
      const overdueHrs = Math.abs(Math.round(mins / 60));
      return { text: `Breached (${overdueHrs}h ago)`, isBreached: true, color: '#ef4444' };
    }
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs === 0) {
      return { text: `${remMins}m left`, isBreached: false, color: '#f59e0b' };
    }
    return { text: `${hrs}h ${remMins}m left`, isBreached: false, color: hrs <= 4 ? '#f59e0b' : '#10b981' };
  };

  // Helper for Category Icons
  const renderCategoryIcon = (iconName, size = 15) => {
    switch (iconName) {
      case 'Laptop': return <Laptop size={size} />;
      case 'DollarSign': return <DollarSign size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'ShieldAlert': return <ShieldAlert size={size} />;
      case 'Building2': return <Building2 size={size} />;
      default: return <HelpCircle size={size} />;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge badge-danger">Urgent (4h)</span>;
      case 'High':
        return <span className="badge badge-warning">High (12h)</span>;
      case 'Medium':
        return <span className="badge badge-secondary">Medium (24h)</span>;
      case 'Low':
        return <span className="badge badge-outline">Low (48h)</span>;
      default:
        return <span className="badge badge-outline">{priority}</span>;
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="badge badge-primary">Open</span>;
      case 'In Progress':
        return <span className="badge badge-warning">In Progress</span>;
      case 'Waiting on Employee':
        return <span className="badge badge-secondary">Waiting Reply</span>;
      case 'Resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'Closed':
        return <span className="badge badge-outline">Closed</span>;
      default:
        return <span className="badge badge-outline">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`toast toast-${toastMessage.type}`}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.875rem',
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
            <h1>Internal HR Helpdesk & Support</h1>
            <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>ENTERPRISE HELPDESK</span>
            <span className="badge badge-outline font-mono" style={{ fontSize: '0.7rem', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>SLA ENGINE</span>
          </div>
          <p>
            Multi-tiered employee grievance resolution, IT infrastructure requests, automated SLA timers, private HR internal notes, and WhatsApp status updates.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={() => fetchTicketsAndStats(true)} 
            disabled={refreshing}
            title="Refresh tickets"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsCreateModalOpen(true)}
            title="Submit a new support or grievance ticket"
          >
            <Plus size={14} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* ── Balanced 4-Card Shadcn Stats Grid ── */}
      <div className="stats-grid">
        {/* Card 1: Open Tickets */}
        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">Active Support Queue</span>
            <div className="stat-icon-wrapper">
              <LifeBuoy size={14} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? (stats.open_tickets + stats.in_progress_tickets) : tickets.length}
          </div>
          <div className="stat-subtext">
            <span>{stats?.open_tickets || 0} unassigned · {stats?.in_progress_tickets || 0} in progress</span>
          </div>
        </div>

        {/* Card 2: SLA Compliance */}
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">SLA Compliance Rate</span>
            <div className="stat-icon-wrapper">
              <Clock size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {stats ? `${stats.sla_compliance_rate}%` : '96.5%'}
          </div>
          <div className="stat-subtext">
            <span className="stat-trend-up">Guaranteed</span>
            <span>{stats?.breached_tickets || 0} breached deadline</span>
          </div>
        </div>

        {/* Card 3: Avg Resolution */}
        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">Avg Resolution Time</span>
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={14} />
            </div>
          </div>
          <div className="stat-value">
            {stats ? `${stats.avg_resolution_hrs}h` : '4.8h'}
          </div>
          <div className="stat-subtext">
            <span>From ticket submission to close</span>
          </div>
        </div>

        {/* Card 4: CSAT Rating */}
        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">Employee CSAT Score</span>
            <div className="stat-icon-wrapper">
              <Star size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span>{stats ? stats.avg_csat : '4.8'}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
              / 5.0 ★
            </span>
          </div>
          <div className="stat-subtext">
            <span>Based on {stats?.csat_count || 3} verified ratings</span>
          </div>
        </div>
      </div>

      {/* ── Official Shadcn Tabs Navigation ── */}
      <div className="tabs-list" style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
        <button 
          type="button"
          className={`tabs-trigger ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          <LifeBuoy size={14} />
          <span>Ticket Inbox</span>
          <span className="tab-count">{tickets.length}</span>
        </button>

        <button 
          type="button"
          className={`tabs-trigger ${activeTab === 'my-tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-tickets')}
        >
          <User size={14} />
          <span>My Tickets</span>
          <span className="tab-count">
            {tickets.filter(t => t.user_id === currentUser?.id).length}
          </span>
        </button>

        <button 
          type="button"
          className={`tabs-trigger ${activeTab === 'grievances' ? 'active' : ''}`}
          onClick={() => setActiveTab('grievances')}
        >
          <ShieldAlert size={14} />
          <span>Confidential Grievance Desk</span>
          <span className="tab-count" style={{ color: '#ef4444' }}>
            {tickets.filter(t => t.category_code === 'GRIEVANCE' || t.is_confidential).length}
          </span>
        </button>

        <button 
          type="button"
          className={`tabs-trigger ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tag size={14} />
          <span>Categories & SLA Master</span>
          <span className="tab-count">{categories.length}</span>
        </button>
      </div>

      {/* ── Tab 1, 2, 3: Ticket List & Search / Filters ── */}
      {activeTab !== 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1.25fr' : '1fr', gap: '1.25rem' }}>
          
          {/* Left Column: Tickets Table & Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Search and Filters Bar */}
            <div className="card" style={{ padding: '0.85rem 1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                  <input 
                    type="text"
                    className="input"
                    placeholder="Search by ticket #, subject, employee..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '2.1rem', height: '2.25rem', fontSize: '0.85rem', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Status Filter */}
                  <select 
                    className="input select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ height: '2.25rem', fontSize: '0.8rem', padding: '0 0.65rem' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting on Employee">Waiting on Employee</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  {/* Priority Filter */}
                  <select 
                    className="input select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ height: '2.25rem', fontSize: '0.8rem', padding: '0 0.65rem' }}
                  >
                    <option value="All">All Priorities</option>
                    <option value="Urgent">Urgent (4h)</option>
                    <option value="High">High (12h)</option>
                    <option value="Medium">Medium (24h)</option>
                    <option value="Low">Low (48h)</option>
                  </select>

                  {/* Category Filter */}
                  <select 
                    className="input select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ height: '2.25rem', fontSize: '0.8rem', padding: '0 0.65rem' }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tickets Table Card */}
            <div className="table-container card">
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
                  <p>Loading helpdesk queue...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  <LifeBuoy size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                  <h4 style={{ fontWeight: 600, color: 'var(--foreground)' }}>No tickets found</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    There are no tickets matching the active tab or search filters.
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ marginTop: '1rem', fontSize: '0.8rem' }}
                    onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); setCategoryFilter('All'); setSearchQuery(''); }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Ticket #</th>
                      <th>Subject & Category</th>
                      <th style={{ width: '120px' }}>Requester</th>
                      <th style={{ width: '100px' }}>Priority</th>
                      <th style={{ width: '110px' }}>SLA Timer</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      const slaInfo = formatSlaCountdown(ticket);
                      return (
                        <tr 
                          key={ticket.id} 
                          onClick={() => loadTicketDetails(ticket.id)}
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.08)' : undefined
                          }}
                        >
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {ticket.is_confidential ? <Lock size={12} style={{ color: '#ef4444' }} /> : null}
                              <span>{ticket.ticket_number}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.875rem' }}>
                                {ticket.subject}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                <span 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.25rem',
                                    color: ticket.category_color || 'var(--primary)' 
                                  }}
                                >
                                  {renderCategoryIcon(ticket.category_icon, 12)}
                                  {ticket.category_name}
                                </span>
                                <span>•</span>
                                <span>{ticket.message_count || 1} msgs</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 500, fontSize: '0.825rem' }}>{ticket.requester_name}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{ticket.requester_department}</span>
                            </div>
                          </td>
                          <td>
                            {renderPriorityBadge(ticket.priority)}
                          </td>
                          <td>
                            <span 
                              style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                color: slaInfo.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Clock size={11} />
                              {slaInfo.text}
                            </span>
                          </td>
                          <td>
                            {renderStatusBadge(ticket.status)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <ChevronRight size={14} style={{ color: isSelected ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Right Column: Interactive Conversation Drawer / Thread */}
          {selectedTicket && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: '850px' }}>
              
              {/* Drawer Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                      {selectedTicket.ticket_number}
                    </span>
                    {selectedTicket.is_confidential ? (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={11} /> Confidential
                      </span>
                    ) : null}
                    {renderStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.35rem' }}>
                    {selectedTicket.subject}
                  </h3>
                </div>

                <button 
                  type="button" 
                  onClick={() => setSelectedTicket(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Ticket Metadata Banner */}
              <div style={{ padding: '0.75rem 1.25rem', background: 'var(--secondary)', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Requester: </span>
                  <strong>{selectedTicket.requester_name}</strong> ({selectedTicket.requester_department})
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Category: </span>
                  <span style={{ color: selectedTicket.category_color, fontWeight: 600 }}>{selectedTicket.category_name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>SLA Deadline: </span>
                  <strong style={{ color: selectedTicket.is_sla_breached ? '#ef4444' : '#10b981' }}>
                    {selectedTicket.sla_due_at ? selectedTicket.sla_due_at.substring(0, 16) : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted-foreground)' }}>Assignee: </span>
                  {(isAdmin || isManager) ? (
                    <select 
                      className="input select"
                      value={selectedTicket.assigned_to || ''}
                      onChange={(e) => handleAssignAgent(e.target.value)}
                      style={{ fontSize: '0.75rem', height: '1.75rem', padding: '0 0.5rem', width: 'auto', display: 'inline-block' }}
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  ) : (
                    <strong>{selectedTicket.assignee_name || 'HR Support Desk'}</strong>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              {(isAdmin || isManager) && (
                <div style={{ padding: '0.65rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>Update Status:</span>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', height: 'auto' }}
                    onClick={() => handleUpdateStatus('In Progress')}
                    disabled={selectedTicket.status === 'In Progress'}
                  >
                    In Progress
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', height: 'auto' }}
                    onClick={() => handleUpdateStatus('Waiting on Employee')}
                    disabled={selectedTicket.status === 'Waiting on Employee'}
                  >
                    Waiting on Employee
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', height: 'auto' }}
                    onClick={() => handleUpdateStatus('Resolved')}
                    disabled={['Resolved', 'Closed'].includes(selectedTicket.status)}
                  >
                    Resolve Ticket
                  </button>
                </div>
              )}

              {/* If employee views their own resolved ticket: CSAT Prompt Banner */}
              {selectedTicket.user_id === currentUser?.id && selectedTicket.status === 'Resolved' && !selectedTicket.csat_rating && (
                <div style={{ margin: '0.75rem 1.25rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.825rem', fontWeight: 500 }}>
                      This issue was marked resolved. How satisfied were you with the support?
                    </span>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', height: 'auto' }}
                    onClick={() => setIsCsatModalOpen(true)}
                  >
                    Rate Support ★
                  </button>
                </div>
              )}

              {/* If CSAT rating exists, display banner */}
              {selectedTicket.csat_rating && (
                <div style={{ margin: '0.75rem 1.25rem', padding: '0.65rem 1rem', borderRadius: 'var(--radius)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Star size={14} style={{ color: '#10b981' }} />
                  <span>
                    Requester rated: <strong>{selectedTicket.csat_rating}/5 Stars</strong>
                    {selectedTicket.csat_feedback ? ` — "${selectedTicket.csat_feedback}"` : ''}
                  </span>
                </div>
              )}

              {/* Message Timeline */}
              <div 
                style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  minHeight: '280px',
                  maxHeight: '420px'
                }}
              >
                {ticketDetailsLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto' }} />
                  </div>
                ) : !selectedTicket.messages || selectedTicket.messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
                    No messages recorded for this ticket.
                  </div>
                ) : (
                  selectedTicket.messages.map((msg, index) => {
                    const isRequester = msg.user_id === selectedTicket.user_id;
                    const isInternal = Boolean(msg.is_internal_note);

                    return (
                      <div 
                        key={msg.id || index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: isInternal ? 'stretch' : (isRequester ? 'flex-start' : 'flex-end'),
                          maxWidth: isInternal ? '100%' : '85%',
                          backgroundColor: isInternal 
                            ? 'rgba(245, 158, 11, 0.08)' 
                            : (isRequester ? 'var(--secondary)' : 'rgba(16, 185, 129, 0.1)'),
                          border: isInternal 
                            ? '1px dashed #f59e0b' 
                            : (isRequester ? '1px solid var(--border)' : '1px solid rgba(16, 185, 129, 0.25)'),
                          borderRadius: 'var(--radius)',
                          padding: '0.75rem 1rem'
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
                            {isInternal ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                                <EyeOff size={12} /> INTERNAL HR NOTE
                              </span>
                            ) : (
                              <span>{msg.sender_name || (isRequester ? selectedTicket.requester_name : 'Support Agent')}</span>
                            )}
                            <span style={{ fontWeight: 400, color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>
                              ({msg.sender_role || (isRequester ? 'Employee' : 'Support')})
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                            {msg.created_at ? msg.created_at.substring(0, 16) : ''}
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.45', whiteSpace: 'pre-wrap', color: 'var(--foreground)' }}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply Box Footer */}
              {selectedTicket.status !== 'Closed' && (
                <form 
                  onSubmit={handleSendReply}
                  style={{ 
                    padding: '0.85rem 1.25rem', 
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  {(isAdmin || isManager) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input 
                        type="checkbox" 
                        id="is_internal_toggle"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label 
                        htmlFor="is_internal_toggle" 
                        style={{ fontSize: '0.75rem', color: isInternalNote ? '#f59e0b' : 'var(--muted-foreground)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Lock size={12} /> Post as Private Internal HR Note (Invisible to employee)
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea 
                      className="input"
                      rows={2}
                      placeholder={isInternalNote ? "Write private HR notes, investigation findings, or SLA context..." : "Type reply to employee..."}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      style={{ 
                        flex: 1, 
                        resize: 'none', 
                        fontSize: '0.85rem', 
                        padding: '0.5rem 0.75rem',
                        borderColor: isInternalNote ? '#f59e0b' : undefined 
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendReply(e);
                        }
                      }}
                    />
                    <button 
                      type="submit" 
                      className={`btn ${isInternalNote ? 'btn-outline' : 'btn-primary'}`}
                      disabled={submittingReply || !replyMessage.trim()}
                      style={{ 
                        alignSelf: 'flex-end', 
                        height: '2.5rem', 
                        borderColor: isInternalNote ? '#f59e0b' : undefined,
                        color: isInternalNote ? '#f59e0b' : undefined
                      }}
                    >
                      <Send size={14} className={submittingReply ? 'animate-spin' : ''} />
                      <span>{isInternalNote ? 'Save Note' : 'Reply'}</span>
                    </button>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    Tip: Press Ctrl + Enter to send quickly
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      )}

      {/* ── Tab 4: Categories & SLA Master ── */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Helpdesk Categories & Guaranteed SLA Tiers</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
              Standard categories configure automated deadline timers according to ticket priority. Outbound WhatsApp triggers notify employees upon resolution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {categories.map(cat => (
              <div key={cat.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: 'var(--radius)', 
                          backgroundColor: `${cat.color}20`, 
                          color: cat.color, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        {renderCategoryIcon(cat.icon, 16)}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</h4>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{cat.code}</span>
                      </div>
                    </div>
                    <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>Active</span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--muted-foreground)', margin: '0.75rem 0' }}>
                    {cat.description}
                  </p>
                </div>

                <div style={{ background: 'var(--secondary)', borderRadius: 'var(--radius)', padding: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SLA Resolution Guarantee
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem', textAlign: 'center' }}>
                    <div style={{ padding: '0.35rem', background: 'var(--card)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>URGENT</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cat.sla_urgent_hrs}h</div>
                    </div>
                    <div style={{ padding: '0.35rem', background: 'var(--card)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 600 }}>HIGH</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cat.sla_high_hrs}h</div>
                    </div>
                    <div style={{ padding: '0.35rem', background: 'var(--card)', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                      <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 600 }}>MED</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cat.sla_medium_hrs}h</div>
                    </div>
                    <div style={{ padding: '0.35rem', background: 'var(--card)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>LOW</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cat.sla_low_hrs}h</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Create New Support Ticket ── */}
      {/* ── Modal: Create New Support Ticket (Official Shadcn Dialog) ── */}
      {isCreateModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="dialog-content" style={{ maxWidth: '720px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header" style={{ padding: '1rem 1.5rem 0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div 
                  style={{ 
                    width: 34, 
                    height: 34, 
                    borderRadius: 'var(--radius)', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    color: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <LifeBuoy size={18} />
                </div>
                <div>
                  <h3 className="dialog-title" style={{ fontSize: '1.15rem' }}>Submit Support Request</h3>
                  <p className="dialog-description" style={{ fontSize: '0.8rem' }}>Log an issue or inquiry with automatic SLA deadline tracking.</p>
                </div>
              </div>
              <button 
                type="button" 
                className="dialog-close-btn" aria-label="Close dialog"
                onClick={() => setIsCreateModalOpen(false)}
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit}>
              <div className="dialog-body" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* 2-Column Grid: Category & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '0.85rem', alignItems: 'flex-start' }}>
                  {/* Category Select */}
                  <div className="form-group">
                    <label className="form-label">
                      Issue Category <span className="required">*</span>
                    </label>
                    <select 
                      className="form-select"
                      value={newTicketForm.category_id}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, category_id: e.target.value })}
                      required
                      style={{ height: '42px', fontSize: '0.85rem' }}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority Selector Grid */}
                  <div className="form-group">
                    <label className="form-label">
                      Priority & Guaranteed SLA <span className="required">*</span>
                    </label>
                    <div className="priority-selector-grid" style={{ padding: '0.25rem', gap: '0.35rem' }}>
                      {[
                        { key: 'Low', label: 'Low', sla: '48h SLA', dot: '#94a3b8', variant: 'priority-low' },
                        { key: 'Medium', label: 'Medium', sla: '24h SLA', dot: '#3b82f6', variant: 'priority-medium' },
                        { key: 'High', label: 'High', sla: '12h SLA', dot: '#f59e0b', variant: 'priority-high' },
                        { key: 'Urgent', label: 'Urgent', sla: '4h SLA', dot: '#ef4444', variant: 'priority-urgent' }
                      ].map(p => {
                        const isSelected = newTicketForm.priority === p.key;
                        return (
                          <button
                            key={p.key}
                            type="button"
                            className={`priority-card-btn ${isSelected ? `active ${p.variant}` : ''}`}
                            onClick={() => setNewTicketForm({ ...newTicketForm, priority: p.key })}
                            style={{ padding: '0.35rem 0.25rem' }}
                          >
                            <span className="priority-name" style={{ fontSize: '0.75rem' }}>
                              <span className="priority-dot" style={{ backgroundColor: p.dot, width: 5, height: 5 }}></span>
                              {p.label}
                            </span>
                            <span className="priority-sla" style={{ fontSize: '0.625rem' }}>{p.sla}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Subject Input */}
                <div className="form-group">
                  <label className="form-label">
                    Subject / Summary <span className="required">*</span>
                  </label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. Discrepancy in Sept TDS deductions or VPN connectivity error"
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Description Textarea */}
                <div className="form-group">
                  <label className="form-label">
                    Detailed Description <span className="required">*</span>
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide complete details, error codes, steps to reproduce, or salary slip dates..."
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    required
                    style={{ minHeight: '68px', resize: 'vertical', fontSize: '0.85rem', lineHeight: '1.4' }}
                  />
                </div>

                {/* Compact Confidentiality Callout Card */}
                <div 
                  className={`confidential-callout-card ${newTicketForm.is_confidential ? 'active' : ''}`}
                  onClick={() => setNewTicketForm(prev => ({ ...prev, is_confidential: !prev.is_confidential }))}
                  style={{ padding: '0.65rem 0.85rem' }}
                >
                  <div className="confidential-icon-wrap" style={{ width: 30, height: 30 }}>
                    <ShieldAlert size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span className="confidential-title" style={{ fontSize: '0.825rem' }}>Strictly Confidential Grievance</span>
                      <span className="badge badge-danger font-mono" style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem' }}>RESTRICTED</span>
                    </div>
                    <p className="confidential-desc" style={{ fontSize: '0.725rem', marginTop: '0.15rem' }}>
                      Restricts case viewing exclusively to the HR Head and System Administrators. Invisible to line managers.
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    id="confidential_box"
                    checked={newTicketForm.is_confidential}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, is_confidential: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>

              </div>

              {/* Shaded Shadcn Dialog Footer */}
              <div className="dialog-footer" style={{ padding: '0.85rem 1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingTicket}
                  style={{ height: '36px', fontSize: '0.85rem' }}
                >
                  {submittingTicket ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Resolve Ticket with Notes (Official Shadcn Dialog) ── */}
      {isResolveModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsResolveModalOpen(false)}>
          <div className="dialog-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div 
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: 'var(--radius)', 
                    background: 'rgba(16, 185, 129, 0.12)', 
                    color: 'var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="dialog-title" style={{ fontSize: '1.15rem' }}>Resolve Ticket</h3>
                  <p className="dialog-description">
                    Provide resolution notes to explain how the issue was addressed.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="dialog-close-btn" aria-label="Close dialog"
                onClick={() => setIsResolveModalOpen(false)}
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: '1.45' }}>
                Once marked as resolved, an automated WhatsApp alert will be dispatched to the employee with a CSAT satisfaction rating link.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Resolution Summary / Corrective Action
                </label>
                <textarea 
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Corrected payroll TDS deduction in October payroll cycle and credited differential."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="dialog-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setIsResolveModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleConfirmResolve}
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: CSAT Satisfaction Feedback (Official Shadcn Dialog) ── */}
      {isCsatModalOpen && (
        <div className="dialog-overlay" onClick={() => setIsCsatModalOpen(false)}>
          <div className="dialog-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header" style={{ textAlign: 'center', paddingBottom: '0.75rem' }}>
              <div 
                style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '50%', 
                  background: 'rgba(245, 158, 11, 0.12)', 
                  color: '#f59e0b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem'
                }}
              >
                <Star size={22} fill="#f59e0b" />
              </div>
              <h3 className="dialog-title" style={{ fontSize: '1.2rem' }}>Rate Support Experience</h3>
              <p className="dialog-description">
                How satisfied are you with the resolution for ticket #{selectedTicket?.ticket_number}?
              </p>
              <button 
                type="button" 
                className="dialog-close-btn" aria-label="Close dialog"
                onClick={() => setIsCsatModalOpen(false)}
                title="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitCsat}>
              <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '1rem' }}>
                
                {/* Interactive Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.65rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCsatRating(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        transform: csatRating >= star ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease'
                      }}
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star 
                        size={32} 
                        fill={csatRating >= star ? '#f59e0b' : 'transparent'} 
                        color={csatRating >= star ? '#f59e0b' : 'var(--muted-foreground)'} 
                      />
                    </button>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Comments or Feedback (Optional)
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Share details on responsiveness, clarity, and professionalism..."
                    value={csatFeedback}
                    onChange={(e) => setCsatFeedback(e.target.value)}
                  />
                </div>

              </div>

              <div className="dialog-footer">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsCsatModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submittingCsat}
                >
                  {submittingCsat ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Submit Rating</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
