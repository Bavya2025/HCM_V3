import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, Navigation, MapPin, Map, Layers } from 'lucide-react';

const { BaseLayer } = LayersControl;

// Marker Icons setup
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icon for Facilities (Pink/Primary color style)
const facilityIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'facility-marker-icon'
});

const MapController = ({ center, zoom, offices, viewMode }) => {
    const map = useMap();
    
    useEffect(() => {
        // Fix Leaflet container resize issues after layout transitions (500ms)
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 600);
        return () => clearTimeout(timer);
    }, [map, viewMode]); // Re-trigger on layout change

    useEffect(() => {
        // Automatically fit view bounds when the list of offices on map changes
        if (offices && offices.length > 0) {
            try {
                const bounds = L.latLngBounds(offices.map(o => [
                    parseFloat(o.latitude), 
                    parseFloat(o.longitude)
                ]));
                // MaxZoom 12 prevents zooming in too much on very close markers
                map.fitBounds(bounds, { padding: [70, 70], maxZoom: 12, animate: true });
            } catch (e) {
                console.error("FitBounds failed:", e);
            }
        }
    }, [map, offices?.length]); // Only re-run when quantity changes

    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
        }
    }, [center, zoom, map]);

    return null;
};

const OrganizationMap = ({ offices, selectedOfficeId, onOfficeClick, viewMode }) => {
    const [mapOffices, setMapOffices] = useState([]);
    const [center, setCenter] = useState([20.5937, 78.9629]); // Default India center
    const [zoom, setZoom] = useState(5);

    useEffect(() => {
        // Filter offices that have coordinates
        const withCoords = (offices || []).filter(o => {
            const lat = parseFloat(o.latitude);
            const lng = parseFloat(o.longitude);
            // Must be valid non-zero numbers
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });
        setMapOffices(withCoords);

        // If a specific office is selected and has coords, center there
        if (selectedOfficeId) {
            const selected = (offices || []).find(o => String(o.id) === String(selectedOfficeId));
            if (selected) {
                const lat = parseFloat(selected.latitude);
                const lng = parseFloat(selected.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setCenter([lat, lng]);
                    setZoom(12); 
                }
            }
        } else if (withCoords.length > 0) {
            // Otherwise, if we have offices, maybe fit bounds?
            // For now, just keep default or move to first one
        }
    }, [offices, selectedOfficeId]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <LayersControl position="topleft">
                    <BaseLayer checked name="Standard Map">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>
                    <BaseLayer name="Satellite View">
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </BaseLayer>
                    <BaseLayer name="Terrain / Topo">
                        <TileLayer
                            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        />
                    </BaseLayer>
                </LayersControl>
                
                {mapOffices.map(office => (
                    <Marker 
                        key={office.id} 
                        position={[parseFloat(office.latitude), parseFloat(office.longitude)]}
                        icon={facilityIcon}
                        eventHandlers={{
                            click: () => onOfficeClick && onOfficeClick(office)
                        }}
                    >
                        <Popup className="premium-popup">
                            <div style={{ padding: '8px', minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                                    <div style={{ padding: '6px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{office.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{office.level_display || office.level_name}</div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569' }}>
                                        <MapPin size={12} style={{ color: '#94a3b8' }} />
                                        <span>{office.district_name}, {office.state_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569' }}>
                                        <Navigation size={12} style={{ color: '#94a3b8' }} />
                                        <span>{parseFloat(office.latitude || 0).toFixed(4)}, {parseFloat(office.longitude || 0).toFixed(4)}</span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onOfficeClick && onOfficeClick(office)}
                                        style={{ 
                                            marginTop: '8px',
                                            width: '100%',
                                            padding: '8px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                <MapController center={center} zoom={zoom} offices={mapOffices} viewMode={viewMode} />
            </MapContainer>
            
            {/* Legend / Overlay */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '12px 16px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Map size={14} style={{ color: 'var(--primary)' }} />
                    GEOSPATIAL DISTRIBUTION
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#64748b' }}>
                    <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                    <span>{mapOffices.length} Units Located</span>
                </div>
            </div>
        </div>
    );
};

export default OrganizationMap;
