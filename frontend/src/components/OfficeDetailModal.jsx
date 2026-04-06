import React from 'react';
import {
    X,
    Building2,
    MapPin,
    Calendar,
    Hash,
    FileText,
    ChevronRight,
    Layout,
    ShieldCheck,
    Globe,
    Navigation,
    UserCircle,
    Edit,
    ArrowLeft,
    Sparkles,
    Briefcase,
    ShieldAlert,
    Home,
    FolderKanban
} from 'lucide-react';
import { useData } from '../context/DataContext';

const OfficeDetailModal = () => {
    const {
        showOfficeDetail,
        setShowOfficeDetail,
        selectedOffice,
        handleEdit,
        projects
    } = useData();

    if (!showOfficeDetail || !selectedOffice) return null;

    const data = selectedOffice;

    const ProfileDetailItem = ({ icon: Icon, label, value }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be185d' }}>
                <Icon size={18} />
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '1rem', color: '#334155', fontWeight: 600 }}>{value || 'Not Specified'}</div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay active" style={{ display: 'block', backgroundColor: 'rgba(15, 23, 42, 0.98)', zIndex: 9999 }}>
            <div className="modal-content fade-in" style={{
                height: '100vh',
                width: '100vw',
                background: '#fcf8f1',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                borderRadius: 0,
                maxWidth: 'none',
                position: 'fixed',
                top: 0,
                left: 0
            }}>
                {/* Header Bar */}
                <div className="modal-header" style={{ padding: '1.5rem 2rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{data.name}</h1>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>OFFICE VIEW • {data.code}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => setShowOfficeDetail(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                background: '#fff7ed',
                                color: '#64748b',
                                border: '1px solid #fde6cd',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}
                        >
                            <ArrowLeft size={18} /> Exit View
                        </button>
                        <button
                            onClick={() => {
                                setShowOfficeDetail(false);
                                handleEdit('Offices', data);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #be185d 0%, #881337 100%)',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 12px rgba(190, 24, 93, 0.25)'
                            }}
                        >
                            <Edit size={18} /> Manage Office
                        </button>
                    </div>
                </div>

                <div className="modal-form-container" style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>

                        {/* Top Summary Card */}
                        <div className="detail-header-grid" style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            marginBottom: '2rem',
                            border: '1px solid #fde6cd',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)'
                        }}>
                            {/* Graphic Identifier */}
                            <div style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '32px',
                                background: '#fff1f2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#be185d',
                                border: '1px solid #fecdd3'
                            }}>
                                <Building2 size={72} strokeWidth={1.5} />
                            </div>

                            {/* Core Details */}
                            <div>
                                <div style={{
                                    padding: '6px 14px',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    borderRadius: '24px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    width: 'fit-content',
                                    marginBottom: '1rem',
                                    textTransform: 'uppercase'
                                }}>
                                    {data.level_name || 'Organization Level'}
                                </div>

                                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>{data.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <Hash size={16} /> {data.code}
                                    </div>
                                    <div style={{ color: '#cbd5e1' }}>|</div>
                                    <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                        <Globe size={16} /> {data.country_name || 'India'}
                                    </div>
                                </div>
                            </div>

                            {/* Location Context */}
                            <div style={{ paddingLeft: '2rem', borderLeft: '1px solid #fcf8f1' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>PARENT OFFICE</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
                                    {data.parent_name || 'Primary Root'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Hierarchy Level: {data.level}</div>
                            </div>

                            {/* Connectivity Status */}
                            <div style={{ paddingLeft: '2rem', borderLeft: '1px solid #fcf8f1' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>STATUS</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Active</div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Operational Unit</div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="detail-main-grid">

                            {/* Configuration Panel */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #fde6cd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#be185d', fontWeight: 800, marginBottom: '2rem', fontSize: '1rem' }}>
                                    <Layout size={20} /> BASIC CONFIGURATION
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <ProfileDetailItem icon={Hash} label="Internal Code" value={data.code} />
                                    <ProfileDetailItem icon={Calendar} label="Registered Date" value={data.created_at?.split('T')[0]} />
                                    <ProfileDetailItem icon={ShieldCheck} label="Compliance ID" value={data.register_id} />
                                    <ProfileDetailItem icon={UserCircle} label="Director ID" value={data.din_no} />
                                </div>
                            </div>

                            {/* Geography Panel */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #fde6cd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#be185d', fontWeight: 800, marginBottom: '2rem', fontSize: '1rem' }}>
                                    <MapPin size={20} /> GEOGRAPHIC ANCHOR
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <ProfileDetailItem icon={Globe} label="State / Province" value={data.state_name} />
                                    <ProfileDetailItem icon={Navigation} label="District Unit" value={data.district_name} />
                                    <ProfileDetailItem icon={Navigation} label="Mandal / Block" value={data.mandal_name} />
                                    <ProfileDetailItem icon={Home} label="Cluster" value={data.cluster_name ? `${data.cluster_name} (${data.cluster_type || 'N/A'})` : 'Not Specified'} />
                                </div>
                            </div>

                            {/* Facility & Type Panel */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #fde6cd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#be185d', fontWeight: 800, marginBottom: '2rem', fontSize: '1rem' }}>
                                    <Sparkles size={20} /> UNIT SPECIFICATION
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <ProfileDetailItem icon={Layout} label="Facility Nature" value={data.facility_type} />
                                    <ProfileDetailItem icon={Briefcase} label="Office Category" value={data.level_name} />
                                    {data.camp_type && <ProfileDetailItem icon={Navigation} label="Operation Mode" value={data.camp_type} />}
                                    {data.mobile_type && <ProfileDetailItem icon={Sparkles} label="Mobile Category" value={data.mobile_type_display || data.mobile_type} />}
                                    {data.start_date && <ProfileDetailItem icon={Calendar} label="Validity Start" value={data.start_date} />}
                                </div>
                            </div>

                            {/* Active Projects Panel */}
                            <div style={{ gridColumn: '1 / -1', background: 'white', padding: '2.5rem', borderRadius: '24px', border: '1px solid #fde6cd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#be185d', fontWeight: 800, marginBottom: '2rem', fontSize: '1rem' }}>
                                    <FolderKanban size={20} /> ACTIVE PROJECT JURISDICTION
                                </div>

                                {(() => {
                                    // office assigned projects
                                    const officeProjects = projects.filter(p =>
                                        p.assigned_offices?.includes(data.id) ||
                                        (p.assigned_level && p.assigned_level == data.level)
                                    );

                                    if (officeProjects.length === 0) {
                                        return (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic', border: '2px dashed #f1f5f9', borderRadius: '16px' }}>
                                                No specific projects currently assigned to this office.
                                            </div>
                                        );
                                    }

                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                            {officeProjects.map(project => (
                                                <div key={project.id} style={{
                                                    padding: '1.5rem',
                                                    borderRadius: '16px',
                                                    background: '#fff7ed',
                                                    border: '1px solid #ffedd5',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
                                                            <FolderKanban size={20} />
                                                        </div>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#ecfccb', color: '#4d7c0f' }}>
                                                            ACTIVE
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>{project.name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.description || 'No description available.'}</div>
                                                    </div>
                                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid #fde6cd', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                                                        <Hash size={14} /> {project.code || 'N/A'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficeDetailModal;
