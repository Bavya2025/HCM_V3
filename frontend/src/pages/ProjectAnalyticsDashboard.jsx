import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { FolderKanban, Users, Building2, Layers, Search, ChevronRight, UserSquare2, PlayCircle, Clock } from 'lucide-react';
import GenericTable from '../components/GenericTable';

const ProjectAnalyticsDashboard = () => {
    const { projects, offices, departments, sections, positions, allEmployees, loading } = useData();
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Pre-calculate stats for all projects
    const projectStats = useMemo(() => {
        if (!projects) return [];

        return projects.map(proj => {
            // Find structural units mapped to this project
            const projOffices = (offices || []).filter(o => o.assigned_projects?.includes(proj.name) || o.project_id === proj.id);
            const projDepts = (departments || []).filter(d => d.project === proj.id || d.project_id === proj.id);
            const projSecs = (sections || []).filter(s => s.project === proj.id || s.project_id === proj.id);
            
            const officeIds = projOffices.map(o => o.id);
            const deptIds = projDepts.map(d => d.id);
            const secIds = projSecs.map(s => s.id);

            // Find all positions in these units
            const projPositions = (positions || []).filter(p => 
                officeIds.includes(p.office) || 
                officeIds.includes(p.office_id) ||
                deptIds.includes(p.department) || 
                deptIds.includes(p.department_id) ||
                secIds.includes(p.section) || 
                secIds.includes(p.section_id)
            );

            const positionIds = projPositions.map(p => p.id);

            // Find all employees holding these positions
            const projEmployees = (allEmployees || []).filter(emp => 
                emp.positions_details?.some(pd => positionIds.includes(pd.id))
            );

            return {
                ...proj,
                totalOffices: projOffices.length,
                totalDepartments: projDepts.length,
                totalSections: projSecs.length,
                totalPositions: projPositions.length,
                totalEmployees: projEmployees.length,
                employees: projEmployees
            };
        });
    }, [projects, offices, departments, sections, positions, allEmployees]);

    // Filter projects by search
    const filteredProjects = useMemo(() => {
        if (!searchQuery) return projectStats;
        const q = searchQuery.toLowerCase();
        return projectStats.filter(p => 
            p.name?.toLowerCase().includes(q) || 
            p.code?.toLowerCase().includes(q)
        );
    }, [projectStats, searchQuery]);

    const selectedProject = projectStats.find(p => p.id === selectedProjectId);

    return (
        <div className="fade-in stagger-in" style={{ paddingBottom: '3rem', width: '100%' }}>
            
            {/* HER0 / SEARCH */}
            <div className="glass" style={{
                padding: '1.5rem 2rem',
                marginBottom: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FolderKanban size={24} color="var(--primary)" /> Project Workforce Analytics
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                        Live oversight of project assignments and resource allocation.
                    </p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                        type="text" 
                        placeholder="Search projects by name or code..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 38px',
                            border: '2px solid #f1f5f9', borderRadius: '12px',
                            fontSize: '0.85rem', fontWeight: 600, outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* MASTER: PROJECT CARDS */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.5rem', marginBottom: selectedProjectId ? '2rem' : '0' 
            }}>
                {filteredProjects.map((proj) => {
                    const isSelected = proj.id === selectedProjectId;
                    const isActive = proj.status === 'Active';
                    return (
                        <div key={proj.id} 
                            onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                            style={{
                                background: isSelected ? 'var(--primary)' : 'white',
                                borderRadius: '16px', padding: '1.5rem',
                                border: isSelected ? 'none' : '1px solid #e2e8f0',
                                boxShadow: isSelected ? '0 10px 25px -5px rgba(136, 19, 55, 0.4)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                color: isSelected ? 'white' : '#1e293b',
                                transform: isSelected ? 'scale(1.02)' : 'none'
                            }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ 
                                    padding: '8px', borderRadius: '10px', 
                                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                    color: isSelected ? 'white' : 'var(--primary)'
                                }}>
                                    <FolderKanban size={20} />
                                </div>
                                <div style={{ 
                                    fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px',
                                    background: isSelected ? (isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isActive ? '#dcfce7' : '#fee2e2'),
                                    color: isSelected ? 'white' : (isActive ? '#16a34a' : '#dc2626')
                                }}>
                                    {proj.status || 'Active'}
                                </div>
                            </div>
                            
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{proj.name}</h3>
                            <div style={{ fontSize: '0.8rem', opacity: isSelected ? 0.9 : 0.6, fontWeight: 600, marginBottom: '1.5rem' }}>
                                Code: {proj.code}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.8 : 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Employees</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={16} opacity={isSelected ? 0.8 : 0.4} /> {proj.totalEmployees}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.8 : 0.5, fontWeight: 700, textTransform: 'uppercase' }}>Active Units</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building2 size={16} opacity={isSelected ? 0.8 : 0.4} /> {proj.totalOffices + proj.totalDepartments + proj.totalSections}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* DETAIL: EMPLOYEE TABLE */}
            {selectedProject && (
                <div className="fade-in glass" style={{
                    marginTop: '2rem', padding: '2rem', borderRadius: '16px', borderTop: '4px solid var(--primary)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                Workforce: {selectedProject.name}
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Showing {selectedProject.employees.length} employees currently assigned to this project's structural units.
                            </p>
                        </div>
                        <button className="btn-secondary" onClick={() => setSelectedProjectId(null)}>
                            Close View
                        </button>
                    </div>

                    {selectedProject.employees.length > 0 ? (
                        <div style={{ 
                            background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'
                        }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Employee Profile</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Position</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Unit / Location</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProject.employees.map((item, idx) => (
                                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <UserSquare2 size={18} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                                                            {item.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {item.employee_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                                    {item.positions_details?.[0]?.name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Building2 size={12} /> {item.positions_details?.[0]?.office_name || '-'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className={`status-badge ${item.status?.toLowerCase() || 'active'}`}>
                                                    {item.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ 
                            padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' 
                        }}>
                            <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No Employees Assigned</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                                There are currently no active employees attached to any Office, Department, or Section under {selectedProject.name}.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectAnalyticsDashboard;
