import React from 'react';
import { Layers, Building2, Plus, Edit, X, Eye, Settings, MapPin, Map, Globe, Calendar, ChevronLeft, ChevronRight, TrendingUp, Crown, Users, Pencil, Trash2, Truck } from 'lucide-react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const Organization = () => {
    const {
        activeSection,
        offices,
        allOffices,
        orgLevels,
        loading,
        handleAdd,
        handleEdit,
        handleDelete,
        handleViewOffice,
        handleAddOfficeByLevel
    } = useData();

    const scrollContainerRef = React.useRef(null);

    // Auto-scroll to center of tree on load
    React.useEffect(() => {
        if (activeSection === 'organization') {
            const timer = setTimeout(() => {
                const container = scrollContainerRef.current;
                if (container) {
                    const scrollWidth = container.scrollWidth;
                    const clientWidth = container.clientWidth;
                    // Center the view
                    container.scrollLeft = (scrollWidth - clientWidth) / 2;
                }
            }, 500); // 500ms delay to ensure rendering is complete
            return () => clearTimeout(timer);
        }
    }, [activeSection, allOffices]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    const [expandedNodes, setExpandedNodes] = React.useState({});
    const [openSummaryId, setOpenSummaryId] = React.useState(null);


    const toggleNode = (e, officeId) => {
        e.stopPropagation();
        setExpandedNodes(prev => ({
            ...prev,
            [officeId]: !prev[officeId]
        }));
    };

    const renderOfficeNode = (office, level = 0) => {
        const allChildren = allOffices
            .filter(o => o.parent === office.id)
            .sort((a, b) => a.name.localeCompare(b.name));

        const isExpanded = expandedNodes[office.id];
        const isRoot = !office.parent;
        const isVisualRoot = isRoot && (office.level_name === 'Group' || office.level_name === 'Head Office');

        // Smart Threshold: Group into scroll card if more than 5 facilities
        const facilities = allChildren.filter(c => c.level_code === 'L9');
        const standardOffices = allChildren.filter(c => c.level_code !== 'L9');

        const useScrollPattern = facilities.length > 5;

        return (
            <li key={office.id} className={`tree-li ${isExpanded ? 'is-expanded' : ''}`}>
                <div
                    className={`tree-node-box ${isVisualRoot ? 'root-node' : ''} ${isExpanded ? 'active-parent' : ''}`}
                    onClick={(e) => {
                        if (allChildren.length > 0) {
                            toggleNode(e, office.id);
                        } else {
                            handleViewOffice ? handleViewOffice(office) : handleEdit('Offices', office);
                        }
                    }}
                >
                    <footer>
                        {isVisualRoot && <Crown size={10} fill="var(--orange)" style={{ marginRight: '4px' }} />}
                        {office.level_name || 'Unit Level'}
                    </footer>
                    <header>{office.name}</header>
                    {allChildren.length > 0 && (
                        <div className={`node-toggle-indicator ${isExpanded ? 'open' : ''}`}>
                            <Plus size={12} className="plus-icon" />
                            <X size={12} className="close-icon" />
                        </div>
                    )}
                </div>

                {isExpanded && allChildren.length > 0 && (
                    <ul className="tree-ul slide-down-fade">
                        {/* Standard Offices always show in Tree form */}
                        {standardOffices.map(child => renderOfficeNode(child, level + 1))}

                        {/* Facilities: Conditional Tree vs Scroll */}
                        {facilities.length > 0 && (
                            useScrollPattern ? (
                                <li className="tree-li" style={{ overflow: 'visible' }}>
                                    <div
                                        className={`tree-node-box summary-node clickable-summary ${openSummaryId === office.id ? 'expanded' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenSummaryId(openSummaryId === office.id ? null : office.id);
                                        }}
                                    >
                                        <div className="summary-card-inner">
                                            <div className="summary-fleet-icon">
                                                <Truck size={20} />
                                            </div>
                                            <div className="summary-fleet-info">
                                                <span className="count">{facilities.length}</span>
                                                <span className="label">Units (Scroll)</span>
                                            </div>
                                        </div>

                                        {openSummaryId === office.id && (
                                            <div className="facility-detail-list" onClick={(e) => e.stopPropagation()}>
                                                <div className="facility-list-header">
                                                    <h3>{office.name} Units</h3>
                                                    <button className="close-detail-btn" onClick={() => setOpenSummaryId(null)}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                                <div className="facility-item-scroll">
                                                    {facilities.map(f => (
                                                        <div
                                                            key={f.id}
                                                            className="facility-detail-item"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleViewOffice ? handleViewOffice(f) : handleEdit('Offices', f)}
                                                        >
                                                            <span className="name">{f.name}</span>
                                                            <span className="code">{f.code} • {f.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ) : (
                                facilities.map(f => (
                                    <li key={f.id} className="tree-li">
                                        <div
                                            className="tree-node-box facility-node"
                                            onClick={() => handleViewOffice ? handleViewOffice(f) : handleEdit('Offices', f)}
                                        >
                                            <footer>Facility</footer>
                                            <header>{f.name}</header>
                                        </div>
                                    </li>
                                ))
                            )
                        )}
                    </ul>
                )}
            </li>
        );
    };

    const renderTableData = (item) => {
        switch (activeSection) {
            case 'offices':
                return (
                    <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            code: {item.code} | Level: {item.level_name}
                            {item.is_temporary && <span style={{ color: '#f59e0b', marginLeft: '8px', fontWeight: 700 }}>[TEMPORARY]</span>}
                        </div>
                    </td>
                );
            case 'departments':
                return (
                    <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 600, color: item.office_is_facility ? 'var(--primary)' : '#64748b' }}>
                                {item.office_level || 'Office'}:
                            </span>
                            <span>{item.office_name}</span>
                            {item.project_name && <span style={{ color: 'var(--primary)', fontWeight: 600 }}> • {item.project_name}</span>}
                        </div>
                    </td>
                );
            case 'sections':
                return (
                    <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                            <div style={{ marginBottom: '2px' }}>
                                <span style={{ fontWeight: 600 }}>Dept:</span> {item.department_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 600, color: item.office_is_facility ? 'var(--primary)' : '#64748b' }}>
                                    {item.office_level || 'Office'}:
                                </span>
                                <span>{item.office_name}</span>
                                {item.project_name && <span style={{ color: 'var(--primary)', fontWeight: 600 }}> • {item.project_name}</span>}
                            </div>
                        </div>
                    </td>
                );
            default:
                return null;
        }
    };

    if (activeSection === 'organization') {
        const rootOffices = allOffices
            .filter(o => !o.parent)
            .sort((a, b) => a.name.localeCompare(b.name));

        // ONLY show spinner here for the visual chart as it doesn't use GenericTable
        if (loading && (!allOffices || allOffices.length === 0)) {
            return (
                <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <BavyaSpinner label="Architecting Organization Tree..." />
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                        {allOffices?.length > 0 ? `Rendering ${allOffices.length} nodes...` : 'Fetching hierarchy data...'}
                    </div>
                </div>
            );
        }

        return (
            <div className="fade-in stagger-in">
                <header className="section-header" style={{ marginBottom: '1rem' }}>
                    <div>
                        <h1 className="section-title">Organization Chart</h1>
                        <p className="section-subtitle">Real-time mapping of reporting lines and functional connections</p>
                    </div>
                    <div className="stagger-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '6px 12px', borderRadius: '20px', border: '1px solid #dcfce7' }}>
                            <div className="pulse" style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dynamic Sync Live</span>
                        </div>
                        <button className="btn-secondary" style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.location.reload()}>
                            <TrendingUp className="glass-float" size={18} /> Sync Structure
                        </button>
                    </div>
                </header>

                <div style={{ position: 'relative' }}>
                    <button onClick={scrollLeft} style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 999,
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button onClick={scrollRight} style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 999,
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        transition: 'all 0.2s ease',
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="tree-container" ref={scrollContainerRef}>
                        <div className="tree-root">
                            <div className="tree-chart" style={{ paddingBottom: '40px' }}>
                                {rootOffices.length > 0 ? (
                                    <ul className="tree-ul" style={{ paddingTop: 0 }}>
                                        {rootOffices.map(office => renderOfficeNode(office))}
                                    </ul>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '5rem 3rem', color: '#94a3b8' }}>
                                        <div style={{ opacity: 0.2, marginBottom: '1.5rem' }}>
                                            <Building2 size={80} style={{ margin: '0 auto' }} />
                                        </div>
                                        <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Empty Backbone</h4>
                                        <p style={{ fontSize: '1rem', fontWeight: 500 }}>Establish your first organizational unit to visualize the hierarchy.</p>
                                        <button className="btn-primary" style={{ marginTop: '2rem' }} onClick={() => handleAdd('Offices')}>
                                            <Plus size={18} /> Establish Head Office
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (['offices', 'departments', 'sections'].includes(activeSection)) {
        return <GenericTable renderTableData={renderTableData} />;
    }

    return null;
};

export default Organization;
