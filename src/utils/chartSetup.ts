import 'hammerjs';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';

let registered = false;

export function ensureChartRegistered(): typeof Chart {
  if (!registered) {
    Chart.register(...registerables, zoomPlugin);
    registered = true;
  }
  return Chart;
}
