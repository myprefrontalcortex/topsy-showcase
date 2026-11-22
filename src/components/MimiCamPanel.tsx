import React from 'react';
import { formatTimeAgo } from '../utils/formatters';

interface MimiCamPanelProps {
  dataBaseUrl: string;
  mediaVersion: number;
  generatedAt: string | null | undefined;
  onOpenImage: (src: string, title: string) => void;
}

export const MimiCamPanel: React.FC<MimiCamPanelProps> = ({
  dataBaseUrl,
  mediaVersion,
  generatedAt,
  onOpenImage,
}) => {
  const mimiUrl = `${dataBaseUrl}/mimicam_snapshot.jpg?v=${mediaVersion}`;

  return (
    <div className="panel-card">
      <div className="chart-title">
        <span>🐢 MimiCam &bull; Turtle Feed</span>
        <span className="readonly-pill">SNAPSHOT</span>
      </div>
      <div className="media-frame media-frame-16x9">
        <img
          src={mimiUrl}
          alt="MimiCam Turtle Habitat Snapshot"
          onClick={() => onOpenImage(mimiUrl, 'MimiCam • Turtle Habitat Snapshot')}
        />
        <span className="media-badge media-badge-bottom" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>
          PRIVACY CROPPED{generatedAt ? ` • ${formatTimeAgo(generatedAt)}` : ''}
        </span>
      </div>
    </div>
  );
};
