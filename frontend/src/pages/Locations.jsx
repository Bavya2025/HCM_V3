import React from 'react';
import { Globe, MapPin, Navigation, Home, Map, Layers, Building2, Sparkles, User } from 'lucide-react';
import { useData } from '../context/DataContext';
import GenericTable from '../components/GenericTable';
import BavyaSpinner from '../components/BavyaSpinner';

const GeoLocations = () => {
    const { activeSection, loading, geoClusters } = useData();

    const allowedSections = [
        'geo-continents', 'geo-countries', 'geo-states', 'geo-districts',
        'geo-mandals', 'geo-clusters', 'visiting-locations', 'landmarks'
    ];

    const renderTableData = React.useCallback((item, { searchTerm = '', HighlightTerm }) => {
        const h = (text) => <HighlightTerm text={text} term={searchTerm} />;

        switch (activeSection) {
            case 'geo-continents':
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                    </td>
                );
            case 'geo-countries':
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {h(item.continent_name || item.continent || 'No Continent')}
                        </div>
                    </td>
                );
            case 'geo-states':
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h(item.country_name || 'No Country')}</div>
                    </td>
                );
            case 'geo-districts':
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>State: {h(item.state_name || 'No State')}</div>
                    </td>
                );
            case 'geo-mandals':
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.district_name ? <>{h(item.district_name)}, </> : ''}{h(item.state_name || '')}
                        </div>
                    </td>
                );
            case 'geo-clusters':
                return (
                    <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>
                                {h(item.name)} {item.code && <span style={{ color: 'var(--magenta)', fontSize: '0.85rem' }}>({h(item.code)})</span>}
                            </div>
                            <span style={{
                                padding: '2px 10px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                color: '#0369a1',
                                border: '1px solid #bae6fd'
                            }}>
                                {h(item.cluster_type_display || item.cluster_type)}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                            Mandal: <strong>{h(item.mandal_name)}</strong> | District: <strong>{h(item.district_name)}</strong>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {item.visiting_locations?.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem' }}>
                                    <MapPin size={12} color="#0284c7" />
                                    <span style={{ fontWeight: 700, color: '#0c4a6e' }}>{item.visiting_locations.length} Locations</span>
                                </div>
                            )}
                            {item.landmarks?.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem' }}>
                                    <Navigation size={12} color="#059669" />
                                    <span style={{ fontWeight: 700, color: '#064e3b' }}>{item.landmarks.length} Landmarks</span>
                                </div>
                            )}
                        </div>
                    </td>
                );
            case 'visiting-locations':
            case 'landmarks':
                return (
                    <td>
                        <div style={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center' }}>
                            {h(item.name)}
                            {item.is_office && (
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    background: item.office_type === 'FACILITY' ? '#f0f9ff' : '#fef3c7',
                                    color: item.office_type === 'FACILITY' ? '#0369a1' : '#92400e',
                                    border: `1px solid ${item.office_type === 'FACILITY' ? '#bae6fd' : '#fde68a'}`,
                                    marginLeft: '8px',
                                    verticalAlign: 'middle',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}>
                                    <Building2 size={10} /> {h(item.office_type || 'OFFICE')}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                            Lat: <strong>{item.latitude}</strong> | Long: <strong>{item.longitude}</strong>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            Cluster: <strong>{h(item.cluster_name)}</strong> ({h(item.cluster_type_display)}) | Mandal: <strong>{h(item.mandal_name)}</strong>
                        </div>
                        {item.contact_person && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                                <User size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                <strong>{h(item.contact_person)}</strong> {item.contact_number && `(${h(item.contact_number)})`}
                            </div>
                        )}
                        {item.address && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                                {h(item.address)}
                            </div>
                        )}
                    </td>
                );
            default:
                return (
                    <td>
                        <div style={{ fontWeight: 600 }}>{h(item.name)}</div>
                    </td>
                );
        }
    }, [activeSection]);

    if (!allowedSections.includes(activeSection)) return null;

    return <GenericTable renderTableData={renderTableData} />;
};

export default GeoLocations;
