import React from 'react';
import type { MotionSummary } from '../types/telemetry';
import { formatTimeAgo, parseTimestamp } from '../utils/formatters';

interface MotionActivityPanelProps {
  motion: MotionSummary | undefined;
}

export const MotionActivityPanel: React.FC<MotionActivityPanelProps> = ({ motion }) => {
  const recent = motion?.recent ?? [];
  const count24h = motion?.count_24h ?? 0;

  return (
    <div className="panel-card" style={{ maxHeight: '380px' }}>
      <div className="chart-title">
        <span>🐾 Recent Motion Activity</span>
        <span className="readonly-pill">{count24h} events / 24h</span>
      </div>
      <div className="motion-list-container">
        {recent.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textAlign: 'center', padding: '18px 0', fontStyle: 'italic' }}>
            No motion events recorded recently.
          </div>
        ) : (
          recent.map((ev, idx) => {
            const dt = parseTimestamp(ev.timestamp);
            return (
              <div key={`${ev.timestamp}-${idx}`} className="motion-item">
                <div>
                  <div className="motion-time">{dt.toLocaleTimeString()}</div>
                  <div className="motion-date">{dt.toLocaleDateString()}</div>
                </div>
                <span className="status-pill standby">{formatTimeAgo(ev.timestamp)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
