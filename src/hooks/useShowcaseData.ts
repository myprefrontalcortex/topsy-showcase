import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BiometricsData,
  FreshnessStatus,
  HistoryAcData,
  HistoryDailyData,
  HistoryLiveData,
  SiteConfig,
  TelemetryData,
} from '../types/telemetry';
import { parseTimestamp } from '../utils/formatters';

const DEFAULT_CONFIG: SiteConfig = {
  dataBaseUrl: './data',
  pollIntervalMs: 30000,
  historyPollIntervalMs: 300000,
};

async function fetchJsonWithCacheBust<T>(url: string, timeoutMs = 10000): Promise<T> {
  const sep = url.includes('?') ? '&' : '?';
  const controller = new AbortController();
  const id = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(`${url}${sep}t=${Date.now()}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} for ${url}`);
    }
    return (await resp.json()) as T;
  } finally {
    window.clearTimeout(id);
  }
}

export interface ShowcaseDataState {
  config: SiteConfig;
  dataBaseUrl: string;
  telemetry: TelemetryData | null;
  historyLive: HistoryLiveData | null;
  historyDaily: HistoryDailyData | null;
  historyAc: HistoryAcData | null;
  biometrics: BiometricsData | null;
  mediaVersion: number;
  freshness: FreshnessStatus;
  errorMessage: string | null;
  refreshNow: () => Promise<void>;
}

export function useShowcaseData(): ShowcaseDataState {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [historyLive, setHistoryLive] = useState<HistoryLiveData | null>(null);
  const [historyDaily, setHistoryDaily] = useState<HistoryDailyData | null>(null);
  const [historyAc, setHistoryAc] = useState<HistoryAcData | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricsData | null>(null);
  const [mediaVersion, setMediaVersion] = useState<number>(() => Date.now());
  const [freshness, setFreshness] = useState<FreshnessStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    async function loadConfig() {
      let nextCfg = { ...DEFAULT_CONFIG };
      try {
        const loaded = await fetchJsonWithCacheBust<Partial<SiteConfig>>('./config.json', 5000);
        if (loaded && typeof loaded.dataBaseUrl === 'string' && loaded.dataBaseUrl.trim()) {
          nextCfg = {
            dataBaseUrl: loaded.dataBaseUrl.trim().replace(/\/+$/, ''),
            pollIntervalMs: typeof loaded.pollIntervalMs === 'number' ? loaded.pollIntervalMs : DEFAULT_CONFIG.pollIntervalMs,
            historyPollIntervalMs:
              typeof loaded.historyPollIntervalMs === 'number'
                ? loaded.historyPollIntervalMs
                : DEFAULT_CONFIG.historyPollIntervalMs,
          };
        }
      } catch {
        // Fallback silently to default config
      }

      const envUrl = import.meta.env.VITE_DATA_BASE_URL as string | undefined;
      if (envUrl && envUrl.trim()) {
        nextCfg.dataBaseUrl = envUrl.trim().replace(/\/+$/, '');
      }

      const params = new URLSearchParams(window.location.search);
      const queryUrl = params.get('dataUrl');
      if (queryUrl && /^https?:\/\//i.test(queryUrl.trim())) {
        nextCfg.dataBaseUrl = queryUrl.trim().replace(/\/+$/, '');
      }

      if (!canceled && mountedRef.current) {
        setConfig(nextCfg);
        setConfigLoaded(true);
      }
    }
    loadConfig();
    return () => {
      canceled = true;
    };
  }, []);

  const fetchTelemetry = useCallback(async (baseUrl: string) => {
    try {
      const data = await fetchJsonWithCacheBust<TelemetryData>(`${baseUrl}/telemetry.json`);
      if (!mountedRef.current) return;
      setTelemetry(data);
      setMediaVersion(Date.now());
      setErrorMessage(null);
      const genAt = parseTimestamp(data.generated_at).getTime();
      const ageMs = Date.now() - genAt;
      setFreshness(ageMs > 15 * 60 * 1000 ? 'stale' : 'live');
    } catch (err) {
      if (!mountedRef.current) return;
      setFreshness((prev) => (prev === 'loading' ? 'offline' : 'stale'));
      setErrorMessage(err instanceof Error ? err.message : 'Unable to reach telemetry feed');
    }
  }, []);

  const fetchHistories = useCallback(async (baseUrl: string) => {
    const results = await Promise.allSettled([
      fetchJsonWithCacheBust<HistoryLiveData>(`${baseUrl}/history_live.json`, 15000),
      fetchJsonWithCacheBust<HistoryDailyData>(`${baseUrl}/history_daily.json`, 15000),
      fetchJsonWithCacheBust<HistoryAcData>(`${baseUrl}/history_ac.json`, 15000),
      fetchJsonWithCacheBust<BiometricsData>(`${baseUrl}/biometrics.json`, 15000),
    ]);
    if (!mountedRef.current) return;
    if (results[0].status === 'fulfilled') setHistoryLive(results[0].value);
    if (results[1].status === 'fulfilled') setHistoryDaily(results[1].value);
    if (results[2].status === 'fulfilled') setHistoryAc(results[2].value);
    if (results[3].status === 'fulfilled') setBiometrics(results[3].value);
  }, []);

  const refreshNow = useCallback(async () => {
    const base = config.dataBaseUrl;
    await Promise.all([fetchTelemetry(base), fetchHistories(base)]);
  }, [config.dataBaseUrl, fetchTelemetry, fetchHistories]);

  useEffect(() => {
    if (!configLoaded) return;
    const base = config.dataBaseUrl;
    fetchTelemetry(base);
    fetchHistories(base);

    const tTimer = window.setInterval(() => fetchTelemetry(base), config.pollIntervalMs);
    const hTimer = window.setInterval(() => fetchHistories(base), config.historyPollIntervalMs);
    return () => {
      window.clearInterval(tTimer);
      window.clearInterval(hTimer);
    };
  }, [configLoaded, config.dataBaseUrl, config.pollIntervalMs, config.historyPollIntervalMs, fetchTelemetry, fetchHistories]);

  return {
    config,
    dataBaseUrl: config.dataBaseUrl,
    telemetry,
    historyLive,
    historyDaily,
    historyAc,
    biometrics,
    mediaVersion,
    freshness,
    errorMessage,
    refreshNow,
  };
}
