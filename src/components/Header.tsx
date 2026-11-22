import React, { useEffect, useRef, useState } from 'react';
import type { FreshnessStatus, TelemetryData } from '../types/telemetry';
import { computeShedForecast, formatRelativeDate, formatTimeAgo } from '../utils/formatters';

interface HeaderProps {
  telemetry: TelemetryData | null;
  lastFedDate: string | null;
  lastShedDate: string | null;
  freshness: FreshnessStatus;
  onOpenImage: (src: string, title: string) => void;
}

type PopupKey = 'clean' | 'shed' | 'mimi' | 'weather' | null;

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  lastFedDate,
  lastShedDate,
  freshness,
  onOpenImage,
}) => {
  const [clockText, setClockText] = useState(() => new Date().toLocaleString());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [openPopup, setOpenPopup] = useState<PopupKey>(null);
  const chipBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setClockText(new Date().toLocaleString());
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (chipBarRef.current && !chipBarRef.current.contains(e.target as Node)) {
        setOpenPopup(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const battery = telemetry?.climate?.battery ?? null;
  let batColor = '#00e676';
  if (battery !== null) {
    if (battery <= 20) batColor = '#ff1744';
    else if (battery <= 45) batColor = '#ff9100';
  }

  const maint = telemetry?.maintenance;
  const mimiTasks = maint?.mimi_tasks ?? [];
  const closestMimi = mimiTasks.reduce<{ days_remaining: number | null } | null>((best, t) => {
    if (t.days_remaining === null) return best;
    if (!best || best.days_remaining === null || t.days_remaining < best.days_remaining) return t;
    return best;
  }, null);

  const weather = telemetry?.weather;
  const shed = computeShedForecast(lastShedDate);

  const syncLabel = telemetry?.generated_at
    ? freshness === 'live'
      ? `Synced ${formatTimeAgo(telemetry.generated_at, nowMs)}`
      : freshness === 'stale'
      ? `Cached (${formatTimeAgo(telemetry.generated_at, nowMs)})`
      : 'Offline Snapshot'
    : 'Connecting...';

  const togglePopup = (key: Exclude<PopupKey, null>) => {
    setOpenPopup((prev) => (prev === key ? null : key));
  };

  return (
    <header>
      <div className="header-brand">
        <button
          type="button"
          className="avatar-glow-wrapper"
          onClick={() => onOpenImage('./Topsy.jpg', 'TOP5Y • Rhacodactylus auriculatus')}
          aria-label="View full portrait of Topsy"
        >
          <img src="./Topsy.jpg" alt="Topsy the Gargoyle Gecko" className="avatar-glow-img" />
        </button>
        <div>
          <h1>
            <span className={`status-indicator ${freshness === 'stale' ? 'stale' : freshness === 'offline' ? 'offline' : ''}`} />
            TOP5Y SENTINEL
          </h1>
          <div className="status-container">
            <span>
              <strong style={{ color: 'var(--accent-primary)' }}>Rhacodactylus auriculatus</strong> (Gargoyle Gecko) • Live Habitat Showcase
            </span>
            <span className="readonly-pill">READ-ONLY</span>
          </div>
        </div>
      </div>

      <div className="header-meta">
        <div className="time-row">
          <span className={`sync-badge ${freshness === 'live' ? 'live' : 'stale'}`} title={telemetry?.generated_at ?? ''}>
            {syncLabel}
          </span>
          <div className="time-display">{clockText}</div>
        </div>

        <div className="header-battery" title={telemetry?.climate?.timestamp ? `Last sensor update: ${telemetry.climate.timestamp}` : ''}>
          <span>Sensor Battery:</span>
          <div className="battery-icon">
            <div
              className={`battery-seg ${battery !== null && battery < 10 ? 'blink' : ''}`}
              style={{ backgroundColor: battery !== null && battery >= 5 ? batColor : 'transparent' }}
            />
            <div
              className="battery-seg"
              style={{ backgroundColor: battery !== null && battery >= 25 ? batColor : 'transparent' }}
            />
            <div
              className="battery-seg"
              style={{ backgroundColor: battery !== null && battery >= 50 ? batColor : 'transparent' }}
            />
            <div
              className="battery-seg"
              style={{ backgroundColor: battery !== null && battery >= 75 ? batColor : 'transparent' }}
            />
            <div className="battery-cap" />
          </div>
          <span style={{ fontWeight: 'bold', minWidth: '32px', textAlign: 'right' }}>
            {battery !== null ? `${battery}%` : '--%'}
          </span>
        </div>

        <div className="countdown-container" ref={chipBarRef}>
          {/* TOP5Y Clean Chip (Read-Only) */}
          <div className="chip-wrapper">
            <div
              className="countdown-chip interactive"
              onClick={() => togglePopup('clean')}
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                borderColor: 'rgba(168, 85, 247, 0.25)',
                color: '#c084fc',
              }}
              title="Tap to view deep cleaning schedule"
            >
              <span className="chip-dot" style={{ backgroundColor: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />
              <span>
                TOP5Y Clean: <strong>{maint?.topsy_clean_days !== null && maint?.topsy_clean_days !== undefined ? `${maint.topsy_clean_days}d` : '--d'}</strong>
              </span>
            </div>
            {openPopup === 'clean' && (
              <div className="chip-popup chip-popup-left">
                <div className="chip-popup-header" style={{ color: '#c084fc' }}>
                  <span>🧼 Monthly Deep Cleaning</span>
                </div>
                <div className="chip-popup-rows">
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Last done:</span>
                    <strong>{maint?.topsy_clean_last ?? 'Unknown'}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Next due:</span>
                    <strong>{maint?.topsy_clean_date ?? '--'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TOP5Y Fed Chip */}
          <div
            className="countdown-chip"
            style={{
              background: 'rgba(0, 230, 118, 0.08)',
              borderColor: 'rgba(0, 230, 118, 0.25)',
              color: '#69f0ae',
            }}
            title={lastFedDate && lastFedDate !== 'Never' ? `Last feeding on ${lastFedDate}` : 'No feeding record'}
          >
            <span className="chip-dot" style={{ backgroundColor: '#00e676', boxShadow: '0 0 6px #00e676' }} />
            <span>
              TOP5Y Fed: <strong>{formatRelativeDate(lastFedDate)}</strong>
            </span>
          </div>

          {/* TOP5Y Shed Chip */}
          <div className="chip-wrapper">
            <div
              className="countdown-chip interactive"
              onClick={() => togglePopup('shed')}
              style={{
                background: 'rgba(255, 183, 77, 0.08)',
                borderColor: 'rgba(255, 183, 77, 0.25)',
                color: '#ffb74d',
              }}
              title="Tap to view shedding forecast"
            >
              <span className="chip-dot" style={{ backgroundColor: '#ffb74d', boxShadow: '0 0 6px #ffb74d' }} />
              <span>
                TOP5Y Shed: <strong>{formatRelativeDate(lastShedDate)}</strong>
              </span>
            </div>
            {openPopup === 'shed' && (
              <div className="chip-popup chip-popup-left" style={{ minWidth: '280px' }}>
                <div className="chip-popup-header" style={{ color: '#ffb74d' }}>
                  <span>🦎 Skin Shedding Forecast</span>
                </div>
                <div className="chip-popup-rows">
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Last Shed:</span>
                    <strong>{shed.lastText}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Expected Min (2w):</span>
                    <strong>{shed.minExpected}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Expected Max (4w):</span>
                    <strong>{shed.maxExpected}</strong>
                  </div>
                  <div className="chip-popup-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <strong style={{ color: shed.statusColor }}>{shed.statusText}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mimi-chan Schedule Chip */}
          <div className="chip-wrapper">
            <div
              className="countdown-chip interactive"
              onClick={() => togglePopup('mimi')}
              style={{
                background: 'rgba(0, 176, 255, 0.08)',
                borderColor: 'rgba(0, 176, 255, 0.25)',
                color: '#38bdf8',
              }}
              title="Tap to view Mimi-chan's maintenance schedule"
            >
              <span className="chip-dot" style={{ backgroundColor: '#00b0ff', boxShadow: '0 0 6px #00b0ff' }} />
              <span>
                Mimi-chan: <strong>{closestMimi?.days_remaining !== null && closestMimi?.days_remaining !== undefined ? `${closestMimi.days_remaining}d` : '--'}</strong>
              </span>
            </div>
            {openPopup === 'mimi' && (
              <div className="chip-popup" style={{ minWidth: '295px' }}>
                <div className="chip-popup-header" style={{ color: 'var(--text-primary)' }}>
                  <span>🐢 Mimi-chan Schedule</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CARE LOG</span>
                </div>
                <div className="chip-popup-rows">
                  {mimiTasks.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '6px' }}>No scheduled tasks.</div>
                  ) : (
                    mimiTasks.map((t, i) => {
                      const days = t.days_remaining ?? 0;
                      const dotColor = days <= 2 ? 'var(--accent-primary)' : days <= 5 ? '#fb8c00' : 'var(--accent-success)';
                      return (
                        <div
                          key={i}
                          className="chip-popup-row"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px' }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                            {t.task.split(' / ')[0]}
                          </span>
                          <strong style={{ color: dotColor }}>{t.days_remaining ?? '--'}d</strong>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tokyo Weather Chip */}
          <div className="chip-wrapper">
            <div
              className="countdown-chip interactive"
              onClick={() => togglePopup('weather')}
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
              }}
              title="Tap to view Tokyo Ambient Weather"
            >
              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{weather?.icon ?? '⛅'}</span>
              <span>
                Tokyo:{' '}
                <strong>
                  {weather?.current_temp !== null && weather?.current_temp !== undefined
                    ? `${weather.current_temp.toFixed(1)}° (${weather.night_min !== null ? Math.round(weather.night_min) : '-'}°~${weather.day_max !== null ? Math.round(weather.day_max) : '-'}°)`
                    : '--°C'}
                </strong>
              </span>
            </div>
            {openPopup === 'weather' && (
              <div className="chip-popup" style={{ minWidth: '280px' }}>
                <div className="chip-popup-header" style={{ color: '#fbbf24' }}>
                  <span>🌤️ {weather?.location ?? 'Tokyo, Japan'} Weather</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{weather?.updated_at ?? '--'}</span>
                </div>
                <div className="chip-popup-rows">
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Condition:</span>
                    <strong>{`${weather?.icon ?? ''} ${weather?.condition ?? '--'}`}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Current Outdoor:</span>
                    <strong>{weather?.current_temp !== null && weather?.current_temp !== undefined ? `${weather.current_temp.toFixed(1)}°C (${weather.current_humidity ?? '--'}% RH)` : '--'}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>☀️ Day Max (07-19h):</span>
                    <strong style={{ color: '#fbbf24' }}>{weather?.day_max !== null && weather?.day_max !== undefined ? `${weather.day_max.toFixed(1)}°C` : '--'}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>🌙 Night Min (19-07h):</span>
                    <strong style={{ color: '#38bdf8' }}>{weather?.night_min !== null && weather?.night_min !== undefined ? `${weather.night_min.toFixed(1)}°C` : '--'}</strong>
                  </div>
                  <div className="chip-popup-row">
                    <span style={{ color: 'var(--text-secondary)' }}>☁️ Cloud Cover:</span>
                    <strong>{weather?.cloud_desc ?? `${weather?.current_cloud_cover ?? '--'}%`}</strong>
                  </div>
                  <div className="chip-popup-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🌧️ Rain Probability:</span>
                    <strong>{weather?.precip_prob_max !== null && weather?.precip_prob_max !== undefined ? `${weather.precip_prob_max}%` : '--%'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
