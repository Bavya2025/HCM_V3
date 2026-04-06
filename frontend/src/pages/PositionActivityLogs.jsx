import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    ClipboardList,
    Search,
    Calendar,
    User,
    Activity,
    ArrowRight,
    Filter,
    FileText,
    History,
    ShieldAlert
} from 'lucide-react';
import api from '../api';
import BavyaSpinner from '../components/BavyaSpinner';

const PositionActivityLogs = () => {
    const { activePositionContext } = useData();
    const [searchParams] = useSearchParams();
    const assignmentId = searchParams.get('assignment');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    // RESTRICTION: Acting users cannot view activity logs (security/privacy)
    if (activePositionContext) {
        return (
            <div className="fade-in" style={{ padding: '4rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Restricted Access</h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b', margin: '1rem 0 2rem' }}>
                    You are currently in <strong>Acting Mode</strong>. Delegate activity logs are restricted to the primary position holder.
                </p>
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569' }}>
                    Please switch back to your <strong>Standard Mode</strong> to view audit trails.
                </div>
            </div>
        );
    }

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let endpoint = 'position-activity-logs/';
            if (assignmentId) {
                endpoint += `?assignment=${assignmentId}`;
            }
            const res = await api.get(endpoint);
            const results = (res && res.results) || res;
            setLogs(Array.isArray(results) ? results : []);
        } catch (err) {
            console.error("Error fetching activity logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [assignmentId]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.model_name.toLowerCase().includes(search.toLowerCase()) ||
            (log.record_name && log.record_name.toLowerCase().includes(search.toLowerCase())) ||
            log.user_name.toLowerCase().includes(search.toLowerCase());

        const matchesAction = filterAction === 'ALL' || log.action_type === filterAction;

        return matchesSearch && matchesAction;
    });

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return '#10b981'; // Emerald
            case 'EDIT': return '#f59e0b';   // Amber
            case 'DELETE': return '#ef4444'; // Red
            case 'VIEW': return '#3b82f6';   // Blue
            default: return '#64748b';
        }
    };

    if (loading) return <BavyaSpinner />;

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <History size={32} style={{ color: 'var(--primary)' }} />
                    {assignmentId ? 'Assignment Activity Audit' : 'Delegate Activity Tracking'}
                </h2>
                <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '1.1rem' }}>
                    {assignmentId
                        ? 'Detailed audit log for this specific delegation assignment.'
                        : 'Monitor system actions taken by employees holding your delegated positions (Normal Assignments only).'
                    }
                </p>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                background: 'white',
                padding: '1.25rem',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by user, module, or record name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                            borderRadius: '12px', border: '1px solid #e2e8f0',
                            fontSize: '0.95rem', background: '#f8fafc'
                        }}
                    />
                </div>
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                        fontSize: '0.95rem', background: '#f8fafc', fontWeight: 600, color: '#475569'
                    }}
                >
                    <option value="ALL">All Actions</option>
                    <option value="CREATE">Created Records</option>
                    <option value="EDIT">Edited Records</option>
                    <option value="VIEW">Visited Pages</option>
                </select>
                <button
                    onClick={fetchLogs}
                    style={{
                        padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f1f5f9',
                        color: '#475569', border: 'none', fontWeight: 700, cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* Activity Timeline/List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <div
                            key={log.id}
                            style={{
                                background: 'white',
                                border: '1px solid #f1f5f9',
                                borderRadius: '16px',
                                padding: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                transition: 'transform 0.2s',
                                cursor: 'default'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(8px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                            {/* Action Icon */}
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: `${getActionColor(log.action_type)}15`,
                                color: getActionColor(log.action_type),
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {log.action_type === 'CREATE' && <Activity size={24} />}
                                {log.action_type === 'EDIT' && <Activity size={24} />}
                                {log.action_type === 'VIEW' && <FileText size={24} />}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{log.user_name}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>acted as</span>
                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>{log.assignment_details}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '6px',
                                        background: `${getActionColor(log.action_type)}15`,
                                        color: getActionColor(log.action_type),
                                        fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em'
                                    }}>
                                        {log.action_type}
                                    </span>
                                    <span style={{ color: '#475569', fontWeight: 600 }}>{log.model_name}</span>
                                    {log.record_name && (
                                        <>
                                            <ArrowRight size={14} style={{ color: '#94a3b8' }} />
                                            <span style={{ color: '#0f172a', fontWeight: 700 }}>{log.record_name}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div style={{ textAlign: 'right', minWidth: '150px' }}>
                                <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                    <Calendar size={14} />
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '4rem', background: '#f8fafc',
                        borderRadius: '24px', border: '2px dashed #e2e8f0'
                    }}>
                        <ClipboardList size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                        <h3 style={{ color: '#475569', marginTop: 0 }}>No activity records found</h3>
                        <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0.5rem auto' }}>
                            Activity logs will appear here when employees perform actions using positions you have assigned to them (Normal Assignments only).
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PositionActivityLogs;
