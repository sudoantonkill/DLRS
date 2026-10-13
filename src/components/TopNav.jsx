import React, { useState, useEffect } from 'react';
import { sound } from '../utils/soundFx';
import { Globe2, Map, Volume2, VolumeX, Shield, Wallet, ArrowLeft, RefreshCw, Cpu, PlusCircle } from 'lucide-react';

export default function TopNav({
  viewMode, // 'landing' | 'globe' | 'map'
  setViewMode,
  onBackToHome,
  account,
  onConnectWallet,
  onTriggerDescent,
  onOpenRegister,
  selectedPlot
}) {
  const [utcTime, setUtcTime] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="top-nav-bar font-mono">
      {/* Left: Brand & Back Navigation */}
      <div className="nav-left-group">
        <button
          className="nav-home-btn"
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          title="Return to Protocol Home"
        >
          <ArrowLeft size={16} />
          <span className="brand-title">AEGIS // ORBITAL LEDGER</span>
        </button>

        {viewMode !== 'landing' && (
          <div className="view-mode-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'globe' ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                setViewMode('globe');
              }}
            >
              <Globe2 size={13} />
              <span>3D GLOBE</span>
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => {
                sound.playClick();
                setViewMode('map');
              }}
            >
              <Map size={13} />
              <span>SATELLITE MAP</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: Live Orbit Telemetry */}
      <div className="nav-center-telemetry">
        <span className="telemetry-pill">
          <span className="live-dot" />
          <span>CHAIN: SEPOLIA (11155111)</span>
        </span>
        <span className="telemetry-pill hide-sm">
          <ClockTelemetry utcTime={utcTime} />
        </span>
        {selectedPlot && (
          <span className="telemetry-pill highlight hide-sm">
            <span>TARGET: #{selectedPlot.id} ({selectedPlot.location.split(',')[0]})</span>
          </span>
        )}
      </div>

      {/* Right: Audio FX & Web3 Wallet */}
      <div className="nav-right-group">
        {/* Descent trigger shortcut button if on Globe */}
        {viewMode === 'globe' && (
          <button
            className="descent-nav-btn"
            onClick={onTriggerDescent}
            title="Execute Atmospheric Dive"
          >
            <Cpu size={13} />
            <span>COMMENCE DESCENT &rarr;</span>
          </button>
        )}

        {/* Quick Register Land Button */}
        <button
          className="nav-register-btn font-mono"
          onClick={() => {
            sound.playClick();
            if (onOpenRegister) onOpenRegister();
          }}
          title="Register New Land On Chain & Pin On Globe"
        >
          <PlusCircle size={13} />
          <span>+ REGISTER LAND</span>
        </button>

        {/* Audio Mute / Unmute */}
        <button
          className="audio-toggle-btn"
          onClick={toggleSound}
          title={isMuted ? "Enable Sci-Fi Audio FX" : "Mute Audio FX"}
        >
          {isMuted ? <VolumeX size={16} className="text-muted" /> : <Volume2 size={16} className="text-cyan" />}
        </button>

        {/* Wallet Connect Button */}
        <button
          className={`wallet-nav-btn ${account ? 'connected' : ''}`}
          onClick={onConnectWallet}
        >
          <Wallet size={14} />
          <span>
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : 'CONNECT WALLET'}
          </span>
          {account && <span className="connected-dot" />}
        </button>
      </div>
    </header>
  );
}

function ClockTelemetry({ utcTime }) {
  return <span>T-STAMP: {utcTime}</span>;
}
