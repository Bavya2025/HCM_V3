import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Building2,
    FolderKanban,
    Briefcase,
    ChevronRight,
    Settings,
    Activity,
    ShieldAlert,
    TrendingUp,
    Clock,
    CheckCircle2,
    LayoutGrid,
    Layers,
    ShieldCheck,
    ClipboardList
} from 'lucide-react';
import { useData } from '../context/DataContext';
import BavyaSpinner from '../components/BavyaSpinner';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        stats,
        handleAdd,
        fetchStats,
        canCreate,
        user,
        allEmployees,
        offices,
        projects,
        handleEdit,
        refreshPermissions // Add this
    } = useData();
    const [time, setTime] = useState(new Date());
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);

        // Auto-refresh profile and stats on dashboard entry to ensure acting context is loaded
        refreshPermissions();
        fetchStats(true);

        return () => clearInterval(timer);
    }, []);

    // Generate Dynamic Activity Feed
    useEffect(() => {
        const events = [];

        // 1. Employee Events
        if (allEmployees?.length > 0) {
            allEmployees.slice(-3).reverse().forEach((emp, i) => {
                events.push({
                    id: `emp-${emp.id}`,
                    type: 'EMPLOYEE',
                    title: 'New Talent Acquisition',
                    desc: `${emp.name} joined as ${emp.designation || 'Team Member'}`,
                    time: i === 0 ? 'Just now' : `${i + 2} hours ago`,
                    icon: <Users size={16} />,
                    color: '#be185d',
                    bg: '#fdf2f8'
                });
            });
        }

        // 2. Office Events
        if (offices?.length > 0) {
            offices.slice(-2).reverse().forEach((off, i) => {
                events.push({
                    id: `off-${off.id}`,
                    type: 'OFFICE',
                    title: 'Facility Expansion',
                    desc: `New office commissioned: ${off.name}`,
                    time: '1 day ago',
                    icon: <Building2 size={16} />,
                    color: '#059669',
                    bg: '#ecfdf5'
                });
            });
        }

        // 3. Project Events
        if (projects?.length > 0) {
            projects.slice(-2).reverse().forEach((proj, i) => {
                events.push({
                    id: `proj-${proj.id}`,
                    type: 'PROJECT',
                    title: 'Project Update',
                    desc: `New initiative: ${proj.name}`,
                    time: '2 days ago',
                    icon: <FolderKanban size={16} />,
                    color: '#f97316',
                    bg: '#fff7ed'
                });
            });
        }

        // Fallback to System Events if no data
        if (events.length === 0) {
            events.push(
                { id: 'sys-1', title: 'System Indexing', desc: 'Database optimization completed.', time: '10 mins ago', icon: <CheckCircle2 size={16} />, color: '#64748b', bg: '#f1f5f9' },
                { id: 'sys-2', title: 'Data Synchronization', desc: 'Geo-location data synced.', time: '45 mins ago', icon: <Activity size={16} />, color: '#64748b', bg: '#f1f5f9' },
                { id: 'sys-3', title: 'Backup Protocol', desc: 'Daily incremental backup successful.', time: '2 hours ago', icon: <Clock size={16} />, color: '#64748b', bg: '#f1f5f9' }
            );
        }

        setRecentActivity(events.slice(0, 5));
    }, [allEmployees, offices, projects]);


    return (
        <div className="fade-in stagger-in" style={{ paddingBottom: '3rem', width: '100%' }}>

            {/* HERO SECTION */}
            <div className="glass" style={{
                padding: '1.25rem 2rem',
                marginBottom: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(120deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '130px'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                        <span style={{
                            background: 'rgba(5, 150, 105, 0.1)',
                            color: '#059669',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            <span className="live-dot" style={{ width: '5px', height: '5px', background: '#059669', borderRadius: '50%' }}></span>
                            SYSTEM ONLINE
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="hero-gradient-text" style={{ fontSize: '1.75rem', lineHeight: '1.2', marginBottom: '0.25rem' }}>
                        Welcome back, {user?.employee_name || user?.username || 'Administrator'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, maxWidth: '500px', lineHeight: '1.4' }}>

                    </p>
                </div>

                {/* Decorative Background Element - Subtle */}
                <div style={{
                    position: 'absolute',
                    top: '-60%',
                    right: '-5%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(190, 24, 93, 0.04) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}></div>
            </div>

            {/* STATS GRID */}
            <div className="stats-grid stagger-in" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} 
                        className="stat-card" 
                        onClick={() => stat.title === 'Live Projects' ? navigate('/project-analytics') : null}
                        style={{
                            background: stat.color,
                            padding: '1.25rem',
                            borderRadius: '16px',
                            minHeight: '140px',
                            cursor: stat.title === 'Live Projects' ? 'pointer' : 'default',
                            transform: stat.title === 'Live Projects' ? 'scale(1)' : 'none',
                            transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => stat.title === 'Live Projects' && (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseLeave={(e) => stat.title === 'Live Projects' && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <div className="stat-card-glow"></div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="glass-float" style={{
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '12px',
                                    color: 'white'
                                }}>
                                    {React.cloneElement(stat.icon, { size: 20 })}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '20px',
                                    color: 'white'
                                }}>
                                    LIVE SYNC
                                </div>
                            </div>
                            <h3 style={{
                                marginTop: '1rem',
                                opacity: 0.9,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                color: 'white'
                            }}>
                                {stat.title}
                            </h3>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                margin: '0.25rem 0',
                                letterSpacing: '-0.02em',
                                color: 'white'
                            }}>
                                {stat.value}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', opacity: 0.9, fontWeight: 600, color: 'white' }}>
                            <TrendingUp size={14} /> {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* CRITICAL ALERTS SECTION */}
            {(() => {
                const now = new Date();
                const criticalProjects = (projects || []).filter(p => {
                    if (!p.end_date) return false;
                    const end = new Date(p.end_date);
                    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                    return diffDays <= 10; // Alarms for projects ending within 10 days
                }).sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

                if (criticalProjects.length === 0) return null;

                return (
                    <div className="stagger-in" style={{ marginBottom: '2.5rem' }}>
                        <div className="glass section-card" style={{ padding: '2rem', borderLeft: '4px solid #ef4444' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '12px' }}>
                                    <ShieldAlert size={22} color="#ef4444" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b' }}>Critical Operational Alerts</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#b91c1c', opacity: 0.8 }}>Project portfolio milestones requiring immediate oversight</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {criticalProjects.slice(0, 3).map(proj => {
                                    const end = new Date(proj.end_date);
                                    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                                    const isExpired = diffDays < 0;

                                    return (
                                        <div key={proj.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: isExpired ? '#fef2f2' : '#fff7ed',
                                            borderRadius: '12px',
                                            border: `1px solid ${isExpired ? '#fecaca' : '#fed7aa'}`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: isExpired ? '#ef4444' : '#f97316',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}>
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{proj.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ends: {new Date(proj.end_date).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    color: isExpired ? '#ef4444' : '#f97316',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {isExpired ? 'EXPIRED' : `${diffDays} DAYS REMAINING`}
                                                </div>
                                                <button className="nav-link" style={{ fontSize: '0.7rem', marginTop: '4px', padding: 0, minWidth: 'auto' }} onClick={() => handleEdit('Projects', proj)}>
                                                    View Details <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            <div className="stagger-in">
                {/* ACTIONS SECTION */}
                <div className="glass section-card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', background: 'rgba(190, 24, 93, 0.1)', borderRadius: '12px' }}>
                                <ShieldAlert size={22} color="var(--primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Quick Actions</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}></p>
                            </div>
                        </div>
                        <button
                            className="glass"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '10px 16px', borderRadius: '12px', color: '#64748b', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            onClick={() => alert("Dashboard personalization feature is coming in the next update!")}
                        >
                            <Settings size={14} /> Customize
                        </button>
                    </div>

                    <div className="dashboard-actions-grid">
                        {[
                            { title: 'Provision Office', icon: <Building2 />, color: '#ffedd5', txt: '#f97316', type: 'Offices' },
                            { title: 'Add Employee', icon: <Users />, color: '#fff1f2', txt: '#be185d', type: 'Employees' },
                            { title: 'New Project', icon: <FolderKanban />, color: '#ecfdf5', txt: '#059669', type: 'Projects' },
                            { title: 'Define Position', icon: <Briefcase />, color: '#fef3c7', txt: '#eab308', type: 'Positions' },
                            { title: 'Add Department', icon: <LayoutGrid />, color: '#f0f9ff', txt: '#0284c7', type: 'Departments' },
                            { title: 'Job Family', icon: <Layers />, color: '#f5f3ff', txt: '#7c3aed', type: 'Job Families' },
                            { title: 'New Role', icon: <ShieldCheck />, color: '#fdf4ff', txt: '#c026d3', type: 'Roles' },
                            { title: 'Assign Task', icon: <ClipboardList />, color: '#ecfdf5', txt: '#16a34a', type: 'Tasks' }
                        ].filter(action => canCreate(action.type)).map((action, i) => (
                            <div key={i} className="action-card" onClick={() => handleAdd(action.type)}>
                                <div className="action-icon" style={{ background: action.color, color: action.txt }}>
                                    {action.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{action.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Instant Deploy</div>
                                </div>
                                <ChevronRight className="action-arrow" size={16} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0.05))', pointerEvents: 'none' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

