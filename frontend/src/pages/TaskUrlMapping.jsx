import React from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const TaskUrlMapping = () => {
    const { loading } = useData();



    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return isNaN(d) ? 'N/A' : d.toLocaleDateString();
    };

    const renderTableData = React.useCallback((item) => (
        <>
            <td>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.url_pattern}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Task: {item.task_name}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: item.can_view ? '#ecfdf5' : '#fef2f2', color: item.can_view ? '#059669' : '#dc2626', border: '1px solid currentColor' }}>VIEW</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: item.can_create ? '#ecfdf5' : '#fef2f2', color: item.can_create ? '#059669' : '#dc2626', border: '1px solid currentColor' }}>CREATE</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: item.can_edit ? '#ecfdf5' : '#fef2f2', color: item.can_edit ? '#059669' : '#dc2626', border: '1px solid currentColor' }}>EDIT</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: item.can_delete ? '#ecfdf5' : '#fef2f2', color: item.can_delete ? '#059669' : '#dc2626', border: '1px solid currentColor' }}>DELETE</span>
                </div>
            </td>
            <td>
                <span className="badge badge-active">{item.status || 'Active'}</span>
            </td>
            <td>{formatDate(item.created_at)}</td>
        </>
    ), []);

    return <GenericTable renderTableData={renderTableData} />;
};

export default TaskUrlMapping;
