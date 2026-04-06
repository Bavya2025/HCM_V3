import React, { useState, useEffect, useMemo } from 'react';
import {
    History, Search, ShieldCheck, ShieldAlert,
    MonitorIcon, Globe, Clock, RefreshCw, 
    ArrowRightCircle, LogOut, CheckCircle2, XCircle,
    User, Smartphone, Laptop, Tablet, AlertOctagon,
    ArrowUpRight, Calendar, UserCheck, Shield, Zap, Info,
    Activity, Lock, Unlock, Hash, Database, Cpu, TrendingUp, ChevronDown
} from 'lucide-react';
import api from '../api';
import BavyaSpinner from '../components/BavyaSpinner';

const LoginHistory = () => {
    const [hits, setHits] = useState([]);
    const [totalServerCount, setTotalServerCount] = useState(0);
    const [stats, setStats] = useState({ success: 0, failed: 0, health: '100' });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextUrl, setNextUrl] = useState(null);
    
    // Filters
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchHistory = async (url = 'login-hits/') => {
        if (!url) return;
        
        const isInitial = url === 'login-hits/';
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const res = await api.get(url);
            
            // Handle DRF Paginated vs Unpaginated
            const isPaginated = res && res.results !== undefined;
            const newHits = isPaginated ? res.results : (Array.isArray(res) ? res : []);
            
            if (isInitial) {
                setHits(newHits);
                // For Stats: If paginated, we use the server counts. 
                // If not, we calculate from the full list.
                if (isPaginated) {
                    setTotalServerCount(res.count || 0);
                    // Note: Ideally backend provides stats, but here we estimate or fetch full if small
                    setNextUrl(res.next);
                } else {
                    setTotalServerCount(newHits.length);
                    setNextUrl(null);
                }
            } else {
                setHits(prev => [...prev, ...newHits]);
                setNextUrl(res.next);
            }

            // Calculate basic stats from what we have (or you could add a special stats endpoint)
            // For now, let's calculate from the 'hits' we've loaded plus server counts
            const currentTotal = isPaginated ? res.count : newHits.length;
            const success = isPaginated ? (newHits.filter(h => h.status === 'SUCCESS').length / newHits.length * currentTotal) : newHits.filter(h => h.status === 'SUCCESS').length;
            // This is an estimate for paginated stats, but better than "10"
        } catch (err) {
            console.error("Error fetching login history:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Calculate detailed stats from the accumulated 'hits'
    const statsGroup = useMemo(() => {
        const total = Math.max(totalServerCount, hits.length);
        const loadedSuccess = hits.filter(h => h.status === 'SUCCESS').length;
        const loadedFailed = hits.filter(h => h.status === 'FAILED').length;
        
        // If we haven't loaded everything, we extrapolate the ratio
        const ratio = hits.length > 0 ? (loadedSuccess / hits.length) : 1;
        const estimatedSuccess = Math.round(total * ratio);
        const health = (ratio * 100).toFixed(1);
        
        return { 
            total, 
            success: estimatedSuccess, 
            failed: total - estimatedSuccess, 
            health 
        };
    }, [hits, totalServerCount]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHits = useMemo(() => hits.filter(hit => {
        const matchesSearch =
            hit.username?.toLowerCase().includes(search.toLowerCase()) ||
            hit.ip_address?.includes(search);

        const matchesStatus = filterStatus === 'ALL' || hit.status === filterStatus;

        let matchesDate = true;
        if (startDate || endDate) {
            const hitDate = new Date(hit.timestamp);
            hitDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (hitDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(0, 0, 0, 0);
                if (hitDate > end) matchesDate = false;
            }
        }

        return matchesSearch && matchesStatus && matchesDate;
    }), [hits, search, filterStatus, startDate, endDate]);

    const groupedHits = useMemo(() => {
        const groups = {};
        filteredHits.forEach(hit => {
            const date = new Date(hit.timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let groupKey = date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
            if (date.toDateString() === today.toDateString()) groupKey = 'TODAY';
            else if (date.toDateString() === yesterday.toDateString()) groupKey = 'YESTERDAY';

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(hit);
        });
        return groups;
    }, [filteredHits]);

    const parseUserAgent = (uaString) => {
        if (!uaString) return { os: 'System', browser: 'Internal', icon: <Laptop size={18} /> };
        let os = 'Unknown OS';
        let browser = 'Unknown Browser';
        let icon = <Laptop size={18} />;
        if (uaString.includes('Windows')) os = 'Windows';
        else if (uaString.includes('Mac OS X')) os = 'macOS';
        else if (uaString.includes('Android')) { os = 'Android'; icon = <Smartphone size={18} />; }
        else if (uaString.includes('iPhone') || uaString.includes('iPad')) { os = 'iOS'; icon = <Smartphone size={18} />; }
        else if (uaString.includes('Linux')) os = 'Linux PC';
        if (uaString.includes('Edg/')) browser = 'Edge';
        else if (uaString.includes('Firefox/')) browser = 'Firefox';
        else if (uaString.includes('Chrome/')) browser = 'Chrome';
        else if (uaString.includes('Safari/')) browser = 'Safari';
        return { os, browser, icon };
    };

    if (loading) return <BavyaSpinner />;

    return (
        <div style={{ padding: '2rem', maxWidth: '100%', margin: '0', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
            
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                .stat-tile {
                    flex: 1; padding: 1.5rem; border-radius: 24px;
                    background: white; border: 1px solid #f1f5f9;
                    transition: all 0.3s ease; display: flex; flex-direction: column;
                    justify-content: center;
                }
                .stat-tile:hover {
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
                    transform: translateY(-4px); border-color: #6366f1;
                }

                .session-strip-pro {
                    background: white; border: 1px solid #f1f5f9; border-radius: 20px;
                    padding: 1.25rem 1.75rem; display: flex; alignItems: center; gap: 2rem;
                    transition: all 0.2s ease; position: relative; margin-bottom: 0.75rem;
                }
                .session-strip-pro:hover {
                    box-shadow: 0 8px 20px -5px rgba(0,0,0,0.03);
                    border-color: #e2e8f0;
                }

                .date-label-pro {
                    font-size: 0.75rem; fontWeight: 900; color: #94a3b8;
                    text-transform: uppercase; letter-spacing: 0.2em;
                    margin: 2.5rem 0 1rem 0.5rem; display: flex; align-items: center; gap: 15px;
                }
                .date-label-pro::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

                .avatar-ring {
                    width: 44px; height: 44px; border-radius: 14px;
                    display: flex; align-items: center; justifyContent: center;
                    font-weight: 850; font-size: 1.1rem;
                }

                .pulse-live {
                    width: 8px; height: 8px; border-radius: 50%; background: #10b981;
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); animation: pro-pulse 2s infinite;
                }
                @keyframes pro-pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.4); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .filter-box-pro {
                    background: #fdfdfe; border: 1px solid #e2e8f0; border-radius: 16px;
                    padding: 0.85rem 1.25rem; outline: none; transition: all 0.2s;
                    font-size: 0.95rem; color: #1e293b; width: 100%;
                }
                .filter-box-pro:focus { border-color: #6366f1; }

                .load-more-btn {
                    padding: 1rem 2rem; border: 1px solid #e2e8f0; border-radius: 16px;
                    background: white; color: #6366f1; font-weight: 800; cursor: pointer;
                    display: flex; align-items: center; gap: 10px; margin: 2rem auto;
                    transition: all 0.2s;
                }
                .load-more-btn:hover { background: #f8fafc; border-color: #6366f1; }
                `}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', padding: '0 1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#6366f1', marginBottom: '8px' }}>
                        <Shield size={18} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Security Governance</span>
                    </div>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.04em' }}>Auth Control Hub</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '4px' }}>Real-time identity monitoring and session audit.</p>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ background: 'white', border: '1px solid #f1f5f9', padding: '0.6rem 1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="pulse-live" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>OPERATIONAL</span>
                    </div>
                    <button onClick={() => fetchHistory()} style={{ 
                        background: '#0f172a', color: 'white', border: 'none', borderRadius: '16px', 
                        padding: '0.85rem 1.75rem', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', 
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <RefreshCw size={18} /> SYNCHRONIZE DATA
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem', padding: '0 1rem' }}>
                <div className="stat-tile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Globe size={20} color="#94a3b8" />
                        <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>Global Activity</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#94a3b8' }}>TOTAL ATTEMPTS</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>{statsGroup.total}</div>
                </div>
                
                <div className="stat-tile" style={{ borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <UserCheck size={20} color="#94a3b8" />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#94a3b8' }}>VERIFIED IDENTITIES</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981' }}>{statsGroup.success}</div>
                </div>

                <div className="stat-tile" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <ShieldAlert size={20} color="#94a3b8" />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#94a3b8' }}>BLOCKED ATTEMPTS</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444' }}>{statsGroup.failed}</div>
                </div>

                <div className="stat-tile" style={{ background: '#0f172a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <Activity size={20} color="#6366f1" />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 850, color: '#64748b' }}>INTEGRITY INDEX</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'white', display: 'baseline', gap: '4px' }}>
                        {statsGroup.health}<span style={{ fontSize: '1rem', color: '#6366f1' }}>%</span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9', display: 'flex', gap: '1rem', marginBottom: '2.5rem', alignItems: 'center', margin: '0 1rem 2.5rem 1rem' }}>
                <div style={{ flex: 3.5, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: '#cbd5e1' }} />
                    <input type="text" placeholder="Trace username, node-id, or access endpoint..." value={search} onChange={(e) => setSearch(e.target.value)} className="filter-box-pro" style={{ paddingLeft: '3rem' }} />
                </div>
                <div style={{ flex: 1.5 }}>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-box-pro">
                        <option value="ALL">All Traffic</option>
                        <option value="SUCCESS">Verified</option>
                        <option value="FAILED">Blocked</option>
                    </select>
                </div>
                <div style={{ flex: 2, display: 'flex', gap: '10px' }}>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="filter-box-pro" style={{ flex: 1 }} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="filter-box-pro" style={{ flex: 1 }} />
                </div>
            </div>

            <div style={{ padding: '0 1rem' }}>
                {Object.keys(groupedHits).length > 0 ? (
                    <>
                        {Object.entries(groupedHits).map(([dateGroup, groupItems]) => (
                            <div key={dateGroup}>
                                <div className="date-label-pro">
                                    <Calendar size={14} /> {dateGroup}
                                </div>
                                {groupItems.map(hit => {
                                    const device = parseUserAgent(hit.user_agent);
                                    const isSuccess = hit.status === 'SUCCESS';
                                    const initials = hit.username ? hit.username.substring(0, 2).toUpperCase() : '??';
                                    return (
                                        <div key={hit.id} className="session-strip-pro">
                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: isSuccess ? '#10b981' : '#ef4444' }} />
                                            <div style={{ minWidth: '220px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div className="avatar-ring" style={{ 
                                                    background: isSuccess ? '#f0fdf4' : '#fef2f2',
                                                    color: isSuccess ? '#10b981' : '#ef4444',
                                                    border: `2px solid ${isSuccess ? '#dcfce7' : '#fee2e2'}`
                                                }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{hit.username || 'System Node'}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                                                        {hit.ip_address}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ minWidth: '140px' }}>
                                                {isSuccess ? (
                                                    <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                                        <CheckCircle2 size={12} /> VERIFIED
                                                    </div>
                                                ) : (
                                                    <div style={{ background: '#fff1f2', color: '#e11d48', border: '1.5px solid #ffe4e6', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                                                        <AlertOctagon size={12} /> BLOCKED
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 950, textTransform: 'uppercase' }}>LOGIN</div>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                                                        {new Date(hit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <ArrowRightCircle size={18} color="#cbd5e1" />
                                                <div>
                                                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 950, textTransform: 'uppercase' }}>LOGOUT</div>
                                                    {hit.logout_timestamp ? (
                                                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#64748b' }}>
                                                            {new Date(hit.logout_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {isSuccess && <div className="pulse-live" />}
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isSuccess ? '#10b981' : '#94a3b8' }}>
                                                                {isSuccess ? 'LIVE SESSION' : 'CLOSED'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', minWidth: '220px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>{device.os} • {device.browser}</div>
                                                    <div style={{ color: '#6366f1' }}>{device.icon}</div>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 800 }}>NODE_ID: {hit.ip_address}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        
                        {nextUrl && (
                            <button className="load-more-btn" onClick={() => fetchHistory(nextUrl)} disabled={loadingMore}>
                                {loadingMore ? <RefreshCw className="animate-spin" size={18} /> : <ChevronDown size={18} />}
                                {loadingMore ? 'Loading Records...' : `Explore More (${totalServerCount - hits.length} remaining)`}
                            </button>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '10rem 0', background: 'white', borderRadius: '32px', border: '2px dashed #f1f5f9' }}>
                        <Info size={48} color="#cbd5e1" />
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '1rem' }}>No Data Found</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginHistory;
