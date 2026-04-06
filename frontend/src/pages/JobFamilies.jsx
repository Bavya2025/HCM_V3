import React from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const JobFamilies = () => {
    const { loading } = useData();



    const renderTableData = React.useCallback((item) => (
        <td>
            <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.description}</div>
        </td>
    ), []);

    return <GenericTable renderTableData={renderTableData} />;
};

export default JobFamilies;
