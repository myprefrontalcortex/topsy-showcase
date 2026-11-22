import React, { useEffect, useMemo, useRef } from 'react';
import type { Chart as ChartInstance, ChartConfiguration } from 'chart.js';
import type { BiometricsData } from '../types/telemetry';
import { ensureChartRegistered } from '../utils/chartSetup';
import { formatRelativeDate, makeEmojiCanvas } from '../utils/formatters';

interface BiometricsPanelProps {
  biometrics: BiometricsData | null;
}

interface BioEventPoint {
  x: Date;
  y: number;
  style: HTMLCanvasElement;
  notes: string;
}

export const BiometricsPanel: React.FC<BiometricsPanelProps> = ({ biometrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartInstance | null>(null);

  const summary = useMemo(() => {
    const records = biometrics?.records ?? [];
    let latestWeight = '--';
    let latestSize = '--';
    for (let i = records.length - 1; i >= 0; i--) {
      const r = records[i];
      if (latestWeight === '--' && r.weight) latestWeight = `${r.weight} g`;
      if (latestSize === '--' && r.size) latestSize = r.size;
      if (latestWeight !== '--' && latestSize !== '--') break;
    }
    return {
      latestWeight,
      latestSize,
      lastFed: formatRelativeDate(biometrics?.last_fed_date),
    };
  }, [biometrics]);

  const sortedDesc = useMemo(() => {
    if (!biometrics?.records) return [];
    return [...biometrics.records].sort((a, b) => b.date.localeCompare(a.date));
  }, [biometrics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !biometrics || biometrics.records.length === 0) return;

    const Chart = ensureChartRegistered();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const chartData = [...biometrics.records].sort((a, b) => a.date.localeCompare(b.date));
    let maxRecordedWeight = 30.0;
    for (const r of chartData) {
      if (r.weight) {
        const w = parseFloat(r.weight);
        if (!Number.isNaN(w) && w > maxRecordedWeight) maxRecordedWeight = w;
      }
    }
    const topEmojiY = Math.ceil(maxRecordedWeight + 2.0);
    const chartHeadroom = topEmojiY + 3.0;

    const weightPoints: Array<{ x: Date; y: number }> = [];
    const sizePoints: Array<{ x: Date; y: number }> = [];
    const feedingPoints: BioEventPoint[] = [];
    const sheddingPoints: BioEventPoint[] = [];
    const cleaningPoints: BioEventPoint[] = [];

    const roachCanvas = makeEmojiCanvas('🪳', 20);
    const cricketCanvas = makeEmojiCanvas('🦗', 20);
    const wormCanvas = makeEmojiCanvas('🐛', 20);
    const foodCanvas = makeEmojiCanvas('🟢', 20);
    const shedCanvas = makeEmojiCanvas('🦎', 20);
    const cleanCanvas = makeEmojiCanvas('🧼', 20);

    for (const row of chartData) {
      const dateObj = new Date(row.date);
      if (Number.isNaN(dateObj.getTime())) continue;

      if (row.weight) {
        const w = parseFloat(row.weight);
        if (!Number.isNaN(w)) weightPoints.push({ x: dateObj, y: w });
      }

      if (row.size) {
        const sz = row.size.trim();
        let sVal = sz.includes('/') ? parseFloat(sz.split('/')[1]) : parseFloat(sz);
        if (!Number.isNaN(sVal)) {
          if (sVal > 50) sVal = sVal / 10.0;
          sizePoints.push({ x: dateObj, y: sVal });
        }
      }

      const isEatingCGD = Boolean(row.eating && ['TRUE', 'YES'].includes(row.eating.toUpperCase()));
      const notesLower = (row.notes || '').toLowerCase();
      const hasRoaches = notesLower.includes('roach') || notesLower.includes('dubia') || notesLower.includes('blatta');
      const hasCrickets = notesLower.includes('cricket') || notesLower.includes('insect') || notesLower.includes('bug');
      const hasWorms = notesLower.includes('worm') || notesLower.includes('larvae') || notesLower.includes('caterpillar') || notesLower.includes('calci');

      if (isEatingCGD) {
        feedingPoints.push({ x: dateObj, y: 15.0, style: foodCanvas, notes: row.notes || 'Ate CGD' });
      }
      if (hasRoaches || hasCrickets || hasWorms) {
        const icon = hasRoaches ? roachCanvas : hasCrickets ? cricketCanvas : wormCanvas;
        feedingPoints.push({
          x: dateObj,
          y: isEatingCGD ? 18.0 : 15.0,
          style: icon,
          notes: row.notes || 'Ate insects',
        });
      }

      const isShedding = Boolean(row.shedding && ['TRUE', 'YES'].includes(row.shedding.toUpperCase()));
      if (isShedding) {
        sheddingPoints.push({ x: dateObj, y: topEmojiY, style: shedCanvas, notes: row.notes || 'Shedded skin' });
      }

      const isCleaning =
        notesLower.includes('cleaning') ||
        notesLower.includes('cleaned') ||
        notesLower.includes('deep clean') ||
        notesLower.includes('clean') ||
        notesLower.includes('🧼');
      if (isCleaning) {
        cleaningPoints.push({
          x: dateObj,
          y: isShedding ? topEmojiY + 2.0 : topEmojiY,
          style: cleanCanvas,
          notes: row.notes || 'Cleaned terrarium',
        });
      }
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Weight (g)',
            data: weightPoints as unknown as never[],
            borderColor: '#ff4a6b',
            backgroundColor: 'rgba(255, 74, 107, 0.05)',
            yAxisID: 'yWeight',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'SVL Length (cm)',
            data: sizePoints as unknown as never[],
            borderColor: '#00b0ff',
            backgroundColor: 'rgba(0, 176, 255, 0.05)',
            yAxisID: 'ySize',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Feeding Days 🟢/🪳/🦗',
            data: feedingPoints as unknown as never[],
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            yAxisID: 'yWeight',
            showLine: false,
            pointStyle: feedingPoints.map((p) => p.style),
            pointRadius: 10,
            pointHoverRadius: 12,
          },
          {
            label: 'Shedding Days 🦎',
            data: sheddingPoints as unknown as never[],
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            yAxisID: 'yWeight',
            showLine: false,
            pointStyle: sheddingPoints.map((p) => p.style),
            pointRadius: 10,
            pointHoverRadius: 12,
          },
          {
            label: 'Cleaning Days 🧼',
            data: cleaningPoints as unknown as never[],
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            yAxisID: 'yWeight',
            showLine: false,
            pointStyle: cleaningPoints.map((p) => p.style),
            pointRadius: 10,
            pointHoverRadius: 12,
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
            ticks: { color: '#909bb0', maxRotation: 0, autoSkip: true, font: { size: 10 } },
          },
          ySize: {
            type: 'linear',
            position: 'left',
            title: { display: true, text: 'SVL (cm)', color: '#00b0ff', font: { size: 10 } },
            grid: { color: '#242936' },
            ticks: { color: '#909bb0', font: { size: 10 } },
          },
          yWeight: {
            type: 'linear',
            position: 'right',
            suggestedMax: chartHeadroom,
            title: { display: true, text: 'Weight (g)', color: '#ff4a6b', font: { size: 10 } },
            grid: { drawOnChartArea: false },
            ticks: { color: '#909bb0', font: { size: 10 } },
          },
        },
        plugins: {
          legend: { labels: { color: '#e6eaf2', usePointStyle: true, boxWidth: 10, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.dataset.label || '';
                const raw = ctx.raw as Partial<BioEventPoint>;
                if (label.includes('Feeding Days') || label.includes('Shedding Days') || label.includes('Cleaning Days')) {
                  return `${label}: ${raw?.notes || 'Event Recorded'}`;
                }
                return `${label}: ${ctx.parsed.y}`;
              },
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvas, config);
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [biometrics]);

  return (
    <div className="panel-card">
      <div className="chart-title">
        <span>📊 Growth &amp; Health Log</span>
        <span className="readonly-pill">{sortedDesc.length} entries</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          Len (SVL): <strong style={{ color: 'var(--accent-secondary)' }}>{summary.latestSize}</strong>
        </div>
        <div>
          Wt: <strong style={{ color: 'var(--accent-primary)' }}>{summary.latestWeight}</strong>
        </div>
        <div>
          Last Fed: <strong style={{ color: 'var(--accent-success)' }}>{summary.lastFed}</strong>
        </div>
      </div>

      <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
      </div>

      <div className="data-table-wrapper" style={{ maxHeight: '220px' }}>
        <table className="data-table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Weight</th>
              <th style={{ textAlign: 'right' }}>Size</th>
              <th style={{ textAlign: 'center' }}>Eat</th>
              <th style={{ textAlign: 'center' }}>Shed</th>
              <th style={{ textAlign: 'center' }}>Calcium</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {sortedDesc.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px' }}>
                  No biometric logs available.
                </td>
              </tr>
            ) : (
              sortedDesc.map((row, i) => {
                const isAte = row.eating && ['TRUE', 'YES'].includes(row.eating.toUpperCase());
                return (
                  <tr key={`${row.date}-${i}`}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{row.date}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-secondary)', fontWeight: 500 }}>
                      {row.weight ? `${row.weight}g` : '--'}
                    </td>
                    <td style={{ textAlign: 'right' }}>{row.size || '--'}</td>
                    <td style={{ textAlign: 'center' }}>{isAte ? '✅' : '❌'}</td>
                    <td style={{ textAlign: 'center' }}>{row.shedding || '--'}</td>
                    <td style={{ textAlign: 'center' }}>{row.calcium || '--'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', wordBreak: 'break-word' }}>{row.notes || '--'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
