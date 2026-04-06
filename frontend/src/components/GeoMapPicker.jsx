import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, GeoJSON, LayersControl } from 'react-leaflet';

const { BaseLayer } = LayersControl;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correct marker icon assets since default ones might break in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            const roundedLat = parseFloat(lat.toFixed(4));
            const roundedLng = parseFloat(lng.toFixed(4));
            const newPos = [roundedLat, roundedLng];
            setPosition(newPos);
            onLocationSelect(roundedLat, roundedLng);
            // map.flyTo(e.latlng, map.getZoom()); // Optional: fly to click
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

// Component to update map center dynamically when props change
const MapUpdater = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.flyToBounds(bounds, { duration: 1.5, padding: [50, 50] });
        } else if (center) {
            // Use flyTo for smooth animation, setView for instant jump
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, bounds, map]);
    return null;
};

const GeoMapPicker = ({ latitude, longitude, onLocationSelect, searchQuery }) => {
    // Default to India's center if no coordinates provided
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    const [position, setPosition] = useState(null);
    const [center, setCenter] = useState(defaultCenter);
    const [zoom, setZoom] = useState(defaultZoom);
    const [bounds, setBounds] = useState(null);
    const [geoJsonData, setGeoJsonData] = useState(null);

    // Sync external lat/long props with internal state
    useEffect(() => {
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const newPos = [lat, lng];
                setPosition(newPos);
                // If we have precise coordinates, center there
                setCenter(newPos);
                setZoom(15);
                setBounds(null); // Clear bounds to enforce precise centering
            }
        }
    }, [latitude, longitude]);

    // Handle search query changes to auto-focus map and fetch boundaries
    useEffect(() => {
        if (searchQuery) {
            // Immediate reset to prevent "stale" shapes from showing during debounce
            setGeoJsonData(null);
            setBounds(null);

            const delayDebounceFn = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&polygon_geojson=1`)
                    .then(response => response.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const firstResult = data[0];

                            // Set GeoJSON boundary data
                            if (firstResult.geojson) {
                                setGeoJsonData(firstResult.geojson);
                            } else {
                                setGeoJsonData(null);
                            }

                            // Use bounding box to set view bounds perfectly
                            if (firstResult.boundingbox) {
                                const [minLat, maxLat, minLon, maxLon] = firstResult.boundingbox;
                                const newBounds = [
                                    [parseFloat(minLat), parseFloat(minLon)],
                                    [parseFloat(maxLat), parseFloat(maxLon)]
                                ];
                                setBounds(newBounds);
                            } else {
                                // Fallback if no bounds provided
                                const lat = parseFloat(firstResult.lat);
                                const lon = parseFloat(firstResult.lon);
                                setCenter([lat, lon]);
                                setZoom(10); // Default fallback zoom
                                setBounds(null);
                            }
                        }
                    })
                    .catch(e => console.error("Geocoding error:", e));
            }, 800); // Debounce 800ms for better responsiveness

            return () => clearTimeout(delayDebounceFn);
        } else {
            setGeoJsonData(null);
            setBounds(null);
        }
    }, [searchQuery]); // Removed latitude, longitude from deps to prevent re-search after click

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
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

                {geoJsonData && (
                    <GeoJSON
                        key={searchQuery} // Force re-render when query changes
                        data={geoJsonData}
                        style={{ color: '#2563eb', weight: 2, fillOpacity: 0.05 }}
                        pointToLayer={(feature, latlng) => {
                            // If we already have a manual marker position, don't render another one from GeoJSON search result
                            return null; 
                        }}
                    />
                )}

                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
                <MapUpdater center={center} zoom={zoom} bounds={bounds} />
            </MapContainer>

            {/* Overlay instruction */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#1e293b',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                pointerEvents: 'none'
            }}>
                {searchQuery ? `Map focused on: ${searchQuery}` : 'Click on the map to set location'}
            </div>
        </div>
    );
};

export default GeoMapPicker;
