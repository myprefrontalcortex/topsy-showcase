import React, { useEffect, useState } from 'react';

interface TestPatternStandbyProps {
  message?: string;
  generatedAt?: string | null;
  channelUrl?: string | null;
}

const DEFAULT_MESSAGE = 'Terrarium maintenance in progress — live broadcast will resume shortly.';
const DEFAULT_YOUTUBE_CHANNEL = 'https://www.youtube.com/@MYprefrontalRIDES';

export const TestPatternStandby: React.FC<TestPatternStandbyProps> = ({ message, generatedAt, channelUrl }) => {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('en-GB', { hour12: false })
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const displayMessage = message && message.trim() ? message.trim() : DEFAULT_MESSAGE;
  const youtubeHref = channelUrl && channelUrl.trim() ? channelUrl.trim() : DEFAULT_YOUTUBE_CHANNEL;

  return (
    <div className="standby-viewport">
      <div className="crt-monitor">
        <div className="crt-bezel">
          <div className="crt-screen" role="img" aria-label="TOP5Y Sentinel Television Test Pattern — Maintenance Standby">
            {/* Top SMPTE 75% Color Bars */}
            <div className="smpte-top-bars">
              <div style={{ backgroundColor: '#c0c0c0' }} />
              <div style={{ backgroundColor: '#c0c000' }} />
              <div style={{ backgroundColor: '#00c0c0' }} />
              <div style={{ backgroundColor: '#00c000' }} />
              <div style={{ backgroundColor: '#c000c0' }} />
              <div style={{ backgroundColor: '#c00000' }} />
              <div style={{ backgroundColor: '#0000c0' }} />
            </div>

            {/* Secondary Chroma Castellation Strip */}
            <div className="smpte-chroma-strip">
              <div style={{ backgroundColor: '#0000c0' }} />
              <div style={{ backgroundColor: '#131313' }} />
              <div style={{ backgroundColor: '#c000c0' }} />
              <div style={{ backgroundColor: '#131313' }} />
              <div style={{ backgroundColor: '#00c0c0' }} />
              <div style={{ backgroundColor: '#131313' }} />
              <div style={{ backgroundColor: '#c0c0c0' }} />
            </div>

            {/* Central Philips PM5544 Geometric Pattern */}
            <div className="pm5544-stage">
              <svg viewBox="0 0 800 440" preserveAspectRatio="none" className="pm5544-svg">
                <defs>
                  {/* Checkerboard border pattern */}
                  <pattern id="pm-checker" width="32" height="32" patternUnits="userSpaceOnUse">
                    <rect width="16" height="16" fill="#d4d4d4" />
                    <rect x="16" width="16" height="16" fill="#181b22" />
                    <rect y="16" width="16" height="16" fill="#181b22" />
                    <rect x="16" y="16" width="16" height="16" fill="#d4d4d4" />
                  </pattern>
                  {/* Calibration grid */}
                  <pattern id="pm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill="#2c313c" />
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9aa4b8" strokeWidth="1.2" opacity="0.55" />
                  </pattern>
                  {/* High-frequency vertical grating patterns */}
                  <pattern id="grating-fine" width="6" height="10" patternUnits="userSpaceOnUse">
                    <rect width="3" height="10" fill="#e5e7eb" />
                    <rect x="3" width="3" height="10" fill="#111827" />
                  </pattern>
                  <pattern id="grating-med" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect width="5" height="10" fill="#e5e7eb" />
                    <rect x="5" width="5" height="10" fill="#111827" />
                  </pattern>
                  <clipPath id="circle-clip">
                    <circle cx="400" cy="220" r="184" />
                  </clipPath>
                </defs>

                {/* Outer checkerboard castellations */}
                <rect x="0" y="0" width="800" height="440" fill="url(#pm-checker)" />
                {/* Inner calibration grid */}
                <rect x="24" y="20" width="752" height="400" fill="url(#pm-grid)" stroke="#e5e7eb" strokeWidth="2" />

                {/* Side Chroma Accent Blocks (Philips PM5544 signature) */}
                <rect x="24" y="80" width="56" height="70" fill="#b45309" opacity="0.85" />
                <rect x="24" y="150" width="56" height="70" fill="#15803d" opacity="0.85" />
                <rect x="24" y="220" width="56" height="70" fill="#7e22ce" opacity="0.85" />
                <rect x="24" y="290" width="56" height="70" fill="#b91c1c" opacity="0.85" />

                <rect x="720" y="80" width="56" height="70" fill="#0e7490" opacity="0.85" />
                <rect x="720" y="150" width="56" height="70" fill="#a16207" opacity="0.85" />
                <rect x="720" y="220" width="56" height="70" fill="#1d4ed8" opacity="0.85" />
                <rect x="720" y="290" width="56" height="70" fill="#be123c" opacity="0.85" />

                {/* Corner Reference Circles */}
                <circle cx="112" cy="64" r="22" fill="none" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />
                <circle cx="688" cy="64" r="22" fill="none" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />
                <circle cx="112" cy="376" r="22" fill="none" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />
                <circle cx="688" cy="376" r="22" fill="none" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />

                {/* Main Center PM5544 Circle */}
                <g clipPath="url(#circle-clip)">
                  <rect x="216" y="36" width="368" height="368" fill="#1a1d24" />
                  {/* Upper resolution lines & grating bars */}
                  <rect x="216" y="36" width="368" height="62" fill="#d1d5db" />
                  <rect x="260" y="98" width="140" height="36" fill="url(#grating-med)" />
                  <rect x="400" y="98" width="140" height="36" fill="url(#grating-fine)" />

                  {/* Inner horizontal color blocks */}
                  <g>
                    <rect x="216" y="134" width="61.3" height="60" fill="#d4d400" />
                    <rect x="277.3" y="134" width="61.3" height="60" fill="#00c8c8" />
                    <rect x="338.6" y="134" width="61.4" height="60" fill="#00c800" />
                    <rect x="400" y="134" width="61.4" height="60" fill="#c800c8" />
                    <rect x="461.4" y="134" width="61.3" height="60" fill="#c80000" />
                    <rect x="522.7" y="134" width="61.3" height="60" fill="#0032d8" />
                  </g>

                  {/* Center dark band with crosshairs */}
                  <rect x="216" y="194" width="368" height="68" fill="#0c0e13" />
                  <line x1="216" y1="220" x2="584" y2="220" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />
                  <line x1="400" y1="36" x2="400" y2="404" stroke="#e5e7eb" strokeWidth="2" opacity="0.7" />

                  {/* Monochrome staircase */}
                  <g>
                    <rect x="216" y="262" width="61.3" height="44" fill="#111111" />
                    <rect x="277.3" y="262" width="61.3" height="44" fill="#3a3a3a" />
                    <rect x="338.6" y="262" width="61.4" height="44" fill="#6b6b6b" />
                    <rect x="400" y="262" width="61.4" height="44" fill="#9c9c9c" />
                    <rect x="461.4" y="262" width="61.3" height="44" fill="#cfcfcf" />
                    <rect x="522.7" y="262" width="61.3" height="44" fill="#f3f4f6" />
                  </g>

                  {/* Lower color burst + fine grating */}
                  <rect x="216" y="306" width="368" height="36" fill="url(#grating-fine)" />
                  <rect x="216" y="342" width="184" height="62" fill="#b45309" />
                  <rect x="400" y="342" width="184" height="62" fill="#dc2626" />
                </g>

                <circle cx="400" cy="220" r="184" fill="none" stroke="#f8fafc" strokeWidth="3.5" />
              </svg>

              {/* Call-sign & Standby Plates overlaid inside the Test Card Circle */}
              <div className="pm5544-overlay">
                <div className="pm-plate pm-callsign">TOP5Y SENTINEL</div>

                <div className="pm-standby-card">
                  <div className="pm-standby-title">
                    <span className="pm-standby-dot" />
                    <span>PLEASE STAND BY</span>
                  </div>
                  <p className="pm-standby-msg">{displayMessage}</p>
                </div>

                <div className="pm-plate pm-clock-plate">
                  <span>{clock} JST</span>
                  <span style={{ opacity: 0.5 }}>&bull;</span>
                  <span style={{ color: '#ffb74d' }}>OFF AIR &bull; MAINTENANCE</span>
                </div>
              </div>
            </div>

            {/* Bottom PLUGE / Grayscale Reference Strip */}
            <div className="smpte-bottom-pluge">
              <div style={{ backgroundColor: '#00214c', flex: 1.25 }} />
              <div style={{ backgroundColor: '#ffffff', flex: 1.25 }} />
              <div style={{ backgroundColor: '#32006a', flex: 1.25 }} />
              <div style={{ backgroundColor: '#131313', flex: 1.5 }} />
              <div style={{ backgroundColor: '#070707', flex: 0.6 }} />
              <div style={{ backgroundColor: '#131313', flex: 0.6 }} />
              <div style={{ backgroundColor: '#222222', flex: 0.6 }} />
              <div style={{ backgroundColor: '#131313', flex: 1.0 }} />
            </div>

            {/* Subtle CRT Scanlines + Vignette */}
            <div className="crt-scanlines" />
            <div className="crt-vignette" />
          </div>
        </div>

        <div className="crt-yt-bar">
          <span className="crt-yt-prompt">While you wait, catch past streams &amp; clips on YouTube:</span>
          <a
            className="crt-yt-btn"
            href={youtubeHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">▶</span>
            <span>Watch on YouTube (@MYprefrontalRIDES)</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="crt-footer-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pm-standby-dot" />
            <span>CH-01 &bull; TOP5Y TERRARIUM FEED</span>
          </div>
          <span>
            Broadcast paused by habitat operator &bull; Auto-polling every 60s for signal restoration
            {generatedAt ? ` • Last sync ${new Date(generatedAt).toLocaleTimeString()}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
