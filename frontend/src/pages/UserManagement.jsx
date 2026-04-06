import React, { useState, useEffect, useRef } from 'react';
import { Users, ShieldCheck, UserCheck, UserMinus, Settings, Search, ShieldAlert, Lock, Mail, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../api';
import BavyaSpinner from '../components/BavyaSpinner';
import PermissionMatrix from './PermissionMatrix';

const UserManagement = () => {
    const { showNotification, offices, departments, orgLevels, getPhotoUrl, allEmployees } = useData();
    const [employees, setEmployees] = useState(allEmployees || []);

    const getInitialFilters = () => {
        const saved = sessionStorage.getItem(`filters_users`);
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return {
            searchTerm: '',
            levelFilter: 'all',
            officeFilter: 'all',
            deptFilter: 'all'
        };
    };

    const [filters, setFilters] = useState(getInitialFilters);
    const { searchTerm, levelFilter, officeFilter, deptFilter } = filters;
    const updateFilter = (newVal) => setFilters(prev => ({ ...prev, ...newVal }));

    const [localLoading, setLocalLoading] = useState(allEmployees?.length === 0);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'permissions'
    const [processingId, setProcessingId] = useState(null);

    // Save filters
    useEffect(() => {
        sessionStorage.setItem('filters_users', JSON.stringify(filters));
    }, [filters]);

    const handleProvision = async (empId) => {
        setProcessingId(empId);
        try {
            const res = await api.post(`employees/${empId}/create_user`);
            if (res.email_sent) {
                showNotification(res.message, "success");
            } else {
                showNotification(`${res.message} -> PLEASE COPY & GIVE MANUALLY: [User: ${res.username}] [Pass: ${res.password}]`, "warning");
            }
            fetchEmployees();
        } catch (err) {
            const msg = err.error || err.detail || (typeof err === 'string' ? err : "Failed to create user");
            showNotification(msg, "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleResend = async (empId) => {
        setProcessingId(empId);
        try {
            const res = await api.post(`employees/${empId}/resend_credentials`);
            if (res.email_sent) {
                showNotification(res.message, "success");
            } else {
                showNotification(`${res.message} -> PLEASE COPY & GIVE MANUALLY: [User: ${res.username}] [Pass: ${res.password}]`, "warning");
            }
        } catch (err) {
            showNotification("Failed to resend credentials", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        current: 1
    });

    const fetchEmployees = async (page = 1) => {
        setLocalLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (levelFilter !== 'all') params.append('level', levelFilter);
            if (officeFilter !== 'all') params.append('office', officeFilter);
            if (deptFilter !== 'all') params.append('department', deptFilter);
            params.append('page', page);

            const res = await api.get(`employees?${params.toString()}`);
            setEmployees(res.results || res);
            setPagination({
                count: res.count || 0,
                next: res.next,
                previous: res.previous,
                current: page
            });
        } catch (err) {
            showNotification("Failed to load user data", "error");
        } finally {
            setLocalLoading(false);
        }
    };

    // Use a ref to track if it's the first mount
    const isFirstMount = useRef(true);

    useEffect(() => {
        // Initial load happens immediately
        if (isFirstMount.current) {
            fetchEmployees(1);
            isFirstMount.current = false;
            return;
        }

        // Subsequent changes are debounced
        const delayDebounceFn = setTimeout(() => {
            fetchEmployees(1);
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, levelFilter, officeFilter, deptFilter]);

    const handleToggleStatus = async (employee) => {
        const newStatus = (employee.status === 'Active' || employee.status === 'Suspicious') ? 'Inactive' : 'Active';
        try {
            await api.patch(`employees/${employee.id}`, { status: newStatus });
            setEmployees(employees.map(e => e.id === employee.id ? { ...e, status: newStatus } : e));
            showNotification(`User ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`);
        } catch (err) {
            showNotification("Failed to update user status", "error");
        }
    };

    const filteredEmployees = employees.filter(e => {
        // Exclude root admin
        if (e.employee_code === 'ADM-001') return false;

        // Local Filter Fallback (Ensures UI matches filters even if backend is syncing)
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            e.name?.toLowerCase().startsWith(search) ||
            e.employee_code?.toLowerCase().startsWith(search) ||
            e.positions_details?.some(p =>
                p.name?.toLowerCase().startsWith(search) ||
                p.role_name?.toLowerCase().startsWith(search)
            );

        const matchesLevel = levelFilter === 'all' ||
            e.positions_details?.some(p => p.office_level === levelFilter);

        const matchesOffice = officeFilter === 'all' ||
            e.positions_details?.some(p => p.office_id?.toString() === officeFilter);

        const matchesDept = deptFilter === 'all' ||
            e.positions_details?.some(p => p.department_id?.toString() === deptFilter);

        return matchesSearch && matchesLevel && matchesOffice && matchesDept;
    }).sort((a, b) => a.name.localeCompare(b.name));

    if (view === 'permissions' && selectedEmployee) {
        return <PermissionMatrix employee={selectedEmployee} onBack={() => { setView('list'); setSelectedEmployee(null); }} />;
    }

    return (
        <div className="fade-in stagger-in">
            <header className="section-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 className="section-title hero-gradient-text">Identity & Access Management</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <p className="section-subtitle" style={{ margin: 0 }}>
                            Oversee system users and manage high-level security permissions
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: localLoading ? 'rgba(136, 19, 55, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: `1px solid ${localLoading ? 'rgba(136, 19, 55, 0.1)' : 'rgba(34, 197, 94, 0.1)'}`,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: localLoading ? 'var(--primary)' : '#22c55e',
                                animation: localLoading ? 'pulse 1s infinite' : 'none'
                            }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: localLoading ? 'var(--primary)' : '#166534', letterSpacing: '0.05em' }}>
                                {localLoading ? 'SYNCING...' : 'LIVE'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Advanced Filtering Section */}
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Search Identity</label>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                        <input
                            type="text"
                            placeholder="Name or Employee Code..."
                            style={{ width: '100%', padding: '10px 10px 10px 40px', border: '2px solid #f1f5f9', borderRadius: '12px', fontSize: '0.85rem', outline: 'none' }}
                            value={searchTerm}
                            onChange={(e) => updateFilter({ searchTerm: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ width: '180px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Org Level</label>
                    <select
                        value={levelFilter}
                        onChange={(e) => {
                            updateFilter({ levelFilter: e.target.value, officeFilter: 'all', deptFilter: 'all' });
                        }}
                        style={{ width: '100%', padding: '10px 12px', border: '2px solid #f1f5f9', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
                    >
                        <option value="all">All Levels</option>
                        {orgLevels.map(l => (
                            <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ width: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Office / Unit</label>
                    <select
                        value={officeFilter}
                        onChange={(e) => {
                            updateFilter({ officeFilter: e.target.value, deptFilter: 'all' });
                        }}
                        style={{ width: '100%', padding: '10px 12px', border: '2px solid #f1f5f9', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
                    >
                        <option value="all">All Offices</option>
                        {offices
                            .filter(o => levelFilter === 'all' || o.level_name === levelFilter)
                            .map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                    </select>
                </div>

                <div style={{ width: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Department</label>
                    <select
                        value={deptFilter}
                        onChange={(e) => updateFilter({ deptFilter: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '2px solid #f1f5f9', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
                    >
                        <option value="all">All Departments</option>
                        {departments
                            .filter(d => (officeFilter === 'all' || d.office?.toString() === officeFilter || d.office_id?.toString() === officeFilter) &&
                                (levelFilter === 'all' || d.office_level === levelFilter))
                            .map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                    </select>
                </div>

                <button
                    className="btn-secondary"
                    style={{ padding: '10px 15px', borderRadius: '12px', fontWeight: 800, fontSize: '0.75rem' }}
                    onClick={() => {
                        updateFilter({
                            searchTerm: '',
                            levelFilter: 'all',
                            officeFilter: 'all',
                            deptFilter: 'all'
                        });
                    }}
                >
                    Reset
                </button>
            </div>

            <div className="glass section-card" style={{ padding: '0', position: 'relative', minHeight: '200px' }}>
                {localLoading && employees.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 10,
                        backdropFilter: 'blur(4px)',
                        borderRadius: '16px'
                    }}>
                        <BavyaSpinner label="Initialising Identity Directory..." />
                    </div>
                )}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User Identity</th>
                            <th>Organizational Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Security Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id} className="stagger-in">
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 800,
                                            overflow: 'hidden'
                                        }}>
                                            {emp.photo ? (
                                                <img
                                                    src={getPhotoUrl(emp.photo)}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                emp.name[0]
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emp.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.employee_code}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#475569' }}>
                                        {emp.positions_details?.[0]?.name || 'Unassigned'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {emp.positions_details?.[0]?.role_name || 'Generic User'}
                                    </div>
                                </td>
                                <td>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        background: emp.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                                        color: emp.status === 'Active' ? '#166534' : '#991b1b',
                                        border: `1px solid ${emp.status === 'Active' ? '#dcfce7' : '#fee2e2'}`
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: emp.status === 'Active' ? '#22c55e' : '#ef4444'
                                        }}></div>
                                        {emp.status.toUpperCase()}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {!emp.user ? (
                                            <button
                                                className="btn-primary"
                                                disabled={processingId === emp.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 16px',
                                                    fontSize: '0.8rem',
                                                    background: 'var(--magenta)',
                                                    fontWeight: 800,
                                                    cursor: processingId === emp.id ? 'wait' : 'pointer',
                                                    borderRadius: '10px',
                                                    opacity: processingId === emp.id ? 0.7 : 1
                                                }}
                                                onClick={() => handleProvision(emp.id)}
                                            >
                                                <Lock size={14} className={processingId === emp.id ? 'spin' : ''} />
                                                {processingId === emp.id ? 'SENDING...' : 'Provision Account'}
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '0.75rem', fontWeight: 800 }}>
                                                    <ShieldCheck size={16} /> ACCOUNT PROVISIONED
                                                </div>
                                                <button
                                                    className="btn-primary"
                                                    disabled={processingId === emp.id}
                                                    style={{
                                                        padding: '8px 16px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 900,
                                                        background: processingId === emp.id ? '#94a3b8' : '#0369a1',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        cursor: processingId === emp.id ? 'wait' : 'pointer',
                                                        boxShadow: '0 4px 6px -1px rgba(3, 105, 161, 0.2)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={() => handleResend(emp.id)}
                                                >
                                                    <Mail size={14} style={{ marginRight: '6px' }} />
                                                    {processingId === emp.id ? 'SENDING...' : 'RESEND EMAIL'}
                                                </button>
                                            </div>
                                        )}
                                        <button
                                            className="btn-secondary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.75rem' }}
                                            onClick={() => { setSelectedEmployee(emp); setView('permissions'); }}
                                        >
                                            <ShieldAlert size={14} /> Permissions
                                        </button>
                                        {/* Show Disable for Active/Suspicious users with accounts, Enable for Inactive */}
                                        {emp.user && (
                                            <button
                                                className="btn-secondary"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    color: (emp.status === 'Active' || emp.status === 'Suspicious') ? '#ef4444' : '#166534',
                                                    background: (emp.status === 'Active' || emp.status === 'Suspicious') ? '#fff1f2' : '#dcfce7',
                                                    border: `1px solid ${(emp.status === 'Active' || emp.status === 'Suspicious') ? '#fee2e2' : '#bbf7d0'}`,
                                                    width: '100px',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => handleToggleStatus(emp)}
                                            >
                                                {(emp.status === 'Active' || emp.status === 'Suspicious') ? <UserMinus size={14} /> : <UserCheck size={14} />}
                                                {(emp.status === 'Active' || emp.status === 'Suspicious') ? 'Disable' : 'Enable'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Page <b>{pagination.current}</b> of <b>{Math.ceil(pagination.count / 10)}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn-secondary"
                            disabled={!pagination.previous}
                            onClick={() => fetchEmployees(pagination.current - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '0.5rem 1rem',
                                opacity: !pagination.previous ? 0.5 : 1,
                                cursor: !pagination.previous ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg> Previous
                        </button>
                        <button
                            className="btn-secondary"
                            disabled={!pagination.next}
                            onClick={() => fetchEmployees(pagination.current + 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '0.5rem 1rem',
                                opacity: !pagination.next ? 0.5 : 1,
                                cursor: !pagination.next ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Next <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
