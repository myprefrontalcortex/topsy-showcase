export interface SiteConfig {
  dataBaseUrl: string;
  pollIntervalMs: number;
  historyPollIntervalMs: number;
}

export interface ClimateTodayStats {
  temp_min: number | null;
  temp_max: number | null;
  hum_min: number | null;
  hum_max: number | null;
  temp_mean_7d: number | null;
  temp_median_7d: number | null;
  hum_mean_7d: number | null;
  hum_median_7d: number | null;
}

export interface ClimateTrend {
  temp_delta: number | null;
  hum_delta: number | null;
}

export interface ClimateSummary {
  timestamp: string | null;
  temperature: number | null;
  humidity: number | null;
  battery: number | null;
  room_temperature: number | null;
  room_humidity: number | null;
  room_source: string;
  today: ClimateTodayStats;
  trend: ClimateTrend;
}

export interface WeatherSummary {
  location: string;
  current_temp: number | null;
  current_humidity: number | null;
  current_cloud_cover: number | null;
  condition: string | null;
  icon: string | null;
  cloud_desc: string | null;
  day_max: number | null;
  night_min: number | null;
  precip_prob_max: number | null;
  updated_at: string | null;
}

export interface SystemSummary {
  cpu_temp: number | null;
  cpu_load: number | null;
  mem_used_mb: number | null;
  mem_total_mb: number | null;
  disk_used_gb: number | null;
  disk_total_gb: number | null;
  fan_rpm: number | null;
}

export interface AutomationSummary {
  ac: {
    mode: string | null;
    actual_state: boolean | null;
    active_profile: string | null;
    profile_name: string | null;
    thresh_on: number | null;
    thresh_off: number | null;
    cycle_name: string | null;
  };
  fan: {
    mode: string | null;
    actual_state: boolean | null;
  };
  mist: {
    mode: string | null;
    actual_state: boolean | null;
    is_misting: boolean;
    last_time: string | null;
  };
}

export interface YoutubeSummary {
  is_live: boolean;
  video_id: string | null;
  title: string | null;
  viewers: number | null;
  total_views: number | null;
  stream_url: string | null;
  channel_url: string | null;
}

export interface MimiTask {
  task: string;
  days_remaining: number | null;
  next_due: string | null;
}

export interface MaintenanceSummary {
  topsy_clean_days: number | null;
  topsy_clean_date: string | null;
  topsy_clean_last: string | null;
  mimi_tasks: MimiTask[];
}

export interface MotionSummary {
  count_24h: number;
  recent: Array<{ timestamp: string }>;
}

export interface MediaAvailability {
  thermal_available: boolean;
  thermal_updated_at: string | null;
  topsy_snapshot_available: boolean;
  mimicam_available: boolean;
}

export interface TelemetryData {
  generated_at: string;
  climate: ClimateSummary;
  weather: WeatherSummary;
  system: SystemSummary;
  automation: AutomationSummary;
  youtube: YoutubeSummary;
  maintenance: MaintenanceSummary;
  motion: MotionSummary;
  media: MediaAvailability;
}

export interface LiveClimatePoint {
  t: string;
  temp: number;
  hum: number;
  rtemp: number | null;
  rhum: number | null;
}

export interface LiveMistEvent {
  t: string;
  duration: number;
}

export interface LiveFanEvent {
  t: string;
}

export interface HistoryLiveData {
  generated_at: string;
  points: LiveClimatePoint[];
  mist_events: LiveMistEvent[];
  fan_events: LiveFanEvent[];
}

export interface DailyClimateDay {
  date: string;
  temp_avg: number | null;
  temp_median: number | null;
  temp_min: number | null;
  temp_max: number | null;
  hum_avg: number | null;
  hum_median: number | null;
  hum_min: number | null;
  hum_max: number | null;
  room_hum_avg: number | null;
}

export interface HistoryDailyData {
  generated_at: string;
  days: DailyClimateDay[];
}

export interface AcHistoryDay {
  date: string;
  count: number;
  total_duration_min: number;
  mean_duration_min: number;
  median_duration_min: number;
  outdoor_temp_max: number | null;
}

export interface HistoryAcData {
  generated_at: string;
  days: AcHistoryDay[];
}

export interface BiometricRecord {
  date: string;
  weight: string;
  size: string;
  eating: string;
  shedding: string;
  calcium: string;
  humidity: string;
  temp: string;
  notes: string;
}

export interface BiometricsData {
  generated_at: string;
  last_fed_date: string | null;
  last_shed_date: string | null;
  records: BiometricRecord[];
}

export type FreshnessStatus = 'loading' | 'live' | 'stale' | 'offline';
