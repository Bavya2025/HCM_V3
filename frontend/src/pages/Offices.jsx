import React from 'react';
import { MapPin, FolderKanban } from 'lucide-react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const Offices = () => {
    const { loading } = useData();



    const renderTableData = React.useCallback((item) => (
        <td>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {item.level_name} | code: {item.code}
                </span>
                {item.is_temporary && <span style={{ color: '#f59e0b', fontWeight: 700 }}>[TEMPORARY]</span>}
                {item.assigned_projects && item.assigned_projects.length > 0 && (
                    <>
                        <span style={{ color: '#94a3b8' }}>•</span>
                        {item.assigned_projects.map((proj, idx) => (
                            <span key={idx} style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(136, 19, 55, 0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                                <FolderKanban size={12} /> {proj}
                            </span>
                        ))}
                    </>
                )}
            </div>
        </td>
    ), []);

    return <GenericTable renderTableData={renderTableData} />;
};

export default Offices;
