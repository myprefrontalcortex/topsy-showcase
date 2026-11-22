import React from 'react';
import type { TelemetryData } from '../types/telemetry';
import { getHumidityColor, getRoomTempColor, getTerraTempColor, parseTimestamp } from '../utils/formatters';

interface StatsGridProps {
  telemetry: TelemetryData | null;
}

const UpArrowIcon: React.FC<{ className: string; title: string }> = ({ className, title }) => (
  <span title={title} style={{ display: 'inline-flex' }}>
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 4V20M12 4L6 10M12 4L18 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const DownArrowIcon: React.FC<{ className: string; title: string }> = ({ className, title }) => (
  <span title={title} style={{ display: 'inline-flex' }}>
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 20V4M12 20L6 14M12 20L18 14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const SteadyArrowIcon: React.FC<{ title: string }> = ({ title }) => (
  <span title={title} style={{ display: 'inline-flex' }}>
    <svg className="trend-icon trend-steady" viewBox="0 0 24 24" fill="none">
      <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

export const StatsGrid: React.FC<StatsGridProps> = ({ telemetry }) => {
  const c = telemetry?.climate;
  const w = telemetry?.weather;
  const s = telemetry?.system;

  const terraTemp = c?.temperature ?? null;
  const terraHum = c?.humidity ?? null;
  const roomTemp = c?.room_temperature ?? null;
  const roomHum = c?.room_humidity ?? null;
  const roomSrcLabel = c?.room_source === 'sensor' ? 'Room Ambient (Sensor):' : 'Room Ambient (Remo):';

  const tStyle = terraTemp !== null ? getTerraTempColor(terraTemp) : null;
  const hStyle = terraHum !== null ? getHumidityColor(terraHum) : null;
  const rtStyle = roomTemp !== null ? getRoomTempColor(roomTemp) : null;
  const rhStyle = roomHum !== null ? getHumidityColor(roomHum) : null;

  const tempDelta = c?.trend?.temp_delta ?? null;
  const humDelta = c?.trend?.hum_delta ?? null;

  const timeStr = c?.timestamp ? `Last updated: ${parseTimestamp(c.timestamp).toLocaleTimeString()}` : 'Last updated: Never';

  const cpuBorderColor =
    s?.cpu_temp !== null && s?.cpu_temp !== undefined
      ? s.cpu_temp >= 65
        ? 'rgba(255, 74, 107, 0.4)'
        : s.cpu_temp >= 55
        ? 'rgba(255, 183, 77, 0.4)'
        : undefined
      : undefined;

  return (
    <div className="dashboard-grid">
      {/* 1. Temperature Card */}
      <div className="card temp">
        <span className="card-label">Temperature</span>
        <div className="card-value">
          <span
            style={{
              color: tStyle?.color ?? 'var(--text-primary)',
              textShadow: tStyle && tStyle.glow !== 'none' ? `0 0 10px ${tStyle.glow}` : 'none',
            }}
          >
            {terraTemp !== null ? `${terraTemp.toFixed(1)}°C` : '--.-°C'}
          </span>
          {tempDelta !== null && tempDelta > 0.05 ? (
            <UpArrowIcon className="trend-icon trend-up-temp" title={`Rising (+${tempDelta.toFixed(2)}°C over 15m)`} />
          ) : tempDelta !== null && tempDelta < -0.05 ? (
            <DownArrowIcon className="trend-icon trend-down-temp" title={`Falling (${tempDelta.toFixed(2)}°C over 15m)`} />
          ) : (
            <SteadyArrowIcon title="Stable (change within 0.05°C over 15m)" />
          )}
        </div>
        <div className="card-minmax">
          Min: {c?.today?.temp_min !== null && c?.today?.temp_min !== undefined ? `${c.today.temp_min.toFixed(1)}°C` : '--.-°C'} | Max:{' '}
          {c?.today?.temp_max !== null && c?.today?.temp_max !== undefined ? `${c.today.temp_max.toFixed(1)}°C` : '--.-°C'}
        </div>
        <div className="card-7day">
          7d Mean:{' '}
          {c?.today?.temp_mean_7d !== null && c?.today?.temp_mean_7d !== undefined ? `${c.today.temp_mean_7d.toFixed(1)}°C` : '--.-°C'} | Med:{' '}
          {c?.today?.temp_median_7d !== null && c?.today?.temp_median_7d !== undefined ? `${c.today.temp_median_7d.toFixed(1)}°C` : '--.-°C'}
        </div>
        <div className="card-room-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={rtStyle?.color ?? 'var(--accent-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {roomSrcLabel}
          </span>
          <strong
            style={{
              color: rtStyle?.color ?? 'var(--accent-secondary)',
              fontSize: '0.85rem',
              textShadow: rtStyle && rtStyle.glow !== 'none' ? `0 0 8px ${rtStyle.glow}` : 'none',
            }}
          >
            {roomTemp !== null ? `${roomTemp.toFixed(1)}°C` : '--.-°C'}
          </strong>
        </div>
        <span className="card-subtext">{timeStr}</span>
        <div className="card-icon-container">
          <svg className="card-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 9V14" stroke="url(#temp-grad-pub)" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M12 21C14.2091 21 16 19.2091 16 17C16 15.029 14.57 13.3903 12.6775 13.067L12.5 13V5C12.5 4.72386 12.2761 4.5 12 4.5C11.7239 4.5 11.5 4.72386 11.5 5V13L11.3225 13.067C9.43003 13.3903 8 15.029 8 17C8 19.2091 9.79086 21 12 21Z"
              stroke="url(#temp-grad-pub)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="17" r="2" fill="url(#temp-grad-pub)" />
            <defs>
              <linearGradient id="temp-grad-pub" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4b6b" />
                <stop offset="100%" stopColor="#ff8a00" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. Humidity Card */}
      <div className="card humidity">
        <span className="card-label">Humidity</span>
        <div className="card-value">
          <span
            style={{
              color: hStyle?.color ?? 'var(--text-primary)',
              textShadow: hStyle && hStyle.glow !== 'none' ? `0 0 10px ${hStyle.glow}` : 'none',
            }}
          >
            {terraHum !== null ? `${Math.round(terraHum)}%` : '--%'}
          </span>
          {humDelta !== null && humDelta > 0.5 ? (
            <UpArrowIcon className="trend-icon trend-up-hum" title={`Rising (+${humDelta.toFixed(1)}% over 15m)`} />
          ) : humDelta !== null && humDelta < -0.5 ? (
            <DownArrowIcon className="trend-icon trend-down-hum" title={`Falling (${humDelta.toFixed(1)}% over 15m)`} />
          ) : (
            <SteadyArrowIcon title="Stable (change within 0.5% over 15m)" />
          )}
        </div>
        <div className="card-minmax">
          Min: {c?.today?.hum_min !== null && c?.today?.hum_min !== undefined ? `${Math.round(c.today.hum_min)}%` : '--%'} | Max:{' '}
          {c?.today?.hum_max !== null && c?.today?.hum_max !== undefined ? `${Math.round(c.today.hum_max)}%` : '--%'}
        </div>
        <div className="card-7day">
          7d Mean: {c?.today?.hum_mean_7d !== null && c?.today?.hum_mean_7d !== undefined ? `${Math.round(c.today.hum_mean_7d)}%` : '--%'} | Med:{' '}
          {c?.today?.hum_median_7d !== null && c?.today?.hum_median_7d !== undefined ? `${Math.round(c.today.hum_median_7d)}%` : '--%'}
        </div>
        <div className="card-room-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={rhStyle?.color ?? 'var(--accent-primary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {roomSrcLabel}
          </span>
          <strong
            style={{
              color: rhStyle?.color ?? 'var(--accent-primary)',
              fontSize: '0.85rem',
              textShadow: rhStyle && rhStyle.glow !== 'none' ? `0 0 8px ${rhStyle.glow}` : 'none',
            }}
          >
            {roomHum !== null ? `${Math.round(roomHum)}%` : '--%'}
          </strong>
        </div>
        <span className="card-subtext">{timeStr}</span>
        <div className="card-icon-container">
          <svg className="card-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.69C12 2.69 19 9 19 14C19 17.87 15.87 21 12 21C8.13 21 5 17.87 5 14C5 9 12 2.69 12 2.69Z"
              stroke="url(#hum-grad-pub)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M12 7C12 7 16 11 16 14" stroke="url(#hum-grad-pub)" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="hum-grad-pub" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="100%" stopColor="#0080ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 3. Ambient Weather Card */}
      <div className="card weather">
        <span className="card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Ambient Weather ({w?.location ?? 'Tokyo, Japan'})</span>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{w?.icon ?? '⛅'}</span>
        </span>
        <div className="card-value">
          <span>{w?.current_temp !== null && w?.current_temp !== undefined ? `${w.current_temp.toFixed(1)}°C` : '--.-°C'}</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-main)' }}>
            {w?.condition ? `${w.icon ?? ''} ${w.condition}` : '--'}
          </span>
        </div>
        <div className="card-minmax" style={{ color: '#fbbf24' }}>
          ☀️ Day: <strong>{w?.day_max !== null && w?.day_max !== undefined ? `${w.day_max.toFixed(1)}°C` : '--'}</strong> | 🌙 Night:{' '}
          <strong>{w?.night_min !== null && w?.night_min !== undefined ? `${w.night_min.toFixed(1)}°C` : '--'}</strong>
        </div>
        <div className="card-7day" style={{ color: '#94a3b8' }}>
          ☁️ Overcast: <strong>{w?.current_cloud_cover !== null && w?.current_cloud_cover !== undefined ? `${w.current_cloud_cover}%` : '--%'}</strong> | 🌧️ Rain:{' '}
          <strong>{w?.precip_prob_max !== null && w?.precip_prob_max !== undefined ? `${w.precip_prob_max}%` : '--%'}</strong>
        </div>
        <div className="card-room-row">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Outdoor Humidity:
          </span>
          <strong style={{ color: '#38bdf8', fontSize: '0.85rem' }}>
            {w?.current_humidity !== null && w?.current_humidity !== undefined ? `${w.current_humidity}%` : '--%'}
          </strong>
        </div>
        <span className="card-subtext">Forecast: {w?.location ?? 'Tokyo, Japan'} ({w?.updated_at ?? 'Live'})</span>
        <div className="card-icon-container">
          <svg className="card-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" stroke="url(#weather-grad-pub)" strokeWidth="1.5" />
            <path
              d="M12 2V4M12 20V22M4 12H2M22 12H20M5.636 5.636L7.05 7.05M16.95 16.95L18.364 18.364M5.636 18.364L7.05 16.95M16.95 7.05L18.364 5.636"
              stroke="url(#weather-grad-pub)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="weather-grad-pub" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 4. Pi System Diagnostics Card */}
      <div className="card system" style={cpuBorderColor ? { borderColor: cpuBorderColor } : undefined}>
        <span className="card-label">Pi System Diagnostics</span>
        <div className="card-value">
          <span>{s?.cpu_temp !== null && s?.cpu_temp !== undefined ? `${s.cpu_temp.toFixed(1)}°C` : '--.-°C'}</span>
        </div>
        <div className="card-minmax">CPU Load: {s?.cpu_load !== null && s?.cpu_load !== undefined ? `${s.cpu_load.toFixed(1)}%` : '--%'}</div>
        <div className="card-7day">
          RAM: {s?.mem_used_mb ?? '--'}MB / {s?.mem_total_mb ?? '--'}MB
        </div>
        <span className="card-subtext">
          Disk: {s?.disk_used_gb ?? '--'}GB / {s?.disk_total_gb ?? '--'}GB
        </span>
        <span className="card-subtext">CPU Fan: {s?.fan_rpm !== null && s?.fan_rpm !== undefined ? `${s.fan_rpm} RPM` : '-- RPM'}</span>
        <div className="card-icon-container">
          <svg className="card-icon" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#sys-grad-pub)" strokeWidth="1.5" />
            <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="url(#sys-grad-pub)" strokeWidth="1.5" fill="url(#sys-grad-pub)" fillOpacity="0.1" />
            <rect x="13" y="7" width="4" height="4" rx="0.5" stroke="url(#sys-grad-pub)" strokeWidth="1.5" />
            <rect x="7" y="13" width="4" height="4" rx="0.5" stroke="url(#sys-grad-pub)" strokeWidth="1.5" />
            <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="url(#sys-grad-pub)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="15" cy="15" r="1" fill="url(#sys-grad-pub)" />
            <defs>
              <linearGradient id="sys-grad-pub" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38ef7d" />
                <stop offset="100%" stopColor="#11998e" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
