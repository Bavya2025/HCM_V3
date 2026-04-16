import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
    FolderKanban, Users, Building2, Search, 
    Globe, Briefcase, Activity, Target, PieChart, 
    ArrowUpRight, MapPin, ShieldCheck, Mail, Phone
} from 'lucide-react';

const ProjectAnalyticsDashboard = () => {
    const { projects, offices, departments, sections, positions, allEmployees, loading } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-calculate stats for all projects with robust matching
    const projectStats = useMemo(() => {
        if (!projects) return [];

        return projects.map(proj => {
            const projIdStr = String(proj.id);
            const projName = String(proj.name || '').toLowerCase();

            // Find structural units mapped to this project that are ACTIVE
            const projOffices = (offices || []).filter(o => {
                if (String(o.status || '').toLowerCase() !== 'active') return false;
                const isProjectMatch = (o.assigned_projects || []).some(p => String(p).toLowerCase() === projName) || 
                                     String(o.project_id) === projIdStr;
                if (isProjectMatch) return true;
                if (proj.geo_scope_level) {
                    const scope = proj.geo_scope_level.toLowerCase();
                    const stateMatch = !proj.state_name || String(o.state_name || '').toLowerCase() === String(proj.state_name).toLowerCase();
                    const districtMatch = !proj.district_name || String(o.district_name || '').toLowerCase() === String(proj.district_name).toLowerCase();
                    const mandalMatch = !proj.mandal_name || String(o.mandal_name || '').toLowerCase() === String(proj.mandal_name).toLowerCase();
                    if (scope === 'state' && stateMatch) return true;
                    if (scope === 'district' && stateMatch && districtMatch) return true;
                    if (scope === 'mandal' && stateMatch && districtMatch && mandalMatch) return true;
                }
                return false;
            });

            const projDepts = (departments || []).filter(d => {
                if (String(d.status || '').toLowerCase() !== 'active') return false;
                const isProjectMatch = String(d.project) === projIdStr || String(d.project_id) === projIdStr;
                return isProjectMatch || projOffices.some(o => String(o.id) === String(d.office || d.office_id));
            });

            const projSecs = (sections || []).filter(s => {
                if (String(s.status || '').toLowerCase() !== 'active') return false;
                const isProjectMatch = String(s.project) === projIdStr || String(s.project_id) === projIdStr;
                return isProjectMatch || projDepts.some(d => String(d.id) === String(s.department || s.department_id));
            });

            const officeIds = projOffices.map(o => String(o.id));
            const deptIds = projDepts.map(d => String(d.id));
            const secIds = projSecs.map(s => String(s.id));

            const projPositions = (positions || []).filter(p => {
                const isUnitMatch = officeIds.includes(String(p.office)) || officeIds.includes(String(p.office_id)) ||
                                  deptIds.includes(String(p.department)) || deptIds.includes(String(p.department_id)) ||
                                  secIds.includes(String(p.section)) || secIds.includes(String(p.section_id));
                return isUnitMatch && String(p.status || '').toLowerCase() === 'active';
            });

            const positionIds = projPositions.map(p => String(p.id));
            const projEmployees = (allEmployees || []).filter(emp => {
                const hasPosition = emp.positions_details?.some(pd => positionIds.includes(String(pd.id)));
                return hasPosition && String(emp.status || '').toLowerCase() === 'active';
            });

            return {
                ...proj,
                totalUnits: projOffices.length + projDepts.length + projSecs.length,
                totalOffices: projOffices.length,
                totalDepartments: projDepts.length,
                totalSections: projSecs.length,
                totalPositions: projPositions.length,
                totalEmployees: projEmployees.length,
                employees: projEmployees
            };
        });
    }, [projects, offices, departments, sections, positions, allEmployees]);

    // Overall Summary Stats
    const summary = useMemo(() => {
        return {
            totalProjects: projectStats.length,
            totalWorkforce: projectStats.reduce((acc, p) => acc + p.totalEmployees, 0),
            totalActiveUnits: projectStats.reduce((acc, p) => acc + p.totalUnits, 0),
            highestWorkforce: [...projectStats].sort((a, b) => b.totalEmployees - a.totalEmployees)[0]
        };
    }, [projectStats]);

    const filteredProjects = useMemo(() => {
        if (!searchQuery) return projectStats;
        const q = searchQuery.toLowerCase();
        return projectStats.filter(p => p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
    }, [projectStats, searchQuery]);

    const selectedProject = projectStats.find(p => String(p.id) === String(selectedProjectId));

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Workspace Domain...</div>;

    return (
        <div className="fade-in stagger-in" style={{ paddingBottom: '5rem', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
            
            {/* ─── PREMIUM HERO SECTION ─── */}
            <div className="glass" style={{
                padding: '3rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem'
            }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.03, transform: 'rotate(-15deg)' }}>
                    <FolderKanban size={400} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '8px', 
                            padding: '6px 12px', background: 'var(--primary-light)', 
                            borderRadius: '30px', color: 'var(--primary)', 
                            fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem'
                        }}>
                            <Activity size={12} /> Live Workforce Analytics
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            Strategic <span style={{ color: 'var(--primary)' }}>Workforce</span> Domain
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '16px', maxWidth: '550px', fontWeight: 500 }}>
                            Comprehensive oversight of organizational project structures, human capital distribution, and site-level metrics.
                        </p>
                    </div>

                    <div style={{ position: 'relative', width: '400px' }}>
                        <Search size={22} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                        <input
                            type="text"
                            placeholder="Find a project domain..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '18px 20px 18px 54px',
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px',
                                fontSize: '1.05rem', fontWeight: 600, outline: 'none',
                                boxShadow: '0 15px 35px -5px rgba(0,0,0,0.06)',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>
                </div>

                {/* SUMMARY STATS GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    {[
                        { label: 'Domains', value: summary.totalProjects, icon: <FolderKanban />, color: 'var(--primary)' },
                        { label: 'Workforce', value: summary.totalWorkforce, icon: <Users />, color: '#0ea5e9' },
                        { label: 'Active Units', value: summary.totalActiveUnits, icon: <Building2 />, color: '#f59e0b' },
                        { label: 'Coverage', value: '100%', icon: <Target />, color: '#10b981' }
                    ].map((stat, i) => (
                        <div key={i} style={{ 
                            padding: '1.75rem', background: 'white', borderRadius: '24px', 
                            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '20px',
                            boxShadow: '0 10px 15px -10px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ 
                                width: '56px', height: '56px', borderRadius: '16px', 
                                background: `${stat.color}15`, color: stat.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {React.cloneElement(stat.icon, { size: 28 })}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── PROJECT SELECTION GRID ─── */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: selectedProjectId ? '380px 1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', 
                gap: '2rem', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}>
                {filteredProjects.map((proj) => {
                    const isSelected = String(proj.id) === String(selectedProjectId);
                    const isActive = proj.status === 'Active';
                    
                    return (
                        <div key={proj.id}
                            onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                            className="glass"
                            style={{
                                padding: '2.5rem',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid #f1f5f9',
                                cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative', overflow: 'hidden',
                                transform: isSelected ? 'translateY(-8px) scale(1.02)' : 'none',
                                background: isSelected ? 'white' : 'rgba(255,255,255,0.75)',
                                boxShadow: isSelected ? '0 35px 70px -15px rgba(190, 24, 93, 0.18)' : 'var(--shadow-premium)'
                            }}>
                            
                            {isSelected && (
                                <div style={{ 
                                    position: 'absolute', top: '20px', right: '20px', 
                                    width: '12px', height: '12px', borderRadius: '50%', background: 'var(--primary)',
                                    boxShadow: '0 0 15px var(--primary)'
                                }} />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ 
                                    width: '52px', height: '52px', borderRadius: '15px', 
                                    background: isSelected ? 'var(--primary)' : 'var(--primary-light)', 
                                    color: isSelected ? 'white' : 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <Globe size={24} />
                                </div>
                                <div style={{ 
                                    fontSize: '0.7rem', fontWeight: 800, padding: '6px 14px', borderRadius: '30px',
                                    background: isActive ? '#dcfce7' : '#fee2e2', color: isActive ? '#16a34a' : '#ef4444',
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                    {proj.status?.toUpperCase() || 'ACTIVE'}
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '6px' }}>{proj.name}</h3>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={14} color="var(--primary)" /> {proj.code}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Workforce</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                        <Users size={18} color="var(--primary)" /> {proj.totalEmployees}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Units</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                        <Building2 size={18} color="#0ea5e9" /> {proj.totalUnits}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', height: '8px', background: '#f1f5f9', borderRadius: '15px', overflow: 'hidden' }}>
                                <div style={{ 
                                    width: proj.totalEmployees > 0 ? '100%' : '5%', height: '100%', 
                                    background: isSelected ? 'var(--fire)' : 'var(--sunset)', borderRadius: '15px',
                                    transition: 'all 1s ease-in-out'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ─── DETAIL VIEW AREA ─── */}
            {selectedProject && (
                <div className="fade-in" style={{ marginTop: '3.5rem' }}>
                    <div className="glass" style={{ padding: '0', overflow: 'hidden', background: 'white' }}>
                        
                        {/* Detail Header */}
                        <div style={{ 
                            padding: '3rem 4rem', background: 'linear-gradient(90deg, #f8fafc 0%, white 100%)',
                            borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                                        {selectedProject.name}
                                    </h2>
                                    <div style={{ padding: '6px 16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 800 }}>
                                        DOMAIN ID: {selectedProject.code}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                                    <p style={{ color: '#64748b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                        <MapPin size={16} color="var(--primary)" /> Scope: {selectedProject.geo_scope_level || 'General'}
                                    </p>
                                    <p style={{ color: '#64748b', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                                        <Globe size={16} color="var(--primary)" /> Territoy: {selectedProject.state_name || 'All Territories'}
                                    </p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strategic Positions</div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{selectedProject.totalPositions}</div>
                                </div>
                                <div style={{ width: '1px', height: '50px', background: '#e2e8f0', margin: '0 0.5rem' }} />
                                <button className="btn-secondary" onClick={() => setSelectedProjectId(null)} style={{ height: '52px', padding: '0 24px', borderRadius: '18px', fontWeight: 800, border: '2px solid #f1f5f9' }}>
                                    Exit Domain
                                </button>
                            </div>
                        </div>

                        {/* Detail Content Table */}
                        <div style={{ padding: '3rem 4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>Human Capital Manifest</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 14px', borderRadius: '30px', fontWeight: 800 }}>{selectedProject.employees.length} Personnel Active</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '14px' }}><PieChart size={16} style={{ marginRight: '8px' }} /> Unit Metrics</button>
                                    <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 20px', borderRadius: '14px' }}><ArrowUpRight size={16} style={{ marginRight: '8px' }} /> Export Domain Data</button>
                                </div>
                            </div>

                            {selectedProject.employees.length > 0 ? (
                                <div style={{ borderRadius: '28px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 25px 50px -20px rgba(0,0,0,0.08)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={{ padding: '1.75rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Identity</th>
                                                <th style={{ padding: '1.75rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Role</th>
                                                <th style={{ padding: '1.75rem 2.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Node</th>
                                                <th style={{ padding: '1.75rem 2.5rem', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Communication</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProject.employees.map((emp, i) => (
                                                <tr key={emp.id} style={{ 
                                                    borderBottom: '1px solid #f8fafc', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', background: 'white' 
                                                }} onMouseOver={(e) => e.currentTarget.style.background = '#fffafb'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                                                    <td style={{ padding: '1.5rem 2.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                            <div style={{ 
                                                                width: '52px', height: '52px', borderRadius: '16px', 
                                                                background: 'var(--fire)', color: 'white',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '1.25rem', fontWeight: 900, boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)'
                                                            }}>
                                                                {emp.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>{emp.name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>ID-REF: {emp.employee_code}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 2.5rem' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <span style={{ fontWeight: 800, color: '#475569', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{emp.positions_details?.[0]?.name || 'Domain Expert'}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Briefcase size={12} color="var(--primary)" />
                                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>LEVEL: {emp.positions_details?.[0]?.level_name?.toUpperCase() || 'STANDARD'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 2.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.95rem', fontWeight: 700 }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Building2 size={16} color="var(--primary)" />
                                                            </div>
                                                            {emp.positions_details?.[0]?.office_name || 'Central Deployment'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 2.5rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                                            <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                                                                <Mail size={18} />
                                                            </button>
                                                            <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                                                                <Phone size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ 
                                    padding: '6rem 2rem', textAlign: 'center', background: '#f8fafc', 
                                    borderRadius: '40px', border: '2px dashed #e2e8f0' 
                                }}>
                                    <div style={{ 
                                        width: '100px', height: '100px', borderRadius: '30px', background: 'white', 
                                        margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                                        animation: 'float-gentle 4s ease-in-out infinite'
                                    }}>
                                        <Users size={48} color="#cbd5e1" />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.75rem' }}>No Human Capital Assets Detected</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', fontWeight: 600 }}>
                                        Current analytics indicate no active personnel assigned to this project's structural units or geographical operational domains.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectAnalyticsDashboard;
