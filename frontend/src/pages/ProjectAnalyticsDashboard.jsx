import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
    FolderKanban, Users, Building2, Search,
    Globe, Briefcase, Activity, Target, PieChart,
    ArrowUpRight, MapPin, ShieldCheck, Mail, Phone, BarChart3,
    Zap, Sparkles, Filter, ChevronRight, Layers, Layout, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area
} from 'recharts';

const ProjectAnalyticsDashboard = () => {
    const { projects, offices, departments, sections, positions, allEmployees, loading } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null);
    const [showGraph, setShowGraph] = useState(false);

    // Helper component for visual search highlighting
    const HighlightText = ({ text, highlight }) => {
        if (!highlight || !highlight.trim()) return <span>{text}</span>;
        const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) => 
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} style={{ 
                            background: `rgba(56, 189, 248, 0.2)`, 
                            color: '#38bdf8',
                            padding: '0 2px',
                            borderRadius: '4px',
                            textShadow: `0 0 10px rgba(56, 189, 248, 0.4)`,
                            fontWeight: 900
                        }}>
                            {part}
                        </span>
                    ) : part
                )}
            </span>
        );
    };

    // Dynamic styles for the premium dark theme
    const darkTheme = {
        bg: '#030712',
        surface: 'rgba(17, 24, 39, 0.7)',
        glass: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#f472b6', 
        accentSecondary: '#38bdf8', 
        accentTertiary: '#a855f7', 
        textMain: '#f9fafb',
        textDim: '#9ca3af'
    };

    // Pre-calculate stats for all projects
    const projectStats = useMemo(() => {
        if (!projects || !offices) return [];

        const activeOffices = offices.filter(o => String(o.status || '').toLowerCase() === 'active');
        const activePositions = (positions || []).filter(p => String(p.status || '').toLowerCase() === 'active');

        return projects.map(proj => {
            const projOffices = activeOffices.filter(o => 
                String(o.project_id) === String(proj.id) || 
                (proj.geo_scope === 'CLUSTER' && String(o.cluster_name).toLowerCase() === String(proj.cluster_name).toLowerCase())
            );
            
            const officeIds = new Set(projOffices.map(o => String(o.id)));
            const projDepts = (departments || []).filter(d => officeIds.has(String(d.office_id)));
            const deptIds = new Set(projDepts.map(d => String(d.id)));
            const projSecs = (sections || []).filter(s => deptIds.has(String(s.department_id)));
            const sectionIds = new Set(projSecs.map(s => String(s.id)));

            const projPositions = activePositions.filter(p => 
                sectionIds.has(String(p.section_id)) || 
                deptIds.has(String(p.department_id)) || 
                officeIds.has(String(p.office_id))
            );
            
            const projPositionIds = new Set(projPositions.map(p => String(p.id)));
            const projEmployees = (allEmployees || []).filter(emp => {
                const empPosIds = Array.isArray(emp.positions) ? emp.positions : (emp.positions_details?.map(pd => pd.id) || []);
                return empPosIds.some(pid => projPositionIds.has(String(pid)));
            }).sort((a,b) => (a.name || '').localeCompare(b.name || ''));

            return {
                ...proj,
                totalUnits: projOffices.length + projDepts.length + projSecs.length,
                totalPositions: projPositions.length,
                totalEmployees: projEmployees.length,
                totalVacancies: Math.max(0, projPositions.length - projEmployees.length),
                vacancyRate: projPositions.length > 0 ? ((projPositions.length - projEmployees.length) / projPositions.length * 100).toFixed(1) : 0,
                employees: projEmployees
            };
        });
    }, [projects, offices, departments, sections, positions, allEmployees]);

    const summary = useMemo(() => {
        const totalPos = projectStats.reduce((acc, p) => acc + p.totalPositions, 0);
        const totalEmp = projectStats.reduce((acc, p) => acc + p.totalEmployees, 0);
        return {
            totalProjects: projectStats.length,
            totalWorkforce: totalEmp,
            totalVacancies: Math.max(0, totalPos - totalEmp),
            utilization: totalPos > 0 ? (totalEmp / totalPos * 100).toFixed(1) : 0
        };
    }, [projectStats]);

    const chartData = useMemo(() => {
        return projectStats.map(p => ({
            name: p.name,
            Filled: p.totalEmployees,
            Vacant: p.totalVacancies,
            Capacity: p.totalPositions
        }));
    }, [projectStats]);

    const filteredProjects = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return projectStats;
        return projectStats.filter(p => 
            (p.name?.toLowerCase().includes(q)) || 
            (p.code?.toLowerCase().includes(q)) ||
            (p.cluster_name?.toLowerCase().includes(q))
        );
    }, [projectStats, searchQuery]);

    const selectedProject = projectStats.find(p => String(p.id) === String(selectedProjectId));

    const manifestEmployees = useMemo(() => {
        if (!selectedProject) return [];
        const q = employeeSearch.toLowerCase().trim();
        if (!q) return selectedProject.employees;
        return selectedProject.employees.filter(e => 
            e.name?.toLowerCase().includes(q) || 
            e.employee_code?.toLowerCase().includes(q)
        );
    }, [selectedProject, employeeSearch]);

    if (loading) return <div style={{ background: darkTheme.bg, height: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Zap className="animate-pulse" size={48} color={darkTheme.accent} />
    </div>;

    return (
        <div style={{ 
            background: darkTheme.bg,
            minHeight: '100vh',
            color: darkTheme.textMain,
            padding: '2rem',
            fontFamily: "'Inter', sans-serif",
            overflowX: 'hidden'
        }}>
            {/* ─── GLOBAL BACKGROUND GLOWS ─── */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: `${darkTheme.accent}10`, filter: 'blur(150px)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: `${darkTheme.accentSecondary}10`, filter: 'blur(150px)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                
                {/* ─── PREMIUM HERO HEADER ─── */}
                <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="fade-in-up">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: darkTheme.accent, fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                            <Sparkles size={16} /> Human Capital Command Center
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: '1.5rem' }}>
                            Strategic <span style={{ 
                                background: `linear-gradient(to right, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Workforce</span> <br/> Operational Domain
                        </h1>
                        <p style={{ color: darkTheme.textDim, fontSize: '1.1rem', maxWidth: '600px' }}>
                            Real-time organizational intelligence and resource optimization across all project verticals.
                        </p>
                    </div>

                    <div className="fade-in-up" style={{ position: 'relative', minWidth: '400px', animationDelay: '0.1s' }}>
                        <div style={{ 
                            position: 'absolute', inset: 0, background: `linear-gradient(to right, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                            filter: 'blur(15px)', opacity: 0.1, borderRadius: '24px'
                        }} />
                        <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: darkTheme.accentSecondary }} size={24} />
                        <input 
                            type="text" 
                            placeholder="Search Domains or Project Codes..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '20px 25px 20px 60px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                outline: 'none',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>
                </div>

                {/* ─── SUMMARY ANALYTICS ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: 'DOMAINS', value: summary.totalProjects, icon: <Layout />, color: darkTheme.accentSecondary },
                        { label: 'WORKFORCE', value: summary.totalWorkforce, icon: <Users />, color: darkTheme.accent },
                        { label: 'VACANCIES', value: summary.totalVacancies, icon: <Target />, color: '#fbbf24' },
                        { label: 'CAPACITY', value: `${summary.utilization}%`, icon: <Activity />, color: '#10b981' }
                    ].map((stat, i) => (
                        <div key={i} className="glass fade-in-up" style={{
                            padding: '2rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            position: 'relative',
                            overflow: 'hidden',
                            animationDelay: `${i * 0.1}s`
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stat.color }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ 
                                    width: '60px', height: '60px', borderRadius: '18px', 
                                    background: `${stat.color}10`, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: `0 0 20px ${stat.color}20`
                                }}>
                                    {React.cloneElement(stat.icon, { size: 28 })}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: darkTheme.textDim, fontWeight: 800, letterSpacing: '0.1em' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-0.02em' }}>{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── TOGGLEABLE GLOBAL ANALYTICS ─── */}
                <div style={{ marginBottom: '4rem' }}>
                    <button 
                        onClick={() => setShowGraph(!showGraph)}
                        style={{
                            width: '100%',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '24px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                        {showGraph ? <ChevronUp size={24} color={darkTheme.accentSecondary} /> : <ChevronDown size={24} color={darkTheme.accentSecondary} />}
                        {showGraph ? 'HIDE DOMAIN INTELLIGENCE MATRIX' : 'SHOW DOMAIN INTELLIGENCE MATRIX'}
                        <BarChart3 size={20} color={darkTheme.accentSecondary} />
                    </button>

                    {showGraph && (
                        <div 
                            className="fade-in-up"
                            style={{ 
                                marginTop: '1.5rem',
                                padding: '2.5rem', 
                                background: 'rgba(255,255,255,0.01)', 
                                borderRadius: '40px', 
                                border: '1px solid rgba(255,255,255,0.04)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        Domain Resilience Matrix
                                    </h2>
                                    <p style={{ color: darkTheme.textDim, fontSize: '0.9rem' }}>Comparative analysis of workforce deployment vs strategic capacity.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: darkTheme.accent }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: darkTheme.textDim }}>DEPLOYED</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: darkTheme.textDim }}>VACANT</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={darkTheme.accent} stopOpacity={1} />
                                                <stop offset="100%" stopColor={darkTheme.accentTertiary} stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis 
                                            dataKey="name" axisLine={false} tickLine={false} 
                                            tick={{ fill: darkTheme.textDim, fontSize: 10, fontWeight: 700 }}
                                            interval={0} angle={-45} textAnchor="end" height={80}
                                        />
                                        <YAxis 
                                            axisLine={false} tickLine={false} 
                                            tick={{ fill: darkTheme.textDim, fontSize: 11, fontWeight: 700 }}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{ 
                                                background: '#111827', border: '1px solid rgba(255,255,255,0.1)', 
                                                borderRadius: '20px', padding: '15px', color: 'white',
                                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                                            }}
                                        />
                                        <Bar dataKey="Filled" stackId="a" fill="url(#neonGradient)" barSize={40} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="Vacant" stackId="a" fill="rgba(255,255,255,0.05)" barSize={40} radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── PROJECT DOMAIN TILES ─── */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {filteredProjects.map((proj, i) => {
                        const isSelected = String(proj.id) === String(selectedProjectId);
                        const isHovered = hoveredCard === proj.id;
                        const isActiveSearch = searchQuery && (
                            proj.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            proj.code?.toLowerCase().includes(searchQuery.toLowerCase())
                        );
                        
                        return (
                            <div 
                                key={proj.id}
                                onMouseEnter={() => setHoveredCard(proj.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                                className="fade-in-up"
                                style={{
                                    animationDelay: `${(i % 10) * 0.05}s`,
                                    padding: '2.5rem',
                                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '40px',
                                    border: `1px solid ${isActiveSearch ? darkTheme.accentSecondary : (isSelected ? darkTheme.accentSecondary : 'rgba(255,255,255,0.05)')}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transform: isHovered 
                                        ? 'translateY(-12px) scale(1.03) perspective(1000px) rotateX(2deg) rotateY(1deg)' 
                                        : 'none',
                                    boxShadow: isActiveSearch
                                        ? `0 0 30px ${darkTheme.accentSecondary}30`
                                        : (isHovered 
                                            ? `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${darkTheme.accentSecondary}30` 
                                            : '0 10px 30px rgba(0,0,0,0.1)'),
                                    position: 'relative',
                                    backdropFilter: 'blur(30px)',
                                    overflow: 'hidden',
                                    opacity: searchQuery && !isActiveSearch ? 0.3 : 1
                                }}
                            >
                                {/* HYPER-MOTION SHEEN EFFECT */}
                                {isHovered && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                                        animation: 'sheen-glide 1.8s infinite',
                                        pointerEvents: 'none',
                                        zIndex: 1
                                    }} />
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
                                    <div style={{ 
                                        width: '64px', height: '64px', borderRadius: '22px',
                                        background: isSelected ? darkTheme.accentSecondary : 'rgba(255,255,255,0.05)',
                                        color: isSelected ? 'white' : darkTheme.accentSecondary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: isSelected ? `0 0 30px ${darkTheme.accentSecondary}50` : 'none',
                                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'none'
                                    }}>
                                        <Globe size={32} />
                                    </div>
                                    <div style={{ 
                                        fontSize: '0.7rem', fontWeight: 900, padding: '8px 16px', borderRadius: '30px',
                                        background: proj.status?.toLowerCase() === 'active' ? '#065f46' : '#991b1b',
                                        color: 'white', letterSpacing: '0.1em',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        boxShadow: proj.status?.toLowerCase() === 'active' ? '0 0 15px #10b98140' : 'none'
                                    }}>
                                        {proj.status?.toLowerCase() === 'active' && (
                                            <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        )}
                                        {proj.status?.toUpperCase()}
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.6rem', fontWeight: 950, marginBottom: '0.5rem' }}>
                                    <HighlightText text={proj.name} highlight={searchQuery} />
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkTheme.textDim, fontSize: '0.9rem', marginBottom: '3rem' }}>
                                    <ShieldCheck size={16} color={darkTheme.accentSecondary} /> 
                                    <HighlightText text={proj.code} highlight={searchQuery} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Active Personnel</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 950, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {proj.totalEmployees} <span style={{ fontSize: '0.8rem', color: darkTheme.textDim, fontWeight: 600 }}>units</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Strategic Nodes</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 950, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {proj.totalUnits} <span style={{ fontSize: '0.8rem', color: darkTheme.textDim, fontWeight: 600 }}>units</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
                                        <div style={{ fontSize: '0.7rem', color: darkTheme.textDim, fontWeight: 800 }}>UTILIZATION INDEX</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 950, color: darkTheme.accentSecondary }}>{Math.round(100 - proj.vacancyRate)}%</div>
                                    </div>
                                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${100 - proj.vacancyRate}%`, height: '100%', 
                                            background: `linear-gradient(to right, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                                            borderRadius: '20px',
                                            boxShadow: `0 0 15px ${darkTheme.accentSecondary}30`,
                                            transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ─── DOMAIN PERSONNEL DRILL-DOWN ─── */}
                {selectedProject && (
                    <div style={{ marginTop: '5rem', animation: 'slide-up 0.6s ease-out' }}>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.02)', 
                            border: `1px solid ${darkTheme.accentSecondary}30`,
                            borderRadius: '50px',
                            padding: '3rem',
                            backdropFilter: 'blur(40px)',
                            position: 'relative',
                            boxShadow: `0 -50px 100px rgba(0,0,0,0.5), 0 0 40px ${darkTheme.accentSecondary}10`
                        }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '0.5rem' }}>Human Capital Manifest</h2>
                                    <p style={{ color: darkTheme.textDim }}>Personnel resource allocation for <strong>{selectedProject.name}</strong> • {selectedProject.totalEmployees} employees detected</p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{ position: 'relative', minWidth: '300px' }}>
                                        <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: darkTheme.accentSecondary }} size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Find Personnel..." 
                                            value={employeeSearch}
                                            onChange={(e) => setEmployeeSearch(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '15px 15px 15px 45px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <div style={{ 
                                        padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '18px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: darkTheme.textDim }}>DEPLOYMENT CAP</span>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: darkTheme.accentSecondary }}>{selectedProject.totalEmployees} / {selectedProject.totalPositions}</span>
                                    </div>
                                    <button onClick={() => setSelectedProjectId(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>
                             </div>

                             {/* SCROLLABLE MANIFEST VIEWPORT */}
                             <div style={{ 
                                 maxHeight: '700px', 
                                 overflowY: 'auto', 
                                 paddingRight: '1rem',
                                 scrollbarWidth: 'thin',
                                 scrollbarColor: `${darkTheme.accentSecondary}20 transparent`
                             }}>
                                {manifestEmployees.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                                        {manifestEmployees.map((emp, i) => {
                                            const isActiveEmpSearch = employeeSearch && (
                                                emp.name?.toLowerCase().includes(employeeSearch.toLowerCase()) || 
                                                emp.employee_code?.toLowerCase().includes(employeeSearch.toLowerCase())
                                            );

                                            return (
                                                <div key={emp.id} className="stagger-item" style={{
                                                    padding: '1.25rem',
                                                    background: 'rgba(255,255,255,0.03)',
                                                    borderRadius: '24px',
                                                    border: `1px solid ${isActiveEmpSearch ? darkTheme.accentSecondary : 'rgba(255,255,255,0.05)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1.25rem',
                                                    transition: 'all 0.3s ease',
                                                    animation: `fade-in-up 0.5s ease-out ${Math.min(i * 0.02, 1)}s both`,
                                                    opacity: employeeSearch && !isActiveEmpSearch ? 0.4 : 1,
                                                    boxShadow: isActiveEmpSearch ? `0 0 15px ${darkTheme.accentSecondary}20` : 'none'
                                                }}>
                                                    <div style={{ 
                                                        width: '50px', height: '50px', borderRadius: '50%', 
                                                        background: `linear-gradient(45deg, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '1.1rem', fontWeight: 900, color: 'white',
                                                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                                    }}>
                                                        {emp.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                                                            <HighlightText text={emp.name} highlight={employeeSearch} />
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 600 }}>
                                                            <HighlightText text={emp.employee_code} highlight={employeeSearch} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ padding: '8rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '30px' }}>
                                        <Users size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No Personnel Matches</h3>
                                        <p style={{ color: darkTheme.textDim }}>Adjust your search parameters for this domain.</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes sheen-glide {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(100%) skewX(-20deg); opacity: 0; }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                }
                .pulse-dot {
                    animation: pulse-soft 2s infinite ease-in-out;
                }
                .stagger-item:hover {
                    background: rgba(255,255,255,0.06) !important;
                    border-color: ${darkTheme.accentSecondary}40 !important;
                    transform: translateX(10px);
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { 
                    background: ${darkTheme.accentSecondary}30; 
                    border-radius: 10px; 
                }
                ::-webkit-scrollbar-thumb:hover { background: ${darkTheme.accentSecondary}50; }
            `}</style>
        </div>
    );
};

export default ProjectAnalyticsDashboard;
