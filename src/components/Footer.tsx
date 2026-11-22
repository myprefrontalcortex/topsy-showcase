import React from 'react';

interface FooterProps {
  channelUrl: string | null | undefined;
  generatedAt: string | null | undefined;
}

export const Footer: React.FC<FooterProps> = ({ channelUrl, generatedAt }) => {
  return (
    <footer className="showcase-footer">
      <div>
        TOP5Y Terrarium Sentinel &bull; Powered by Raspberry Pi 5, SwitchBot BLE, Reolink 2K Optical &amp; 256&times;192 UVC Thermal Sensors
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {generatedAt && <span>Snapshot: {new Date(generatedAt).toLocaleString()}</span>}
        {channelUrl && (
          <a href={channelUrl} target="_blank" rel="noopener noreferrer">
            YouTube Channel ↗
          </a>
        )}
      </div>
    </footer>
  );
};
