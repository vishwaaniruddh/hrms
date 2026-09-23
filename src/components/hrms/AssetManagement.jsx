import React, { useState, useEffect, useCallback } from 'react';
import { 
  Laptop, 
  Monitor, 
  Key, 
  Smartphone, 
  Headphones, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Box, 
  History, 
  DollarSign, 
  X, 
  ShieldCheck, 
  ArrowRightLeft,
  User,
  Calendar,
  Pencil,
  Trash2
} from 'lucide-react';
import { assetsApi, membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_TABS = ['All', 'Available', 'Assigned', 'Under Repair'];

export default function AssetManagement() {
  const { currentUser, isEmployee, isManager, isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState({
    total_assets: 0,
    assigned_count: 0,
    available_count: 0,
    repair_count: 0,
    total_valuation: 0
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [historyModal, setHistoryModal] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Notification Banner
  const [alertInfo, setAlertInfo] = useState(null);
  const [saving, setSaving] = useState(false);

  // Add Asset Form
  const [addForm, setAddForm] = useState({
    name: '',
    category_id: '1',
    asset_tag: '',
    serial_number: '',
    brand: '',
    model: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_cost: '',
    condition: 'Good',
    notes: ''
  });

  // Assign Form
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    condition: 'Good',
    notes: ''
  });

  // Return Form
  const [returnForm, setReturnForm] = useState({
    condition: 'Good',
    returned_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (isEmployee && currentUser?.id) params.user_id = currentUser.id;
      if (search) params.search = search;
      if (statusTab !== 'All') params.status = statusTab;
      if (categoryFilter) params.category_id = categoryFilter;

      const res = await assetsApi.getAll(params);
      setAssets(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusTab, categoryFilter, isEmployee, currentUser?.id]);

  const fetchStats = useCallback(async () => {
    try {
      const params = isEmployee && currentUser?.id ? { user_id: currentUser.id } : {};
      const res = await assetsApi.getStats(params);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, [isEmployee, currentUser?.id]);

  const fetchCategories = async () => {
    try {
      const res = await assetsApi.getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await membersApi.getAll({ per_page: 100 });
      if (res.data) setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStats();
    fetchMembers();
  }, [fetchStats]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const showAlert = (message, type = 'success') => {
    setAlertInfo({ message, type });
    setTimeout(() => setAlertInfo(null), 4000);
  };

  // Open Assign Modal
  const openAssignModal = (asset) => {
    setAssignModal(asset);
    setAssignForm({
      user_id: members[0]?.id ? String(members[0].id) : '',
      assigned_date: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      condition: asset.condition || 'Good',
      notes: ''
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.user_id) {
      showAlert('Please select an employee to assign this asset.', 'error');
      return;
    }
    setSaving(true);
    try {
      await assetsApi.assign(assignModal.id, {
        user_id: assignForm.user_id,
        assigned_date: assignForm.assigned_date,
        expected_return_date: assignForm.expected_return_date || null,
        condition: assignForm.condition,
        notes: assignForm.notes
      });
      showAlert(`Asset ${assignModal.asset_tag} assigned successfully!`);
      setAssignModal(null);
      fetchAssets();
      fetchStats();
    } catch (err) {
      showAlert(err.message || 'Failed to assign asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (asset) => {
    setReturnModal(asset);
    setReturnForm({
      condition: asset.condition || 'Good',
      returned_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await assetsApi.return(returnModal.id, {
        condition: returnForm.condition,
        returned_date: returnForm.returned_date,
        notes: returnForm.notes || 'Returned to IT central storage'
      });
      showAlert(`Asset ${returnModal.asset_tag} returned to storage.`);
      setReturnModal(null);
      fetchAssets();
      fetchStats();
    } catch (err) {
      showAlert(err.message || 'Failed to return asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Open History Audit Modal
  const openHistoryModal = async (asset) => {
    setHistoryModal(asset);
    setLoadingHistory(true);
    try {
      const res = await assetsApi.getAssignments({ asset_id: asset.id });
      setHistoryLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history logs', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Add Asset Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.asset_tag || !addForm.serial_number || !addForm.brand) {
      showAlert('Please fill in all mandatory asset fields.', 'error');
      return;
    }
    setSaving(true);
    try {
      await assetsApi.create({
        ...addForm,
        purchase_cost: parseFloat(addForm.purchase_cost) || 0
      });
      showAlert(`Asset ${addForm.asset_tag} registered successfully!`);
      setShowAddModal(false);
      setAddForm({
        name: '',
        category_id: '1',
        asset_tag: '',
        serial_number: '',
        brand: '',
        model: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_cost: '',
        condition: 'Good',
        notes: ''
      });
      fetchAssets();
      fetchStats();
    } catch (err) {
      showAlert(err.message || 'Failed to create asset', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id) => {
    try {
      await assetsApi.delete(id);
      setShowDeleteConfirm(null);
      showAlert('Asset deleted from inventory.');
      fetchAssets();
      fetchStats();
    } catch (err) {
      showAlert(err.message || 'Failed to delete asset', 'error');
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (assets.length === 0) return;
    const headers = ['Asset Tag', 'Device Name', 'Category', 'Brand', 'Model', 'Serial Number', 'Cost', 'Condition', 'Status', 'Assigned To'];
    const rows = assets.map(a => [
      a.asset_tag,
      `"${a.name}"`,
      `"${a.category_name}"`,
      a.brand,
      a.model,
      a.serial_number,
      `$${a.purchase_cost}`,
      a.condition,
      a.status,
      a.assigned_to_name ? `"${a.assigned_to_name}"` : 'In Storage'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `it_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (code) => {
    switch (code) {
      case 'LAPTOP': return <Laptop size={15} />;
      case 'MONITOR': return <Monitor size={15} />;
      case 'SECURITY': return <Key size={15} />;
      case 'MOBILE': return <Smartphone size={15} />;
      default: return <Headphones size={15} />;
    }
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
          <h1>{isEmployee ? 'My Issued Equipment & Devices' : 'IT Asset & Hardware Inventory'}</h1>
          <p>
            {isEmployee
              ? 'Official hardware, workstations, monitors, and security tokens issued for your active employment.'
              : 'Track company devices, monitors, security keys, serial tags, and staff assignments.'}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={exportCSV} title="Export current inventory to CSV">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          {!isEmployee && (
            <button 
              className="btn btn-primary" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={15} />
              <span>Add Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Sleek Compact KPI Metric Cards with Subtle Gradients */}
      <div className="stats-grid">
        <div className="stat-card gradient-emerald">
          <div className="stat-header">
            <span className="stat-label">{isEmployee ? 'Assigned Assets' : 'Total Assets'}</span>
            <div className="stat-icon-wrapper">
              <Laptop size={14} />
            </div>
          </div>
          <div className="stat-value">{isEmployee ? (stats.assigned_count || stats.total_assets || assets.length) : (stats.total_assets || 0)}</div>
          <div className="stat-subtext">
            <span className="stat-trend-up">{categories.length}</span>
            <span>hardware categories</span>
          </div>
        </div>

        <div className="stat-card gradient-blue">
          <div className="stat-header">
            <span className="stat-label">{isEmployee ? 'Custody Holder' : 'Assigned to Staff'}</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--primary))' }}>
              <UserCheck size={14} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'hsl(var(--primary))', fontSize: isEmployee ? '1.1rem' : '1.85rem' }}>
            {isEmployee ? (currentUser?.name || 'Assigned') : (stats.assigned_count || 0)}
          </div>
          <div className="stat-subtext">
            <span>{isEmployee ? 'Verified Employee Custody' : 'Active employee custody'}</span>
          </div>
        </div>

        <div className="stat-card gradient-amber">
          <div className="stat-header">
            <span className="stat-label">{isEmployee ? 'Hardware Status' : 'In Storage / Ready'}</span>
            <div className="stat-icon-wrapper" style={{ color: 'hsl(var(--success))' }}>
              <Box size={14} />
            </div>
          </div>
          <div className="stat-value">{isEmployee ? 'Operational' : (stats.available_count || 0)}</div>
          <div className="stat-subtext">
            <span>{isEmployee ? 'IT compliance verified' : 'Available for onboarding'}</span>
          </div>
        </div>

        <div className="stat-card gradient-purple">
          <div className="stat-header">
            <span className="stat-label">{isEmployee ? 'Issued Valuation' : 'Hardware Valuation'}</span>
            <div className="stat-icon-wrapper">
              <DollarSign size={14} />
            </div>
          </div>
          <div className="stat-value">
            ${Number(stats.total_valuation || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="stat-subtext">
            <span>{isEmployee ? 'Insured equipment value' : 'Capital equipment investment'}</span>
          </div>
        </div>
      </div>

      {/* Unified Filter & Action Bar in Single Horizontal Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.85rem',
        flexWrap: 'wrap'
      }}>
        {/* Left: Status Filter Tabs */}
        {!isEmployee ? (
          <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                className={`tabs-trigger${statusTab === tab ? ' active' : ''}`}
                style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}
                onClick={() => { setStatusTab(tab); setPage(1); }}
              >
                <span>{tab === 'All' ? 'All Assets' : tab}</span>
                <span className="tab-count">
                  {tab === 'All' ? (stats.total_assets || total) :
                   tab === 'Available' ? (stats.available_count || 0) :
                   tab === 'Assigned' ? (stats.assigned_count || 0) : (stats.repair_count || 0)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="tabs-list" style={{ height: '34px', padding: '3px', flexShrink: 0 }}>
            <button type="button" className="tabs-trigger active" style={{ padding: '0.2rem 0.65rem', fontSize: '0.78rem' }}>
              <span>My Issued Assets</span>
              <span className="tab-count">{assets.length}</span>
            </button>
          </div>
        )}

        {/* Right: Search + Category Filter + Result Count in same line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', minWidth: '320px' }}>
          <div className="search-input-wrapper" style={{ maxWidth: '260px', minWidth: '180px' }}>
            <Search className="search-input-icon" size={13} />
            <input
              type="text"
              className="search-input"
              style={{ height: '34px', fontSize: '0.8rem', paddingLeft: '2.1rem' }}
              placeholder="Search tag, serial, staff..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            style={{ height: '34px', fontSize: '0.8rem', minWidth: '140px' }}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <span className="text-sm text-muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', marginLeft: '0.35rem' }}>
            Showing <strong>{assets.length}</strong> of <strong>{total}</strong> devices
          </span>
        </div>
      </div>

      {/* Data Table with nowrap styling */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <div className="loading-spinner" style={{ minHeight: '60px' }}>
              <div className="spinner"></div>
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading IT inventory...</p>
          </div>
        ) : assets.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            <Laptop size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <h3 style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>No assets found</h3>
            <p className="text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: '130px' }}>Asset Tag</th>
                <th style={{ whiteSpace: 'nowrap' }}>Device / Hardware</th>
                <th style={{ whiteSpace: 'nowrap' }}>Category</th>
                <th style={{ whiteSpace: 'nowrap' }}>Serial Number</th>
                <th style={{ whiteSpace: 'nowrap' }}>Condition</th>
                <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ whiteSpace: 'nowrap' }}>Assigned Custody</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  {/* Dedicated Column 1: Asset Tag */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', whiteSpace: 'nowrap' }}>
                      <div className="stat-icon-wrapper" style={{ width: '26px', height: '26px', flexShrink: 0 }}>
                        {getCategoryIcon(asset.category_code)}
                      </div>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: '4px',
                        backgroundColor: 'oklch(0.65 0.16 162.5 / 0.15)',
                        color: 'var(--primary)',
                        border: '1px solid oklch(0.65 0.16 162.5 / 0.3)',
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                      }}>
                        {asset.asset_tag}
                      </span>
                    </div>
                  </td>

                  {/* Dedicated Column 2: Device / Hardware */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                        {asset.brand} {asset.model ? `• ${asset.model}` : ''}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 500, color: 'var(--muted-foreground)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {asset.category_name}

                    </span>
                  </td>

                  {/* Serial Number */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'var(--muted)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      whiteSpace: 'nowrap'
                    }}>
                      {asset.serial_number}
                    </span>
                  </td>

                  {/* Condition */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge ${
                      asset.condition === 'New' ? 'badge-success' :
                      asset.condition === 'Good' ? 'badge-secondary' :
                      asset.condition === 'Fair' ? 'badge-warning' : 'badge-destructive'
                    }`} style={{ whiteSpace: 'nowrap' }}>
                      {asset.condition}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge ${
                      asset.status === 'Available' ? 'badge-success' :
                      asset.status === 'Assigned' ? 'badge-secondary' :
                      asset.status === 'Under Repair' ? 'badge-warning' : 'badge-destructive'
                    }`} style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge-dot" />
                      {asset.status === 'Available' ? 'In Storage' : asset.status}
                    </span>
                  </td>

                  {/* Assigned Custody */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {asset.assigned_to_name ? (
                      <div className="user-cell" style={{ whiteSpace: 'nowrap' }}>
                        <div className="cell-avatar" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                          {asset.assigned_to_name.charAt(0)}
                        </div>
                        <div style={{ whiteSpace: 'nowrap' }}>
                          <div className="cell-title" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{asset.assigned_to_name}</div>
                          <div className="cell-subtitle" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{asset.assigned_to_designation || 'Staff'}</div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        In Storage Safe
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                      {/* History Logs */}
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Custody Audit History"
                        onClick={() => openHistoryModal(asset)}
                      >
                        <History size={14} />
                      </button>

                      {!isEmployee && (
                        <>
                          {/* Available -> Assign Button */}
                          {asset.status === 'Available' && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'oklch(0.65 0.16 162.5 / 0.4)', color: 'var(--primary)', height: '28px', padding: '0 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                              title="Assign to Staff"
                              onClick={() => openAssignModal(asset)}
                            >
                              <UserCheck size={12} />
                              <span>Assign</span>
                            </button>
                          )}

                          {/* Assigned -> Return Button */}
                          {asset.status === 'Assigned' && (
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: 'oklch(0.78 0.16 75 / 0.4)', color: 'var(--warning)', height: '28px', padding: '0 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                              title="Return Asset to Storage"
                              onClick={() => openReturnModal(asset)}
                            >
                              <ArrowRightLeft size={12} />
                              <span>Return</span>
                            </button>
                          )}

                          {/* Delete Asset */}
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: 'var(--destructive)', width: '28px', height: '28px' }}
                            title="Delete Asset"
                            onClick={() => setShowDeleteConfirm(asset.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}


        {/* Table Pagination */}
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

      {/* ── MODAL 1: ADD NEW ASSET ── */}
      {showAddModal && (
        <div className="dialog-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Register New IT Asset</h2>
              <p className="dialog-description">Add hardware, laptop, or peripheral equipment to central company inventory.</p>
              <button 
                type="button" 
                className="dialog-close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="dialog-body">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Device Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="e.g. MacBook Pro 16&quot; M3 Max"
                      value={addForm.name}
                      onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Asset Tag <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input font-mono" 
                      required
                      placeholder="e.g. AST-00106"
                      value={addForm.asset_tag}
                      onChange={e => setAddForm({ ...addForm, asset_tag: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      value={addForm.category_id}
                      onChange={e => setAddForm({ ...addForm, category_id: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      placeholder="e.g. Apple, Dell, Lenovo"
                      value={addForm.brand}
                      onChange={e => setAddForm({ ...addForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model / Part No.</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. XPS 15 9530 i9"
                      value={addForm.model}
                      onChange={e => setAddForm({ ...addForm, model: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial Number <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input font-mono" 
                      required
                      placeholder="e.g. C02G1234MD6R"
                      value={addForm.serial_number}
                      onChange={e => setAddForm({ ...addForm, serial_number: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Cost (USD)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      placeholder="0.00"
                      value={addForm.purchase_cost}
                      onChange={e => setAddForm({ ...addForm, purchase_cost: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={addForm.purchase_date}
                      onChange={e => setAddForm({ ...addForm, purchase_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Condition</label>
                    <select 
                      className="form-select"
                      value={addForm.condition}
                      onChange={e => setAddForm({ ...addForm, condition: e.target.value })}
                    >
                      <option value="New">Brand New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Notes & Accessories</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="e.g. 140W USB-C charger, HDMI adapter, storage shelf 4B..."
                      value={addForm.notes}
                      onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ASSIGN ASSET TO EMPLOYEE ── */}
      {assignModal && (
        <div className="dialog-overlay" onClick={() => setAssignModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Assign IT Equipment</h2>
              <p className="dialog-description">Allocate custody of {assignModal.name} to a company employee.</p>
              <button 
                type="button" 
                className="dialog-close-btn"
                onClick={() => setAssignModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="dialog-body">
                {/* Equipment Summary Ribbon */}
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--muted)',
                  border: '1px solid var(--border)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{assignModal.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                      SN: <span className="font-mono">{assignModal.serial_number}</span> • {assignModal.brand}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'oklch(0.65 0.16 162.5 / 0.15)',
                    color: 'var(--primary)',
                    border: '1px solid oklch(0.65 0.16 162.5 / 0.3)'
                  }}>
                    {assignModal.asset_tag}
                  </span>
                </div>

                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Assign to Employee <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      required
                      value={assignForm.user_id}
                      onChange={e => setAssignForm({ ...assignForm, user_id: e.target.value })}
                    >
                      <option value="">Select Employee...</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.designation || 'Staff'} • {m.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Handover Date <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required
                      value={assignForm.assigned_date}
                      onChange={e => setAssignForm({ ...assignForm, assigned_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Return Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={assignForm.expected_return_date}
                      onChange={e => setAssignForm({ ...assignForm, expected_return_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Handover Condition</label>
                    <select 
                      className="form-select"
                      value={assignForm.condition}
                      onChange={e => setAssignForm({ ...assignForm, condition: e.target.value })}
                    >
                      <option value="New">Brand New</option>
                      <option value="Good">Good Condition</option>
                      <option value="Fair">Fair / Minor Scratches</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Handover Notes & Included Items</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="e.g. Issued with power adapter, carry pouch, USB adapter..."
                      value={assignForm.notes}
                      onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setAssignModal(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: RETURN ASSET TO STORAGE ── */}
      {returnModal && (
        <div className="dialog-overlay" onClick={() => setReturnModal(null)}>
          <div className="dialog-content" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Return Equipment to Storage</h2>
              <p className="dialog-description">Relieve staff custody and check item back into central safe.</p>
              <button 
                type="button" 
                className="dialog-close-btn"
                onClick={() => setReturnModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit}>
              <div className="dialog-body">
                {/* Current Custody Info */}
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'oklch(0.78 0.16 75 / 0.1)',
                  border: '1px solid oklch(0.78 0.16 75 / 0.25)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.9rem' }}>{returnModal.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                      Currently held by: <strong style={{ color: 'var(--foreground)' }}>{returnModal.assigned_to_name}</strong>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: 'oklch(0.78 0.16 75 / 0.2)',
                    color: 'var(--warning)',
                    border: '1px solid oklch(0.78 0.16 75 / 0.35)'
                  }}>
                    {returnModal.asset_tag}
                  </span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Return Date <span className="required">*</span></label>
                    <input 
                      type="date" 
                      className="form-input" 
                      required
                      value={returnForm.returned_date}
                      onChange={e => setReturnForm({ ...returnForm, returned_date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Condition on Inspection <span className="required">*</span></label>
                    <select 
                      className="form-select"
                      value={returnForm.condition}
                      onChange={e => setReturnForm({ ...returnForm, condition: e.target.value })}
                    >
                      <option value="Good">Good (Ready for Re-issue)</option>
                      <option value="Fair">Fair (Normal Wear)</option>
                      <option value="Damaged">Damaged (Needs Repair)</option>
                    </select>
                  </div>

                  <div className="form-group col-span-2">
                    <label className="form-label">Return Inspection Notes</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="e.g. Device inspected, charger returned, memory wiped, no physical defects..."
                      value={returnForm.notes}
                      onChange={e => setReturnForm({ ...returnForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="dialog-footer">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setReturnModal(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Returning...' : 'Confirm Return to Storage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: CUSTODY AUDIT HISTORY ── */}
      {historyModal && (
        <div className="dialog-overlay" onClick={() => setHistoryModal(null)}>
          <div className="dialog-content" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title">Custody Audit Trail</h2>
              <p className="dialog-description">Historical assignment logs and return records for {historyModal.asset_tag}.</p>
              <button 
                type="button" 
                className="dialog-close-btn"
                onClick={() => setHistoryModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="dialog-body">
              {/* Device summary bar */}
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div>
                  <strong>{historyModal.name}</strong>
                  <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.5rem', fontFamily: 'monospace' }}>
                    ({historyModal.serial_number})
                  </span>
                </div>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{historyModal.brand} {historyModal.model}</span>
              </div>

              {loadingHistory ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  <div className="loading-spinner" style={{ minHeight: '40px' }}>
                    <div className="spinner"></div>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Loading audit logs...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem 0', fontSize: '0.85rem' }}>
                  No historical assignments found for this asset.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyLogs.map(log => (
                    <div 
                      key={log.id} 
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="cell-avatar" style={{ width: '26px', height: '26px', fontSize: '0.7rem' }}>
                            {log.member_name ? log.member_name.charAt(0) : 'U'}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '0.85rem' }}>{log.member_name}</span>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>({log.designation || 'Staff'})</span>
                        </div>
                        <span className={`badge ${log.status === 'Active' ? 'badge-success' : 'badge-secondary'}`}>
                          {log.status === 'Active' ? 'Active Custody' : 'Returned'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)', paddingTop: '0.35rem' }}>
                        <span>Assigned: <strong style={{ color: 'var(--foreground)' }}>{log.assigned_date}</strong></span>
                        <span>{log.returned_date ? <>Returned: <strong style={{ color: 'var(--foreground)' }}>{log.returned_date}</strong></> : <span style={{ color: 'var(--primary)' }}>Currently held</span>}</span>
                      </div>

                      {log.notes && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0, fontStyle: 'italic', backgroundColor: 'var(--background)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dialog-footer">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setHistoryModal(null)}
              >
                Close Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: DELETE CONFIRMATION ── */}
      {showDeleteConfirm && (
        <div className="dialog-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="dialog-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h2 className="dialog-title" style={{ color: 'var(--destructive)' }}>Delete Asset Record?</h2>
              <p className="dialog-description">This action cannot be undone. Are you sure you want to permanently remove this device?</p>
            </div>
            <div className="dialog-footer">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-destructive"
                onClick={() => handleDeleteAsset(showDeleteConfirm)}
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
