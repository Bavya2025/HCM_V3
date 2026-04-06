import React from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const Tasks = () => {
    const { loading } = useData();



    const renderTableData = React.useCallback((item) => (
        <td>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                <span style={{ fontWeight: 600 }}>Job:</span> {item.job_name} |
                <span style={{ fontWeight: 600, marginLeft: '8px' }}>URLs:</span> {item.urls && item.urls.length > 0 ? item.urls.map(u => u.url_pattern).join(', ') : 'No URLs mapped'}
            </div>
        </td>
    ), []);

    return <GenericTable renderTableData={renderTableData} />;
};

export default Tasks;
