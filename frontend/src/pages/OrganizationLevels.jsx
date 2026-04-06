import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';

const OrganizationLevels = () => {
    const { orgLevels, handleAddOfficeByLevel, setLoading } = useData();

    // FORCE LOAD CLEAR: Since this page uses pre-loaded data from DataContext,
    // we must ensure the global loading spinner is turned off immediately on mount.
    React.useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    // Although GenericTable provides its own data, we can also use customData
    // or just let it fetch automatically. Using customData with orgLevels 
    // ensures the rank sort is preserved immediately.
    const sortedLevels = orgLevels || [];

    const renderTableData = (item) => (
        <>
            <td style={{ cursor: 'pointer' }} onClick={() => handleAddOfficeByLevel(item.id)}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                    {item.level_code}
                </div>
            </td>
            <td style={{ cursor: 'pointer' }} onClick={() => handleAddOfficeByLevel(item.id)}>
                <div style={{ fontWeight: 600 }} className="hover-link">{item.name}</div>
                {item.parent_name && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Sub-level of {item.parent_name}</div>}
            </td>
        </>
    );

    return <GenericTable renderTableData={renderTableData} customData={sortedLevels} />;
};

export default OrganizationLevels;
