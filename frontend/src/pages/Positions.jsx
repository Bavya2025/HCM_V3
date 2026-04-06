import React from 'react';
import { Briefcase, MapPin, FolderKanban } from 'lucide-react';
import { useData } from '../context/DataContext';
import BavyaSpinner from '../components/BavyaSpinner';
import GenericTable from '../components/GenericTable';

const Positions = () => {
    const {
        loading,
        fetchPositionDetail
    } = useData();



    const renderTableData = React.useCallback((item) => (
        <td style={{ cursor: 'pointer' }} onClick={() => fetchPositionDetail(item.id)}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>{item.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>
                    <Briefcase size={12} /> {item.role_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {item.office_name}
                </div>
                {item.level_name && (
                    <div style={{ fontSize: '0.75rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px', background: '#f0f9ff', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        Level: {item.level_name}
                    </div>
                )}
                {item.project_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(136, 19, 55, 0.05)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        <FolderKanban size={12} /> {item.project_name}
                    </div>
                )}
            </div>
        </td>
    ), [fetchPositionDetail]);

    return (
        <div className="fade-in">
            <GenericTable renderTableData={renderTableData} />
        </div>
    );
};

export default Positions;
