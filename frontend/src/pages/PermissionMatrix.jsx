import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Save, CheckCircle2, XCircle, Layout, Globe, Users, Briefcase, FileText, Landmark, Heart, CreditCard, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../api';
import BavyaSpinner from '../components/BavyaSpinner';

const PermissionMatrix = ({ employee, onBack }) => {
    const { showNotification, fetchData } = useData();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [taskUrls, setTaskUrls] = useState([]);
    const [overrides, setOverrides] = useState({});
    const [showAll, setShowAll] = useState(false);

    // Identify which Task URLs are actually assigned to this employee via their role/job
    const assignedTaskUrlIds = React.useMemo(() => {
        const ids = new Set();
        employee.positions_details?.forEach(pos => {
            // Direct Job Tasks
            pos.job_details?.tasks?.forEach(task => {
                task.urls?.forEach(url => ids.add(url.id));
            });
            // Role -> Job Tasks
            pos.role_details?.jobs?.forEach(job => {
                job.tasks?.forEach(task => {
                    task.urls?.forEach(url => ids.add(url.id));
                });
            });
        });
        return ids;
    }, [employee]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch available modules (Task URLs)
                const urlsRes = await api.get('task-urls');
                const allUrls = urlsRes.results || urlsRes;
                setTaskUrls(allUrls);

                // 2. Fetch existing overrides
                const overridesRes = await api.get(`employee-permissions?employee=${employee.id}`);
                const overridesData = overridesRes.results || overridesRes;

                const overrideMap = {};

                // Initialize map with TaskUrl defaults
                allUrls.forEach(url => {
                    overrideMap[url.id] = {
                        employee: employee.id,
                        task_url: url.id,
                        can_view: !!url.can_view,
                        can_create: !!url.can_create,
                        can_edit: !!url.can_edit,
                        can_delete: !!url.can_delete,
                        is_enabled: true,
                        is_overridden: false // Mark as inherited
                    };
                });

                // Apply actual employee-specific overrides on top
                overridesData.forEach(o => {
                    overrideMap[o.task_url] = { ...o, is_overridden: true };
                });

                setOverrides(overrideMap);
            } catch (err) {
                showNotification("Could not synchronize security data", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [employee.id]);

    const CATEGORIES = [
        { group: 'Core Management', icon: <Layout />, items: ['offices', 'facilities', 'departments', 'sections'] },
        { group: 'Job Structure', icon: <Briefcase />, items: ['job-families', 'role-types', 'roles', 'jobs', 'tasks'] },
        { group: 'Workforce', icon: <Users />, items: ['employees', 'positions', 'projects'] },
        { group: 'Employee Assets', icon: <FileText />, items: ['employee-education', 'employee-experience', 'employee-documents', 'employee-bank-details', 'employee-salary-details'] },
        { group: 'Geo Intelligence', icon: <Globe />, items: ['geo-continents', 'geo-countries', 'geo-states', 'geo-districts', 'geo-mandals', 'geo-clusters'] },
        { group: 'Governance', icon: <Shield />, items: ['users', 'permissions', 'api-keys', 'login-history'] }
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            // ONLY commit items that are explicitly overridden
            const dataToSave = Object.values(overrides).filter(o => o.is_overridden);

            // 1. COMMIT TO EMPLOYEE OVERRIDES
            if (dataToSave.length === 0) {
                // If no changes, just clear everything (reset to default)
                await api.delete(`employee-permissions/bulk_delete?employee=${employee.id}`);
            } else {
                await api.post('employee-permissions', dataToSave);
            }

            // 2. SYNC TO GLOBAL TASK POLICY (Propagate changes to the Task Definitions)
            if (dataToSave.length > 0) {
                const taskGroups = {};

                dataToSave.forEach(override => {
                    const originalTUrl = taskUrls.find(u => u.id === override.task_url);
                    if (originalTUrl && originalTUrl.task) {
                        const tid = originalTUrl.task;
                        if (!taskGroups[tid]) {
                            // Fetch all existing patterns for this task to satisfy the backend's destructive bulk sync
                            taskGroups[tid] = taskUrls
                                .filter(u => u.task === tid)
                                .map(u => ({
                                    task: u.task,
                                    url_pattern: u.url_pattern,
                                    can_view: u.can_view,
                                    can_create: u.can_create,
                                    can_edit: u.can_edit,
                                    can_delete: u.can_delete
                                }));
                        }

                        // Find index of the pattern being updated
                        const targetIndex = taskGroups[tid].findIndex(u => u.url_pattern === originalTUrl.url_pattern);
                        if (targetIndex !== -1) {
                            taskGroups[tid][targetIndex] = {
                                ...taskGroups[tid][targetIndex],
                                can_view: override.can_view,
                                can_create: override.can_create,
                                can_edit: override.can_edit,
                                can_delete: override.can_delete
                            };
                        }
                    }
                });

                // Execute Bulk Task Policy Updates
                const updatePromises = Object.entries(taskGroups).map(([tid, fullList]) => {
                    return api.post(`task-urls?task=${tid}`, fullList);
                });

                await Promise.all(updatePromises);

                // Refresh Global Data Context to ensure other pages (like Task URL Mapping) see the changes
                if (fetchData) fetchData();
            }

            showNotification("Security policy synchronized and task profiles updated", "success");
            onBack();
        } catch (err) {
            showNotification("Policy synchronization failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (taskUrlId, field, value) => {
        setOverrides(prev => {
            const existing = prev[taskUrlId] || { employee: employee.id, task_url: taskUrlId, can_view: false, can_create: false, can_edit: false, can_delete: false, is_enabled: true, is_overridden: true };
            return { ...prev, [taskUrlId]: { ...existing, [field]: value, is_overridden: true } };
        });
    };

    // HARD FILTER: Only categories with at least one matching taskUrl from the actual database
    const filteredTaskUrls = showAll ? taskUrls : taskUrls.filter(u => assignedTaskUrlIds.has(u.id));

    let activeCategories = CATEGORIES.map(cat => {
        const modules = cat.items.flatMap(slug => {
            return filteredTaskUrls.filter(u => u.url_pattern === slug || u.url_pattern === `/${slug}` || u.url_pattern === slug + '/*');
        });
        return { ...cat, modules };
    }).filter(cat => cat.modules.length > 0);

    // Add unmatched modules to an "Other" category to ensure 100% visibility
    const matchedIds = new Set(activeCategories.flatMap(c => c.modules.map(m => m.id)));
    const unmatched = filteredTaskUrls.filter(u => !matchedIds.has(u.id));
    if (unmatched.length > 0) {
        activeCategories.push({
            group: 'General Services',
            icon: <Globe />,
            modules: unmatched
        });
    }

    if (loading) return <BavyaSpinner label="Verifying Security Credentials..." />;

    return (
        <div className="fade-in scroll-container" style={{ paddingBottom: '3rem' }}>
            {/* FORCE UPDATE CONFIRMATION: V2.1 Title */}
            <header className="section-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button onClick={onBack} className="glass" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', marginBottom: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                    }}>
                        <ArrowLeft size={16} /> Return to Global Registry
                    </button>
                    <h1 className="section-title hero-gradient-text" style={{ fontSize: '2.25rem' }}>Security Policy Matrix</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Configuring granular access for</span>
                        <span style={{ padding: '4px 12px', background: 'var(--primary-light)', color: 'var(--magenta)', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem' }}>{employee.name}</span>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#64748b', fontWeight: 700, fontFamily: 'monospace' }}>Employee Code: {employee.employee_code}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="glass"
                        style={{
                            padding: '14px 24px',
                            borderRadius: '18px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: showAll ? 'var(--magenta)' : '#64748b',
                            border: `2px solid ${showAll ? 'var(--magenta)' : '#e2e8f0'}`,
                            background: showAll ? 'rgba(190, 24, 93, 0.05)' : 'white'
                        }}
                    >
                        {showAll ? 'Hide Unrelated Tasks' : 'Show All Modules'}
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', borderRadius: '18px', fontSize: '1rem', fontWeight: 800, boxShadow: '0 10px 25px -5px rgba(190, 24, 93, 0.3)' }}>
                        {saving ? <BavyaSpinner size="20px" /> : <Save size={20} />}
                        {saving ? 'Synchronizing...' : 'Commit Security Policy'}
                    </button>
                </div>
            </header>

            <div className="glass section-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #eef2f6' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '1.75rem 2.5rem', background: '#f8fafc', width: '40%', fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.1em' }}>MODULE DEFINITION</th>
                            {['VIEW', 'CREATE', 'EDIT', 'DELETE'].map(h => (
                                <th key={h} style={{ textAlign: 'center', background: '#f8fafc', fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.1em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {activeCategories.map((cat, idx) => (
                            <React.Fragment key={idx}>
                                <tr style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                                    <td colSpan="5" style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase', color: '#1e293b', letterSpacing: '0.12em' }}>
                                            <div style={{ padding: '10px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', display: 'flex', border: '1px solid #f1f5f9' }}>
                                                {React.cloneElement(cat.icon, { size: 18, color: 'var(--magenta)' })}
                                            </div>
                                            {cat.group}
                                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px' }}>{cat.modules.length} ALLOTTED</span>
                                        </div>
                                    </td>
                                </tr>
                                {cat.modules.map(tUrl => {
                                    const override = overrides[tUrl.id] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
                                    const moduleName = tUrl.url_pattern.replace(/^\//, '').split('/').pop().replace(/-/g, ' ');

                                    return (
                                        <tr key={tUrl.id} className="stagger-in">
                                            <td style={{ padding: '1.5rem 3.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <ChevronRight size={14} color="var(--magenta)" />
                                                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#334155' }}>
                                                        <span style={{ textTransform: 'capitalize' }}>{moduleName}</span>
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            fontSize: '0.7rem',
                                                            padding: '2px 8px',
                                                            background: '#f1f5f9',
                                                            color: '#64748b',
                                                            borderRadius: '6px',
                                                            fontWeight: 600
                                                        }}>
                                                            {tUrl.task_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', paddingLeft: '24px', fontFamily: 'monospace' }}>{tUrl.url_pattern}</div>
                                            </td>
                                            {['can_view', 'can_create', 'can_edit', 'can_delete'].map(f => (
                                                <td key={f} style={{ textAlign: 'center' }}>
                                                    <PermissionToggle checked={override[f]} onChange={(v) => handleToggle(tUrl.id, f, v)} />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="glass" style={{ marginTop: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)', border: '1px solid #fef3c7', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ background: '#f59e0b', color: 'white', padding: '12px', borderRadius: '14px' }}><Shield size={24} /></div>
                <div>
                    <h4 style={{ margin: 0, fontWeight: 900, color: '#92400e', fontSize: '1.1rem' }}>Global Security Policy Notice</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#b45309', fontWeight: 500 }}>
                        Allotted permissions here override standard role hierarchies. Ensure you commit changes to apply updates to the identity environment.
                    </p>
                </div>
            </div>
        </div>
    );
};

const PermissionToggle = ({ checked, onChange }) => (
    <div onClick={() => onChange(!checked)} style={{
        width: '28px', height: '28px', borderRadius: '8px', border: `2px solid ${checked ? 'var(--magenta)' : '#cbd5e1'}`,
        background: checked ? 'var(--magenta)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: checked ? '0 4px 10px rgba(190, 24, 93, 0.2)' : 'none', transform: checked ? 'scale(1.05)' : 'scale(1)'
    }}>
        {checked && <CheckCircle2 size={18} color="white" />}
    </div>
);

export default PermissionMatrix;
