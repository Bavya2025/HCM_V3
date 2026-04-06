import React, { useState, useEffect, useMemo } from 'react';
import {
    ClipboardList, Search, Calendar, Activity,
    TerminalSquare, Eye, ShieldAlert, MonitorIcon,
    Globe, FileText, Database, CalendarDays, Filter,
    RefreshCw, ChevronRight, BookOpen, Code, Clock
} from 'lucide-react';
import api from '../api';
import BavyaSpinner from '../components/BavyaSpinner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [showRawJson, setShowRawJson] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('audit-logs/');
            const results = (res && res.results) || res;
            setLogs(Array.isArray(results) ? results : []);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = useMemo(() => logs.filter(log => {
        const matchesSearch =
            log.model_name?.toLowerCase().includes(search.toLowerCase()) ||
            log.username?.toLowerCase().includes(search.toLowerCase()) ||
            log.ip_address?.includes(search);

        const matchesAction = filterAction === 'ALL' || log.action === filterAction;

        let matchesDate = true;
        if (startDate || endDate) {
            const logDate = new Date(log.timestamp);
            logDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (logDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (logDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesAction && matchesDate;
    }), [logs, search, filterAction, startDate, endDate]);

    const getActionColor = (action) => {
        switch (action?.toUpperCase()) {
            case 'CREATE': return '#10b981'; 
            case 'UPDATE': return '#3b82f6'; 
            case 'DELETE': return '#ef4444'; 
            default: return '#64748b';
        }
    };

    const getActionIcon = (action) => {
        switch (action?.toUpperCase()) {
            case 'CREATE': return <Database size={18} />;
            case 'UPDATE': return <Activity size={18} />;
            case 'DELETE': return <ClipboardList size={18} />;
            default: return <FileText size={18} />;
        }
    };

    const parseUserAgent = (uaString) => {
        if (!uaString || uaString === 'Not captured' || uaString.includes('Backend')) 
            return { os: 'System', browser: 'Process', raw: uaString || 'Not captured' };
        
        let os = 'Unknown OS';
        let browser = 'Unknown Browser';
        
        if (uaString.includes('Windows')) os = 'Windows';
        else if (uaString.includes('Mac OS X')) os = 'macOS';
        else if (uaString.includes('Android')) os = 'Android';
        else if (uaString.includes('iPhone') || uaString.includes('iPad')) os = 'iOS';
        else if (uaString.includes('Linux')) os = 'Linux PC';

        if (uaString.includes('Edg/')) browser = 'Edge';
        else if (uaString.includes('Firefox/')) browser = 'Firefox';
        else if (uaString.includes('Chrome/')) browser = 'Chrome';
        else if (uaString.includes('Safari/')) browser = 'Safari';
        
        return { os, browser, raw: uaString };
    };

    const renderDataValue = (val) => {
        if (val === null || val === undefined) return <em style={{ color: '#94a3b8' }}>null</em>;
        if (typeof val === 'boolean') return <span style={{ color: val ? '#10b981' : '#ef4444', fontWeight: 700 }}>{val ? 'TRUE' : 'FALSE'}</span>;
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    const renderProfessionalData = (data) => {
        if (!data || Object.keys(data).length === 0) return (
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>
                No payload metadata recorded for this operation.
            </div>
        );

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 200px) 1fr', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                {Object.entries(data).map(([key, value], idx) => (
                    <React.Fragment key={key}>
                        <div style={{ 
                            padding: '10px 16px', background: '#f8fafc', borderBottom: idx < Object.entries(data).length - 1 ? '1px solid #f1f5f9' : 'none',
                            fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.025em',
                            display: 'flex', alignItems: 'center'
                        }}>
                            {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{ 
                            padding: '10px 16px', background: 'white', borderBottom: idx < Object.entries(data).length - 1 ? '1px solid #f1f5f9' : 'none',
                            fontSize: '0.9rem', color: '#1e293b', fontWeight: 500, wordBreak: 'break-all'
                        }}>
                            {renderDataValue(value)}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    if (loading) return <BavyaSpinner />;

    return (
        <div style={{ padding: '1.5rem 2.5rem', maxWidth: '1600px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .audit-card {
                    background: white; border: 1px solid #e2e8f0; border-radius: 14px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .audit-card:hover {
                    border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    transform: translateX(4px);
                }
                .filter-label {
                    display: block; font-size: 0.7rem; fontWeight: 800; color: #94a3b8; 
                    margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;
                }
                .filter-input {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px;
                    padding: 0.5rem 0.75rem; outline: none; transition: all 0.2s;
                    font-size: 0.85rem; color: #1e293b; width: 100%;
                }
                .filter-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08); }
                .action-pill {
                    font-size: 0.65rem; fontWeight: 900; padding: 2px 10px; border-radius: 6px;
                    text-transform: uppercase; letter-spacing: 0.025em;
                }
                `}
            </style>

            {/* Elegant Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', marginBottom: '4px' }}>
                        <ShieldAlert size={18} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security Management</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>Access & Audit Trails</h2>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, display: 'block' }}>LOGGED EVENTS</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{logs.length}</span>
                    </div>
                    <button onClick={fetchLogs} style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', padding: '0 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#1e293b'}
                        onMouseOut={e => e.currentTarget.style.background = '#0f172a'}>
                        <RefreshCw size={14} /> REFRESH
                    </button>
                </div>
            </div>

            {/* Neat Professional Filter Row */}
            <div style={{
                background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0',
                display: 'flex', gap: '1.25rem', marginBottom: '2rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{ flex: 3, position: 'relative' }}>
                    <label className="filter-label">Live Search</label>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '32px', color: '#cbd5e1' }} />
                    <input type="text" placeholder="Search users, models, or IP addresses..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-input" style={{ paddingLeft: '2.25rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="filter-label">Operation</label>
                    <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="filter-input" style={{ cursor: 'pointer', appearance: 'none' }}>
                        <option value="ALL">All Operations</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label className="filter-label">Date Range (Start)</label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate || undefined}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            if (endDate && e.target.value > endDate) setEndDate('');
                        }}
                        className="filter-input"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="filter-label">Date Range (End)</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            {/* Modern Audit Log List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredLogs.length > 0 ? (
                    filteredLogs.map(log => (
                        <div key={log.id} className="audit-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            {/* Visual Indicator */}
                            <div style={{ width: '4px', height: '24px', borderRadius: '4px', background: getActionColor(log.action) }} />

                            {/* User Info */}
                            <div style={{ minWidth: '120px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>User</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{log.username}</div>
                            </div>

                            {/* Activity Info */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="action-pill" style={{ background: `${getActionColor(log.action)}15`, color: getActionColor(log.action) }}>
                                    {log.action}
                                </div>
                                <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {log.model_name}
                                    <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
                                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 400 }}>Reference ID: <span style={{ color: '#0f172a', fontWeight: 700 }}>{log.record_id}</span></span>
                                </div>
                            </div>

                            {/* Network & Source */}
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>IP ADDRESS</div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{log.ip_address}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>PLATFORM</div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                                        {(() => {
                                            const p = parseUserAgent(log.user_agent);
                                            return `${p.os} / ${p.browser}`;
                                        })()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '130px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800 }}>TIMESTAMP</div>
                                    <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{new Date(log.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button onClick={() => { setSelectedLog(log); setShowRawJson(false); }} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                <BookOpen size={14} /> DETAILS
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '6rem', border: '2px dashed #e2e8f0', borderRadius: '24px' }}>
                        <ShieldAlert size={48} style={{ color: '#e2e8f0' }} />
                        <p style={{ color: '#94a3b8', fontWeight: 600, marginTop: '1rem' }}>No telemetry logs matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Professional Event Inspector Modal */}
            {selectedLog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '2rem' }} onClick={() => setSelectedLog(null)}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        
                        {/* Modal Header */}
                        <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: getActionColor(selectedLog.action), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {getActionIcon(selectedLog.action)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Event Telemetry Inspector</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Ref: {selectedLog.id} • Action: {selectedLog.action}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowRawJson(!showRawJson)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#6366f1', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Code size={14} /> {showRawJson ? 'VIEW TABLE' : 'VIEW RAW JSON'}
                                </button>
                                <button onClick={() => setSelectedLog(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', color: '#94a3b8', fontWeight: 800 }}>✕</button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#e2e8f0', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '2rem' }}>
                                {[
                                    { label: 'Executor', val: selectedLog.username, icon: <Activity size={12}/> },
                                    { label: 'Target Module', val: selectedLog.model_name, icon: <Database size={12}/> },
                                    { label: 'Network Node', val: selectedLog.ip_address, icon: <Globe size={12}/> },
                                    { label: 'Precision Time', val: new Date(selectedLog.timestamp).toLocaleString(), icon: <Clock size={12}/> }
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '1.25rem', background: 'white' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                            {item.icon} {item.label}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 750, color: '#0f172a' }}>{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {showRawJson ? 'Raw Telemetry Data' : 'Structured Data Changes'}
                                    </h4>
                                    {!showRawJson && <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Records found: {Object.keys(selectedLog.changes).length}</span>}
                                </div>
                                
                                {showRawJson ? (
                                    <pre style={{ margin: 0, padding: '1.5rem', background: '#0f172a', color: '#38bdf8', borderRadius: '16px', fontSize: '0.85rem', overflowX: 'auto', border: '1px solid #1e293b', fontFamily: "'Fira Code', monospace", lineHeight: 1.6 }}>
                                        {JSON.stringify(selectedLog.changes, null, 2)}
                                    </pre>
                                ) : (
                                    renderProfessionalData(selectedLog.changes)
                                )}
                            </div>

                            <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <MonitorIcon size={16} color="#6366f1" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                        Client Signature: <span style={{ color: '#0f172a', fontWeight: 800 }}>{parseUserAgent(selectedLog.user_agent).os} • {parseUserAgent(selectedLog.user_agent).browser}</span>
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>ID: {selectedLog.user_agent?.substring(0, 50)}...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
