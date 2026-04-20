import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
    FolderKanban, Users, Building2, Search,
    Globe, Briefcase, Activity, Target, PieChart,
    ArrowUpRight, MapPin, ShieldCheck, Mail, Phone, BarChart3,
    Zap, Sparkles, Filter, ChevronRight, Layers, Layout
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    Legend, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area
} from 'recharts';

const ProjectAnalyticsDashboard = () => {
    const { projects, offices, departments, sections, positions, allEmployees, loading } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null);

    // Dynamic styles for the premium dark theme
    const darkTheme = {
        bg: '#030712',
        surface: 'rgba(17, 24, 39, 0.7)',
        glass: 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#f472b6', // Pink neon
        accentSecondary: '#38bdf8', // Blue neon
        accentTertiary: '#a855f7', // Purple neon
        textMain: '#f9fafb',
        textDim: '#9ca3af'
    };

    // Pre-calculate stats for all projects with robust matching
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
            });

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
        if (!searchQuery) return projectStats;
        const q = searchQuery.toLowerCase();
        return projectStats.filter(p => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
    }, [projectStats, searchQuery]);

    const selectedProject = projectStats.find(p => String(p.id) === String(selectedProjectId));

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
                <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: darkTheme.accent, fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem' }}>
                            <Sparkles size={16} /> Human Capital Command Center
                        </div>
                        <h1 style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: '1.5rem' }}>
                            Strategic <span style={{ 
                                background: `linear-gradient(to right, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Workforce</span> <br/> Operational Domain
                        </h1>
                        <p style={{ color: darkTheme.textDim, fontSize: '1.2rem', maxWidth: '600px' }}>
                            Real-time organizational intelligence and resource optimization across all project verticals.
                        </p>
                    </div>

                    <div style={{ position: 'relative', minWidth: '450px' }}>
                        <div style={{ 
                            position: 'absolute', inset: 0, background: `linear-gradient(to right, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                            filter: 'blur(15px)', opacity: 0.1, borderRadius: '24px'
                        }} />
                        <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: darkTheme.accentSecondary }} size={24} />
                        <input 
                            type="text" 
                            placeholder="Universal Search Domain..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '22px 25px 22px 60px',
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
                            onFocus={(e) => e.target.style.borderColor = darkTheme.accentSecondary}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>
                </div>

                {/* ─── SUMMARY ANALYTICS ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}>
                    {[
                        { label: 'DOMAINS', value: summary.totalProjects, icon: <Layout />, color: darkTheme.accentSecondary },
                        { label: 'WORKFORCE', value: summary.totalWorkforce, icon: <Users />, color: darkTheme.accent },
                        { label: 'VACANCIES', value: summary.totalVacancies, icon: <Target />, color: '#fbbf24' },
                        { label: 'CAPACITY', value: `${summary.utilization}%`, icon: <Activity />, color: '#10b981' }
                    ].map((stat, i) => (
                        <div key={i} className="glass" style={{
                            padding: '2rem',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '32px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            position: 'relative',
                            overflow: 'hidden'
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

                {/* ─── DATA VISUALIZATION SECTION ─── */}
                <div style={{ 
                    padding: '2.5rem', 
                    background: 'rgba(255,255,255,0.01)', 
                    borderRadius: '40px', 
                    border: '1px solid rgba(255,255,255,0.04)',
                    marginBottom: '4rem',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <BarChart3 size={28} color={darkTheme.accentSecondary} /> Domain Resilience Matrix
                            </h2>
                            <p style={{ color: darkTheme.textDim, fontSize: '0.9rem' }}>Comparative analysis of workforce deployment vs strategic capacity across all active domains.</p>
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
                                    tick={{ fill: darkTheme.textDim, fontSize: 11, fontWeight: 700 }}
                                    dy={10}
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
                                <Bar dataKey="Filled" stackId="a" fill="url(#neonGradient)" barSize={50} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="Vacant" stackId="a" fill="rgba(255,255,255,0.05)" barSize={50} radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ─── PROJECT DOMAIN TILES ─── */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {filteredProjects.map((proj) => {
                        const isSelected = String(proj.id) === String(selectedProjectId);
                        const isHovered = hoveredCard === proj.id;
                        
                        return (
                            <div 
                                key={proj.id}
                                onMouseEnter={() => setHoveredCard(proj.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                                style={{
                                    padding: '2.5rem',
                                    background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                    borderRadius: '40px',
                                    border: `1px solid ${isSelected ? darkTheme.accentSecondary : 'rgba(255,255,255,0.05)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                    transform: isHovered 
                                        ? 'translateY(-12px) scale(1.03) perspective(1000px) rotateX(2deg) rotateY(1deg)' 
                                        : 'none',
                                    boxShadow: isHovered 
                                        ? `0 40px 80px rgba(0,0,0,0.5), 0 0 40px ${darkTheme.accentSecondary}30` 
                                        : '0 10px 30px rgba(0,0,0,0.1)',
                                    position: 'relative',
                                    backdropFilter: 'blur(30px)',
                                    overflow: 'hidden'
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

                                <h3 style={{ fontSize: '1.8rem', fontWeight: 950, marginBottom: '0.5rem' }}>{proj.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: darkTheme.textDim, fontSize: '0.9rem', marginBottom: '3rem' }}>
                                    <ShieldCheck size={16} color={darkTheme.accentSecondary} /> {proj.code}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Active Personnel</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {proj.totalEmployees} <span style={{ fontSize: '0.9rem', color: darkTheme.textDim, fontWeight: 600 }}>units</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Strategic Nodes</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 950, display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            {proj.totalUnits} <span style={{ fontSize: '0.9rem', color: darkTheme.textDim, fontWeight: 600 }}>units</span>
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
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '50px',
                            padding: '4rem',
                            backdropFilter: 'blur(40px)'
                        }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '0.5rem' }}>Human Capital Manifest</h2>
                                    <p style={{ color: darkTheme.textDim }}>Personnel resource allocation for <strong>{selectedProject.name}</strong></p>
                                </div>
                                <div style={{ 
                                    padding: '1.5rem 2.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '24px',
                                    display: 'flex', flexDir: 'column', alignItems: 'flex-end'
                                }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: darkTheme.textDim }}>CURRENT DEPLOYMENT</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 950, color: darkTheme.accent }}>{selectedProject.totalEmployees} / {selectedProject.totalPositions}</span>
                                </div>
                             </div>

                             {selectedProject.employees?.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                    {selectedProject.employees.map((emp, i) => (
                                        <div key={emp.id} style={{
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '24px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.25rem',
                                            transition: 'transform 0.3s ease'
                                        }}>
                                            <div style={{ 
                                                width: '50px', height: '50px', borderRadius: '50%', 
                                                background: `linear-gradient(45deg, ${darkTheme.accent}, ${darkTheme.accentSecondary})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.1rem', fontWeight: 900, color: 'white'
                                            }}>
                                                {emp.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{emp.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: darkTheme.textDim, fontWeight: 600 }}>{emp.employee_code}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div style={{ padding: '5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '30px' }}>
                                    <Users size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>No Active Personnel Detected</h3>
                                    <p style={{ color: darkTheme.textDim }}>Current records indicate no staffing assigned to this domain.</p>
                                </div>
                             )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .glass:hover {
                    border-color: rgba(255,255,255,0.2) !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                @keyframes float-gentle {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes sheen-glide {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(100%) skewX(-20deg); opacity: 0; }
                }
                @keyframes pulse-soft {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .pulse-dot {
                    animation: pulse-soft 2s infinite ease-in-out;
                }
                .stagger-item {
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .stagger-item:hover {
                    background: rgba(255,255,255,0.04) !important;
                }
            `}</style>
        </div>
    );
};

export default ProjectAnalyticsDashboard;
