import React from 'react';
import type { MediaAvailability } from '../types/telemetry';
import { formatTimeAgo } from '../utils/formatters';

interface ThermalPanelProps {
  dataBaseUrl: string;
  mediaVersion: number;
  media: MediaAvailability | undefined;
  onOpenImage: (src: string, title: string) => void;
}

export const ThermalPanel: React.FC<ThermalPanelProps> = ({
  dataBaseUrl,
  mediaVersion,
  media,
  onOpenImage,
}) => {
  const thermalUrl = `${dataBaseUrl}/thermal.jpg?v=${mediaVersion}`;

  return (
    <div className="panel-card thermal-panel">
      <div className="chart-title" style={{ color: '#ffab40' }}>
        <span>🌡️ Heatmap Thermal Camera (InfraRed)</span>
        <span
          style={{
            fontSize: '0.7rem',
            background: 'rgba(255, 171, 64, 0.15)',
            border: '1px solid rgba(255, 171, 64, 0.3)',
            color: '#ffab40',
            padding: '2px 7px',
            borderRadius: '4px',
          }}
        >
          256&times;192 UVC
        </span>
      </div>

      <div className="media-frame media-frame-4x3">
        {media?.thermal_available ? (
          <>
            <img
              src={thermalUrl}
              alt="TOP5Y Terrarium Infrared Thermal Heatmap"
              style={{ objectFit: 'contain' }}
              onClick={() => onOpenImage(thermalUrl, 'TOP5Y • 256×192 UVC Thermal Heatmap')}
            />
            <span className="media-badge">LIVE IR</span>
            {media.thermal_updated_at && (
              <span className="media-badge media-badge-right">{formatTimeAgo(media.thermal_updated_at)}</span>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Thermal sensor offline
          </div>
        )}
      </div>

      <span className="card-subtext" style={{ textAlign: 'center' }}>
        Thermal gradient inset synced from basking zone &bull; Click image to enlarge
      </span>
    </div>
  );
};
