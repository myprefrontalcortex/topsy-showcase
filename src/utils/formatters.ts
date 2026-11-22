export interface ColorStyle {
  color: string;
  glow: string;
}

export function getTerraTempColor(t: number): ColorStyle {
  if (t <= 23.5) return { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' };
  if (t <= 27.0) return { color: '#b388ff', glow: 'rgba(179, 136, 255, 0.4)' };
  return { color: '#ff4b6b', glow: 'rgba(255, 75, 107, 0.4)' };
}

export function getRoomTempColor(t: number): ColorStyle {
  if (t < 28.0) return { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' };
  if (t <= 32.0) return { color: '#b388ff', glow: 'rgba(179, 136, 255, 0.4)' };
  return { color: '#ff4b6b', glow: 'rgba(255, 75, 107, 0.4)' };
}

export function getHumidityColor(h: number): ColorStyle {
  if (h < 50) return { color: '#a0a5b5', glow: 'none' };
  if (h <= 75) return { color: '#b388ff', glow: 'rgba(179, 136, 255, 0.4)' };
  return { color: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)' };
}

export function parseTimestamp(tsStr: string | null | undefined): Date {
  if (!tsStr) return new Date();
  const trimmed = tsStr.trim();
  // Explicit timezone offset or Z present
  if (/([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const clean = trimmed.split('.')[0].replace('T', ' ');
  const fallback = new Date(clean);
  return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function getMovingAverage(
  points: Array<{ x: Date; y: number }>,
  windowSize: number
): Array<{ x: Date; y: number }> {
  const result: Array<{ x: Date; y: number }> = [];
  let runningSum = 0;
  for (let i = 0; i < points.length; i++) {
    runningSum += points[i].y;
    if (i >= windowSize) {
      runningSum -= points[i - windowSize].y;
    }
    const count = Math.min(i + 1, windowSize);
    result.push({ x: points[i].x, y: Number((runningSum / count).toFixed(2)) });
  }
  return result;
}

export function makeEmojiCanvas(emoji: string, size = 18): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = `${size - 4}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + 1);
  }
  return canvas;
}

export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr === 'Never') return 'Never';
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return dateStr;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays > 1) return `${diffDays}d ago`;
  return `In ${Math.abs(diffDays)}d`;
}

export function formatTimeAgo(isoStr: string | null | undefined, nowMs = Date.now()): string {
  if (!isoStr) return '--';
  const dt = parseTimestamp(isoStr);
  const diffSec = Math.max(0, Math.round((nowMs - dt.getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 48) return `${diffHr}h ago`;
  const diffDays = Math.round(diffHr / 24);
  return `${diffDays}d ago`;
}

export interface ShedForecast {
  lastText: string;
  minExpected: string;
  maxExpected: string;
  statusText: string;
  statusColor: string;
}

export function computeShedForecast(lastShedVal: string | null | undefined): ShedForecast {
  if (!lastShedVal || lastShedVal === 'Never') {
    return {
      lastText: 'Never',
      minExpected: '--',
      maxExpected: '--',
      statusText: 'No shedding record',
      statusColor: 'var(--text-secondary)',
    };
  }
  const lastDateObj = new Date(`${lastShedVal}T00:00:00`);
  if (Number.isNaN(lastDateObj.getTime())) {
    return {
      lastText: lastShedVal,
      minExpected: '--',
      maxExpected: '--',
      statusText: 'Unknown format',
      statusColor: 'var(--text-secondary)',
    };
  }
  const minDate = new Date(lastDateObj.getTime() + 14 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(lastDateObj.getTime() + 28 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDateObj.setHours(0, 0, 0, 0);
  const daysSince = Math.round((today.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

  let statusText: string;
  let statusColor: string;
  if (daysSince < 14) {
    statusText = `Expected in ${14 - daysSince} to ${28 - daysSince} days`;
    statusColor = '#ffb74d';
  } else if (daysSince <= 28) {
    statusText = `Shed Window Active (Next ${28 - daysSince}d)`;
    statusColor = '#69f0ae';
  } else {
    statusText = `Overdue (by ${daysSince - 28} days)`;
    statusColor = '#ff5252';
  }

  return {
    lastText: `${lastShedVal} (${daysSince}d ago)`,
    minExpected: fmt(minDate),
    maxExpected: fmt(maxDate),
    statusText,
    statusColor,
  };
}
