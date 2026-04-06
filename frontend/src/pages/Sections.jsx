import React from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const Sections = () => {
    const { loading } = useData();



    const renderTableData = React.useCallback((item) => (
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
    ), []);

    return <GenericTable renderTableData={renderTableData} />;
};

export default Sections;
