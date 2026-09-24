import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCheck, 
  Check, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Zap, 
  FileText, 
  UserCheck, 
  DollarSign, 
  Calendar, 
  Bell, 
  Phone, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  ChevronRight, 
  X, 
  Sparkles, 
  Info, 
  Activity,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { notificationsApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NotificationManagement() {
  const { currentUser } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState('triggers'); // 'triggers' | 'logs' | 'gateway'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [members, setMembers] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Drawers
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Composer Form
  const [composerForm, setComposerForm] = useState({
    recipient_phone: '',
    recipient_name: '',
    channel: 'whatsapp',
    message_text: '',
    user_id: ''
  });
  const [sendingTest, setSendingTest] = useState(false);
  const [runningAttendance, setRunningAttendance] = useState(false);

  // Notification Toast Helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Stats & Settings
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, settingsRes] = await Promise.all([
        notificationsApi.getStats(),
        notificationsApi.getSettings()
      ]);

      if (statsRes && statsRes.data) setStats(statsRes.data);
      if (settingsRes && settingsRes.data) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Failed to load notification stats/settings:', err);
      showToast('Failed to load notification data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch Message Logs
  const fetchLogs = useCallback(async () => {
    try {
      const params = {
        page,
        per_page: 15,
        search: searchQuery || undefined,
        channel: channelFilter !== 'all' ? channelFilter : undefined,
        event_type: eventFilter !== 'all' ? eventFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await notificationsApi.getLogs(params);
      if (res && res.data) {
        setLogs(res.data);
        setTotalLogs(res.total || res.data.length);
      }
    } catch (err) {
      console.error('Failed to load message logs:', err);
    }
  }, [page, searchQuery, channelFilter, eventFilter, statusFilter]);

  // Fetch Member Directory for Composer
  useEffect(() => {
    membersApi.getAll({ per_page: 50 }).then((res) => {
      if (res && res.data) setMembers(res.data);
    }).catch(() => {});
  }, []);

  // Initial Load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load logs on filter/tab changes
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  // Handle Trigger Setting Toggle / Channel Change
  const handleUpdateSetting = async (triggerKey, updatePayload) => {
    try {
      const res = await notificationsApi.updateSetting(triggerKey, updatePayload);
      if (res && res.success) {
        setSettings((prev) =>
          prev.map((s) => (s.trigger_key === triggerKey ? { ...s, ...res.data } : s))
        );
        showToast(`Trigger "${triggerKey}" settings updated`);
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
      showToast('Could not save trigger changes', 'error');
    }
  };

  // Run Attendance Audit & Alerts
  const handleRunAttendanceAudit = async () => {
    setRunningAttendance(true);
    try {
      const res = await notificationsApi.triggerAttendance();
      if (res && res.success) {
        showToast(`Attendance audit complete: ${res.data.alerts_sent} alerts dispatched`);
        fetchData(true);
        if (activeTab === 'logs') fetchLogs();
      }
    } catch (err) {
      console.error('Audit failed:', err);
      showToast('Failed to trigger attendance alerts', 'error');
    } finally {
      setRunningAttendance(false);
    }
  };

  // Quick Send Composer Submit
  const handleSendComposer = async (e) => {
    e.preventDefault();
    if (!composerForm.recipient_phone || !composerForm.message_text) {
      showToast('Phone number and message text are required', 'error');
      return;
    }

    setSendingTest(true);
    try {
      const res = await notificationsApi.sendTest(composerForm);
      if (res && res.success) {
        showToast(`Message dispatched! ID: ${res.data.message_id.substring(0, 18)}...`);
        setIsComposerOpen(false);
        setComposerForm({
          recipient_phone: '',
          recipient_name: '',
          channel: 'whatsapp',
          message_text: '',
          user_id: ''
        });
        fetchData(true);
        if (activeTab === 'logs') fetchLogs();
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
      showToast('Failed to dispatch message via Gateway', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Simulate Delivery Receipt Transition (sent -> delivered -> read)
  const handleSimulateReceipt = async (log) => {
    let nextStatus = 'delivered';
    if (log.status === 'delivered') nextStatus = 'read';
    else if (log.status === 'read') nextStatus = 'delivered';

    try {
      const res = await notificationsApi.simulateReceipt({
        message_id: log.message_id,
        status: nextStatus
      });
      if (res && res.success) {
        showToast(`Receipt webhook ingested: ${log.recipient_name || log.recipient_phone} is now "${nextStatus}"`);
        setLogs((prev) =>
          prev.map((item) =>
            item.message_id === log.message_id ? { ...item, status: nextStatus } : item
          )
        );
        fetchData(true);
      }
    } catch (err) {
      console.error('Receipt simulation failed:', err);
      showToast('Failed to simulate delivery receipt', 'error');
    }
  };

  // Pre-fill composer from member
  const handleSelectMember = (userId) => {
    const member = members.find((m) => String(m.id) === String(userId));
    if (member) {
      setComposerForm((prev) => ({
        ...prev,
        user_id: member.id,
        recipient_name: member.full_name,
        recipient_phone: member.phone || '',
        message_text: `Hi ${member.full_name}, this is an official update from Acme Global HR Operations.`
      }));
    }
  };

  // Quick Test Dispatch from Trigger Card
  const handleQuickTriggerTest = (trigger) => {
    const defaultPhone = '+917021889883';
    let sampleText = trigger.template_text
      .replace('{{employee_name}}', 'Dr. Julian Morales')
      .replace('{{leave_type}}', 'Privilege Leave')
      .replace('{{start_date}}', '2026-10-01')
      .replace('{{end_date}}', '2026-10-03')
      .replace('{{days}}', '3')
      .replace('{{status}}', 'Approved')
      .replace('{{approver_name}}', 'Emma Walker')
      .replace('{{remarks}}', 'Approved for clinical conference')
      .replace('{{month_year}}', 'September 2026')
      .replace('{{net_salary}}', '7,604.38')
      .replace('{{payment_method}}', 'Direct Bank Transfer')
      .replace('{{payment_ref}}', 'TXN-202609-0941')
      .replace('{{payslip_url}}', 'http://localhost:5173/hrms/ess')
      .replace('{{designation}}', 'Lead Pharmacist')
      .replace('{{onboarding_url}}', 'http://localhost:5173/hrms/lifecycle')
      .replace('{{alert_message}}', 'we noticed you have not clocked in past 10:00 AM')
      .replace('{{date}}', new Date().toISOString().slice(0, 10))
      .replace('{{ess_url}}', 'http://localhost:5173/hrms/ess');

    setComposerForm({
      recipient_phone: defaultPhone,
      recipient_name: 'Dr. Julian Morales',
      channel: trigger.channel === 'both' ? 'whatsapp' : trigger.channel,
      message_text: sampleText,
      user_id: '36'
    });
    setIsComposerOpen(true);
  };

  return (
    <div className="nk-content-inner">
      <div className="nk-content-body">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div 
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.25rem',
              borderRadius: '0.5rem',
              background: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
              color: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircleIcon />}
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="nk-block-head nk-block-head-sm mb-4">
          <div className="nk-block-between align-start flex-wrap gap-3">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <div 
                  style={{ 
                    width: 34, 
                    height: 34, 
                    borderRadius: 8, 
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)'
                  }}
                >
                  <MessageSquare size={18} color="#ffffff" />
                </div>
                <h3 className="nk-block-title page-title" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>
                  Automated WhatsApp & SMS Notification Engine
                </h3>
                <span 
                  style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '9999px', 
                    background: 'rgba(37, 211, 102, 0.15)', 
                    color: '#25D366',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    letterSpacing: '0.025em'
                  }}
                >
                  Tubelight Integration Active
                </span>
              </div>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', margin: 0 }}>
                Event-driven HR triggers, multi-tier delivery webhooks (<code style={{ fontSize: '0.8rem' }}>sent ➔ delivered ➔ read</code>), and automated staff engagement.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                type="button" 
                className="btn btn-outline-light" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                onClick={() => { fetchData(true); if (activeTab === 'logs') fetchLogs(); }}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button 
                type="button" 
                className="btn btn-success" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                }}
                onClick={() => setIsComposerOpen(true)}
              >
                <Send size={14} />
                <span>Send Broadcast / Test</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          
          {/* Total Dispatched */}
          <div 
            style={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '0.75rem', 
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Total Dispatched</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={15} color="#25D366" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
              {stats ? stats.total : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', display: 'flex', gap: '0.75rem' }}>
              <span>🟢 {stats ? stats.whatsapp_count : 0} WhatsApp</span>
              <span>📱 {stats ? stats.sms_count : 0} SMS</span>
            </div>
          </div>

          {/* Delivery Rate */}
          <div 
            style={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '0.75rem', 
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Delivery Rate</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCheck size={16} color="#3b82f6" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
              {stats ? `${stats.delivery_rate}%` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
              {stats ? `${stats.delivered + stats.read} delivered out of ${stats.total}` : 'Loading...'}
            </div>
          </div>

          {/* Read Rate */}
          <div 
            style={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '0.75rem', 
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Read Receipts (Blue Ticks)</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCheck size={16} color="#38bdf8" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8' }}>
              {stats ? `${stats.read_rate}%` : '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
              {stats ? `${stats.read} verified read receipts` : 'Loading...'}
            </div>
          </div>

          {/* Active Gateways */}
          <div 
            style={{ 
              background: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))', 
              borderRadius: '0.75rem', 
              padding: '1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Tubelight Gateway</span>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} color="#10b981" />
              </div>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366' }}></span>
              Connected (Live API)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
              Webhook ingestion listening on <code style={{ fontSize: '0.7rem' }}>/webhook</code>
            </div>
          </div>

        </div>

        {/* ── Navigation Tabs ── */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid hsl(var(--border))', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('triggers')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'triggers' ? '#25D366' : 'hsl(var(--muted-foreground))',
              borderBottom: activeTab === 'triggers' ? '2px solid #25D366' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Zap size={16} />
            <span>Event Triggers Hub</span>
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: '9999px', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366' }}>
              4 Active
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'logs' ? '#25D366' : 'hsl(var(--muted-foreground))',
              borderBottom: activeTab === 'logs' ? '2px solid #25D366' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileText size={16} />
            <span>Delivery Receipts & Activity Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gateway')}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: activeTab === 'gateway' ? '#25D366' : 'hsl(var(--muted-foreground))',
              borderBottom: activeTab === 'gateway' ? '2px solid #25D366' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sliders size={16} />
            <span>Tubelight Gateway Setup</span>
          </button>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 1: EVENT TRIGGERS HUB                                    */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'triggers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
            
            {settings.map((trigger) => {
              const isLeave = trigger.trigger_key === 'leave_approval';
              const isSalary = trigger.trigger_key === 'salary_disbursal';
              const isOnboarding = trigger.trigger_key === 'onboarding_welcome';
              const isAttendance = trigger.trigger_key === 'attendance_alert';

              const icon = isLeave ? <Calendar size={18} color="#10b981" /> :
                           isSalary ? <DollarSign size={18} color="#f59e0b" /> :
                           isOnboarding ? <UserCheck size={18} color="#8b5cf6" /> :
                           <Clock size={18} color="#ef4444" />;

              const accentBorder = isLeave ? 'rgba(16, 185, 129, 0.3)' :
                                   isSalary ? 'rgba(245, 158, 11, 0.3)' :
                                   isOnboarding ? 'rgba(139, 92, 246, 0.3)' :
                                   'rgba(239, 68, 68, 0.3)';

              return (
                <div 
                  key={trigger.id}
                  style={{
                    background: 'hsl(var(--card))',
                    border: `1px solid ${accentBorder}`,
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div>
                    {/* Header: Title + Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {icon}
                        </div>
                        <div>
                          <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                            {trigger.name}
                          </h5>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                            Key: <code>{trigger.trigger_key}</code>
                          </span>
                        </div>
                      </div>

                      {/* Enabled Toggle Switch */}
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.4rem' }}>
                        <input 
                          type="checkbox" 
                          checked={Boolean(trigger.is_enabled)}
                          onChange={(e) => handleUpdateSetting(trigger.trigger_key, { is_enabled: e.target.checked ? 1 : 0 })}
                          style={{ width: 18, height: 18, accentColor: '#25D366' }}
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: trigger.is_enabled ? '#10b981' : 'hsl(var(--muted-foreground))' }}>
                          {trigger.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </label>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginBottom: '0.85rem', minHeight: '2.4rem' }}>
                      {trigger.description}
                    </p>

                    {/* Channel Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>Dispatch Channel:</span>
                      {['whatsapp', 'sms', 'both'].map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => handleUpdateSetting(trigger.trigger_key, { channel: ch })}
                          style={{
                            padding: '0.2rem 0.55rem',
                            fontSize: '0.75rem',
                            borderRadius: '0.35rem',
                            border: trigger.channel === ch ? '1px solid #25D366' : '1px solid hsl(var(--border))',
                            background: trigger.channel === ch ? 'rgba(37, 211, 102, 0.15)' : 'transparent',
                            color: trigger.channel === ch ? '#25D366' : 'hsl(var(--muted-foreground))',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontWeight: trigger.channel === ch ? 600 : 400
                          }}
                        >
                          {ch === 'both' ? 'Dual (WA + SMS)' : ch}
                        </button>
                      ))}
                    </div>

                    {/* Template Preview */}
                    <div 
                      style={{ 
                        background: 'rgba(0,0,0,0.25)', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '0.5rem', 
                        padding: '0.75rem', 
                        fontSize: '0.775rem',
                        fontFamily: 'monospace',
                        color: 'hsl(var(--foreground))',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5,
                        marginBottom: '1rem'
                      }}
                    >
                      {trigger.template_text}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid hsl(var(--border))' }}>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))' }}>
                      Template ID: <code>{trigger.template_name || 'raw_text'}</code>
                    </span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isAttendance && (
                        <button
                          type="button"
                          className="btn btn-outline-warning btn-sm"
                          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={handleRunAttendanceAudit}
                          disabled={runningAttendance}
                        >
                          <Clock size={12} className={runningAttendance ? 'animate-spin' : ''} />
                          <span>{runningAttendance ? 'Auditing...' : 'Run Audit Now'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: '#25D366', color: '#25D366' }}
                        onClick={() => handleQuickTriggerTest(trigger)}
                      >
                        <Send size={12} />
                        <span>Test Trigger</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 2: LIVE DELIVERY RECEIPTS & ACTIVITY LOGS               */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'logs' && (
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', overflow: 'hidden' }}>
            
            {/* Filter Bar */}
            <div style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                {/* Search */}
                <div style={{ position: 'relative', minWidth: 220 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'hsl(var(--muted-foreground))' }} />
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Search recipient, phone or text..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    style={{ paddingLeft: '2rem', height: 34, fontSize: '0.825rem' }}
                  />
                </div>

                {/* Channel Filter */}
                <select
                  className="form-select"
                  value={channelFilter}
                  onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
                  style={{ width: 'auto', height: 34, fontSize: '0.825rem' }}
                >
                  <option value="all">All Channels</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>

                {/* Event Type Filter */}
                <select
                  className="form-select"
                  value={eventFilter}
                  onChange={(e) => { setEventFilter(e.target.value); setPage(1); }}
                  style={{ width: 'auto', height: 34, fontSize: '0.825rem' }}
                >
                  <option value="all">All Triggers</option>
                  <option value="leave_approval">🌴 Leave Decision</option>
                  <option value="salary_disbursal">💰 Salary Disbursal</option>
                  <option value="onboarding_welcome">🚀 Onboarding Welcome</option>
                  <option value="attendance_alert">⏰ Attendance Alert</option>
                  <option value="custom_broadcast">📢 Custom Broadcast</option>
                </select>

                {/* Status Filter */}
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  style={{ width: 'auto', height: 34, fontSize: '0.825rem' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read (Blue Ticks)</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                Showing <strong>{logs.length}</strong> of <strong>{totalLogs}</strong> logged dispatches
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-tranx" style={{ margin: 0 }}>
                <thead>
                  <tr className="tb-tnx-head" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600 }}>Recipient</th>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600 }}>Channel & Trigger</th>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600, width: '35%' }}>Message Content</th>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600 }}>Delivery Receipt</th>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600 }}>Timestamps</th>
                    <th style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--muted-foreground))' }}>
                        No delivery logs found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isWa = log.channel === 'whatsapp';
                      const isRead = log.status === 'read';
                      const isDelivered = log.status === 'delivered';
                      const isSent = log.status === 'sent';
                      const isFailed = log.status === 'failed';

                      return (
                        <tr key={log.id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                          
                          {/* Recipient */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div 
                                style={{ 
                                  width: 30, 
                                  height: 30, 
                                  borderRadius: '50%', 
                                  background: isWa ? 'rgba(37, 211, 102, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                  color: isWa ? '#25D366' : '#3b82f6',
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                {isWa ? 'WA' : 'SMS'}
                              </div>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'hsl(var(--foreground))', display: 'block' }}>
                                  {log.recipient_name || log.user_full_name || 'Staff Member'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                  {log.recipient_phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Channel & Trigger */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span 
                                style={{ 
                                  fontSize: '0.7rem', 
                                  fontWeight: 600, 
                                  padding: '0.15rem 0.45rem', 
                                  borderRadius: '0.25rem',
                                  width: 'fit-content',
                                  background: isWa ? 'rgba(37, 211, 102, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                  color: isWa ? '#25D366' : '#3b82f6'
                                }}
                              >
                                {log.channel.toUpperCase()}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', textTransform: 'capitalize' }}>
                                {log.event_type.replace('_', ' ')}
                              </span>
                            </div>
                          </td>

                          {/* Message Content Preview */}
                          <td style={{ maxWidth: 320 }}>
                            <div 
                              style={{ 
                                fontSize: '0.775rem', 
                                color: 'hsl(var(--foreground))', 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                lineHeight: 1.4
                              }}
                              title={log.message_text}
                            >
                              {log.message_text}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>
                              ID: {log.message_id ? `${log.message_id.substring(0, 22)}...` : 'n/a'}
                            </span>
                          </td>

                          {/* Delivery Status Receipt */}
                          <td>
                            {isRead && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                                <CheckCheck size={16} />
                                <span>Read</span>
                              </div>
                            )}
                            {isDelivered && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', fontWeight: 600 }}>
                                <CheckCheck size={16} />
                                <span>Delivered</span>
                              </div>
                            )}
                            {isSent && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', fontWeight: 500 }}>
                                <Check size={16} />
                                <span>Sent</span>
                              </div>
                            )}
                            {isFailed && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                                <AlertCircle size={15} />
                                <span>Failed</span>
                              </div>
                            )}
                          </td>

                          {/* Timestamps */}
                          <td>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                              <div>Sent: {log.sent_at ? log.sent_at.slice(11, 16) : '—'}</div>
                              {log.read_at ? (
                                <div style={{ color: '#38bdf8' }}>Read: {log.read_at.slice(11, 16)}</div>
                              ) : log.delivered_at ? (
                                <div>Dlv: {log.delivered_at.slice(11, 16)}</div>
                              ) : null}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              {/* Simulate Webhook Button */}
                              <button
                                type="button"
                                className="btn btn-outline-light btn-xs"
                                title="Simulate Webhook delivery callback (cycles sent -> delivered -> read)"
                                aria-label="Simulate Webhook delivery callback (cycles sent -> delivered -> read)" onClick={() => handleSimulateReceipt(log)}
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <RotateCw size={11} />
                                <span>Advance Webhook</span>
                              </button>

                              {/* Inspect Payload */}
                              <button
                                type="button"
                                className="btn btn-dim btn-light btn-xs"
                                title="View raw payload & gateway response"
                                aria-label="View raw payload & gateway response" onClick={() => setSelectedLog(log)}
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                              >
                                Payload
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline-light btn-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                Page {page} of {Math.max(1, Math.ceil(totalLogs / 15))}
              </span>
              <button
                type="button"
                className="btn btn-outline-light btn-xs"
                disabled={page >= Math.ceil(totalLogs / 15)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>

          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* TAB 3: TUBELIGHT GATEWAY SETUP                               */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'gateway' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
            
            {/* Gateway Status & Credentials */}
            <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(37, 211, 102, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} color="#25D366" />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Tubelight Communications Integration</h5>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Live Provider Configuration</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Base URL</span>
                  <code>https://portal.tubelightcommunications.com</code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Send WhatsApp Endpoint</span>
                  <code>/whatsapp/api/v1/send</code>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Authentication Protocol</span>
                  <span>Bearer Token (Auto-refresh with 23h TTL)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Credentials Storage</span>
                  <span>Integrated with <code>whatsapp_api.api_config</code></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ color: 'hsl(var(--muted-foreground))' }}>Fallback Channel</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>SMS Gateway Active</span>
                </div>
              </div>
            </div>

            {/* Webhook Configuration Guide */}
            <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExternalLink size={18} color="#3b82f6" />
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Delivery Receipt Webhook</h5>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Ingestion of carrier status callbacks</span>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                Configure this webhook URL inside your Tubelight Communications Portal dashboard under <strong>API Settings ➔ Webhooks / Callback URL</strong>:
              </p>

              <div 
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem',
                  color: '#25D366',
                  border: '1px solid hsl(var(--border))',
                  marginBottom: '1rem',
                  wordBreak: 'break-all'
                }}
              >
                http://localhost/hrms/backend/api/notifications/webhook
              </div>

              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                <strong>Supported Receipt Actions:</strong>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', lineHeight: 1.6 }}>
                  <li><code>sent</code>: Message transmitted to recipient carrier</li>
                  <li><code>delivered</code>: Received on employee device (grey double check)</li>
                  <li><code>read</code>: Opened by employee in WhatsApp (blue double check)</li>
                  <li><code>failed</code>: Delivery failed (auto-logged with error reason)</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODAL: QUICK TEST COMPOSER                                   */}
        {/* ──────────────────────────────────────────────────────────── */}
        {isComposerOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div 
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                width: '100%',
                maxWidth: 540,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={14} color="#ffffff" />
                  </div>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Send Notification / Test Broadcast</h5>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsComposerOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSendComposer} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Select Member Helper */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem', display: 'block' }}>
                    Select Staff Member (Optional Autofill)
                  </label>
                  <select 
                    className="form-select"
                    value={composerForm.user_id}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="">-- Choose employee to auto-fill --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.designation}) — {m.phone || 'No phone'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Phone & Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem', display: 'block' }}>
                      Recipient Phone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. 917021889883"
                      value={composerForm.recipient_phone}
                      onChange={(e) => setComposerForm({ ...composerForm, recipient_phone: e.target.value })}
                      required
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem', display: 'block' }}>
                      Recipient Name
                    </label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="e.g. Abu Bin Ishtiyak"
                      value={composerForm.recipient_name}
                      onChange={(e) => setComposerForm({ ...composerForm, recipient_name: e.target.value })}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Channel Radio */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem', display: 'block' }}>
                    Delivery Channel
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="channel" 
                        value="whatsapp" 
                        checked={composerForm.channel === 'whatsapp'}
                        onChange={() => setComposerForm({ ...composerForm, channel: 'whatsapp' })}
                        style={{ accentColor: '#25D366' }}
                      />
                      <span>WhatsApp (Tubelight API)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="channel" 
                        value="sms" 
                        checked={composerForm.channel === 'sms'}
                        onChange={() => setComposerForm({ ...composerForm, channel: 'sms' })}
                        style={{ accentColor: '#3b82f6' }}
                      />
                      <span>SMS Gateway</span>
                    </label>
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '0.35rem', display: 'block' }}>
                    Message Content <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea 
                    className="form-control"
                    rows={4}
                    placeholder="Type the message to send via Tubelight WhatsApp Gateway..."
                    value={composerForm.message_text}
                    onChange={(e) => setComposerForm({ ...composerForm, message_text: e.target.value })}
                    required
                    style={{ fontSize: '0.85rem', lineHeight: 1.4 }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsComposerOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success btn-sm"
                    disabled={sendingTest}
                    style={{ 
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Send size={13} className={sendingTest ? 'animate-spin' : ''} />
                    <span>{sendingTest ? 'Sending via Gateway...' : 'Send Now'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* MODAL: PAYLOAD INSPECTION                                    */}
        {/* ──────────────────────────────────────────────────────────── */}
        {selectedLog && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div 
              style={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                width: '100%',
                maxWidth: 600,
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Message Payload & Gateway Response</h5>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                    ID: <code>{selectedLog.message_id}</code>
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedLog(null)}
                  style={{ background: 'none', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>
                    Full Message Text
                  </span>
                  <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid hsl(var(--border))', borderRadius: '0.4rem', padding: '0.75rem', fontSize: '0.8rem', marginTop: '0.35rem', whiteSpace: 'pre-wrap' }}>
                    {selectedLog.message_text}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>
                    Outbound Request Payload (JSON)
                  </span>
                  <pre style={{ background: '#090d16', border: '1px solid hsl(var(--border))', borderRadius: '0.4rem', padding: '0.75rem', fontSize: '0.75rem', color: '#10b981', marginTop: '0.35rem', overflowX: 'auto' }}>
                    {selectedLog.raw_payload ? JSON.stringify(typeof selectedLog.raw_payload === 'string' ? JSON.parse(selectedLog.raw_payload) : selectedLog.raw_payload, null, 2) : 'No raw payload recorded'}
                  </pre>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' }}>
                    Tubelight Gateway API Response
                  </span>
                  <pre style={{ background: '#090d16', border: '1px solid hsl(var(--border))', borderRadius: '0.4rem', padding: '0.75rem', fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.35rem', overflowX: 'auto' }}>
                    {selectedLog.api_response ? JSON.stringify(typeof selectedLog.api_response === 'string' ? JSON.parse(selectedLog.api_response) : selectedLog.api_response, null, 2) : 'No raw response recorded'}
                  </pre>
                </div>

              </div>

              {/* Footer */}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-outline-light btn-sm"
                  onClick={() => setSelectedLog(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
