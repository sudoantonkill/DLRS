import React, { useState } from 'react';
import { sound } from '../utils/soundFx';
import { Compass, ShieldCheck, Search, PlusCircle, Globe2, Radio, Database, Cpu } from 'lucide-react';

export default function LandingHero({
  onSelectOption,
  plots = []
}) {
  const [quickSearchId, setQuickSearchId] = useState('');

  const handleRegisterClick = () => {
    sound.playBassThud();
    sound.playClick();
    onSelectOption('register');
  };

  const handleFindClick = () => {
    sound.playBassThud();
    sound.playClick();
    onSelectOption('find', quickSearchId ? parseInt(quickSearchId, 10) : null);
  };

  const handleQuickSelect = (plotId) => {
    sound.playTargetLock();
    onSelectOption('find', plotId);
  };

  return (
    <div className="landing-hero-container">
      {/* Background Animated Particle Grid & Scanlines */}
      <div className="hero-grid-bg" />
      <div className="hero-scanlines" />

      {/* Top Telemetry Header */}
      <header className="hero-top-bar font-mono">
        <div className="hero-brand">
          <Globe2 className="brand-icon pulse-fast" size={18} />
          <span>AEGIS // ORBITAL GEOSPATIAL REGISTRY</span>
        </div>
        <div className="hero-network-pill">
          <span className="live-dot" />
          <span>SEPOLIA NODE (CHAIN ID: 11155111)</span>
          <span className="separator">|</span>
          <span className="dimmed">ESRI SATELLITE OPTICS: ONLINE</span>
        </div>
      </header>

      {/* Hero Center Content */}
      <div className="hero-center-content">
        <div className="hero-super-title font-mono">
          <Radio size={14} className="spin-slow" />
          <span>MISSION PROTOCOL // SATELLITE PROPERTY VERIFICATION</span>
        </div>

        <h1 className="hero-title">
          DECENTRALIZED <span className="text-glow-cyan">LAND REGISTRY</span>
        </h1>

        <p className="hero-subtitle">
          Eliminate deed tampering, double selling, and boundary disputes. Every square foot is verified through
          orbital satellite imagery, cryptographic Merkle proofs, and immutable Ethereum smart contracts.
        </p>

        {/* The Two Main Christopher Nolan Action Cards */}
        <div className="hero-actions-grid">
          
          {/* OPTION 1: REGISTER A LAND */}
          <div
            className="hero-action-card register-card"
            onClick={handleRegisterClick}
            onMouseEnter={() => sound.playClick()}
          >
            <div className="card-top font-mono">
              <span className="card-index">01 // PROTOCOL</span>
              <span className="card-badge cyan">MINT_TITLE</span>
            </div>

            <div className="card-icon-wrap cyan">
              <PlusCircle size={38} />
            </div>

            <h2 className="card-heading">REGISTER A LAND</h2>

            <p className="card-desc">
              Anchor new property parcel into the blockchain ledger. Define exact satellite boundary coordinates,
              verify title deeds, and mint an immutable on-chain record.
            </p>

            <div className="card-footer-cta font-mono">
              <span>INITIALIZE REGISTRATION</span>
              <span className="cta-arrow">&rarr;</span>
            </div>
            <div className="card-glow-edge cyan" />
          </div>

          {/* OPTION 2: FIND A LAND */}
          <div
            className="hero-action-card find-card"
            onClick={handleFindClick}
            onMouseEnter={() => sound.playClick()}
          >
            <div className="card-top font-mono">
              <span className="card-index">02 // PROTOCOL</span>
              <span className="card-badge green">ORBITAL_SEARCH</span>
            </div>

            <div className="card-icon-wrap green">
              <Search size={38} />
            </div>

            <h2 className="card-heading">FIND A LAND</h2>

            <p className="card-desc">
              Execute orbital satellite target lock. Zoom in from space to examine high-resolution boundaries,
              ownership provenance, chain IDs, and cryptographic hashes.
            </p>

            <div className="hero-quick-search-box" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                placeholder="Direct Land ID (e.g. 101)"
                value={quickSearchId}
                onChange={(e) => setQuickSearchId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFindClick();
                }}
                className="quick-search-input font-mono"
              />
              <button
                type="button"
                className="quick-search-btn font-mono"
                onClick={handleFindClick}
              >
                LOCATE &rarr;
              </button>
            </div>

            <div className="card-footer-cta font-mono">
              <span>COMMENCE ORBITAL SCAN</span>
              <span className="cta-arrow">&rarr;</span>
            </div>
            <div className="card-glow-edge green" />
          </div>

        </div>

        {/* Quick Launch Pre-Verified Mumbai Parcels */}
        <div className="hero-presets-strip">
          <div className="presets-label font-mono">
            <span>PRE-INDEXED HIGH-VALUE PLOTS:</span>
          </div>
          <div className="presets-buttons-row">
            {plots.slice(0, 5).map((p) => (
              <button
                key={p.id}
                className="preset-chip font-mono"
                onClick={() => handleQuickSelect(p.id)}
                onMouseEnter={() => sound.playClick()}
              >
                <span className="chip-dot" style={{ background: p.boundaryColor }} />
                <span>#{p.id} {p.name.split('//')[1]?.trim() || p.location.split(',')[0]}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Cinematic Telemetry Ticker */}
      <footer className="hero-footer-bar font-mono">
        <div className="footer-item">
          <Database size={13} />
          <span>SMART CONTRACT: 0x8d34...500e</span>
        </div>
        <div className="footer-item">
          <Cpu size={13} />
          <span>ACTIVE SENSORS: SENTINEL-2C / ESRI OPTICS</span>
        </div>
        <div className="footer-item text-green">
          <ShieldCheck size={13} />
          <span>ZERO-FRAUD CONSENSUS PROTOCOL</span>
        </div>
      </footer>
    </div>
  );
}
