import React from 'react';
import {
    Briefcase,
    GraduationCap,
    History,
    Wallet,
    FileDigit,
    ShieldCheck,
    Banknote,
    ArrowLeft,
    Edit3,
    Mail,
    Phone,
    Plus,
    Edit,
    Trash2,
    Sparkles,
    ShieldAlert,
    Users,
    User,
    Calendar,
    Eye,
    Download,
    FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';

const EmployeeProfileModal = () => {
    const {
        user,
        selectedEmployee,
        setShowEmployeeProfile,
        activeProfileTab,
        setActiveProfileTab,
        handleEdit,
        handleAdd,
        handleDelete,
        canEdit,
        canDelete,
        canCreate,
        getPhotoUrl
    } = useData();

    if (!selectedEmployee) return null;

    const isSelf = user?.employee_profile_id === selectedEmployee?.id;
    const effectiveStatus = (selectedEmployee.status === 'Suspicious' && isSelf) ? 'Active' : (selectedEmployee.status || 'Active');

    let tabs = [
        { id: 'Employment', icon: <Briefcase size={16} /> },
        { id: 'Education', icon: <GraduationCap size={16} /> },
        { id: 'Experience', icon: <History size={16} /> },
        { id: 'Documents', icon: <FileText size={16} /> },
        { id: 'Bank', icon: <Wallet size={16} /> },
        { id: 'EPFO', icon: <FileDigit size={16} /> },
        { id: 'Health', icon: <ShieldCheck size={16} /> },
        { id: 'Salary', icon: <Banknote size={16} /> }
    ];

    if (selectedEmployee.employee_code === 'ADM-001') {
        tabs = [];
    }

    if (selectedEmployee.user_details) {
        tabs.push({ id: 'Account', icon: <User size={16} /> });
    }

    return (
        <div className="modal-overlay active" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.98)' }}>
            <div className="modal-content fade-in" style={{
                height: '100vh',
                width: '100vw',
                background: '#fcf8f1',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                borderRadius: 0,
                maxWidth: 'none'
            }}>
                {/* Header Bar */}
                <div className="modal-header" style={{ padding: '1.5rem 2rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            overflow: 'hidden'
                        }}>
                            {selectedEmployee.photo ? (
                                <img src={getPhotoUrl(selectedEmployee.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                selectedEmployee.name?.[0]
                            )}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{selectedEmployee.name}</h1>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{selectedEmployee.employee_code}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowEmployeeProfile(false)}
                            className="btn-secondary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                background: '#fff7ed',
                                color: '#64748b',
                                border: '1px solid #fde6cd',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
                        >
                            <ArrowLeft size={18} /> Exit Profile
                        </button>
                        {(canEdit('Employees') || user?.employee_profile_id === selectedEmployee?.id) && (
                            <button
                                onClick={() => handleEdit('Employees', { ...selectedEmployee, _is_profile_edit: user?.employee_profile_id === selectedEmployee?.id })}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 12px rgba(190, 24, 93, 0.25)'
                                }}
                            >
                                <Edit3 size={18} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="modal-form-container" style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

                        {/* Profile Top Stats Card */}
                        <div className="detail-header-grid" style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            marginBottom: '2rem',
                            border: '1px solid #fde6cd',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)'
                        }}>
                            {/* Large Avatar */}
                            <div
                                style={{ position: 'relative', cursor: (canEdit('Employees') || user?.employee_profile_id === selectedEmployee?.id) ? 'pointer' : 'default' }}
                                onClick={() => (canEdit('Employees') || user?.employee_profile_id === selectedEmployee?.id) && handleEdit('Employees', { ...selectedEmployee, _is_profile_edit: user?.employee_profile_id === selectedEmployee?.id })}
                                className="avatar-container"
                            >
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '40px',
                                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#be185d',
                                    fontSize: '3.5rem',
                                    fontWeight: 800,
                                    border: '4px solid white',
                                    boxShadow: '0 20px 25px -5px rgba(190, 24, 93, 0.1)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {selectedEmployee.photo ? (
                                        <img src={getPhotoUrl(selectedEmployee.photo)} alt={selectedEmployee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        selectedEmployee.name?.split(' ').map(n => n[0]).join('').substring(0, 2)
                                    )}
                                    {canEdit('Employees') && (
                                        <div className="avatar-edit-overlay" style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        }}>
                                            <Edit size={32} />
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    right: '-10px',
                                    background: '#10b981',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '4px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                                </div>
                            </div>

                            {/* Main Identity */}
                            <div>
                                <div style={{ color: '#be185d', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Primary Assignment</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>{selectedEmployee.positions_details?.[0]?.name || 'Position Pending'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <span style={{ padding: '4px 12px', background: '#ffedd5', color: '#f97316', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{selectedEmployee.positions_details?.[0]?.department_name || 'Organization'}</span>
                                    {selectedEmployee.positions_details?.[0]?.project_name && (
                                        <span style={{ padding: '4px 12px', background: 'rgba(136, 19, 55, 0.05)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {selectedEmployee.positions_details[0].project_name}
                                        </span>
                                    )}
                                    <span style={{ color: '#94a3b8' }}>•</span>
                                    <span style={{ color: '#64748b', fontWeight: 500 }}>Employee Code: {selectedEmployee.employee_code}</span>
                                    <span style={{ color: '#94a3b8' }}>•</span>
                                    <span style={{
                                        padding: '2px 10px',
                                        background: effectiveStatus === 'Active' ? '#dcfce7' : (effectiveStatus === 'Suspicious' ? '#fef3c7' : '#fee2e2'),
                                        color: effectiveStatus === 'Active' ? '#166534' : (effectiveStatus === 'Suspicious' ? '#92400e' : '#991b1b'),
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800
                                    }}>
                                        {effectiveStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Quick Links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#64748b', border: '1px solid #fde6cd' }}>
                                        <Mail size={18} style={{ margin: 'auto' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>PRIMARY EMAIL</div>
                                        <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{selectedEmployee.email || selectedEmployee.personal_email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyItems: 'center', color: '#64748b', border: '1px solid #fde6cd' }}>
                                        <Phone size={18} style={{ margin: 'auto' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>OFFICIAL PHONE</div>
                                        <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{selectedEmployee.phone || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tenure Status */}
                            <div style={{ paddingLeft: '4rem', borderLeft: '1px solid #fcf8f1' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem' }}>TENURE PERIOD</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                    {(() => {
                                        if (!selectedEmployee.hire_date) return '0 Years';
                                        const start = new Date(selectedEmployee.hire_date);
                                        const end = new Date();

                                        // Calculate difference in months
                                        const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                                        const adjustedMonths = end.getDate() < start.getDate() ? diffInMonths - 1 : diffInMonths;

                                        const finalYears = Math.floor(adjustedMonths / 12);
                                        const finalAllMonths = adjustedMonths % 12;

                                        if (finalYears > 0 && finalAllMonths > 0) return `${finalYears} Yrs ${finalAllMonths} Mos`;
                                        if (finalYears > 0) return `${finalYears} Years`;
                                        if (finalAllMonths > 0) return `${finalAllMonths} Months`;
                                        return '0 Years';
                                    })()}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Joined: {selectedEmployee.hire_date || 'N/A'}</div>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.5rem' }}>REPORTING TO</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be185d' }}>
                                            <Users size={12} />
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#be185d' }}>
                                            {selectedEmployee.reporting_to_name || 'Organization Head'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs (Pill Style) */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveProfileTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '12px 24px',
                                        borderRadius: '16px',
                                        border: '1px solid',
                                        borderColor: activeProfileTab === tab.id ? 'var(--primary)' : '#fde6cd',
                                        background: activeProfileTab === tab.id ? 'var(--primary)' : 'white',
                                        color: activeProfileTab === tab.id ? 'white' : '#64748b',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: activeProfileTab === tab.id ? '0 10px 15px -3px rgba(190, 24, 93, 0.3)' : 'none'
                                    }}
                                >
                                    {tab.icon}
                                    {tab.id}
                                </button>
                            ))}
                        </div>

                        {/* Content Canvas */}
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            minHeight: '500px',
                            border: '1px solid #fde6cd',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                        }}>
                            {activeProfileTab === 'Employment' && (
                                <div className="fade-in">
                                    <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #fff7ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Lifecycle & Career Journey</h2>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Mapping the internal progression and historical assignments.</p>
                                        </div>
                                        {canCreate('Employment History') && (
                                            <button
                                                className="btn-primary"
                                                style={{ background: '#be185d', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                                onClick={() => handleAdd('Employment History', { employee: selectedEmployee.id })}
                                            >
                                                <Plus size={18} /> Add Record
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem 3rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Position / Role</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Department</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Period</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Status</th>
                                                    <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ background: 'rgba(190, 24, 93, 0.03)', borderRadius: '16px' }}>
                                                    <td style={{ padding: '1.5rem 1rem', borderRadius: '16px 0 0 16px', borderLeft: '4px solid #be185d' }}>
                                                        <div style={{ fontWeight: 800, color: '#be185d' }}>{selectedEmployee.positions_details?.[0]?.name || 'Primary Role'}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Active Current Assignment</div>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 1rem', color: '#475569', fontWeight: 600 }}>{selectedEmployee.positions_details?.[0]?.department_name || 'N/A'}</td>
                                                    <td style={{ padding: '1.5rem 1rem', color: '#475569', fontWeight: 600 }}>{selectedEmployee.hire_date || 'N/A'} — Present</td>
                                                    <td style={{ padding: '1.5rem 1rem' }}>
                                                        <span style={{
                                                            padding: '6px 16px',
                                                            background: effectiveStatus === 'Active' ? '#dcfce7' : (effectiveStatus === 'Suspicious' ? '#fef3c7' : '#fee2e2'),
                                                            color: effectiveStatus === 'Active' ? '#166534' : (effectiveStatus === 'Suspicious' ? '#92400e' : '#991b1b'),
                                                            borderRadius: '50px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 800
                                                        }}>
                                                            {effectiveStatus.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 1rem', textAlign: 'right', borderRadius: '0 16px 16px 0', border: 'none' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Primary Record</span>
                                                    </td>
                                                </tr>
                                                {selectedEmployee.employment_history?.map((hist, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #fcf8f1' }}>
                                                        <td style={{ padding: '1.5rem 1rem', color: '#1e293b', fontWeight: 600 }}>{hist.position_name}</td>
                                                        <td style={{ padding: '1.5rem 1rem', color: '#475569', fontWeight: 500 }}>{hist.department_name}</td>
                                                        <td style={{ padding: '1.5rem 1rem', color: '#475569', fontWeight: 500 }}>{hist.date_of_join}</td>
                                                        <td style={{ padding: '1.5rem 1rem' }}>
                                                            <span style={{
                                                                padding: '6px 16px',
                                                                background: hist.status === 'Active' ? '#dcfce7' : '#fcf8f1',
                                                                color: hist.status === 'Active' ? '#166534' : '#64748b',
                                                                borderRadius: '50px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 800
                                                            }}>
                                                                {hist.status?.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.5rem 1rem' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                {canEdit('Employment History') && (
                                                                    <button onClick={() => handleEdit('Employment History', hist)} style={{ padding: '10px', background: '#fff7ed', border: '1px solid #fde6cd', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                )}
                                                                {canDelete('Employment History') && (
                                                                    <button onClick={() => handleDelete('Employment History', hist.id)} style={{ padding: '10px', background: '#fff1f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Education' && (
                                <div className="fade-in">
                                    <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #fff7ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Academic Credentials</h2>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Official certifications and academic milestones verified by HR.</p>
                                        </div>
                                        {canCreate('Education') && (
                                            <button
                                                className="btn-primary"
                                                style={{ background: '#be185d', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                                onClick={() => handleAdd('Education', { employee: selectedEmployee.id })}
                                            >
                                                <Plus size={18} /> Add Qualification
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem 3rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Qualification</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Institution</th>
                                                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Year</th>
                                                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Result</th>
                                                    <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEmployee.education_records?.map((edu, idx) => (
                                                    <tr key={idx} style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1' }}>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{edu.qualification}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#be185d', fontWeight: 600 }}>{edu.specialization || 'N/A'}</div>
                                                        </td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', color: '#475569', fontWeight: 500 }}>{edu.institution}</td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', textAlign: 'center', color: '#1e293b', fontWeight: 700 }}>{edu.year_of_passing}</td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', textAlign: 'center' }}>
                                                            <span style={{ padding: '4px 12px', background: '#f5f3ff', color: '#be185d', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>{edu.percentage || 'N/A'} %</span>
                                                        </td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                {edu.certificate && (
                                                                    <>
                                                                        <a href={edu.certificate} target="_blank" rel="noopener noreferrer" style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="View Certificate"><Eye size={16} /></a>
                                                                        <a href={edu.certificate} download style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="Download Certificate"><Download size={16} /></a>
                                                                    </>
                                                                )}
                                                                {canEdit('Education') && (
                                                                    <button onClick={() => handleEdit('Education', edu)} style={{ padding: '10px', background: '#fff7ed', border: '1px solid #fde6cd', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                )}
                                                                {canDelete('Education') && (
                                                                    <button onClick={() => handleDelete('Education', edu.id)} style={{ padding: '10px', background: '#fff1f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Experience' && (
                                <div className="fade-in">
                                    <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #fff7ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Professional History</h2>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Comprehensive catalog of previous external industry experience.</p>
                                        </div>
                                        {canCreate('Experience') && (
                                            <button
                                                className="btn-primary"
                                                style={{ background: '#be185d', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                                onClick={() => handleAdd('Experience', { employee: selectedEmployee.id })}
                                            >
                                                <Plus size={18} /> Add Experience
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ padding: '2.5rem 3rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {selectedEmployee.experience_records?.map((exp, idx) => (
                                                <div key={idx} style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'min-content 1fr',
                                                    gap: '2rem',
                                                    position: 'relative'
                                                }}>
                                                    {/* Timeline Connector */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fffbeb', border: '2px solid #fde6cd', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                                                            <Briefcase size={20} color="#be185d" />
                                                        </div>
                                                        {idx !== selectedEmployee.experience_records.length - 1 && (
                                                            <div style={{ width: '2px', flex: 1, background: '#fcf8f1', margin: '8px 0' }}></div>
                                                        )}
                                                    </div>

                                                    <div style={{
                                                        background: '#fcf8f1',
                                                        padding: '1.5rem 2rem',
                                                        borderRadius: '20px',
                                                        border: '1px solid #fde6cd',
                                                        position: 'relative',
                                                        transition: 'all 0.3s ease'
                                                    }} className="experience-v-card">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b' }}>{exp.job_title}</div>
                                                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#be185d', marginTop: '2px' }}>{exp.company}</div>
                                                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><History size={14} /> {exp.from_date} — {exp.to_date || 'Present'}</span>
                                                                    <span>•</span>
                                                                    <span style={{ fontWeight: 700, color: '#334155' }}>CTC: {exp.last_ctc || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                {exp.experience_letter && (
                                                                    <>
                                                                        <a href={exp.experience_letter} target="_blank" rel="noopener noreferrer" style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="View Letter"><Eye size={16} /></a>
                                                                        <a href={exp.experience_letter} download="experience_letter" style={{ padding: '8px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="Download Letter"><Download size={16} /></a>
                                                                    </>
                                                                )}
                                                                {canEdit('Experience') && (
                                                                    <button onClick={() => handleEdit('Experience', exp)} style={{ padding: '8px', background: 'white', border: '1px solid #fde6cd', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}><Edit size={16} /></button>
                                                                )}
                                                                {canDelete('Experience') && (
                                                                    <button onClick={() => handleDelete('Experience', exp.id)} style={{ padding: '8px', background: '#fff1f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedEmployee.experience_records?.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontStyle: 'italic' }}>No prior experience recorded.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Documents' && (
                                <div className="fade-in">
                                    <div style={{ padding: '2rem 3rem', borderBottom: '1px solid #fff7ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Compliance & Archive</h2>
                                            <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Secure repository for all professional and legal documentation.</p>
                                        </div>
                                        {canCreate('Documents') && (
                                            <button
                                                className="btn-primary"
                                                style={{ background: '#be185d', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                                                onClick={() => handleAdd('Documents', { employee: selectedEmployee.id })}
                                            >
                                                <Plus size={18} /> Upload Document
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ padding: '1rem 3rem' }}>
                                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Type / Name</th>
                                                    <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Reference No</th>
                                                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Issue Date</th>
                                                    <th style={{ textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Expiry</th>
                                                    <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedEmployee.documents?.map((doc, idx) => (
                                                    <tr key={idx} style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1' }}>
                                                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{doc.document_type_name || 'General Document'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#be185d', fontWeight: 600 }}>ID: {doc.id}</div>
                                                        </td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', color: '#475569', fontWeight: 500 }}>{doc.document_number || 'N/A'}</td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', textAlign: 'center', color: '#1e293b', fontWeight: 500 }}>{doc.issue_date || '—'}</td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1', textAlign: 'center' }}>
                                                            {doc.expiry_date ? (
                                                                <span style={{ padding: '4px 12px', background: new Date(doc.expiry_date) < new Date() ? '#fee2e2' : '#f0fdf4', color: new Date(doc.expiry_date) < new Date() ? '#ef4444' : '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>{doc.expiry_date}</span>
                                                            ) : '—'}
                                                        </td>
                                                        <td style={{ padding: '1.5rem 1rem', borderTop: '1px solid #fcf8f1', borderBottom: '1px solid #fcf8f1' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                                {doc.file && (
                                                                    <>
                                                                        <a href={doc.file} target="_blank" rel="noopener noreferrer" style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="View File"><Eye size={16} /></a>
                                                                        <a href={doc.file} download style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex' }} title="Download File"><Download size={16} /></a>
                                                                    </>
                                                                )}
                                                                {canEdit('Documents') && (
                                                                    <button onClick={() => handleEdit('Documents', doc)} style={{ padding: '10px', background: '#fff7ed', border: '1px solid #fde6cd', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}><Settings size={16} /></button>
                                                                )}
                                                                {canDelete('Documents') && (
                                                                    <button onClick={() => handleDelete('Documents', doc.id)} style={{ padding: '10px', background: '#fff1f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {(!selectedEmployee.documents || selectedEmployee.documents.length === 0) && (
                                            <div style={{ padding: '5rem', textAlign: 'center', color: '#94a3b8' }}>
                                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                                <p>No documents uploaded for this employee.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Bank' && (
                                <div className="fade-in" style={{ padding: '3.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem' }}>
                                        {selectedEmployee.bank_details ? (
                                            <div style={{
                                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                                borderRadius: '28px',
                                                padding: '2.5rem',
                                                color: 'white',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem' }}>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em' }}>{selectedEmployee.bank_details.bank_name?.toUpperCase()}</div>
                                                    <Sparkles size={32} opacity={0.5} />
                                                </div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '0.2em', marginBottom: '2.5rem', fontFamily: 'monospace' }}>
                                                    {selectedEmployee.bank_details.account_number?.replace(/(.{4})/g, '$1 ')}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>ACCOUNT HOLDER</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.name?.toUpperCase()}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>IFSC CODE</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmployee.bank_details.ifsc_code}</div>
                                                    </div>
                                                </div>
                                                {canEdit('Bank Details') && (
                                                    <button
                                                        onClick={() => handleEdit('Bank Details', selectedEmployee.bank_details)}
                                                        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ) : canCreate('Bank Details') ? (
                                            <div onClick={() => handleAdd('Bank Details', { employee: selectedEmployee.id })} style={{ border: '2px dashed #fde6cd', borderRadius: '28px', padding: '4rem', textAlign: 'center', cursor: 'pointer' }}>
                                                <Plus size={48} color="#94a3b8" style={{ marginBottom: '1.5rem' }} />
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155' }}>Setup Bank Account</h3>
                                                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Account details required for payroll processing.</p>
                                            </div>
                                        ) : (
                                            <div style={{ border: '2px solid #fde6cd', borderRadius: '28px', padding: '4rem', textAlign: 'center', background: '#fcf8f1' }}>
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#94a3b8' }}>No Bank Details</h3>
                                                <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>View-only access</p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            <div style={{ background: '#fcf8f1', borderRadius: '20px', padding: '1.5rem', border: '1px solid #fde6cd' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#be185d' }}>
                                                    <ShieldAlert size={20} />
                                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>VERIFICATION STATUS</span>
                                                </div>
                                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>Account information is encrypted and used exclusively for electronic fund transfers. Identity verification is pending with Finance.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'EPFO' && (
                                <div className="fade-in" style={{ padding: '3.5rem' }}>
                                    <div style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                                        {[
                                            { label: 'UAN Number', value: selectedEmployee.epfo_details?.uan_number, icon: <FileDigit color="#be185d" /> },
                                            { label: 'Member ID', value: selectedEmployee.epfo_details?.epfo_member_id, icon: <User color="#f97316" /> },
                                            { label: 'Joining Date', value: selectedEmployee.epfo_details?.pf_joining_date, icon: <Calendar color="#059669" /> },
                                            { label: 'KYC Status', value: 'VERIFIED', icon: <ShieldCheck color="#2563eb" /> }
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: '#fcf8f1', padding: '1.75rem', borderRadius: '24px', border: '1px solid #fde6cd', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ padding: '12px', background: 'white', borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex' }}>
                                                    {React.cloneElement(item.icon, { size: 20 })}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>{item.value || 'N/A'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        {(selectedEmployee.epfo_details ? canEdit('EPFO Details') : canCreate('EPFO Details')) && (
                                            <button
                                                onClick={() => selectedEmployee.epfo_details ? handleEdit('EPFO Details', selectedEmployee.epfo_details) : handleAdd('EPFO Details', { employee: selectedEmployee.id })}
                                                style={{ padding: '14px 28px', background: 'var(--primary)', color: 'white', borderRadius: '14px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <Edit size={18} /> {selectedEmployee.epfo_details ? 'Update EPFO Records' : 'Configure EPFO Data'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Health' && (
                                <div className="fade-in" style={{ padding: '3.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
                                                <ShieldCheck size={24} color="#be185d" /> Medical Profile & Emergency Contact
                                            </h3>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                                <div style={{ padding: '1.5rem', background: '#fcf8f1', border: '1px solid #fde6cd', borderRadius: '20px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Blood Group</div>
                                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#be185d' }}>{selectedEmployee.health_details?.blood_group || '—'}</div>
                                                </div>
                                                <div style={{ padding: '1.5rem', background: '#fcf8f1', border: '1px solid #fde6cd', borderRadius: '20px' }}>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Health Status</div>
                                                    <div style={{ padding: '8px 16px', background: '#dcfce7', color: '#166534', borderRadius: '12px', display: 'inline-block', marginTop: '1rem', fontWeight: 800, fontSize: '0.85rem' }}>DECLARED FIT</div>
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)', border: '1px solid #fde6cd', borderRadius: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                    <div style={{ fontWeight: 800, color: '#be185d', fontSize: '0.85rem', textTransform: 'uppercase' }}>Primary Emergency Contact</div>
                                                    <Phone size={20} color="#be185d" />
                                                </div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{selectedEmployee.health_details?.emergency_contact_name || 'Not Configured'}</div>
                                                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>RELATION</div>
                                                        <div style={{ fontWeight: 700, color: '#475569' }}>{selectedEmployee.health_details?.emergency_contact_relation || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>PHONE NUMBER</div>
                                                        <div style={{ fontWeight: 700, color: '#475569' }}>{selectedEmployee.health_details?.emergency_contact_phone || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ background: '#fcf8f1', padding: '2.5rem', borderRadius: '28px', border: '1px solid #fde6cd' }}>
                                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>Medical Disclosures</h4>
                                            <p style={{ color: '#64748b', lineHeight: 1.6, fontSize: '0.95rem' }}>{selectedEmployee.health_details?.chronic_illnesses || 'No major medical conditions or allergies disclosed to company health records.'}</p>
                                            {(selectedEmployee.health_details ? canEdit('Health Details') : canCreate('Health Details')) && (
                                                <button
                                                    onClick={() => selectedEmployee.health_details ? handleEdit('Health Details', selectedEmployee.health_details) : handleAdd('Health Details', { employee: selectedEmployee.id })}
                                                    style={{ marginTop: '2.5rem', width: '100%', padding: '14px', background: 'white', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
                                                >Update Records</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Salary' && (
                                <div className="fade-in" style={{ padding: '3.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '3rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <Banknote size={28} color="#be185d" /> Compensation & Benefits
                                                </h3>
                                                <div style={{ padding: '8px 16px', background: '#be185d', color: 'white', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem' }}>MONTHLY GROSS: ₹ {selectedEmployee.salary_details?.monthly_gross?.toLocaleString() || '0'}</div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                                {[
                                                    { label: 'Basic Salary', value: selectedEmployee.salary_details?.basic_salary, pct: '40%' },
                                                    { label: 'HRA (House Rent)', value: selectedEmployee.salary_details?.hra, pct: '20%' },
                                                    { label: 'Special Allowance', value: selectedEmployee.salary_details?.special_allowance, pct: 'FIXED' },
                                                    { label: 'Transport Allowance', value: selectedEmployee.salary_details?.conveyance_allowance, pct: 'FIXED' }
                                                ].map((item, i) => (
                                                    <div key={i} style={{ padding: '1.5rem', background: '#fcf8f1', border: '1px solid #fde6cd', borderRadius: '24px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>{item.label}</div>
                                                            <div style={{ fontSize: '0.65rem', padding: '2px 8px', background: '#fff7ed', borderRadius: '6px', fontWeight: 800, color: '#f97316' }}>{item.pct}</div>
                                                        </div>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>₹ {item.value?.toLocaleString() || '0'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ background: '#1e293b', padding: '2.5rem', borderRadius: '32px', color: 'white' }}>
                                            <div style={{ opacity: 0.5, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>MONTHLY TAKE-HOME</div>
                                            <div style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>₹</span> {selectedEmployee.salary_details?.net_salary?.toLocaleString() || '0'}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ opacity: 0.6 }}>EPF Contribution</span>
                                                    <span style={{ fontWeight: 700, color: '#fb7185' }}>- ₹ {selectedEmployee.salary_details?.pf_employee_contribution?.toLocaleString() || '0'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <span style={{ opacity: 0.6 }}>Professional Tax</span>
                                                    <span style={{ fontWeight: 700, color: '#fb7185' }}>- ₹ {selectedEmployee.salary_details?.professional_tax?.toLocaleString() || '0'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                                                    <span style={{ fontWeight: 700 }}>Total Deductions</span>
                                                    <span style={{ fontWeight: 800, color: '#fb7185' }}>₹ {((selectedEmployee.salary_details?.pf_employee_contribution || 0) + (selectedEmployee.salary_details?.professional_tax || 0)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {(selectedEmployee.salary_details ? canEdit('Salary Details') : canCreate('Salary Details')) && (
                                                <button
                                                    onClick={() => selectedEmployee.salary_details ? handleEdit('Salary Details', selectedEmployee.salary_details) : handleAdd('Salary Details', { employee: selectedEmployee.id })}
                                                    style={{ marginTop: '2.5rem', width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}
                                                >Update Payroll Structure</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeProfileTab === 'Account' && (
                                <div className="fade-in" style={{ padding: '3.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '3rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
                                                <User size={28} color="#be185d" /> System User Account
                                            </h3>
                                            <div style={{ background: '#fcf8f1', padding: '2.5rem', borderRadius: '28px', border: '1px solid #fde6cd' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Username</div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>@{selectedEmployee.user_details?.username}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Account Status</div>
                                                        <div style={{ marginTop: '8px' }}>
                                                            <span style={{ padding: '6px 16px', background: '#dcfce7', color: '#166534', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>ACTIVE</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Permission Tier</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#be185d', marginTop: '4px' }}>
                                                            {selectedEmployee.user_details?.is_superuser ? 'SYSTEM ADMINISTRATOR' : (selectedEmployee.user_details?.is_staff ? 'STAFF / ADMIN' : 'STANDARD USER')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Primary Email</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>{selectedEmployee.user_details?.email || 'N/A'}</div>
                                                    </div>
                                                </div>

                                                {canEdit('User Management') && (
                                                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #fde6cd', display: 'flex', gap: '1rem' }}>
                                                        <button
                                                            onClick={() => handleEdit('User Management', selectedEmployee.user_details)}
                                                            style={{ padding: '12px 24px', background: '#be185d', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        >
                                                            <Edit3 size={18} /> Edit Credentials
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit('User Management', { ...selectedEmployee.user_details, password: '' })}
                                                            style={{ padding: '12px 24px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                                                        >
                                                            Reset Password
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: '#64748b' }}>
                                                <ShieldAlert size={20} />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>SECURITY OVERVIEW</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                                                    This account is linked to the <strong>{selectedEmployee.name}</strong> workforce profile.
                                                    Modifying these settings will affect system-wide access and authentication.
                                                </div>
                                                <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde6cd', borderRadius: '12px', fontSize: '0.85rem', color: '#92400e' }}>
                                                    Last Security Audit: Today
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfileModal;
