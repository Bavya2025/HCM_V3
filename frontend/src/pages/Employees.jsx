import React from 'react';
import { Eye, Edit2, X, Users, Briefcase } from 'lucide-react';
import { useData } from '../context/DataContext';
import BavyaSpinner from '../components/BavyaSpinner';
import GenericTable from '../components/GenericTable';

const Employees = () => {
    const {
        user,
        loading,
        handleEdit,
        handleDelete,
        canEdit,
        canDelete,
        handleViewProfile,
        getPhotoUrl,
        activeSection,
        data
    } = useData();




    const renderTableData = React.useCallback((item, { searchTerm, HighlightTerm }) => (
        <>
            <td style={{ cursor: 'pointer' }} onClick={() => handleViewProfile(item.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '15px',
                        background: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        border: '2px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}>
                        {item.photo ? (
                            <img
                                src={getPhotoUrl(item.photo)}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            item.name?.[0]
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                            <HighlightTerm text={item.name} term={searchTerm} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', color: '#64748b', border: '1px solid #fde6cd' }}>
                                <HighlightTerm text={item.employee_code} term={searchTerm} />
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>•</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Briefcase size={12} /> <HighlightTerm text={item.positions_details?.length > 0 ? item.positions_details.map(p => p.name).join(', ') : 'Unassigned'} term={searchTerm} />
                            </span>
                        </div>
                    </div>
                </div>
            </td>
        </>
    ), [handleViewProfile, getPhotoUrl]);

    return (
        <div className="fade-in">
            <GenericTable renderTableData={renderTableData} />
        </div>
    );
};

export default Employees;
