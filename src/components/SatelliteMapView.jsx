import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { sound } from '../utils/soundFx';

// Custom Sci-Fi Pulsing Icon for Land Markers
function createFuturisticIcon(color = '#00f0ff', label = '') {
  return L.divIcon({
    className: 'custom-scifi-pin',
    html: `
      <div class="pin-anchor" style="--pin-color: ${color};">
        <div class="pin-ring"></div>
        <div class="pin-core"></div>
        ${label ? `<div class="pin-label">${label}</div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

// Controller component to snap/fly map camera to the selected land
// Uses setView on first mount so the map immediately starts at the correct location,
// then flyTo animates when selectedPlot changes afterward.
function MapFlyController({ selectedPlot }) {
  const map = useMap();
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!selectedPlot || !selectedPlot.lat || !selectedPlot.lng) return;

    if (!isMountedRef.current) {
      // On first render: instantly jump to the correct location (no animation).
      // This guarantees the map opens exactly at the registered plot, not at plot 101.
      map.setView([selectedPlot.lat, selectedPlot.lng], 18, { animate: false });
      isMountedRef.current = true;
    } else {
      // On subsequent selectedPlot changes: smooth cinematic flyTo
      map.flyTo([selectedPlot.lat, selectedPlot.lng], 18, {
        animate: true,
        duration: 2.0,
        easeLinearity: 0.25
      });
      sound.playTargetLock();
    }
  }, [selectedPlot, map]);

  return null;
}

// Map event handler for clicking to set registration coordinates
function MapClickRegistrar({ isRegisterMode, onLocationPicked }) {
  useMapEvents({
    click(e) {
      if (isRegisterMode && onLocationPicked) {
        sound.playClick();
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function SatelliteMapView({
  plots = [],
  selectedPlot = null,
  onSelectPlot,
  isRegisterMode = false,
  newPlotCoords = null,
  onLocationPicked,
  mapLayer = 'satellite'
}) {
  const defaultCenter = selectedPlot
    ? [selectedPlot.lat, selectedPlot.lng]
    : [19.0596, 72.8295]; // Mumbai

  // Map tile layers
  const tileProviders = {
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri &mdash; Earthstar Geographics, High-Res Orbital Satellite"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "&copy; CartoDB Dark Matter Tactical Layer"
    },
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors"
    }
  };

  const activeProvider = tileProviders[mapLayer] || tileProviders.satellite;

  return (
    <div className="satellite-map-wrapper">
      {/* key on selectedPlot.id forces MapContainer to fully remount when the active plot changes,
          guaranteeing defaultCenter is always the correct location, not stale from a previous mount. */}
      <MapContainer
        key={selectedPlot?.id ?? 'default'}
        center={defaultCenter}
        zoom={17}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#020408' }}
      >
        <TileLayer
          attribution={activeProvider.attribution}
          url={activeProvider.url}
          maxZoom={19}
        />

        <MapFlyController selectedPlot={selectedPlot} />
        <MapClickRegistrar
          isRegisterMode={isRegisterMode}
          onLocationPicked={onLocationPicked}
        />

        {/* Render colorful glowing polygon boundaries for each registered plot */}
        {plots.map((plot) => {
          const isSelected = selectedPlot?.id === plot.id;
          const color = plot.boundaryColor || '#00f0ff';

          return (
            <React.Fragment key={plot.id}>
              {/* Exact Land Area Boundary Polygon */}
              {plot.polygon && plot.polygon.length > 0 && (
                <Polygon
                  positions={plot.polygon}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    weight: isSelected ? 4 : 2.5,
                    dashArray: isSelected ? null : '6, 6',
                    fillColor: color,
                    fillOpacity: isSelected ? 0.45 : 0.25,
                    className: isSelected ? 'glowing-polygon-active' : 'glowing-polygon'
                  }}
                  eventHandlers={{
                    click: () => {
                      sound.playTargetLock();
                      onSelectPlot(plot);
                    }
                  }}
                />
              )}

              {/* Center Pin Marker */}
              <Marker
                position={[plot.lat, plot.lng]}
                icon={createFuturisticIcon(color, `#${plot.id}`)}
                eventHandlers={{
                  click: () => {
                    sound.playTargetLock();
                    onSelectPlot(plot);
                  }
                }}
              >
                <Popup className="scifi-popup">
                  <div className="popup-inner">
                    <div className="popup-badge" style={{ borderColor: color, color: color }}>
                      PARCEL #{plot.id}
                    </div>
                    <div className="popup-title">{plot.name}</div>
                    <div className="popup-row">
                      <span>AREA:</span> <b>{plot.area?.toLocaleString()} SQ FT</b>
                    </div>
                    <div className="popup-row">
                      <span>CHAIN ID:</span> <b>{plot.chainId} (Sepolia)</b>
                    </div>
                    <div className="popup-row">
                      <span>OWNER:</span> <code>{plot.owner ? `${plot.owner.slice(0, 8)}...${plot.owner.slice(-6)}` : 'Unassigned'}</code>
                    </div>
                    <button
                      className="popup-inspect-btn"
                      onClick={() => onSelectPlot(plot)}
                    >
                      INSPECT DOSSIER
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Temporary boundary indicator for newly picked location during Registration */}
        {isRegisterMode && newPlotCoords && (
          <>
            <Marker
              position={[newPlotCoords.lat, newPlotCoords.lng]}
              icon={createFuturisticIcon('#39ff14', 'NEW')}
            />
            {newPlotCoords.polygon && (
              <Polygon
                positions={newPlotCoords.polygon}
                pathOptions={{
                  color: '#39ff14',
                  weight: 3,
                  dashArray: '4, 4',
                  fillColor: '#39ff14',
                  fillOpacity: 0.35,
                  className: 'glowing-polygon-active'
                }}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Map HUD Overlay Grid & Crosshairs */}
      <div className="map-hud-overlay" style={{ pointerEvents: 'none' }}>
        <div className="map-crosshair-center" />
        <div className="map-scanlines" />
        <div className="map-telemetry-corner font-mono">
          <div>OPTICAL SENSOR: HIGH-RES SATELLITE (ESRI)</div>
          <div>TARGET PARCEL: #{selectedPlot?.id ?? 'SCANNING'}</div>
          <div>COORDINATES: {selectedPlot?.lat?.toFixed(5) ?? '19.0596'}° N, {selectedPlot?.lng?.toFixed(5) ?? '72.8295'}° E</div>
        </div>
      </div>
    </div>
  );
}
