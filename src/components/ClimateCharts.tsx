import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js';
import type { HistoryAcData, HistoryDailyData, HistoryLiveData } from '../types/telemetry';
import { ensureChartRegistered } from '../utils/chartSetup';
import { getMovingAverage, makeEmojiCanvas, parseTimestamp } from '../utils/formatters';

interface ClimateChartsProps {
  historyLive: HistoryLiveData | null;
  historyDaily: HistoryDailyData | null;
  historyAc: HistoryAcData | null;
}

type ChartTab = 'live' | 'daily' | 'ac';
type LiveHours = 1 | 6 | 12 | 24 | 48 | 168;
type DailyDays = 30 | 60 | 90;

interface TimePoint {
  x: Date;
  y: number;
}

interface MistPoint extends TimePoint {
  duration: number;
}

export const ClimateCharts: React.FC<ClimateChartsProps> = ({
  historyLive,
  historyDaily,
  historyAc,
}) => {
  const [tab, setTab] = useState<ChartTab>('live');
  const [liveHours, setLiveHours] = useState<LiveHours>(24);
  const [dailyDays, setDailyDays] = useState<DailyDays>(30);
  const [isZoomed, setIsZoomed] = useState(false);

  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainChartRef = useRef<ChartInstance | null>(null);

  const acCountCanvasRef = useRef<HTMLCanvasElement>(null);
  const acDurCanvasRef = useRef<HTMLCanvasElement>(null);
  const acTotCanvasRef = useRef<HTMLCanvasElement>(null);
  const acChartsRef = useRef<ChartInstance[]>([]);

  const filteredLive = useMemo(() => {
    if (!historyLive || historyLive.points.length === 0) return null;
    const pts = historyLive.points;
    const latestMs = parseTimestamp(pts[pts.length - 1].t).getTime();
    const cutoffMs = latestMs - liveHours * 3600 * 1000;

    const tempPoints: TimePoint[] = [];
    const humPoints: TimePoint[] = [];
    const roomTempPoints: TimePoint[] = [];
    const roomHumPoints: TimePoint[] = [];

    for (const p of pts) {
      const dt = parseTimestamp(p.t);
      if (dt.getTime() < cutoffMs) continue;
      tempPoints.push({ x: dt, y: p.temp });
      humPoints.push({ x: dt, y: p.hum });
      if (p.rtemp !== null) roomTempPoints.push({ x: dt, y: p.rtemp });
      if (p.rhum !== null) roomHumPoints.push({ x: dt, y: p.rhum });
    }

    const mistPoints: MistPoint[] = historyLive.mist_events
      .map((e) => ({ x: parseTimestamp(e.t), y: 95, duration: e.duration }))
      .filter((e) => e.x.getTime() >= cutoffMs);

    const fanPoints: TimePoint[] = historyLive.fan_events
      .map((e) => ({ x: parseTimestamp(e.t), y: 95 }))
      .filter((e) => e.x.getTime() >= cutoffMs);

    const rollWin = liveHours <= 24 ? 15 : 5;
    return {
      tempPoints,
      tempRolling: getMovingAverage(tempPoints, rollWin),
      humPoints,
      humRolling: getMovingAverage(humPoints, rollWin),
      mistPoints,
      fanPoints,
      roomTempPoints,
      roomHumPoints,
    };
  }, [historyLive, liveHours]);

  const filteredDaily = useMemo(() => {
    if (!historyDaily || historyDaily.days.length === 0) return null;
    const slice = historyDaily.days.slice(-dailyDays);
    return {
      tempAvg: slice.filter((d) => d.temp_avg !== null).map((d) => ({ x: new Date(d.date), y: d.temp_avg as number })),
      tempMedian: slice.filter((d) => d.temp_median !== null).map((d) => ({ x: new Date(d.date), y: d.temp_median as number })),
      tempMax: slice.filter((d) => d.temp_max !== null).map((d) => ({ x: new Date(d.date), y: d.temp_max as number })),
      humAvg: slice.filter((d) => d.hum_avg !== null).map((d) => ({ x: new Date(d.date), y: d.hum_avg as number })),
      humMedian: slice.filter((d) => d.hum_median !== null).map((d) => ({ x: new Date(d.date), y: d.hum_median as number })),
      humMax: slice.filter((d) => d.hum_max !== null).map((d) => ({ x: new Date(d.date), y: d.hum_max as number })),
      roomHumAvg: slice.filter((d) => d.room_hum_avg !== null).map((d) => ({ x: new Date(d.date), y: d.room_hum_avg as number })),
    };
  }, [historyDaily, dailyDays]);

  // Main Climate / Daily History Chart lifecycle
  useEffect(() => {
    if (tab === 'ac') {
      if (mainChartRef.current) {
        mainChartRef.current.destroy();
        mainChartRef.current = null;
      }
      return;
    }

    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const Chart = ensureChartRegistered();

    if (mainChartRef.current) {
      mainChartRef.current.destroy();
      mainChartRef.current = null;
    }
    setIsZoomed(false);

    if (tab === 'live' && filteredLive) {
      const fanIcon = makeEmojiCanvas('🌀', 20);
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Temp (°C)',
              data: filteredLive.tempPoints as unknown as never[],
              borderColor: '#ff4a6b',
              backgroundColor: 'rgba(255, 74, 107, 0.05)',
              yAxisID: 'yTemp',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5,
            },
            {
              label: 'Temp Rolling Avg',
              data: filteredLive.tempRolling as unknown as never[],
              borderColor: 'rgba(255, 138, 0, 0.85)',
              backgroundColor: 'transparent',
              yAxisID: 'yTemp',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'Humidity (%)',
              data: filteredLive.humPoints as unknown as never[],
              borderColor: '#00b0ff',
              backgroundColor: 'rgba(0, 176, 255, 0.05)',
              yAxisID: 'yHum',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 5,
            },
            {
              label: 'Hum Rolling Avg',
              data: filteredLive.humRolling as unknown as never[],
              borderColor: 'rgba(0, 229, 255, 0.85)',
              backgroundColor: 'transparent',
              yAxisID: 'yHum',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'Misting Events',
              data: filteredLive.mistPoints as unknown as never[],
              borderColor: '#b388ff',
              backgroundColor: '#b388ff',
              pointBackgroundColor: '#b388ff',
              pointBorderColor: '#b388ff',
              yAxisID: 'yHum',
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false,
              fill: false,
            },
            {
              label: 'Fan Events',
              data: filteredLive.fanPoints as unknown as never[],
              borderColor: 'transparent',
              backgroundColor: 'transparent',
              pointStyle: fanIcon,
              yAxisID: 'yHum',
              pointRadius: 10,
              pointHoverRadius: 12,
              showLine: false,
              fill: false,
            },
            {
              label: 'Room Humidity (%)',
              data: filteredLive.roomHumPoints as unknown as never[],
              borderColor: '#78909c',
              backgroundColor: 'transparent',
              yAxisID: 'yHum',
              borderDash: [3, 3],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
            {
              label: 'Room Temp (°C)',
              data: filteredLive.roomTempPoints as unknown as never[],
              borderColor: '#ffa726',
              backgroundColor: 'transparent',
              yAxisID: 'yTemp',
              borderDash: [3, 3],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                displayFormats: {
                  minute: 'HH:mm',
                  hour: liveHours > 24 ? 'MMM dd HH:mm' : 'HH:mm',
                },
              },
              grid: { color: '#242936' },
              ticks: { color: '#909bb0', maxRotation: 0, autoSkip: true },
            },
            yTemp: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Temperature (°C)', color: '#ff4a6b' },
              grid: { color: '#242936' },
              ticks: { color: '#909bb0' },
            },
            yHum: {
              type: 'linear',
              position: 'right',
              suggestedMax: 100,
              suggestedMin: 30,
              title: { display: true, text: 'Humidity (%)', color: '#00b0ff' },
              grid: { drawOnChartArea: false },
              ticks: { color: '#909bb0' },
            },
          },
          plugins: {
            legend: {
              labels: { color: '#e6eaf2', usePointStyle: true, boxWidth: 12 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  if (ctx.dataset.label === 'Misting Events') {
                    const dur = (ctx.raw as MistPoint)?.duration ?? 0;
                    return `💧 Misting: ${dur}s spray`;
                  }
                  if (ctx.dataset.label === 'Fan Events') {
                    return '🌀 Fan: ON';
                  }
                  return `${ctx.dataset.label}: ${ctx.parsed.y}`;
                },
              },
            },
            zoom: {
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
                onZoomComplete: () => setIsZoomed(true),
              },
              pan: {
                enabled: true,
                mode: 'x',
                onPanComplete: () => setIsZoomed(true),
              },
            },
          },
        },
      };
      mainChartRef.current = new Chart(canvas, config);
    } else if (tab === 'daily' && filteredDaily) {
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Temp Avg (°C)',
              data: filteredDaily.tempAvg as unknown as never[],
              borderColor: '#ff4a6b',
              backgroundColor: 'rgba(255, 74, 107, 0.05)',
              yAxisID: 'yTemp',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
            {
              label: 'Temp Median (°C)',
              data: filteredDaily.tempMedian as unknown as never[],
              borderColor: 'rgba(255, 138, 0, 0.85)',
              backgroundColor: 'transparent',
              yAxisID: 'yTemp',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 2,
              fill: false,
            },
            {
              label: 'Temp Max (°C)',
              data: filteredDaily.tempMax as unknown as never[],
              borderColor: '#ff1744',
              backgroundColor: 'transparent',
              yAxisID: 'yTemp',
              borderDash: [2, 2],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 2,
              pointHoverRadius: 5,
              fill: false,
            },
            {
              label: 'Humidity Avg (%)',
              data: filteredDaily.humAvg as unknown as never[],
              borderColor: '#00b0ff',
              backgroundColor: 'rgba(0, 176, 255, 0.05)',
              yAxisID: 'yHum',
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
            },
            {
              label: 'Humidity Median (%)',
              data: filteredDaily.humMedian as unknown as never[],
              borderColor: 'rgba(0, 229, 255, 0.85)',
              backgroundColor: 'transparent',
              yAxisID: 'yHum',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 2,
              fill: false,
            },
            {
              label: 'Humidity Max (%)',
              data: filteredDaily.humMax as unknown as never[],
              borderColor: '#00e5ff',
              backgroundColor: 'transparent',
              yAxisID: 'yHum',
              borderDash: [2, 2],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 2,
              pointHoverRadius: 5,
              fill: false,
            },
            {
              label: 'Room Humidity Avg (%)',
              data: filteredDaily.roomHumAvg as unknown as never[],
              borderColor: '#78909c',
              backgroundColor: 'transparent',
              yAxisID: 'yHum',
              borderDash: [3, 3],
              tension: 0.3,
              borderWidth: 1.5,
              pointRadius: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'yyyy-MM-dd',
                displayFormats: { day: 'MMM dd' },
              },
              grid: { color: '#242936' },
              ticks: { color: '#909bb0', maxRotation: 0, autoSkip: true },
            },
            yTemp: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: 'Temperature (°C)', color: '#ff4a6b' },
              grid: { color: '#242936' },
              ticks: { color: '#909bb0' },
            },
            yHum: {
              type: 'linear',
              position: 'right',
              title: { display: true, text: 'Humidity (%)', color: '#00b0ff' },
              grid: { drawOnChartArea: false },
              ticks: { color: '#909bb0' },
            },
          },
          plugins: {
            legend: { labels: { color: '#e6eaf2' } },
          },
        },
      };
      mainChartRef.current = new Chart(canvas, config);
    }

    return () => {
      if (mainChartRef.current) {
        mainChartRef.current.destroy();
        mainChartRef.current = null;
      }
    };
  }, [tab, filteredLive, filteredDaily, liveHours]);

  // AC Combo Charts lifecycle
  useEffect(() => {
    acChartsRef.current.forEach((c) => c.destroy());
    acChartsRef.current = [];

    if (tab !== 'ac' || !historyAc || historyAc.days.length === 0) return;
    if (!acCountCanvasRef.current || !acDurCanvasRef.current || !acTotCanvasRef.current) return;

    const Chart = ensureChartRegistered();
    const dates = historyAc.days.map((d) => d.date);
    const counts = historyAc.days.map((d) => d.count);
    const medians = historyAc.days.map((d) => d.median_duration_min);
    const totalsHours = historyAc.days.map((d) => Number((d.total_duration_min / 60).toFixed(1)));
    const outdoorTemps = historyAc.days.map((d) => d.outdoor_temp_max);

    const buildAcConfig = (
      barLabel: string,
      barData: number[],
      barBg: string,
      barBorder: string,
      yTitle: string,
      stepSize?: number
    ): ChartConfiguration<'bar' | 'line'> => ({
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            type: 'bar',
            label: barLabel,
            data: barData,
            backgroundColor: barBg,
            borderColor: barBorder,
            borderWidth: 1.5,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Outdoor Max Temp (°C)',
            data: outdoorTemps,
            borderColor: '#ff5252',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 2.5,
            pointHoverRadius: 5,
            tension: 0.3,
            yAxisID: 'yTemp',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#909bb0' } } },
        scales: {
          x: { grid: { color: '#242936' }, ticks: { color: '#909bb0' } },
          y: {
            grid: { color: '#242936' },
            title: { display: true, text: yTitle, color: barBorder },
            ticks: { color: '#909bb0', ...(stepSize ? { stepSize } : {}) },
          },
          yTemp: {
            type: 'linear',
            position: 'right',
            title: { display: true, text: 'Outdoor Max (°C)', color: '#ff5252' },
            grid: { drawOnChartArea: false },
            ticks: {
              color: '#ff5252',
              callback: (v) => `${v}°C`,
            },
          },
        },
      },
    });

    acChartsRef.current = [
      new Chart(
        acCountCanvasRef.current,
        buildAcConfig('Number of Switch-Ons', counts, 'rgba(0, 176, 255, 0.4)', '#00b0ff', 'Switch-Ons (Count)', 1)
      ),
      new Chart(
        acDurCanvasRef.current,
        buildAcConfig('Median Cycle Duration (min)', medians, 'rgba(255, 138, 0, 0.4)', '#ff8a00', 'Duration (Minutes)')
      ),
      new Chart(
        acTotCanvasRef.current,
        buildAcConfig('Total ON Duration (hrs)', totalsHours, 'rgba(255, 74, 107, 0.4)', '#ff4a6b', 'Duration (Hours)')
      ),
    ];

    return () => {
      acChartsRef.current.forEach((c) => c.destroy());
      acChartsRef.current = [];
    };
  }, [tab, historyAc]);

  const handleResetZoom = () => {
    if (mainChartRef.current) {
      mainChartRef.current.resetZoom();
      setIsZoomed(false);
    }
  };

  const titleText =
    tab === 'live'
      ? 'Climate Timeline'
      : tab === 'daily'
      ? `Daily ${dailyDays}-Day History`
      : 'AC Usage History (Jul 16 – Present)';

  const acTableRows = useMemo(() => (historyAc ? [...historyAc.days].reverse() : []), [historyAc]);

  return (
    <div className="panel-card">
      <div className="chart-header">
        <span className="chart-title">{titleText}</span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="range-selectors">
            <button type="button" className={`range-btn ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>
              Live
            </button>
            <button type="button" className={`range-btn ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}>
              Daily History
            </button>
            <button type="button" className={`range-btn ${tab === 'ac' ? 'active' : ''}`} onClick={() => setTab('ac')}>
              AC
            </button>
          </div>

          {tab === 'live' && (
            <div className="range-selectors">
              {([1, 6, 12, 24, 48, 168] as LiveHours[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`range-btn ${liveHours === h ? 'active' : ''}`}
                  onClick={() => setLiveHours(h)}
                >
                  {h === 168 ? '7D' : `${h}H`}
                </button>
              ))}
              {isZoomed && (
                <button type="button" className="range-btn reset-zoom" onClick={handleResetZoom}>
                  Reset Zoom
                </button>
              )}
            </div>
          )}

          {tab === 'daily' && (
            <div className="range-selectors">
              {([30, 60, 90] as DailyDays[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`range-btn ${dailyDays === d ? 'active' : ''}`}
                  onClick={() => setDailyDays(d)}
                >
                  {d}D
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {tab !== 'ac' ? (
        <div className="climate-chart-wrapper">
          <canvas ref={mainCanvasRef} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <div className="ac-charts-row">
            <div className="ac-mini-chart">
              <canvas ref={acCountCanvasRef} />
            </div>
            <div className="ac-mini-chart">
              <canvas ref={acDurCanvasRef} />
            </div>
            <div className="ac-mini-chart">
              <canvas ref={acTotCanvasRef} />
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Switch-Ons (Cycles)</th>
                  <th>Median Duration</th>
                  <th>Total Runtime</th>
                  <th>Outdoor Max Temp</th>
                </tr>
              </thead>
              <tbody>
                {acTableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '14px' }}>
                      No AC history data available.
                    </td>
                  </tr>
                ) : (
                  acTableRows.map((d) => (
                    <tr key={d.date}>
                      <td style={{ fontWeight: 500 }}>{d.date}</td>
                      <td style={{ color: '#00b0ff' }}>{d.count}</td>
                      <td style={{ color: '#ff8a00' }}>{d.median_duration_min} min</td>
                      <td style={{ color: '#ff4a6b', fontWeight: 500 }}>{(d.total_duration_min / 60).toFixed(1)} hrs</td>
                      <td style={{ color: '#ff5252', fontWeight: 500 }}>
                        {d.outdoor_temp_max !== null ? `${d.outdoor_temp_max}°C` : '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
