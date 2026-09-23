import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, Shield, Globe, ArrowLeft } from 'lucide-react';
import { membersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MemberProfile() {
  const { currentUser, isEmployee } = useAuth();
  const [searchParams] = useSearchParams();
  const memberId = isEmployee ? (currentUser?.id || 36) : (searchParams.get('id') || currentUser?.id || 1);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    membersApi.getById(memberId)
      .then(res => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  if (!member) {
    return (
      <div className="empty-state">
        <p>Member profile not found</p>
        <Link to={isEmployee ? "/hrms/ess" : "/hrms/members"} className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> {isEmployee ? 'Back to Dashboard' : 'Back to Members'}
        </Link>
      </div>
    );
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'badge badge-success';
      case 'Inactive': return 'badge badge-secondary';
      case 'Suspend': return 'badge badge-destructive';
      default: return 'badge badge-outline';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEmployee ? 'My Profile & Employment Details' : 'Member Profile'}</h1>
          <p>{isEmployee ? 'Personal records, employment contract, preferences, and verified credentials' : 'Personal information and preferences'}</p>
        </div>
        <Link to={isEmployee ? "/hrms/ess" : "/hrms/members"} className="btn btn-outline">
          <ArrowLeft size={16} /> {isEmployee ? 'Back to Dashboard' : 'Back'}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Sidebar Card */}
        <div className="card">
          <div className="card-content" style={{ textAlign: 'center', paddingTop: '2rem' }}>
            <div className="avatar avatar-purple" style={{ width: '72px', height: '72px', fontSize: '1.5rem', margin: '0 auto 1rem' }}>
              {getInitials(member.full_name)}
            </div>
            <h3 style={{ fontSize: '1.1rem' }}>{member.full_name}</h3>
            <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>{member.email}</p>
            <div style={{ marginTop: '0.75rem' }}>
              <span className={statusBadgeClass(member.status)}>{member.status}</span>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="badge badge-outline">{member.designation}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Basic Information</h4>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <InfoRow icon={<Mail size={16} />} label="Full Name" value={member.full_name} />
                <InfoRow icon={<Mail size={16} />} label="Display Name" value={member.display_name || '—'} />
                <InfoRow icon={<Mail size={16} />} label="Email" value={member.email} />
                <InfoRow icon={<Phone size={16} />} label="Phone" value={member.phone || 'Not added yet'} />
                <InfoRow icon={<Calendar size={16} />} label="Date of Birth" value={member.date_of_birth || '—'} />
                <InfoRow icon={<MapPin size={16} />} label="Address" value={member.address || '—'} />
                <InfoRow icon={<Calendar size={16} />} label="Joining Date" value={member.joining_date} />
                <InfoRow icon={<Shield size={16} />} label="Role" value={member.role_name || '—'} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          {member.settings && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Preferences</h4>
              </div>
              <div className="card-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <InfoRow icon={<Globe size={16} />} label="Language" value={member.settings.language} />
                  <InfoRow icon={<Calendar size={16} />} label="Date Format" value={member.settings.date_format} />
                  <InfoRow icon={<Globe size={16} />} label="Timezone" value={member.settings.timezone} />
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {member.documents && member.documents.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Documents</h4>
              </div>
              <div className="card-content">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.documents.map((doc) => (
                      <tr key={doc.id}>
                        <td><span className="badge badge-outline">{doc.document_type}</span></td>
                        <td>{doc.document_name}</td>
                        <td className="text-sm text-muted">{doc.uploaded_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
