import React, { useState } from 'react';
import type { MediaAvailability, YoutubeSummary } from '../types/telemetry';
import { formatTimeAgo } from '../utils/formatters';

interface LiveCameraPanelProps {
  dataBaseUrl: string;
  mediaVersion: number;
  generatedAt: string | null | undefined;
  youtube: YoutubeSummary | undefined;
  media: MediaAvailability | undefined;
  onOpenImage: (src: string, title: string) => void;
}

export const LiveCameraPanel: React.FC<LiveCameraPanelProps> = ({
  dataBaseUrl,
  mediaVersion,
  generatedAt,
  youtube,
  media,
  onOpenImage,
}) => {
  const isYtLive = Boolean(youtube?.is_live && youtube?.video_id);
  const [preferSnapshot, setPreferSnapshot] = useState(false);

  const showYoutubeEmbed = isYtLive && !preferSnapshot;
  const snapshotUrl = `${dataBaseUrl}/topsy_snapshot.jpg?v=${mediaVersion}`;

  return (
    <div className="panel-card">
      <div className="chart-header">
        <span className="chart-title">Live Camera Feed (TOP5Y)</span>
        {isYtLive && (
          <div className="range-selectors">
            <button
              type="button"
              className={`range-btn ${!preferSnapshot ? 'active' : ''}`}
              onClick={() => setPreferSnapshot(false)}
            >
              ▶ YouTube Live
            </button>
            <button
              type="button"
              className={`range-btn ${preferSnapshot ? 'active' : ''}`}
              onClick={() => setPreferSnapshot(true)}
            >
              📷 Live Snapshot
            </button>
          </div>
        )}
      </div>

      <div className="media-frame media-frame-16x9">
        {showYoutubeEmbed && youtube?.video_id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtube.video_id}?autoplay=1&mute=1&rel=0&modestbranding=1`}
            title={youtube.title ?? 'TOP5Y Live Stream'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : media?.topsy_snapshot_available ? (
          <>
            <img
              src={snapshotUrl}
              alt="TOP5Y Terrarium Optical Camera Snapshot"
              onClick={() => onOpenImage(snapshotUrl, 'TOP5Y Terrarium • Live Optical Snapshot')}
            />
            <span className="media-badge media-badge-bottom" style={{ color: '#00e676', borderColor: 'rgba(0, 230, 118, 0.4)' }}>
              📷 LIVE SNAPSHOT{generatedAt ? ` • ${formatTimeAgo(generatedAt)}` : ''}
            </span>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Camera feed currently initializing...
          </div>
        )}
      </div>

      <div className="yt-footer">
        <div className="yt-footer-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isYtLive ? 'var(--accent-primary)' : 'var(--accent-success)',
                boxShadow: isYtLive ? '0 0 8px var(--accent-primary)' : '0 0 8px var(--accent-success)',
              }}
            />
            <strong style={{ color: isYtLive ? 'var(--accent-primary)' : 'var(--accent-success)', fontSize: '0.82rem' }}>
              {isYtLive ? 'LIVE ON YOUTUBE' : 'SNAPSHOT MODE'}
            </strong>
          </div>
          {youtube?.stream_url || youtube?.channel_url ? (
            <a
              className="yt-link"
              href={youtube.stream_url || youtube.channel_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube ↗
            </a>
          ) : null}
        </div>
        {(youtube?.title || isYtLive) && (
          <div className="yt-footer-row" style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              {youtube?.title ?? 'TOP5Y Live Stream'}
            </span>
            <span>
              {isYtLive
                ? `👥 ${youtube?.viewers ?? 0} watching`
                : youtube?.total_views !== null && youtube?.total_views !== undefined
                ? `👁️ ${youtube.total_views} views`
                : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
