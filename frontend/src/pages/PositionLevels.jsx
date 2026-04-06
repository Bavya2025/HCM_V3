import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';

const PositionLevels = () => {
    const { positionLevels, setLoading } = useData();

    // FORCE LOAD CLEAR: Ensure the global loading spinner is turned off immediately on mount.
    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    const sortedLevels = positionLevels || [];

    const renderTableData = (item) => (
        <>
            <td>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {item.rank}
                </div>
            </td>
            <td>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, px: '6px', py: '2px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase' }}>
                        {item.office_level_name || 'Global'}
                    </span>
                    {item.description && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {item.description}</span>}
                </div>
            </td>
        </>
    );

    return <GenericTable
        renderTableData={renderTableData}
        customData={sortedLevels}
        tableName="Position Levels"
    />;
};

export default PositionLevels;
