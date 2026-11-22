import React, { useState } from 'react';
import { BiometricsPanel } from './components/BiometricsPanel';
import { ClimateCharts } from './components/ClimateCharts';
import { Footer } from './components/Footer';
import { HabitatStatusPanel } from './components/HabitatStatusPanel';
import { Header } from './components/Header';
import { ImageLightbox } from './components/ImageLightbox';
import { LiveCameraPanel } from './components/LiveCameraPanel';
import { MimiCamPanel } from './components/MimiCamPanel';
import { MotionActivityPanel } from './components/MotionActivityPanel';
import { StatsGrid } from './components/StatsGrid';
import { ThermalPanel } from './components/ThermalPanel';
import { useShowcaseData } from './hooks/useShowcaseData';

export const App: React.FC = () => {
  const {
    dataBaseUrl,
    telemetry,
    historyLive,
    historyDaily,
    historyAc,
    biometrics,
    mediaVersion,
    freshness,
  } = useShowcaseData();

  const [lightbox, setLightbox] = useState<{ src: string | null; title: string }>({
    src: null,
    title: '',
  });

  const openImage = (src: string, title: string) => setLightbox({ src, title });
  const closeImage = () => setLightbox({ src: null, title: '' });

  const terraTemp = telemetry?.climate?.temperature ?? null;

  return (
    <>
      <Header
        telemetry={telemetry}
        lastFedDate={biometrics?.last_fed_date ?? null}
        lastShedDate={biometrics?.last_shed_date ?? null}
        freshness={freshness}
        onOpenImage={openImage}
      />

      {terraTemp !== null && terraTemp >= 28.0 && (
        <div className="alert-banner">
          ⚠️ <strong>HIGH TEMPERATURE NOTICE:</strong> Terrarium canopy sensor reads {terraTemp.toFixed(1)}°C (above 28.0°C comfort ceiling).
        </div>
      )}

      <main className="main-layout">
        <div className="left-column">
          <StatsGrid telemetry={telemetry} />
          <ClimateCharts historyLive={historyLive} historyDaily={historyDaily} historyAc={historyAc} />
          <BiometricsPanel biometrics={biometrics} />
        </div>

        <div className="right-column">
          <LiveCameraPanel
            dataBaseUrl={dataBaseUrl}
            mediaVersion={mediaVersion}
            generatedAt={telemetry?.generated_at}
            youtube={telemetry?.youtube}
            media={telemetry?.media}
            onOpenImage={openImage}
          />
          <ThermalPanel
            dataBaseUrl={dataBaseUrl}
            mediaVersion={mediaVersion}
            media={telemetry?.media}
            onOpenImage={openImage}
          />
          {telemetry?.media?.mimicam_available && (
            <MimiCamPanel
              dataBaseUrl={dataBaseUrl}
              mediaVersion={mediaVersion}
              generatedAt={telemetry?.generated_at}
              onOpenImage={openImage}
            />
          )}
          <HabitatStatusPanel automation={telemetry?.automation} />
          <MotionActivityPanel motion={telemetry?.motion} />
        </div>
      </main>

      <Footer channelUrl={telemetry?.youtube?.channel_url} generatedAt={telemetry?.generated_at} />

      <ImageLightbox src={lightbox.src} title={lightbox.title} onClose={closeImage} />
    </>
  );
};

export default App;
