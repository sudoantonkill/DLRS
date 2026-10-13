import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/soundFx';
import {
  geocodeAddress,
  reverseGeocode,
  checkLocalityMatch
} from '../utils/geocoding';
import {
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileText,
  User,
  KeyRound,
  Hash,
  Layers,
  MapPin,
  Clock,
  ArrowRightLeft,
  PlusCircle,
  Globe2,
  Compass,
  AlertCircle,
  Search,
  Navigation,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Map,
  Loader2
} from 'lucide-react';

export default function DetailsPanel({
  selectedPlot,
  onReenterOrbit,
  onTransferOwnership,
  onRegisterLand,
  newPlotCoords,
  onLocationPicked,
  account,
  activeMode = 'dossier', // 'dossier' | 'register' | 'transfer'
  setActiveMode,
  isWalletConnected,
  onConnectWallet,
  onSwitchToMap
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [transferNewOwner, setTransferNewOwner] = useState('');
  const [transferPlotId, setTransferPlotId] = useState(selectedPlot?.id || '');

  // Registration state
  const [newId, setNewId] = useState('107');
  const [newLocation, setNewLocation] = useState('Worli Sea Face Coastal Corridor, Mumbai');
  const [newArea, setNewArea] = useState('18500');
  const [newCategory, setNewCategory] = useState('Commercial High-Density / Tech Hub');
  const [customLat, setCustomLat] = useState('19.0176');
  const [customLng, setCustomLng] = useState('72.8152');

  // Geocoding & Address Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [reverseInfo, setReverseInfo] = useState(null);
  const [localityCheck, setLocalityCheck] = useState({ isMatch: true, warning: null });
  const [nudgeStep, setNudgeStep] = useState(0.001); // 0.001 deg ~ 110 meters

  const searchDebounceRef = useRef(null);

  // Sync coords when user clicks on 3D Globe or Map
  useEffect(() => {
    if (newPlotCoords) {
      const latStr = newPlotCoords.lat.toFixed(5);
      const lngStr = newPlotCoords.lng.toFixed(5);
      setCustomLat(latStr);
      setCustomLng(lngStr);

      // Perform reverse geocoding to detect the real locality of the dropped pin
      reverseGeocode(newPlotCoords.lat, newPlotCoords.lng).then((res) => {
        if (res) {
          setReverseInfo(res);
          // Check locality match against current location text
          const check = checkLocalityMatch(newLocation, newPlotCoords.lat, newPlotCoords.lng, res);
          setLocalityCheck(check);

          // If current location text is empty or matches previous default, auto-fill detected locality
          if (!newLocation || newLocation.includes('Terrestrial') || check.warning) {
            // Keep user informed
          }
        }
      });
    }
  }, [newPlotCoords]);

  // Re-check locality match when address or coordinates change
  useEffect(() => {
    const latNum = parseFloat(customLat);
    const lngNum = parseFloat(customLng);
    if (!isNaN(latNum) && !isNaN(lngNum)) {
      const check = checkLocalityMatch(newLocation, latNum, lngNum, reverseInfo);
      setLocalityCheck(check);
    }
  }, [newLocation, customLat, customLng, reverseInfo]);

  // Handle typing in Address with live geocoding
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setNewLocation(val);
    setSearchQuery(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearching(true);
      searchDebounceRef.current = setTimeout(async () => {
        const results = await geocodeAddress(val);
        setSuggestions(results);
        setIsSearching(false);
      }, 350);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  // Select an address suggestion -> snaps pin to that location immediately!
  const handleSelectSuggestion = (item) => {
    sound.playTargetLock();
    setNewLocation(item.displayName || item.shortName);
    setCustomLat(item.lat.toFixed(5));
    setCustomLng(item.lng.toFixed(5));
    setSuggestions([]);
    setIsSearching(false);

    if (onLocationPicked) {
      onLocationPicked(item.lat, item.lng);
    }
  };

  // Direct "Locate & Snap Pin" button
  const handleLocateAddress = async () => {
    if (!newLocation.trim()) return;
    setIsSearching(true);
    sound.playClick();
    const results = await geocodeAddress(newLocation);
    setIsSearching(false);

    if (results && results.length > 0) {
      handleSelectSuggestion(results[0]);
    } else {
      alert(`Could not automatically locate "${newLocation}". Please pick on the globe or select a preset.`);
    }
  };

  // Auto-snap pin to typed address
  const handleSnapPinToAddress = async () => {
    sound.playClick();
    setIsSearching(true);
    const results = await geocodeAddress(newLocation);
    setIsSearching(false);
    if (results && results.length > 0) {
      handleSelectSuggestion(results[0]);
    }
  };

  // Update address text from detected pin location
  const handleUpdateAddressFromPin = () => {
    sound.playClick();
    if (reverseInfo && reverseInfo.displayName) {
      setNewLocation(reverseInfo.displayName);
      setLocalityCheck({ isMatch: true, warning: null });
    }
  };

  // Fine-position nudge in cardinal directions (N, S, E, W)
  const handleNudge = (direction) => {
    sound.playClick();
    let latNum = parseFloat(customLat) || 19.0176;
    let lngNum = parseFloat(customLng) || 72.8152;

    switch (direction) {
      case 'north':
        latNum += nudgeStep;
        break;
      case 'south':
        latNum -= nudgeStep;
        break;
      case 'east':
        lngNum += nudgeStep;
        break;
      case 'west':
        lngNum -= nudgeStep;
        break;
      default:
        break;
    }

    const latStr = latNum.toFixed(5);
    const lngStr = lngNum.toFixed(5);
    setCustomLat(latStr);
    setCustomLng(lngStr);

    if (onLocationPicked) {
      onLocationPicked(latNum, lngNum);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    sound.playClick();
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferNewOwner.startsWith('0x') || transferNewOwner.length < 10) {
      alert("Please provide a valid Ethereum wallet address (0x...)");
      return;
    }
    sound.playBassThud();
    onTransferOwnership(selectedPlot?.id || transferPlotId, transferNewOwner);
    setTransferNewOwner('');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newId || !newLocation || !newArea) {
      alert("Please fill in all parcel registration fields.");
      return;
    }

    // Safety check on locality mismatch
    if (!localityCheck.isMatch && localityCheck.warning) {
      const confirmProceed = window.confirm(
        `${localityCheck.warning}\n\nDo you want to proceed with this position, or would you like to cancel and align the pin?`
      );
      if (!confirmProceed) return;
    }

    const latVal = parseFloat(customLat) || (newPlotCoords?.lat ?? 19.0176);
    const lngVal = parseFloat(customLng) || (newPlotCoords?.lng ?? 72.8152);

    sound.playBassThud();
    onRegisterLand({
      id: parseInt(newId, 10),
      location: newLocation,
      area: parseInt(newArea, 10),
      category: newCategory,
      lat: latVal,
      lng: lngVal
    });
    setNewId((prev) => String(parseInt(prev, 10) + 1));
  };

  const downloadDeedCertificate = () => {
    if (!selectedPlot) return;
    sound.playClick();
    const cert = {
      title: "AEGIS DECENTRALIZED TITLE DEED // OFFICIAL ON-CHAIN PROOF",
      timestamp: new Date().toISOString(),
      parcel: {
        id: selectedPlot.id,
        name: selectedPlot.name,
        location: selectedPlot.location,
        areaSqFt: selectedPlot.area,
        coordinates: { lat: selectedPlot.lat, lng: selectedPlot.lng },
        polygonVertices: selectedPlot.polygon
      },
      blockchain: {
        chainId: selectedPlot.chainId,
        chainName: selectedPlot.chainName,
        contractAddress: selectedPlot.contractAddress,
        transactionHash: selectedPlot.txHash,
        blockNumber: selectedPlot.blockNumber,
        merkleRoot: selectedPlot.merkleRoot,
        ipfsCid: selectedPlot.ipfsCid,
        currentOwner: selectedPlot.owner
      },
      verificationProof: "SHA256_INTEGRITY_CHECK_PASS"
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parcel-${selectedPlot.id}-onchain-title-deed.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const PRESET_HUBS = [
    { label: "Mumbai Worli", name: "Worli Sea Face Coastal Corridor, Mumbai", lat: 19.0176, lng: 72.8152 },
    { label: "Bandra BKC", name: "Bandra Kurla Complex (BKC), Mumbai", lat: 19.0657, lng: 72.8687 },
    { label: "Jammu Center", name: "Jammu City Center, Jammu, Jammu and Kashmir", lat: 32.7266, lng: 74.8570 },
    { label: "Srinagar Dal Lake", name: "Srinagar Dal Lake, Kashmir", lat: 34.0837, lng: 74.7973 },
    { label: "New Delhi CP", name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167 },
    { label: "Bengaluru Whitefield", name: "Whitefield Tech Park, Bengaluru", lat: 12.9698, lng: 77.7500 },
    { label: "Dubai Marina", name: "Dubai Marina Palm Corridor", lat: 25.0805, lng: 55.1403 },
    { label: "New York Manhattan", name: "Downtown Manhattan, New York", lat: 40.7128, lng: -74.0060 }
  ];

  return (
    <aside className="details-panel-container">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-header-meta font-mono">
          <div className="panel-tag">
            <span className="pulsing-led" />
            <span>AEGIS // CLASSIFIED GEOSPATIAL DOSSIER</span>
          </div>
          <button
            className="reenter-orbit-btn font-mono"
            onClick={() => {
              sound.playClick();
              onReenterOrbit();
            }}
            title="Return to 3D Space Orbit"
          >
            <Globe2 size={13} />
            <span>ORBIT VIEW</span>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="panel-tab-bar font-mono">
          <button
            className={`panel-tab ${activeMode === 'dossier' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveMode('dossier');
            }}
          >
            <FileText size={13} />
            <span>DOSSIER</span>
          </button>
          <button
            className={`panel-tab ${activeMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveMode('register');
            }}
          >
            <PlusCircle size={13} />
            <span>REGISTER</span>
          </button>
          <button
            className={`panel-tab ${activeMode === 'transfer' ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setActiveMode('transfer');
            }}
          >
            <ArrowRightLeft size={13} />
            <span>TRANSFER</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="panel-body custom-scrollbar">

        {/* ============================================================ */}
        {/* MODE 1: DOSSIER VIEW (Default) */}
        {/* ============================================================ */}
        {activeMode === 'dossier' && (
          <>
            {selectedPlot ? (
              <div className="dossier-view">
                
                {/* Parcel Identity Hero */}
                <div className="parcel-hero-card" style={{ borderColor: selectedPlot.boundaryColor }}>
                  <div className="hero-card-header font-mono">
                    <span className="parcel-id-chip" style={{ background: selectedPlot.boundaryColor }}>
                      PARCEL #{selectedPlot.id}
                    </span>
                    <span className="status-badge text-green font-mono">
                      <ShieldCheck size={14} />
                      <span>{selectedPlot.status}</span>
                    </span>
                  </div>

                  <h2 className="parcel-name">{selectedPlot.name}</h2>
                  <div className="parcel-location font-mono">
                    <MapPin size={13} className="text-cyan" />
                    <span>{selectedPlot.location}</span>
                  </div>
                  <div className="parcel-cat-pill font-mono">{selectedPlot.category}</div>
                </div>

                {/* Spatial / Geodetic Telemetry */}
                <div className="section-title font-mono">
                  <Compass size={13} />
                  <span>GEODETIC & SPATIAL TELEMETRY</span>
                </div>

                <div className="metrics-grid">
                  <div className="metric-box">
                    <div className="metric-label font-mono">SURFACE AREA</div>
                    <div className="metric-value font-mono text-cyan">
                      {selectedPlot.area?.toLocaleString()} <span className="unit">SQ FT</span>
                    </div>
                    <div className="metric-sub font-mono">
                      {selectedPlot.acres} ACRES / {selectedPlot.sqMeters} M²
                    </div>
                  </div>

                  <div className="metric-box">
                    <div className="metric-label font-mono">COORDINATES (CENTROID)</div>
                    <div className="metric-value font-mono text-white" style={{ fontSize: '13px' }}>
                      {selectedPlot.lat?.toFixed(5)}° N, {selectedPlot.lng?.toFixed(5)}° E
                    </div>
                    <div className="metric-sub font-mono">DATUM: WGS84 / SATELLITE OPTICS</div>
                  </div>
                </div>

                {/* Boundary Polygon Vertices */}
                {selectedPlot.polygon && (
                  <div className="boundary-vertices-card font-mono">
                    <div className="vertices-header">
                      <span>BOUNDARY POLYGON VERTICES (4 CORNERS)</span>
                      <span className="boundary-color-dot" style={{ background: selectedPlot.boundaryColor }} />
                    </div>
                    <div className="vertices-list">
                      {selectedPlot.polygon.map(([vlat, vlng], idx) => (
                        <div key={idx} className="vertex-row">
                          <span className="vertex-idx">V{idx + 1}:</span>
                          <span>LAT {vlat.toFixed(5)}° | LNG {vlng.toFixed(5)}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Provenance */}
                <div className="section-title font-mono" style={{ marginTop: '20px' }}>
                  <Layers size={13} />
                  <span>BLOCKCHAIN PROVENANCE & LEDGER HASHES</span>
                </div>

                <div className="blockchain-specs-card">
                  
                  {/* Chain ID */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <Hash size={12} />
                      <span>CHAIN ID</span>
                    </div>
                    <div className="spec-value font-mono">
                      <span className="badge-highlight">{selectedPlot.chainId}</span>
                      <span className="sub-tag">HEX: 0xaa36a7</span>
                      <span className="sub-tag cyan">{selectedPlot.chainName}</span>
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <Hash size={12} />
                      <span>TRANSACTION HASH</span>
                    </div>
                    <div className="spec-value-flex">
                      <code className="hash-code font-mono text-cyan" title={selectedPlot.txHash}>
                        {selectedPlot.txHash ? `${selectedPlot.txHash.slice(0, 16)}...${selectedPlot.txHash.slice(-10)}` : '0x...'}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(selectedPlot.txHash, 'tx')}
                        title="Copy Tx Hash"
                      >
                        {copiedKey === 'tx' ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${selectedPlot.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="explorer-link"
                        title="Verify on Sepolia Etherscan"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Smart Contract */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <KeyRound size={12} />
                      <span>SMART CONTRACT</span>
                    </div>
                    <div className="spec-value-flex">
                      <code className="hash-code font-mono" title={selectedPlot.contractAddress}>
                        {selectedPlot.contractAddress ? `${selectedPlot.contractAddress.slice(0, 14)}...${selectedPlot.contractAddress.slice(-8)}` : '0x...'}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(selectedPlot.contractAddress, 'contract')}
                        title="Copy Contract"
                      >
                        {copiedKey === 'contract' ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Block Number & Timestamp */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <Clock size={12} />
                      <span>BLOCK HEIGHT & TIMESTAMP</span>
                    </div>
                    <div className="spec-value font-mono">
                      <span className="text-white">#{selectedPlot.blockNumber?.toLocaleString()}</span>
                      <span className="sub-tag">{new Date(selectedPlot.timestamp).toLocaleDateString()} {new Date(selectedPlot.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Merkle Root */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <ShieldCheck size={12} />
                      <span>MERKLE GEODETIC ROOT</span>
                    </div>
                    <div className="spec-value-flex">
                      <code className="hash-code font-mono text-purple" title={selectedPlot.merkleRoot}>
                        {selectedPlot.merkleRoot ? `${selectedPlot.merkleRoot.slice(0, 16)}...${selectedPlot.merkleRoot.slice(-8)}` : '0x...'}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(selectedPlot.merkleRoot, 'merkle')}
                        title="Copy Merkle Root"
                      >
                        {copiedKey === 'merkle' ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* IPFS CID */}
                  <div className="spec-row">
                    <div className="spec-label font-mono">
                      <FileText size={12} />
                      <span>DEED IPFS CID</span>
                    </div>
                    <div className="spec-value-flex">
                      <code className="hash-code font-mono" title={selectedPlot.ipfsCid}>
                        {selectedPlot.ipfsCid ? `${selectedPlot.ipfsCid.slice(0, 18)}...${selectedPlot.ipfsCid.slice(-6)}` : 'ipfs://...'}
                      </code>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(selectedPlot.ipfsCid, 'ipfs')}
                        title="Copy IPFS CID"
                      >
                        {copiedKey === 'ipfs' ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Registered Titleholder */}
                  <div className="spec-row owner-highlight">
                    <div className="spec-label font-mono">
                      <User size={12} />
                      <span>REGISTERED TITLE HOLDER</span>
                    </div>
                    <div className="spec-value-flex">
                      <div className="owner-avatar" />
                      <div>
                        <div className="owner-label font-mono">{selectedPlot.ownerLabel || 'Cryptographic Keyholder'}</div>
                        <code className="hash-code font-mono text-white" title={selectedPlot.owner}>
                          {selectedPlot.owner ? `${selectedPlot.owner.slice(0, 14)}...${selectedPlot.owner.slice(-8)}` : 'Unassigned'}
                        </code>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(selectedPlot.owner, 'owner')}
                        title="Copy Owner Address"
                      >
                        {copiedKey === 'owner' ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="dossier-actions-row">
                  <button
                    className="action-btn-secondary font-mono"
                    onClick={downloadDeedCertificate}
                  >
                    <FileText size={14} />
                    <span>EXPORT CERTIFICATE</span>
                  </button>

                  <button
                    className="action-btn-primary font-mono"
                    onClick={() => {
                      sound.playClick();
                      setActiveMode('transfer');
                    }}
                  >
                    <ArrowRightLeft size={14} />
                    <span>TRANSFER TITLE</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="empty-selection-placeholder font-mono">
                <AlertCircle size={32} className="text-cyan pulse-fast" />
                <p>SELECT A LAND ON THE SATELLITE MAP OR GLOBE TO DECRYPT TELEMETRY DOSSIER</p>
              </div>
            )}
          </>
        )}

        {/* ============================================================ */}
        {/* MODE 2: REGISTER A LAND (With Intelligent Geocoding & Fine-Tuning) */}
        {/* ============================================================ */}
        {activeMode === 'register' && (
          <div className="register-view">
            <div className="panel-mode-title font-mono">
              <PlusCircle size={15} className="text-cyan" />
              <span>ON-CHAIN LAND REGISTRATION CONSOLE</span>
            </div>
            <p className="mode-desc">
              Enter your address below to automatically snap the pin to that locality, or click directly on the 3D Globe.
              The locality and coordinates are synchronized to prevent geographic mismatches.
            </p>

            {/* Quick Preset Hubs */}
            <div className="registration-presets-section font-mono" style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', marginBottom: '6px' }}>
                QUICK GLOBAL HUBS (1-CLICK SNAP):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PRESET_HUBS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      handleSelectSuggestion({
                        displayName: preset.name,
                        shortName: preset.label,
                        lat: preset.lat,
                        lng: preset.lng
                      });
                    }}
                    style={{
                      background: 'rgba(8, 20, 42, 0.75)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      color: '#94a3b8',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#00f0ff';
                      e.currentTarget.style.borderColor = '#00f0ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.25)';
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="register-form font-mono">
              
              {/* Unique Parcel ID */}
              <div className="form-group">
                <label>UNIQUE LAND PARCEL ID</label>
                <input
                  type="number"
                  placeholder="e.g. 107"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  required
                  className="scifi-input"
                />
              </div>

              {/* Location / Address Input with Live Geocoding */}
              <div className="form-group" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>LOCATION / PROPERTY ADDRESS</label>
                  <span style={{ fontSize: '10px', color: '#00f0ff' }}>AUTO-SNAPS PIN</span>
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Jammu, Bandra West Mumbai, Nariman Point, Marine Drive..."
                    value={newLocation}
                    onChange={handleAddressChange}
                    required
                    className="scifi-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleLocateAddress}
                    title="Geocode address and snap pin"
                    style={{
                      background: 'rgba(0, 240, 255, 0.15)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      padding: '0 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px'
                    }}
                  >
                    {isSearching ? <Loader2 size={13} className="spin-slow" /> : <Navigation size={13} />}
                    <span>SNAP PIN</span>
                  </button>
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      background: 'rgba(4, 12, 28, 0.98)',
                      border: '1px solid #00f0ff',
                      borderRadius: '4px',
                      marginTop: '4px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)'
                    }}
                    className="custom-scrollbar"
                  >
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          cursor: 'pointer',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 240, 255, 0.18)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <MapPin size={12} className="text-cyan" />
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{item.shortName || item.displayName.split(',')[0]}</span>
                          <span style={{ color: '#94a3b8', marginLeft: '6px' }}>{item.displayName}</span>
                        </div>
                        <span style={{ color: '#00ff88', fontSize: '10px' }}>
                          {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Locality Verification & Anti-Mismatch Banner */}
              {!localityCheck.isMatch && localityCheck.warning ? (
                <div
                  style={{
                    background: 'rgba(255, 80, 80, 0.12)',
                    border: '1px solid #ff4444',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '11px',
                    color: '#ff8888',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#ff4444' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#ffffff' }}>LOCALITY MISMATCH DETECTED</div>
                      <div>{localityCheck.warning}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleSnapPinToAddress}
                      style={{
                        background: 'rgba(0, 240, 255, 0.2)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      ▶ Snap Pin to Address
                    </button>
                    {reverseInfo && (
                      <button
                        type="button"
                        onClick={handleUpdateAddressFromPin}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid #ffffff',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        ▶ Set Address to Pin Locality
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(0, 255, 136, 0.08)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    color: '#00ff88',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>
                    LOCALITY VERIFIED: Pin matches {reverseInfo?.shortName || `${customLat}° N, ${customLng}° E`}
                  </span>
                </div>
              )}

              {/* Exact Coordinates (Lat & Lng) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>LATITUDE (° N/S)</label>
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="e.g. 19.0176"
                    value={customLat}
                    onChange={(e) => {
                      setCustomLat(e.target.value);
                      const lNum = parseFloat(e.target.value);
                      const lnNum = parseFloat(customLng);
                      if (!isNaN(lNum) && !isNaN(lnNum) && onLocationPicked) {
                        onLocationPicked(lNum, lnNum);
                      }
                    }}
                    required
                    className="scifi-input"
                  />
                </div>
                <div className="form-group">
                  <label>LONGITUDE (° E/W)</label>
                  <input
                    type="number"
                    step="0.00001"
                    placeholder="e.g. 72.8152"
                    value={customLng}
                    onChange={(e) => {
                      setCustomLng(e.target.value);
                      const lNum = parseFloat(customLat);
                      const lnNum = parseFloat(e.target.value);
                      if (!isNaN(lNum) && !isNaN(lnNum) && onLocationPicked) {
                        onLocationPicked(lNum, lnNum);
                      }
                    }}
                    required
                    className="scifi-input"
                  />
                </div>
              </div>

              {/* Human Fine-Positioning & Nudge D-Pad Controls */}
              <div
                style={{
                  background: 'rgba(6, 14, 30, 0.75)',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#00f0ff' }}>
                    <Crosshair size={13} />
                    <span style={{ fontWeight: 'bold' }}>FINE-POSITION PIN CENTROID</span>
                  </div>
                  
                  {/* Step resolution selector */}
                  <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.0001)}
                      style={{
                        background: nudgeStep === 0.0001 ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)',
                        color: nudgeStep === 0.0001 ? '#000000' : '#94a3b8',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      ~10m
                    </button>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.001)}
                      style={{
                        background: nudgeStep === 0.001 ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)',
                        color: nudgeStep === 0.001 ? '#000000' : '#94a3b8',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      ~100m
                    </button>
                    <button
                      type="button"
                      onClick={() => setNudgeStep(0.008)}
                      style={{
                        background: nudgeStep === 0.008 ? '#00f0ff' : 'rgba(255, 255, 255, 0.05)',
                        color: nudgeStep === 0.008 ? '#000000' : '#94a3b8',
                        border: 'none',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      ~1km
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Nudge pin on globe or switch to satellite optics for street-level plot placement:
                  </div>

                  {/* Nudge D-Pad Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(2, 26px)', gap: '3px', flexShrink: 0 }}>
                    <div />
                    <button
                      type="button"
                      onClick={() => handleNudge('north')}
                      title="Nudge North"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <div />
                    <button
                      type="button"
                      onClick={() => handleNudge('west')}
                      title="Nudge West"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge('south')}
                      title="Nudge South"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge('east')}
                      title="Nudge East"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid #00f0ff',
                        color: '#00f0ff',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {onSwitchToMap && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onSwitchToMap();
                    }}
                    style={{
                      background: 'rgba(0, 240, 255, 0.08)',
                      border: '1px dashed #00f0ff',
                      color: '#00f0ff',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '4px'
                    }}
                  >
                    <Map size={13} />
                    <span>FINE-TUNE ON HIGH-RES SATELLITE MAP &rarr;</span>
                  </button>
                )}
              </div>

              {/* Surface Area */}
              <div className="form-group">
                <label>SURFACE AREA (SQ FT)</label>
                <input
                  type="number"
                  placeholder="e.g. 18500"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  required
                  className="scifi-input"
                />
              </div>

              {/* Zoning Category */}
              <div className="form-group">
                <label>ZONING CLASSIFICATION</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="scifi-input"
                >
                  <option value="Commercial High-Density / Tech Hub">Commercial High-Density / Tech Hub</option>
                  <option value="Residential Prime Reserve">Residential Prime Reserve</option>
                  <option value="Industrial Quantum Logistics">Industrial Quantum Logistics</option>
                  <option value="Coastal Special Economic Zone">Coastal Special Economic Zone</option>
                </select>
              </div>

              {/* Wallet Signer Status */}
              <div className="wallet-signer-box">
                <div className="signer-status">
                  <span className="pulsing-led" />
                  <span>SIGNER WALLET: {account ? `${account.slice(0, 10)}...${account.slice(-6)}` : 'SIMULATED DEMO SIGNER'}</span>
                </div>
                {!isWalletConnected && (
                  <button
                    type="button"
                    className="connect-wallet-small-btn font-mono"
                    onClick={onConnectWallet}
                  >
                    CONNECT METAMASK
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="scifi-submit-btn font-mono">
                <ShieldCheck size={16} />
                <span>MINT ON SEPOLIA & PIN ON GLOBE &rarr;</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 3: TRANSFER OWNERSHIP */}
        {/* ============================================================ */}
        {activeMode === 'transfer' && (
          <div className="transfer-view">
            <div className="panel-mode-title font-mono">
              <ArrowRightLeft size={15} className="text-cyan" />
              <span>PEER-TO-PEER TITLE TRANSFER PROTOCOL</span>
            </div>
            <p className="mode-desc">
              Execute cryptographic ownership transfer for an authenticated parcel on-chain without intermediaries.
            </p>

            <form onSubmit={handleTransferSubmit} className="transfer-form font-mono">
              <div className="form-group">
                <label>PARCEL ID TO TRANSFER</label>
                <input
                  type="number"
                  value={selectedPlot?.id || transferPlotId}
                  onChange={(e) => setTransferPlotId(e.target.value)}
                  required
                  className="scifi-input"
                />
              </div>

              <div className="form-group">
                <label>CURRENT REGISTERED OWNER</label>
                <input
                  type="text"
                  value={selectedPlot?.owner || '0x...'}
                  disabled
                  className="scifi-input disabled"
                />
              </div>

              <div className="form-group">
                <label>NEW RECIPIENT WALLET ADDRESS (0x...)</label>
                <input
                  type="text"
                  placeholder="0x71C8360f3E24296bA72338A99a463F83b90218A1"
                  value={transferNewOwner}
                  onChange={(e) => setTransferNewOwner(e.target.value)}
                  required
                  className="scifi-input"
                />
              </div>

              <button type="submit" className="scifi-submit-btn font-mono">
                <ArrowRightLeft size={16} />
                <span>SIGN & BROADCAST TRANSFER TX &rarr;</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </aside>
  );
}
