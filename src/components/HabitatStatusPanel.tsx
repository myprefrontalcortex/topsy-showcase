import React from 'react';
import type { AutomationSummary } from '../types/telemetry';
import { formatTimeAgo } from '../utils/formatters';

interface HabitatStatusPanelProps {
  automation: AutomationSummary | undefined;
}

export const HabitatStatusPanel: React.FC<HabitatStatusPanelProps> = ({ automation }) => {
  const mist = automation?.mist;
  const fan = automation?.fan;
  const ac = automation?.ac;

  const mistActive = Boolean(mist?.is_misting || mist?.actual_state);
  const fanActive = Boolean(fan?.actual_state);
  const acActive = Boolean(ac?.actual_state);

  const profileBadge = ac?.profile_name ?? (ac?.active_profile ? ac.active_profile.toUpperCase() : 'AUTO');

  return (
    <div className="panel-card">
      <div className="chart-title">
        <span>🛡️ Habitat Life-Support Status</span>
        <span className="readonly-pill">AUTONOMOUS</span>
      </div>
      <div className="status-list">
        <div className="status-row">
          <div className="status-row-meta">
            <span className="status-row-title">💧 Hydration (Monsoon Nano)</span>
            <span className="status-row-sub">
              Mode: {(mist?.mode ?? 'auto').toUpperCase()} &bull; Last spray:{' '}
              {mist?.last_time ? formatTimeAgo(mist.last_time) : 'Unknown'}
            </span>
          </div>
          <span className={`status-pill ${mistActive ? 'active-blue' : 'standby'}`}>
            {mistActive ? 'MISTING' : 'STANDBY'}
          </span>
        </div>

        <div className="status-row">
          <div className="status-row-meta">
            <span className="status-row-title">🌬️ Ventilation (Exhaust Fan)</span>
            <span className="status-row-sub">
              Mode: {(fan?.mode ?? 'auto').toUpperCase()} &bull; Dual thermal &amp; humidity flush
            </span>
          </div>
          <span className={`status-pill ${fanActive ? 'active-green' : 'standby'}`}>
            {fanActive ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>

        <div className="status-row">
          <div className="status-row-meta">
            <span className="status-row-title">❄️ Climate Control (AC)</span>
            <span className="status-row-sub">
              {profileBadge}
              {ac?.thresh_on !== null && ac?.thresh_on !== undefined && ac?.thresh_off !== null && ac?.thresh_off !== undefined
                ? ` • ON ≥ ${ac.thresh_on}°C / OFF ≤ ${ac.thresh_off}°C`
                : ''}
            </span>
          </div>
          <span className={`status-pill ${acActive ? 'active-blue' : 'standby'}`}>
            {acActive ? 'COOLING' : 'STANDBY'}
          </span>
        </div>
      </div>
    </div>
  );
};
